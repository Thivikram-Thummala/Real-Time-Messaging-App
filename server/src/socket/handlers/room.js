import { logger } from '../../utils/logger.js';

export const handleRoomEvents = (io, socket) => {
  const user = socket.data.user;
  const userId = user.userId;
  const username = user.username || 'User';

  socket.on('room:join', ({ roomId }) => {
    if (!roomId) return;

    socket.join(roomId);
    logger.info(
      { socketId: socket.id, userId, username, roomId },
      `Socket client [${socket.id}] (User: ${username}, ID: ${userId}) joined room channel (ID: ${roomId})`
    );
  });

  socket.on('room:leave', ({ roomId }) => {
    if (!roomId) return;

    socket.leave(roomId);
    logger.info(
      { socketId: socket.id, userId, username, roomId },
      `Socket client [${socket.id}] (User: ${username}, ID: ${userId}) left room channel (ID: ${roomId})`
    );
  });
};
