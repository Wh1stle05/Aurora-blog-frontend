function fromEnv(...keys) {
  for (const key of keys) {
    const value = process.env[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return '';
}

export const PUBLIC_API_BASE = fromEnv('NEXT_PUBLIC_API_BASE', 'VITE_API_BASE') || 'https://api.aurorablog.me';
export const PUBLIC_ASSET_CDN_BASE = fromEnv('NEXT_PUBLIC_ASSET_CDN_BASE', 'VITE_ASSET_CDN_BASE') || 'https://cdn.aurorablog.me';
export const PUBLIC_TURNSTILE_SITE_KEY = fromEnv('NEXT_PUBLIC_TURNSTILE_SITE_KEY', 'VITE_TURNSTILE_SITE_KEY');
export const PUBLIC_SITE_URL = fromEnv('NEXT_PUBLIC_SITE_URL', 'VITE_SITE_URL') || 'https://aurorablog.me';
