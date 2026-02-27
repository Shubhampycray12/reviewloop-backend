const constants = require('../../config/constants');

exports.getPlans = (req, res) => {
  res.json({
    success: true,
    data: {
      plans: Object.keys(constants.PLAN_CONFIG).map(code => ({
        plan_code: code,
        ...constants.PLAN_CONFIG[code]
      }))
    }
  });
};
