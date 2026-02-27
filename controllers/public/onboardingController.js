const customerService = require('../../services/customerService');
const { validationResult } = require('express-validator');

exports.submitDetails = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const { customer_id, ...details } = req.body;
    const customer = await customerService.submitOnboardingDetails(customer_id, details);
    res.json({ success: true, data: { customer_id: customer.customer_id, status: customer.status } });
  } catch (error) {
    next(error);
  }
};

exports.completeOnboarding = async (req, res, next) => {
  try {
    const { customer_id } = req.body;
    const result = await customerService.completeOnboarding(customer_id);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

exports.getStatus = async (req, res, next) => {
  try {
    const customer = await customerService.getCustomerStatus(req.params.customer_id);
    res.json({ success: true, data: customer });
  } catch (error) {
    next(error);
  }
};
