const DEFAULT_PROD_API_BASE = 'https://api.aurorablog.me';

const isPrerenderProxyMode = typeof window !== 'undefined'
  && window.__AURORA_PRERENDER__?.proxyApi;

const resolvedApiBase = isPrerenderProxyMode
  ? ''
  : (import.meta.env.VITE_API_BASE || (import.meta.env.PROD ? DEFAULT_PROD_API_BASE : ''));

export const API_BASE = resolvedApiBase.replace(/\/$/, '');

export function apiUrl(path) {
  return API_BASE ? `${API_BASE}${path}` : path;
}

export const BACKEND_HOST = API_BASE;
