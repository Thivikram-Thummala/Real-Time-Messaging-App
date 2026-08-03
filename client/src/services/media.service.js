import { request } from './client';

export async function uploadMedia(file) {
  const formData = new FormData();
  formData.append('file', file);
  
  return request('/api/v1/media/upload', {
    method: 'POST',
    body: formData
  });
}
