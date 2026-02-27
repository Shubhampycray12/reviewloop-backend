const subscriptionService = require('../../services/subscriptionService');
const { Subscription } = require('../../models');

exports.cancel = async (req, res, next) => {
  try {
    const { customer_id } = req.params;
    const result = await subscriptionService.cancelSubscription(customer_id);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// Additional endpoints for pause/resume etc. can be added
