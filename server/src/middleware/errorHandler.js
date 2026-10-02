import { logger } from '../utils/logger.js';

/**
 * Custom application error class.
 * Extends the native Error with an HTTP status code so the global
 * error handler knows what status to return.
 */
export class AppError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

/**
 * Global Express error handler middleware.
 * Must be registered LAST in the middleware chain (after all routes).
 *
 * - AppError instances → use their statusCode and message
 * - Unknown errors    → 500 Internal Server Error
 */
export const errorHandler = (
  err,
  req,
  res,
  _next
) => {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const message = err.message || 'Internal Server Error';
  const userId = req?.user?.userId || 'anonymous';
  const routeStr = req ? `[${req.method} ${req.originalUrl || req.url}]` : '[Unknown Route]';

  // Log detailed error context with HTTP method, route, and user ID
  if (statusCode >= 500) {
    logger.error(
      { err, statusCode, method: req?.method, route: req?.originalUrl, userId },
      `[SERVER ERROR ${statusCode}] on ${routeStr} by User [${userId}]: ${message}`
    );
  } else {
    logger.warn(
      { statusCode, message, method: req?.method, route: req?.originalUrl, userId },
      `[CLIENT ERROR ${statusCode}] on ${routeStr} by User [${userId}]: ${message}`
    );
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && statusCode >= 500
      ? { stack: err.stack }
      : {})
  });
};
