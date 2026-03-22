import { BACKEND_HOST } from './api.js';

export const CDN_BASE = (import.meta.env.VITE_ASSET_CDN_BASE || '').replace(/\/$/, '');

export function resolveAssetUrl(value) {
  if (!value) return value;
  if (value.startsWith('http://') || value.startsWith('https://')) return value;
  if (value.startsWith('/')) return BACKEND_HOST ? `${BACKEND_HOST}${value}` : value;
  if (!CDN_BASE) return value;
  return `${CDN_BASE}/${value.replace(/^\/+/, '')}`;
}
