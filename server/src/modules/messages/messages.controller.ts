import { Request, Response } from 'express';
import { MessagesService } from './messages.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const sendMessage = asyncHandler(async (req: Request, res: Response) => {
  const { roomId } = req.params as { roomId: string };
  const senderId = req.user!.userId;
  const { content, mediaUrl, messageType } = req.body;

  const message = await MessagesService.sendMessage(
    roomId,
    senderId,
    content,
    mediaUrl,
    messageType
  );

  res.status(201).json({
    success: true,
    data: message
  });
});

export const getHistory = asyncHandler(async (req: Request, res: Response) => {
  const { roomId } = req.params as { roomId: string };
  const { cursor, limit } = req.query;

  // Validate values via Zod custom parser schema or manual parsing
  const limitNum = limit ? parseInt(limit as string, 10) : 50;
  const cursorStr = cursor ? (cursor as string) : undefined;

  const history = await MessagesService.getHistory(roomId, cursorStr, limitNum);

  res.status(200).json({
    success: true,
    data: history
  });
});
