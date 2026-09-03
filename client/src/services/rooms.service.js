import { request } from './client';

export async function getRooms() {
  return request('/api/v1/rooms');
}

export async function createRoom(name, description = 'Public channel', isPrivate = false) {
  return request('/api/v1/rooms', {
    method: 'POST',
    body: JSON.stringify({ name, description, isPrivate })
  });
}

export async function getRoomById(roomId) {
  return request(`/api/v1/rooms/${roomId}`);
}



export async function addMemberToRoom(roomId, userId) {
  return request(`/api/v1/rooms/${roomId}/members`, {
    method: 'POST',
    body: JSON.stringify({ userId })
  });
}

export async function leaveRoom(roomId) {
  return request(`/api/v1/rooms/${roomId}/leave`, {
    method: 'POST'
  });
}

export async function removeMemberFromRoom(roomId, targetUserId) {
  return request(`/api/v1/rooms/${roomId}/members/${targetUserId}`, {
    method: 'DELETE'
  });
}
