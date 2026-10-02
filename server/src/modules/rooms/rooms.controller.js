import { RoomsService } from './rooms.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { logger } from '../../utils/logger.js';

export const createRoom = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const room = await RoomsService.createRoom(userId, req.body);

  logger.info(
    { userId, roomId: room.id, name: room.name, isPrivate: room.is_private },
    `User (ID: ${userId}) created room [${room.name}] (ID: ${room.id})`
  );

  res.status(201).json({
    success: true,
    data: room
  });
});

export const getUserRooms = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const rooms = await RoomsService.getUserRooms(userId);
  res.status(200).json({
    success: true,
    data: rooms
  });
});

export const getRoomById = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const room = await RoomsService.getRoomById(roomId);
  res.status(200).json({
    success: true,
    data: room
  });
});

export const addMember = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const { userId: targetUserId } = req.body;
  const requestingUserId = req.user.userId;
  const membership = await RoomsService.addMemberToRoom(roomId, targetUserId);

  logger.info(
    { requestingUserId, targetUserId, roomId },
    `User (ID: ${requestingUserId}) added User (ID: ${targetUserId}) to room (ID: ${roomId})`
  );

  res.status(200).json({
    success: true,
    data: membership
  });
});

export const leaveRoom = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const userId = req.user.userId;
  const result = await RoomsService.leaveRoom(roomId, userId);

  logger.info(
    { userId, roomId },
    `User (ID: ${userId}) left room (ID: ${roomId})`
  );

  res.status(200).json({
    success: true,
    data: result
  });
});

export const removeMember = asyncHandler(async (req, res) => {
  const { roomId, userId: targetUserId } = req.params;
  const requestingUserId = req.user.userId;
  const result = await RoomsService.removeMemberFromRoom(roomId, targetUserId, requestingUserId);

  logger.info(
    { requestingUserId, targetUserId, roomId },
    `User (ID: ${requestingUserId}) removed User (ID: ${targetUserId}) from room (ID: ${roomId})`
  );

  res.status(200).json({
    success: true,
    data: result
  });
});
