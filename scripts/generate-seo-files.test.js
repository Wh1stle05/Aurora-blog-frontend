import { describe, expect, it } from 'vitest';

import { buildRobotsTxt, buildSitemapXml } from './generate-seo-files.js';

describe('generate-seo-files', () => {
  it('builds a robots.txt file pointing at the sitemap', () => {
    expect(buildRobotsTxt('https://aurorablog.me')).toContain('Sitemap: https://aurorablog.me/sitemap.xml');
  });

  it('builds sitemap xml entries for static and article routes', () => {
    const xml = buildSitemapXml(
      [
        { path: '/', lastModified: '2026-03-25T00:00:00.000Z' },
        { path: '/blog/git-commands', lastModified: '2026-03-25T01:00:00.000Z' },
      ],
      'https://aurorablog.me',
    );

    expect(xml).toContain('<loc>https://aurorablog.me/</loc>');
    expect(xml).toContain('<loc>https://aurorablog.me/blog/git-commands</loc>');
    expect(xml).toContain('<lastmod>2026-03-25T01:00:00.000Z</lastmod>');
  });
});
