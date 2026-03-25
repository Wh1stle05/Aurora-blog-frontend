import { BACKEND_HOST } from './api.js';

const DEFAULT_PROD_CDN_BASE = 'https://cdn.aurorablog.me';

const resolvedCdnBase = import.meta.env.VITE_ASSET_CDN_BASE
  || (import.meta.env.PROD ? DEFAULT_PROD_CDN_BASE : '');

export const CDN_BASE = resolvedCdnBase.replace(/\/$/, '');

export function resolveAssetUrl(value) {
  if (!value) return value;
  if (value.startsWith('http://') || value.startsWith('https://')) return value;
  if (value.startsWith('/')) return BACKEND_HOST ? `${BACKEND_HOST}${value}` : value;
  if (!CDN_BASE) return value;
  return `${CDN_BASE}/${value.replace(/^\/+/, '')}`;
}
