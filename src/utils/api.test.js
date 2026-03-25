import { afterEach, describe, expect, it, vi } from 'vitest';

async function loadApiModule() {
  vi.resetModules();
  return import('./api.js');
}

afterEach(() => {
  vi.unstubAllEnvs();
  delete window.__AURORA_PRERENDER__;
});

describe('apiUrl', () => {
  it('uses configured VITE_API_BASE when present', async () => {
    vi.stubEnv('VITE_API_BASE', 'https://example.com/');
    vi.stubEnv('PROD', 'true');

    const { apiUrl, API_BASE } = await loadApiModule();

    expect(API_BASE).toBe('https://example.com');
    expect(apiUrl('/api/posts')).toBe('https://example.com/api/posts');
  });

  it('falls back to production API host when building without VITE_API_BASE', async () => {
    vi.stubEnv('PROD', 'true');

    const { apiUrl, API_BASE } = await loadApiModule();

    expect(API_BASE).toBe('https://api.aurorablog.me');
    expect(apiUrl('/api/posts')).toBe('https://api.aurorablog.me/api/posts');
  });

  it('uses same-origin api paths during prerender builds', async () => {
    vi.stubEnv('PROD', 'true');
    window.__AURORA_PRERENDER__ = { proxyApi: true };

    const { apiUrl, API_BASE } = await loadApiModule();

    expect(API_BASE).toBe('');
    expect(apiUrl('/api/posts')).toBe('/api/posts');
  });
});
