
import { Server as SocketServer, Socket as SocketClient } from 'socket.io';
import { pool } from '../../config/database.js';
import { updateOnlineStatus } from '../../database/queries/users.js';
import { logger } from '../../utils/logger.js';

export const handleConnection = async (io: SocketServer, socket: SocketClient) => {
  const user = socket.data.user;
  const userId = user.userId;

  logger.info({ socketId: socket.id, userId, username: user.username }, 'Real-time client connected');

  try {
    // 1. Mark user as online in database
    await updateOnlineStatus(pool, userId, true);

    // 2. Broadcast online status to all other users
    socket.broadcast.emit('user:online', {
      userId,
      isOnline: true
    });
  } catch (err: any) {
    logger.error({ err: err.message, userId }, 'Failed to set user online status');
  }

  // Handle disconnection
  socket.on('disconnect', async () => {
    logger.info({ socketId: socket.id, userId }, 'Real-time client disconnected');

    try {
      // Mark user as offline in database
      await updateOnlineStatus(pool, userId, false);

      // Broadcast offline status event to all clients
      io.emit('user:online', {
        userId,
        isOnline: false
      });
      io.emit('user:offline', {
        userId,
        isOnline: false
      });
    } catch (err: any) {
      logger.error({ err: err.message, userId }, 'Failed to set user offline status');
    }
  });
};
