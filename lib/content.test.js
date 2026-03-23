import { describe, expect, it } from 'vitest';

import { apiUrl, normalizeBaseUrl } from './api.js';
import { resolveAssetUrl, transformImageUri } from './assets.js';
import { getPostHref } from './posts.js';

describe('frontend url helpers', () => {
  it('normalizes API base URLs without a trailing slash', () => {
    expect(normalizeBaseUrl('https://api.aurorablog.me/')).toBe('https://api.aurorablog.me');
    expect(apiUrl('/api/posts', 'https://api.aurorablog.me/')).toBe('https://api.aurorablog.me/api/posts');
  });

  it('resolves markdown image references to uploaded CDN assets', () => {
    const post = {
      images: [
        {
          filename: '测试.jpg',
          object_key: 'posts/9405bba3-aa2e-4fb2-ab1b-7a3408e1302a.jpg',
        },
      ],
    };

    expect(
      transformImageUri('./%E6%B5%8B%E8%AF%95.jpg', post, {
        apiBase: 'https://api.aurorablog.me',
        cdnBase: 'https://cdn.aurorablog.me',
      }),
    ).toBe('https://cdn.aurorablog.me/posts/9405bba3-aa2e-4fb2-ab1b-7a3408e1302a.jpg');

    expect(
      resolveAssetUrl('avatars/demo.jpg', {
        apiBase: 'https://api.aurorablog.me',
        cdnBase: 'https://cdn.aurorablog.me',
      }),
    ).toBe('https://cdn.aurorablog.me/avatars/demo.jpg');
  });

  it('builds slug-based blog detail paths', () => {
    expect(getPostHref({ slug: 'git-commands-cheatsheet', id: 12 })).toBe('/blog/git-commands-cheatsheet');
    expect(getPostHref({ id: 12 })).toBe('/blog/12');
  });
});
