function normalizeEnv(value) {
  return typeof value === 'string' && value.trim() ? value.trim() : '';
}

export const PUBLIC_API_BASE =
  normalizeEnv(process.env.NEXT_PUBLIC_API_BASE) ||
  normalizeEnv(process.env.VITE_API_BASE) ||
  'https://api.aurorablog.me';

export const PUBLIC_ASSET_CDN_BASE =
  normalizeEnv(process.env.NEXT_PUBLIC_ASSET_CDN_BASE) ||
  normalizeEnv(process.env.VITE_ASSET_CDN_BASE) ||
  'https://cdn.aurorablog.me';

export const PUBLIC_TURNSTILE_SITE_KEY =
  normalizeEnv(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY) ||
  normalizeEnv(process.env.VITE_TURNSTILE_SITE_KEY);

export const PUBLIC_SITE_URL =
  normalizeEnv(process.env.NEXT_PUBLIC_SITE_URL) ||
  normalizeEnv(process.env.VITE_SITE_URL) ||
  'https://aurorablog.me';
