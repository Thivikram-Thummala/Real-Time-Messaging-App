import { z } from 'zod';

/**
 * Registration request body schema.
 * Validates username (3-50 chars), email (valid format), and password (6+ chars).
 */
export const registerSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be at most 50 characters')
    .trim(),
  email: z
    .string()
    .email('Invalid email address')
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters'),
  avatarUrl: z
    .string()
    .url('Invalid avatar URL')
    .optional()
    .nullable()
});

/**
 * Login request body schema.
 */
export const loginSchema = z.object({
  email: z
    .string()
    .email('Invalid email address')
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(1, 'Password is required')
});
