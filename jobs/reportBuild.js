const reportService = require('../services/reportService');
const logger = require('../utils/logger');

const month = process.argv[2] || new Date().toISOString().slice(0,7);
reportService.buildReportsForMonth(month)
  .then(result => logger.info('Report build completed', result))
  .catch(err => logger.error('Report build failed', err));
