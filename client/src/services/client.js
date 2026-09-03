export const SERVER_URL = 'https://sharepulse-backend.onrender.com';

export function getAuthHeader() {
  const token = localStorage.getItem('chat_jwt_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

export async function request(endpoint, options = {}) {
  const url = `${SERVER_URL}${endpoint}`;
  
  const isFormData = options.body instanceof FormData;
  
  const headers = {
    ...getAuthHeader(),
    ...options.headers
  };
  
  if (!isFormData && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    ...options,
    headers
  });

  return response.json();
}
