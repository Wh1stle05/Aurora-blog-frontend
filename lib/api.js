import { PUBLIC_API_BASE } from './env.js';

export function normalizeBaseUrl(value) {
  return typeof value === 'string' ? value.replace(/\/+$/, '') : '';
}

export function getApiBase() {
  return normalizeBaseUrl(PUBLIC_API_BASE);
}

export function apiUrl(path, base = getApiBase()) {
  return base ? `${normalizeBaseUrl(base)}${path}` : path;
}

export async function apiJson(path, init = {}, options = {}) {
  const response = await fetch(apiUrl(path, options.base), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
    next: options.next,
    cache: options.cache,
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const message = data?.detail || data?.message || `Request failed: ${response.status}`;
    throw new Error(message);
  }
  return data;
}

export const API_BASE = getApiBase();
export const BACKEND_HOST = API_BASE;
