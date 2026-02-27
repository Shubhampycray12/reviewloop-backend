const { Customer } = require('../../models');
const customerService = require('../../services/customerService');

exports.listCustomers = async (req, res, next) => {
  try {
    const { status, pincode, limit = 50, offset = 0 } = req.query;
    const where = {};
    if (status) where.status = status;
    if (pincode) where.pincode = pincode;

    const customers = await Customer.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });
    res.json({ success: true, data: customers });
  } catch (error) {
    next(error);
  }
};

exports.getCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findByPk(req.params.customer_id);
    if (!customer) return res.status(404).json({ success: false, error: 'Customer not found' });
    res.json({ success: true, data: customer });
  } catch (error) {
    next(error);
  }
};

exports.updateCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findByPk(req.params.customer_id);
    if (!customer) return res.status(404).json({ success: false, error: 'Customer not found' });
    await customer.update(req.body);
    res.json({ success: true, data: customer });
  } catch (error) {
    next(error);
  }
};

/** POST /admin/customers/:customer_id/complete-onboarding - Approve/complete onboarding (sets status to ACTIVE). */
exports.completeOnboarding = async (req, res, next) => {
  try {
    const customerId = parseInt(req.params.customer_id, 10);
    if (Number.isNaN(customerId)) {
      return res.status(400).json({ success: false, error: 'Invalid customer_id' });
    }
    const result = await customerService.completeOnboarding(customerId, { skipProfileCheck: true });
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
