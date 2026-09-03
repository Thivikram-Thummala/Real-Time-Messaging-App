export const handleTypingEvents = (io, socket) => {
  const user = socket.data.user;

  socket.on('typing:start', ({ roomId }) => {
    if (!roomId) return;

    // Broadcast to everyone in the room except the sender
    socket.to(roomId).emit('typing:update', {
      roomId,
      userId: user.userId,
      username: user.username,
      isTyping: true
    });
  });

  socket.on('typing:stop', ({ roomId }) => {
    if (!roomId) return;

    socket.to(roomId).emit('typing:update', {
      roomId,
      userId: user.userId,
      username: user.username,
      isTyping: false
    });
  });
};
