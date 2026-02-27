const customerService = require('../../services/customerService');
const { validationResult } = require('express-validator');

exports.checkLead = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const { whatsapp_phone } = req.body;
    const customers = await customerService.checkLead(whatsapp_phone);
    if (customers.length === 0) {
      return res.json({ success: true, data: { exists: false } });
    }
    const lead = customers[0];
    res.json({
      success: true,
      data: {
        exists: true,
        customer: {
          customer_id: lead.customer_id,
          business_name: lead.business_name,
          owner_name: lead.owner_name || '',
          email: lead.email || '',
          status: lead.status,
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.initiateCustomer = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const { business_name, owner_name, whatsapp_phone, email, plan_code } = req.body;
    const result = await customerService.initiateCustomer({ business_name, owner_name, whatsapp_phone, email, plan_code });
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
