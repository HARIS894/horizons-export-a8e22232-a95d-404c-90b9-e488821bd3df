import { logger } from '../config/logger.js';

export const errorHandler = (error, req, res, _next) => {
  const statusCode = error.statusCode || 500;

  (req.log || logger).error(
    {
      err: error,
      path: req.originalUrl,
      method: req.method,
      requestId: req.id,
    },
    error.message,
  );

  res.status(statusCode).json({
    success: false,
    error: {
      message: error.message || 'Internal server error.',
      details: error.details || null,
      requestId: req.id,
    },
  });
};