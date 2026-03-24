import { PUBLIC_API_BASE } from './env.js';

const SERVER_RETRY_ATTEMPTS = 3;

export function normalizeBaseUrl(value) {
  return typeof value === 'string' ? value.replace(/\/+$/, '') : '';
}

export function getApiBase() {
  return normalizeBaseUrl(PUBLIC_API_BASE);
}

export function apiUrl(path, base = getApiBase()) {
  return base ? `${normalizeBaseUrl(base)}${path}` : path;
}

function getRequestMethod(init = {}) {
  return (init.method || 'GET').toUpperCase();
}

function isRetryableGetRequest(init = {}) {
  return getRequestMethod(init) === 'GET';
}

function shouldRetryStatus(status) {
  return status >= 500 && status < 600;
}

async function parseJson(response) {
  return response.json().catch(() => null);
}

export async function apiJson(path, init = {}, options = {}) {
  const attempts = isRetryableGetRequest(init) ? SERVER_RETRY_ATTEMPTS : 1;
  let lastError = null;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(apiUrl(path, options.base), {
        ...init,
        headers: {
          'Content-Type': 'application/json',
          ...(init.headers || {}),
        },
        next: options.next,
        cache: options.cache,
      });

      const data = await parseJson(response);
      if (!response.ok) {
        const message = data?.detail || data?.message || `Request failed: ${response.status}`;
        const error = new Error(message);

        if (attempt < attempts && shouldRetryStatus(response.status)) {
          lastError = error;
          continue;
        }

        throw error;
      }

      return data;
    } catch (error) {
      if (attempt < attempts && isRetryableGetRequest(init)) {
        lastError = error;
        continue;
      }
      throw error;
    }
  }

  throw lastError || new Error('Request failed');
}

export const API_BASE = getApiBase();
export const BACKEND_HOST = API_BASE;
