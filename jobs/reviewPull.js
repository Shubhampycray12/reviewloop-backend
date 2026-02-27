// This script can be run via cron or scheduled task
const reviewService = require('../services/reviewService');
const logger = require('../utils/logger');

const month = process.argv[2] || new Date().toISOString().slice(0,7);
reviewService.pullReviewsForMonth(month)
  .then(result => logger.info('Review pull completed', result))
  .catch(err => logger.error('Review pull failed', err));
