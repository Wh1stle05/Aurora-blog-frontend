import { afterEach, describe, expect, it, vi } from 'vitest';

async function loadAssetsModule() {
  vi.resetModules();
  return import('./assets.js');
}

afterEach(() => {
  vi.unstubAllEnvs();
  delete window.__AURORA_PRERENDER__;
});

describe('resolveAssetUrl', () => {
  it('falls back to production cdn host when VITE_ASSET_CDN_BASE is not set', async () => {
    vi.stubEnv('PROD', 'true');

    const { CDN_BASE, resolveAssetUrl } = await loadAssetsModule();

    expect(CDN_BASE).toBe('https://cdn.aurorablog.me');
    expect(resolveAssetUrl('posts/test.jpg')).toBe('https://cdn.aurorablog.me/posts/test.jpg');
  });
});
