/**
 * Wraps an async Express route handler so that any thrown error
 * is automatically forwarded to the global error handler via next(err).
 *
 * Without this, you'd need try/catch in every single controller.
 *
 * Usage:
 *   router.get('/users', asyncHandler(async (req, res) => { ... }));
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
