import { RoomsService } from './rooms.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const createRoom = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const room = await RoomsService.createRoom(userId, req.body);
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
  const { userId } = req.body;
  const membership = await RoomsService.addMemberToRoom(roomId, userId);
  res.status(200).json({
    success: true,
    data: membership
  });
});

export const leaveRoom = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const userId = req.user.userId;
  const result = await RoomsService.leaveRoom(roomId, userId);
  res.status(200).json({
    success: true,
    data: result
  });
});

export const removeMember = asyncHandler(async (req, res) => {
  const { roomId, userId } = req.params;
  const requestingUserId = req.user.userId;
  const result = await RoomsService.removeMemberFromRoom(roomId, userId, requestingUserId);
  res.status(200).json({
    success: true,
    data: result
  });
});
