import { pool } from '../../config/database.js';
import { AppError } from '../../middleware/errorHandler.js';
import {
  createRoom as createRoomQuery,
  findUserRooms,
  findById,
  getMembers,
  addMember,
  removeMember
} from '../../database/queries/rooms.js';
import type { CreateRoomInput } from './rooms.schema.js';

export class RoomsService {
  /**
   * Create a new room.
   * The creator is automatically added as an 'admin' member
   * within the same database transaction (handled in the query layer).
   */
  static async createRoom(userId: string, input: CreateRoomInput) {
    const { name, description, isPrivate } = input;
    const result = await createRoomQuery(pool, name, description ?? null, userId, isPrivate);
    return result.rows[0];
  }

  /**
   * Get all rooms that the authenticated user is a member of.
   */
  static async getUserRooms(userId: string) {
    const result = await findUserRooms(pool, userId);
    return result.rows;
  }

  /**
   * Get a single room by ID, including its member list.
   */
  static async getRoomById(roomId: string) {
    const roomResult = await findById(pool, roomId);
    if (roomResult.rows.length === 0) {
      throw new AppError(404, 'Room not found');
    }

    const membersResult = await getMembers(pool, roomId);

    return {
      ...roomResult.rows[0],
      members: membersResult.rows
    };
  }



  /**
   * Add a specific target user to a room.
   */
  static async addMemberToRoom(roomId: string, targetUserId: string) {
    const roomResult = await findById(pool, roomId);
    if (roomResult.rows.length === 0) {
      throw new AppError(404, 'Room not found');
    }

    const result = await addMember(pool, roomId, targetUserId);

    if (result.rows.length === 0) {
      throw new AppError(409, 'User is already a member of this room');
    }

    return result.rows[0];
  }

  /**
   * Leave a room (remove the user from members).
   */
  static async leaveRoom(roomId: string, userId: string) {
    const result = await removeMember(pool, roomId, userId);

    if (result.rowCount === 0) {
      throw new AppError(404, 'You are not a member of this room');
    }

    return { message: 'Left room successfully' };
  }
}
