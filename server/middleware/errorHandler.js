import { logger } from '../utils/logger.js';

/**
 * Global error handler middleware
 * Must be registered LAST in Express app
 */
export const errorHandler = (err, req, res, next) => {
  logger.error('Unhandled error', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Default error response
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let details = {};

  // Handle Sequelize validation errors
  if (err.name === 'SequelizeValidationError') {
    statusCode = 400;
    message = 'Validation error';
    details = err.errors.map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }

  // Handle Sequelize unique constraint errors
  if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 409;
    message = 'Resource already exists';
    details = err.errors.map((e) => ({
      field: e.path,
      value: e.value,
      message: `${e.path} already in use`,
    }));
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // Return error response
  return res.status(statusCode).json({
    error: message,
    ...(Object.keys(details).length > 0 && { details }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * 404 Not Found handler
 * Register after all routes
 */
export const notFoundHandler = (req, res) => {
  logger.warn('Route not found', {
    path: req.path,
    method: req.method,
  });

  return res.status(404).json({
    error: 'Route not found',
    path: req.path,
  });
};

/**
 * Request logging middleware
 * Logs all incoming requests
 */
export const requestLogger = (req, res, next) => {
  const start = Date.now();

  // Capture original send function
  const originalSend = res.send;

  res.send = function (data) {
    const duration = Date.now() - start;
    logger.debug('HTTP Request', {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
      userId: req.user?.id || 'anonymous',
    });

    // Call original send
    res.send = originalSend;
    return res.send(data);
  };

  next();
};

export default {
  errorHandler,
  notFoundHandler,
  requestLogger,
};
