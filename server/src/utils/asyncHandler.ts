import { Request, Response, NextFunction } from 'express';

/**
 * Wraps an async Express route handler so that any thrown error
 * is automatically forwarded to the global error handler via next(err).
 *
 * Without this, you'd need try/catch in every single controller.
 *
 * Usage:
 *   router.get('/users', asyncHandler(async (req, res) => { ... }));
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
