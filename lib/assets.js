import { PUBLIC_ASSET_CDN_BASE } from './env.js';
import { getApiBase, normalizeBaseUrl } from './api.js';

export const CDN_BASE = normalizeBaseUrl(PUBLIC_ASSET_CDN_BASE);

export function resolveAssetUrl(value, options = {}) {
  if (!value) return value;
  if (value.startsWith('http://') || value.startsWith('https://')) return value;

  const apiBase = normalizeBaseUrl(options.apiBase || getApiBase());
  const cdnBase = normalizeBaseUrl(options.cdnBase || CDN_BASE);

  if (value.startsWith('/')) {
    return apiBase ? `${apiBase}${value}` : value;
  }

  if (!cdnBase) {
    return value;
  }

  return `${cdnBase}/${value.replace(/^\/+/, '')}`;
}

function decodeFilename(value) {
  if (!value) return '';
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function extractFilename(uri) {
  const placeholderMatch = uri.match(/^\{\{IMAGE_(.+)\}\}$/);
  const rawName = placeholderMatch ? placeholderMatch[1] : uri.split('/').pop()?.split('?')[0];
  return decodeFilename(rawName || '');
}

export function transformImageUri(uri, post, options = {}) {
  if (!uri) return uri;
  if (uri.startsWith('http://') || uri.startsWith('https://')) return uri;

  const filename = extractFilename(uri);
  if (filename && post?.images?.length) {
    const matchedImage = post.images.find((image) => image.filename === filename);
    if (matchedImage?.object_key) {
      return resolveAssetUrl(matchedImage.object_key, options);
    }
  }

  if (uri.startsWith('/uploads')) {
    return resolveAssetUrl(uri, options);
  }

  return uri;
}
