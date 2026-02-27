const subscriptionService = require('../services/subscriptionService');
const logger = require('../utils/logger');

subscriptionService.processRenewals()
  .then(result => logger.info('Renewal check completed', result))
  .catch(err => logger.error('Renewal check failed', err));
