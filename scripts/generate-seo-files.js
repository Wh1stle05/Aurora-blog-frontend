import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

import { getDynamicRoutes, getDynamicRouteEntries, STATIC_SITEMAP_ROUTES } from './fetch-routes.js';

const DEFAULT_SITE_URL = process.env.VITE_SITE_URL || 'https://aurorablog.me';

export function buildRobotsTxt(siteUrl = DEFAULT_SITE_URL) {
  const normalized = siteUrl.replace(/\/+$/, '');
  return `User-agent: *\nAllow: /\nSitemap: ${normalized}/sitemap.xml\n`;
}

export function buildSitemapXml(entries, siteUrl = DEFAULT_SITE_URL) {
  const normalized = siteUrl.replace(/\/+$/, '');
  const urls = entries
    .map(({ path: routePath, lastModified }) => {
      const url = routePath === '/' ? `${normalized}/` : `${normalized}${routePath}`;
      const lastmod = lastModified ? `<lastmod>${lastModified}</lastmod>` : '';
      return `<url><loc>${url}</loc>${lastmod}</url>`;
    })
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;
}

export async function writeSeoFiles({
  outputDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public'),
  siteUrl = DEFAULT_SITE_URL,
  apiBase = process.env.VITE_API_BASE || 'https://api.aurorablog.me',
  fetchImpl = fetch,
} = {}) {
  const [dynamicEntries, dynamicRoutes] = await Promise.all([
    getDynamicRouteEntries({ fetchImpl, apiBase }),
    getDynamicRoutes({ fetchImpl, apiBase }),
  ]);

  const staticEntries = STATIC_SITEMAP_ROUTES.map((routePath) => ({ path: routePath }));
  const dynamicSitemapEntries = dynamicEntries.length
    ? dynamicEntries
    : dynamicRoutes.map((routePath) => ({ path: routePath }));

  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(path.join(outputDir, 'robots.txt'), buildRobotsTxt(siteUrl), 'utf8');
  await fs.writeFile(
    path.join(outputDir, 'sitemap.xml'),
    buildSitemapXml([...staticEntries, ...dynamicSitemapEntries], siteUrl),
    'utf8',
  );
}

const isEntrypoint = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);

if (isEntrypoint) {
  writeSeoFiles().catch((error) => {
    console.error('Failed to generate SEO files:', error);
    process.exitCode = 1;
  });
}
