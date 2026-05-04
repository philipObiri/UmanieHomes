import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  const tokens = getStoredTokens();
  if (tokens?.access) {
    config.headers.Authorization = `Bearer ${tokens.access}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const tokens = getStoredTokens();
      if (tokens?.refresh) {
        try {
          const { data } = await axios.post(`${BASE_URL}/auth/refresh/`, {
            refresh: tokens.refresh,
          });
          setStoredTokens({ ...tokens, access: data.access });
          original.headers.Authorization = `Bearer ${data.access}`;
          return api(original);
        } catch {
          clearStoredTokens();
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

interface StoredTokens {
  access: string;
  refresh: string;
}

export function getStoredTokens(): StoredTokens | null {
  try {
    const raw = localStorage.getItem('auth_tokens');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredTokens(tokens: StoredTokens) {
  localStorage.setItem('auth_tokens', JSON.stringify(tokens));
}

export function clearStoredTokens() {
  localStorage.removeItem('auth_tokens');
}
