import { describe, expect, it } from 'vitest';

import {
  buildCanonicalUrl,
  buildPostPath,
  buildSeoDescription,
  buildArticleJsonLd,
} from './seo.js';

describe('seo helpers', () => {
  it('builds slug-first blog paths', () => {
    expect(buildPostPath({ id: 12, slug: 'git-commands' })).toBe('/blog/git-commands');
    expect(buildPostPath({ id: 12, slug: '' })).toBe('/blog/12');
  });

  it('builds canonical urls from a site url and route path', () => {
    expect(buildCanonicalUrl('/blog/git-commands', 'https://aurorablog.me/')).toBe('https://aurorablog.me/blog/git-commands');
  });

  it('strips markdown syntax when building seo descriptions', () => {
    const description = buildSeoDescription('## Title\n\n![alt](./a.jpg)\nAurora **Blog** content');
    expect(description).toContain('Title');
    expect(description).toContain('Aurora Blog content');
    expect(description).not.toContain('![');
    expect(description.length).toBeLessThanOrEqual(160);
  });

  it('builds article json-ld from a blog payload', () => {
    const jsonLd = buildArticleJsonLd({
      title: 'Git 命令速查表',
      slug: 'git-commands',
      summary: 'Git commands summary',
      created_at: '2026-03-25T00:00:00.000Z',
      author: { nickname: 'Wh1stle' },
      cover_image: 'posts/cover.jpg',
    }, 'https://aurorablog.me', 'https://cdn.aurorablog.me');

    expect(jsonLd['@type']).toBe('BlogPosting');
    expect(jsonLd.headline).toBe('Git 命令速查表');
    expect(jsonLd.url).toBe('https://aurorablog.me/blog/git-commands');
    expect(jsonLd.image).toBe('https://cdn.aurorablog.me/posts/cover.jpg');
  });
});
