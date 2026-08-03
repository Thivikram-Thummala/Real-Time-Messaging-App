import { request } from './client';

export async function searchUsers(query = '') {
  return request(`/api/v1/users/search?q=${encodeURIComponent(query)}`);
}
