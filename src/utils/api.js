export const API_BASE = (import.meta.env.VITE_API_BASE || '').replace(/\/$/, '');

export function apiUrl(path) {
  return API_BASE ? `${API_BASE}${path}` : path;
}

export const BACKEND_HOST = API_BASE;
