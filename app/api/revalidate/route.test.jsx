import { beforeEach, expect, test, vi } from 'vitest';

const revalidatePath = vi.fn();

vi.mock('next/cache', () => ({
  revalidatePath,
}));

beforeEach(() => {
  revalidatePath.mockReset();
  process.env.REVALIDATE_SECRET = 'test-secret';
});

test('rejects invalid revalidation secret', async () => {
  const { POST } = await import('./route.js');
  const request = new Request('https://www.aurorablog.me/api/revalidate', {
    method: 'POST',
    body: JSON.stringify({ secret: 'wrong', paths: ['/blog'] }),
    headers: { 'Content-Type': 'application/json' },
  });

  const response = await POST(request);
  const payload = await response.json();

  expect(response.status).toBe(401);
  expect(payload).toEqual({ revalidated: false, message: 'Invalid secret' });
  expect(revalidatePath).not.toHaveBeenCalled();
});

test('revalidates only supported paths and expands the optional blog slug path', async () => {
  const { POST } = await import('./route.js');
  const request = new Request('https://www.aurorablog.me/api/revalidate', {
    method: 'POST',
    body: JSON.stringify({
      secret: 'test-secret',
      paths: ['/', '/blog', '/about', '/unknown'],
      slug: 'git-commands',
    }),
    headers: { 'Content-Type': 'application/json' },
  });

  const response = await POST(request);
  const payload = await response.json();

  expect(response.status).toBe(200);
  expect(payload).toEqual({
    revalidated: true,
    paths: ['/', '/blog', '/about', '/blog/git-commands'],
  });
  expect(revalidatePath).toHaveBeenCalledTimes(4);
  expect(revalidatePath).toHaveBeenNthCalledWith(1, '/');
  expect(revalidatePath).toHaveBeenNthCalledWith(2, '/blog');
  expect(revalidatePath).toHaveBeenNthCalledWith(3, '/about');
  expect(revalidatePath).toHaveBeenNthCalledWith(4, '/blog/git-commands');
});

test('revalidates collection pages even when no slug is provided', async () => {
  const { POST } = await import('./route.js');
  const request = new Request('https://www.aurorablog.me/api/revalidate', {
    method: 'POST',
    body: JSON.stringify({
      secret: 'test-secret',
      paths: ['/blog', '/about'],
    }),
    headers: { 'Content-Type': 'application/json' },
  });

  const response = await POST(request);
  const payload = await response.json();

  expect(response.status).toBe(200);
  expect(payload).toEqual({
    revalidated: true,
    paths: ['/blog', '/about'],
  });
  expect(revalidatePath).toHaveBeenCalledTimes(2);
  expect(revalidatePath).toHaveBeenNthCalledWith(1, '/blog');
  expect(revalidatePath).toHaveBeenNthCalledWith(2, '/about');
});
