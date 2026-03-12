import { apiClient } from './apiClient';

export async function loginWithCredentials(credentials) {
  return apiClient('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}
