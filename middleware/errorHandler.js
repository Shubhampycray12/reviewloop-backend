const logger = require('../utils/logger');

module.exports = (err, req, res, next) => {
  logger.error(err.stack);
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  res.status(status).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message,
    }
  });
};
