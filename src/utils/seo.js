const DEFAULT_SITE_URL = import.meta.env.VITE_SITE_URL || 'https://aurorablog.me';
const DEFAULT_CDN_BASE = import.meta.env.VITE_ASSET_CDN_BASE || 'https://cdn.aurorablog.me';

function normalizeBase(value) {
  return typeof value === 'string' ? value.replace(/\/+$/, '') : '';
}

export function buildPostPath(post) {
  if (!post) return '/blog';
  return `/blog/${post.slug || post.id}`;
}

export function buildCanonicalUrl(path = '/', siteUrl = DEFAULT_SITE_URL) {
  const base = normalizeBase(siteUrl);
  if (!path || path === '/') return `${base}/`;
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

export function buildSeoDescription(content = '', limit = 160) {
  const collapsed = String(content)
    .replace(/!\[[^\]]*]\([^)]*\)/g, ' ')
    .replace(/\[[^\]]*]\([^)]*\)/g, ' ')
    .replace(/[`*_>#-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return collapsed.slice(0, limit);
}

export function resolveSeoImage(image, cdnBase = DEFAULT_CDN_BASE) {
  if (!image) return `${normalizeBase(cdnBase)}/images/background.webp`;
  if (/^(https?:)?\/\//.test(image)) return image;
  return `${normalizeBase(cdnBase)}/${String(image).replace(/^\/+/, '')}`;
}

export function buildArticleJsonLd(post, siteUrl = DEFAULT_SITE_URL, cdnBase = DEFAULT_CDN_BASE) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: buildSeoDescription(post.summary || post.content || ''),
    url: buildCanonicalUrl(buildPostPath(post), siteUrl),
    datePublished: post.created_at,
    image: resolveSeoImage(post.cover_image, cdnBase),
    author: {
      '@type': 'Person',
      name: post.author?.nickname || post.author || 'Aurora',
    },
  };
}

export function buildDefaultMeta({
  title,
  description,
  path,
  image = 'images/background.webp',
  siteUrl = DEFAULT_SITE_URL,
  cdnBase = DEFAULT_CDN_BASE,
  type = 'website',
}) {
  const canonical = buildCanonicalUrl(path, siteUrl);
  const imageUrl = resolveSeoImage(image, cdnBase);

  return {
    title,
    description,
    canonical,
    imageUrl,
    type,
  };
}
