import { request } from './client';

export async function login(email, password) {
  return request('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
}

export async function register(username, email, password) {
  return request('/api/v1/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, email, password })
  });
}

export async function getMe() {
  return request('/api/v1/auth/me');
}

export async function updateProfile(data) {
  return request('/api/v1/auth/me', {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}
