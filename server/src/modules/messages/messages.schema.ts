import { z } from 'zod';

export const sendMessageSchema = z.object({
  content: z
    .string()
    .trim()
    .optional()
    .nullable(),
  mediaUrl: z
    .string()
    .url('Invalid media URL')
    .optional()
    .nullable(),
  messageType: z
    .enum(['text', 'image', 'file'])
    .default('text')
}).refine(data => data.content || data.mediaUrl, {
  message: 'Either content or mediaUrl must be provided'
});

export const getHistoryQuerySchema = z.object({
  cursor: z
    .string()
    .optional(),
  limit: z
    .coerce
    .number()
    .min(1)
    .max(100)
    .default(50)
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type GetHistoryQuery = z.infer<typeof getHistoryQuerySchema>;
