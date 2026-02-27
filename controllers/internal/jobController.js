const reviewService = require('../../services/reviewService');
const reportService = require('../../services/reportService');
const subscriptionService = require('../../services/subscriptionService');

exports.runReviewPull = async (req, res, next) => {
  try {
    const { month } = req.body; // optional
    const result = await reviewService.pullReviewsForMonth(month || new Date().toISOString().slice(0,7));
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

exports.runReportBuild = async (req, res, next) => {
  try {
    const { month } = req.body;
    const result = await reportService.buildReportsForMonth(month || new Date().toISOString().slice(0,7));
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

exports.runRenewalCheck = async (req, res, next) => {
  try {
    const result = await subscriptionService.processRenewals();
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
