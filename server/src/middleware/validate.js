import { ZodError } from 'zod';

/**
 * Zod validation middleware factory.
 *
 * Returns Express middleware that validates req.body against the given schema.
 * On success: replaces req.body with the parsed (and potentially coerced) data.
 * On failure: returns 400 with structured validation errors.
 *
 * Usage:
 *   router.post('/register', validate(registerSchema), controller);
 */
export const validate = (schema) => {
  return (req, res, next) => {
    try {
      // Parse and replace req.body with the validated data
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const errors = err.issues.map((e) => ({
          field: e.path.join('.'),
          message: e.message
        }));

        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors
        });
      }
      next(err);
    }
  };
};
