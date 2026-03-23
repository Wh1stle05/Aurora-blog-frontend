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

export function transformImageUri(uri, post, resolveAssetUrl) {
  if (!uri) return uri;
  if (uri.startsWith('http://') || uri.startsWith('https://')) return uri;

  const filename = extractFilename(uri);
  if (filename && post?.images?.length) {
    const matchedImg = post.images.find((img) => img.filename === filename);
    if (matchedImg?.object_key) {
      return resolveAssetUrl(matchedImg.object_key);
    }
  }

  if (uri.startsWith('/uploads')) {
    return resolveAssetUrl(uri);
  }

  return uri;
}
