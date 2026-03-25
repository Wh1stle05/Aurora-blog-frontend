import { describe, expect, it, vi, beforeEach } from 'vitest';

let createComment;

describe('blogService auth expiry', () => {
  beforeEach(async () => {
    localStorage.clear();
    vi.resetModules();
    ({ createComment } = await import('./blogService.js'));
  });

  it('dispatches auth-expired on 401 for protected actions', async () => {
    localStorage.setItem('access_token', 'token');
    const dispatchSpy = vi.spyOn(window, 'dispatchEvent');
    global.fetch = vi.fn().mockResolvedValue({
      status: 401,
      ok: false,
      json: async () => ({ detail: 'Invalid authentication' }),
    });

    await expect(createComment(1, 'hello', null, 'captcha')).rejects.toThrow('请先登录');
    expect(dispatchSpy).toHaveBeenCalledWith(expect.objectContaining({ type: 'aurora:auth-expired' }));
    expect(localStorage.getItem('access_token')).toBeNull();
  });
});
