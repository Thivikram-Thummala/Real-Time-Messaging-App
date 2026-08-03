import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

/**
 * Custom application error class.
 * Extends the native Error with an HTTP status code so the global
 * error handler knows what status to return.
 */
export class AppError extends Error {
  public statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    // Preserve the class name in stack traces
    Object.setPrototypeOf(this, AppError.prototype);
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
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const message = err.message || 'Internal Server Error';

  // Log the full error in development, just the message in production
  if (statusCode >= 500) {
    logger.error({ err, statusCode }, 'Server error');
  } else {
    logger.warn({ statusCode, message }, 'Client error');
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && statusCode >= 500
      ? { stack: err.stack }
      : {})
  });
};
