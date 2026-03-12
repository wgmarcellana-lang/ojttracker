import { API_BASE_URL } from '../config/api';

export async function apiClient(path, { token, ...options } = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({
    details: 'Unexpected API response.',
  }));

  if (!response.ok) {
    throw new Error(data.errors?.join('\n') || data.details || 'Request failed.');
  }

  return data;
}
