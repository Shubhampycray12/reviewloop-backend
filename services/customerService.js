const { Customer, Order, Subscription, ProfileConnection } = require('../models');
const constants = require('../config/constants');
const { sequelize } = require('../models');

exports.initiateCustomer = async ({ business_name, owner_name, whatsapp_phone, email, plan_code }) => {
  const transaction = await sequelize.transaction();
  try {
    const customer = await Customer.create({
      business_name,
      owner_name,
      whatsapp_phone,
      email,
      status: 'LEAD'
    }, { transaction });

    const orderType = plan_code === 'PHYSICAL_KIT' ? 'PHYSICAL_KIT' : 'STARTER_SETUP';
    const amount = plan_code === 'PHYSICAL_KIT'
      ? constants.PLAN_CONFIG.PHYSICAL_KIT.oneTimePrice
      : constants.PLAN_CONFIG.STARTER_MONTHLY.setupFee + constants.PLAN_CONFIG.STARTER_MONTHLY.monthlyPrice;

    const order = await Order.create({
      customer_id: customer.customer_id,
      order_type: orderType,
      amount: amount,
      payment_status: 'INITIATED'
    }, { transaction });

    await transaction.commit();
    return { customer_id: customer.customer_id, order_id: order.order_id, amount };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

exports.checkLead = async (whatsapp_phone) => {
  const customers = await Customer.findAll({
    where: { whatsapp_phone, status: 'LEAD' },
    order: [['created_at', 'DESC']],
    limit: 1
  });
  return customers;
};

exports.submitOnboardingDetails = async (customerId, details) => {
  const customer = await Customer.findByPk(customerId);
  if (!customer) throw new Error('Customer not found');
  const payload = {};
  if (details.gst != null) payload.gst_number = details.gst;
  if (details.pincode != null) payload.pincode = details.pincode;
  if (details.address != null) payload.address = details.address;
  if (details.preferred_language != null) {
    const lang = String(details.preferred_language).toUpperCase();
    if (['EN', 'HI', 'MR'].includes(lang)) payload.preferred_language = lang;
  }
  if (details.logo_url != null) payload.logo_url = details.logo_url;
  if (details.google_business_link != null) payload.google_business_link = details.google_business_link;
  await customer.update(payload);
  return customer;
};

/**
 * @param {number} customerId
 * @param {{ skipProfileCheck?: boolean }} [options] - skipProfileCheck: true when admin approves (bypass Google profile requirement)
 */
exports.completeOnboarding = async (customerId, options = {}) => {
  const customer = await Customer.findByPk(customerId, {
    include: [
      { model: Subscription },
      { model: ProfileConnection }
    ]
  });
  if (!customer) {
    const err = new Error('Customer not found');
    err.status = 404;
    throw err;
  }

  // Physical-only (no subscription): just mark active
  if (!customer.Subscription) {
    await customer.update({ status: 'ACTIVE' });
    return { status: 'ACTIVE' };
  }

  // Recurring (STARTER_MONTHLY): require Google profile connection unless bypassed (env or admin)
  const skipProfileCheck = options.skipProfileCheck ||
    process.env.ALLOW_SKIP_PROFILE_CONNECTION === '1' ||
    process.env.ALLOW_SKIP_PROFILE_CONNECTION === 'true';
  if (!skipProfileCheck && (!customer.ProfileConnection || customer.ProfileConnection.status !== 'CONNECTED')) {
    const err = new Error(
      'Profile connection required. Customer must connect Google Business Profile first via GET /api/v1/public/profile/connect?customer_id=' + customerId
    );
    err.status = 400;
    err.code = 'PROFILE_CONNECTION_REQUIRED';
    throw err;
  }

  await customer.update({ status: 'ACTIVE' });
  return { status: 'ACTIVE' };
};

exports.getCustomerStatus = async (customerId) => {
  const customer = await Customer.findByPk(customerId, {
    include: [
      { model: Order, limit: 1, order: [['created_at', 'DESC']] },
      { model: Subscription },
      { model: ProfileConnection }
    ]
  });
  if (!customer) throw new Error('Customer not found');
  return customer;
};
