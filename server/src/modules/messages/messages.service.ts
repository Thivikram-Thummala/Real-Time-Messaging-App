import { pool } from '../../config/database.js';
import { AppError } from '../../middleware/errorHandler.js';
import { insertMessage, getMessagesByRoom } from '../../database/queries/messages.js';
import { findById as findRoomById } from '../../database/queries/rooms.js';
import { findById as findUserById } from '../../database/queries/users.js';
import { buildPaginationResponse } from '../../utils/pagination.js';
import { getIo } from '../../socket/index.js';

export class MessagesService {
  /**
   * Send a new message to a room.
   * 1. Check if the room exists.
   * 2. Insert message into PostgreSQL.
   * 3. Fetch sender details to build an enriched message object.
   * 4. Emit the enriched message via Socket.io to all clients in the room channel.
   */
  static async sendMessage(
    roomId: string,
    senderId: string,
    content?: string | null,
    mediaUrl?: string | null,
    messageType = 'text'
  ) {
    // 1. Verify room exists
    const roomRes = await findRoomById(pool, roomId);
    if (roomRes.rows.length === 0) {
      throw new AppError(404, 'Room not found');
    }

    // 2. Insert message
    const result = await insertMessage(pool, roomId, senderId, content, mediaUrl, messageType);
    const message = result.rows[0];

    // 3. Fetch sender details
    const userRes = await findUserById(pool, senderId);
    const sender = userRes.rows[0];

    const enrichedMessage = {
      ...message,
      sender: sender
        ? { id: sender.id, username: sender.username, avatarUrl: sender.avatar_url }
        : { id: senderId, username: 'Unknown', avatarUrl: null }
    };

    // 4. Emit message to the room via Socket.io (failing silently if socket server is not active/booted yet)
    try {
      const io = getIo();
      io.to(roomId).emit('message:new', enrichedMessage);
    } catch (err: any) {
      // This is expected during startup diagnostics/standalone scripts
    }

    return enrichedMessage;
  }

  /**
   * Fetch paginated message history for a room.
   */
  static async getHistory(roomId: string, cursor?: string, limit = 50) {
    // Verify room exists
    const roomRes = await findRoomById(pool, roomId);
    if (roomRes.rows.length === 0) {
      throw new AppError(404, 'Room not found');
    }

    // Fetch limit + 1 items to see if there is another page
    const fetchLimit = limit + 1;
    const result = await getMessagesByRoom(pool, roomId, cursor, fetchLimit);

    return buildPaginationResponse(result.rows, limit);
  }
}
