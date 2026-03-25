import { describe, expect, it, vi } from 'vitest';

import { getDynamicRoutes, STATIC_PRERENDER_ROUTES, STATIC_SITEMAP_ROUTES } from './fetch-routes.js';

describe('fetch-routes', () => {
  it('keeps the expected public static prerender routes', () => {
    expect(STATIC_PRERENDER_ROUTES).toEqual(['/', '/about', '/contact']);
  });

  it('keeps `/blog` in the sitemap route set even though it is not prerendered', () => {
    expect(STATIC_SITEMAP_ROUTES).toEqual(['/', '/blog', '/about', '/contact']);
  });

  it('builds slug routes from paginated post payloads', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            data: [
              { id: 1, slug: 'git-commands' },
              { id: 2, slug: 'docker-notes' },
            ],
            total_pages: 1,
          },
        }),
      });

    const routes = await getDynamicRoutes({
      fetchImpl: fetchMock,
      apiBase: 'https://api.aurorablog.me',
    });

    expect(routes).toEqual(['/blog/git-commands', '/blog/docker-notes']);
  });

  it('returns an empty route list when route discovery fails', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('Request failed: 502'));
    const routes = await getDynamicRoutes({
      fetchImpl: fetchMock,
      apiBase: 'https://api.aurorablog.me',
    });

    expect(routes).toEqual([]);
  });
});
