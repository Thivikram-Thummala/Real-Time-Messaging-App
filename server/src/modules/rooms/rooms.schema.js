import { z } from 'zod';

/**
 * Schema for creating a new room.
 */
export const createRoomSchema = z.object({
  name: z
    .string()
    .min(1, 'Room name is required')
    .max(100, 'Room name must be at most 100 characters')
    .trim(),
  description: z
    .string()
    .max(500, 'Description must be at most 500 characters')
    .optional()
    .nullable(),
  isPrivate: z
    .boolean()
    .default(false)
});
