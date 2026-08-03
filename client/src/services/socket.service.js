import { io } from 'socket.io-client';
import { SERVER_URL } from './client';

let socket = null;

export function connectSocket(token, onConnect, onDisconnect, onError) {
  if (socket) {
    socket.disconnect();
  }

  socket = io(SERVER_URL, {
    auth: { token },
    transports: ['websocket']
  });

  socket.on('connect', () => {
    if (onConnect) onConnect(socket.id);
  });

  socket.on('connect_error', (err) => {
    if (onError) onError(err);
  });

  socket.on('disconnect', (reason) => {
    if (onDisconnect) onDisconnect(reason);
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function getSocket() {
  return socket;
}
