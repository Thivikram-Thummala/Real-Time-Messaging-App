import { Server, Socket } from 'socket.io';
import { logger } from '../../utils/logger.js';

export const handleRoomEvents = (io: Server, socket: Socket) => {
  const userId = socket.data.user.userId;

  socket.on('room:join', ({ roomId }) => {
    if (!roomId) return;
    
    socket.join(roomId);
    logger.debug({ socketId: socket.id, userId, roomId }, 'Socket client joined room channel');
  });

  socket.on('room:leave', ({ roomId }) => {
    if (!roomId) return;

    socket.leave(roomId);
    logger.debug({ socketId: socket.id, userId, roomId }, 'Socket client left room channel');
  });
};
