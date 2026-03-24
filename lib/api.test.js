import { beforeEach, expect, test, vi } from 'vitest';

beforeEach(() => {
  vi.resetModules();
  vi.restoreAllMocks();
});

test('retries server-side GET requests after transient 502 responses', async () => {
  const fetchMock = vi
    .fn()
    .mockResolvedValueOnce({ ok: false, status: 502, json: async () => ({ detail: 'upstream bad gateway' }) })
    .mockResolvedValueOnce({ ok: false, status: 502, json: async () => ({ detail: 'upstream bad gateway' }) })
    .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ success: true }) });

  vi.stubGlobal('fetch', fetchMock);
  const { apiJson } = await import('./api.js');

  const payload = await apiJson('/api/posts/paginated?page=1&page_size=5');

  expect(payload).toEqual({ success: true });
  expect(fetchMock).toHaveBeenCalledTimes(3);
});
