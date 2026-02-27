const { Subscription, Customer, Order, JobRunLog } = require('../models');
const { Op, sequelize } = require('sequelize');
const logger = require('../utils/logger');

exports.processRenewals = async () => {
  const today = new Date();
  const subscriptions = await Subscription.findAll({
    where: {
      status: 'ACTIVE',
      next_billing_date: { [Op.lte]: today }
    }
  });

  let renewed = 0, failed = 0;

  for (const sub of subscriptions) {
    const transaction = await sequelize.transaction();
    try {
      // Attempt payment (simplified: assume success)
      const paymentSuccess = true; // Replace with actual payment logic

      if (paymentSuccess) {
        await sub.update({
          next_billing_date: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
        }, { transaction });
        // Optionally create a renewal order
        renewed++;
      } else {
        await sub.update({ status: 'INACTIVE' }, { transaction });
        await Customer.update(
          { status: 'INACTIVE' },
          { where: { customer_id: sub.customer_id }, transaction }
        );
        failed++;
      }
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      logger.error(`Renewal failed for subscription ${sub.subscription_id}`, err);
      failed++;
    }
  }

  await JobRunLog.create({
    job_name: 'RENEWAL_CHECK',
    status: 'SUCCESS',
    started_at: new Date(),
    finished_at: new Date(),
  });

  return { renewed, failed };
};

exports.cancelSubscription = async (customerId) => {
  const sub = await Subscription.findOne({ where: { customer_id: customerId, status: 'ACTIVE' } });
  if (!sub) {
    const err = new Error('No active subscription found for this customer. Subscriptions are created when a STARTER_MONTHLY payment is captured (Razorpay webhook).');
    err.status = 404;
    throw err;
  }

  await sub.update({ status: 'CANCELLED' });
  await Customer.update({ status: 'CHURNED' }, { where: { customer_id: customerId } });
  return sub;
};
