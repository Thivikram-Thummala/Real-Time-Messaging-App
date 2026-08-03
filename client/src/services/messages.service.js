import { request } from './client';

export async function getMessages(roomId) {
  return request(`/api/v1/rooms/${roomId}/messages`);
}

export async function sendMessage(roomId, content, mediaUrl = null) {
  return request(`/api/v1/rooms/${roomId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ content, mediaUrl })
  });
}
