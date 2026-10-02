import { pool } from '../../config/database.js';
import { updateOnlineStatus } from '../../database/queries/users.js';
import { logger } from '../../utils/logger.js';
import { socketActiveConnections } from '../../utils/metrics.js';

export const handleConnection = async (io, socket) => {
  const user = socket.data.user;
  const userId = user.userId;

  // Increment active sockets counter gauge
  socketActiveConnections.inc();

  const username = user.username || 'User';
  logger.info(
    { socketId: socket.id, userId, username },
    `Socket client connected for User [${username}] (ID: ${userId}, Socket: ${socket.id})`
  );

  try {
    // 1. Mark user as online in database
    await updateOnlineStatus(pool, userId, true);

    // 2. Broadcast online status to all other users
    socket.broadcast.emit('user:online', {
      userId,
      isOnline: true
    });
  } catch (err) {
    logger.error(
      { err: err.message, userId, username },
      `Failed to set online status for User [${username}] (ID: ${userId}): ${err.message}`
    );
  }

  // Handle disconnection
  socket.on('disconnect', async (reason) => {
    // Decrement active sockets counter gauge
    socketActiveConnections.dec();

    logger.info(
      { socketId: socket.id, userId, username, reason },
      `Socket client disconnected for User [${username}] (ID: ${userId}, Socket: ${socket.id}, Reason: ${reason})`
    );

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
    } catch (err) {
      logger.error(
        { err: err.message, userId, username },
        `Failed to set offline status for User [${username}] (ID: ${userId}): ${err.message}`
      );
    }
  });
};
