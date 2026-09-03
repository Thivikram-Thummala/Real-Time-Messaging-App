import { MessagesService } from './messages.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const sendMessage = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const senderId = req.user.userId;
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

export const getHistory = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const { cursor, limit } = req.query;

  const limitNum = limit ? parseInt(limit, 10) : 50;
  const cursorStr = cursor ? cursor : undefined;

  const history = await MessagesService.getHistory(roomId, cursorStr, limitNum);

  res.status(200).json({
    success: true,
    data: history
  });
});
