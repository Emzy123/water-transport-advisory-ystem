const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

module.exports = (err, req, res, next) => {
  if (err instanceof ApiError) {
    logger.warn({ err, requestId: req.id, path: req.path }, err.message);
    return res.status(err.status).json({
      error: err.message,
      code: err.code,
      ...(err.details && { details: err.details }),
      requestId: req.id,
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      error: 'Resource not found',
      code: 'NOT_FOUND',
      requestId: req.id,
    });
  }

  if (err.code === 'P2002') {
    return res.status(409).json({
      error: 'A record with this value already exists',
      code: 'CONFLICT',
      requestId: req.id,
    });
  }

  logger.error({ err, requestId: req.id, path: req.path }, 'Unhandled error');

  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    code: 'INTERNAL_ERROR',
    requestId: req.id,
  });
};
