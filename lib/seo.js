import { PUBLIC_SITE_URL } from './env.js';
import { getPostHref } from './posts.js';
import { resolveAssetUrl } from './assets.js';

export function siteUrl(path = '') {
  const base = PUBLIC_SITE_URL.replace(/\/+$/, '');
  if (!path) return base;
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

export function buildCanonical(path) {
  return siteUrl(path);
}

export function buildDefaultMetadata({ title, description, path = '/', image } = {}) {
  const canonical = buildCanonical(path);
  const resolvedImage = image ? resolveAssetUrl(image) : siteUrl('/og-default.jpg');
  const finalTitle = title ? `${title} | Aurora Blog` : 'Aurora Blog';
  const finalDescription = description || '一个聚焦开发、部署与实践记录的技术博客。';

  return {
    title: finalTitle,
    description: finalDescription,
    alternates: { canonical },
    openGraph: {
      title: finalTitle,
      description: finalDescription,
      url: canonical,
      siteName: 'Aurora Blog',
      type: 'website',
      images: [{ url: resolvedImage }],
    },
    twitter: {
      card: 'summary_large_image',
      title: finalTitle,
      description: finalDescription,
      images: [resolvedImage],
    },
  };
}

export function buildPostMetadata(post) {
  const description = post.summary || post.content?.slice(0, 160) || 'Aurora Blog 文章';
  const path = getPostHref(post);
  const image = post.cover_image || post.images?.[0]?.object_key || 'images/background.webp';
  return buildDefaultMetadata({
    title: post.title,
    description,
    path,
    image,
  });
}

export function buildPostJsonLd(post) {
  const url = buildCanonical(getPostHref(post));
  const image = resolveAssetUrl(post.cover_image || post.images?.[0]?.object_key || 'images/background.webp');
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.summary || post.content?.slice(0, 160) || '',
    image: [image],
    datePublished: post.created_at,
    dateModified: post.updated_at || post.created_at,
    author: {
      '@type': 'Person',
      name: post.author?.nickname || 'Aurora',
    },
    mainEntityOfPage: url,
    url,
  };
}
