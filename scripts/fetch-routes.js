const DEFAULT_API_BASE = process.env.VITE_API_BASE || 'https://api.aurorablog.me';
const PAGE_SIZE = 50;
const RETRY_ATTEMPTS = 3;

export const STATIC_PRERENDER_ROUTES = ['/', '/about', '/contact'];
export const STATIC_SITEMAP_ROUTES = ['/', '/blog', '/about', '/contact'];

async function fetchJson(fetchImpl, url) {
  let lastError;

  for (let attempt = 1; attempt <= RETRY_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetchImpl(url);
      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      lastError = error;
      if (attempt === RETRY_ATTEMPTS) {
        throw error;
      }
    }
  }

  throw lastError;
}

export async function getDynamicRoutes({
  fetchImpl = fetch,
  apiBase = DEFAULT_API_BASE,
} = {}) {
  const entries = await getDynamicRouteEntries({ fetchImpl, apiBase });
  return entries.map((entry) => entry.path);
}

export async function getDynamicRouteEntries({
  fetchImpl = fetch,
  apiBase = DEFAULT_API_BASE,
} = {}) {
  const routes = [];
  let page = 1;
  let totalPages = 1;

  try {
    do {
      const payload = await fetchJson(
        fetchImpl,
        `${apiBase.replace(/\/+$/, '')}/api/posts/paginated?page=${page}&page_size=${PAGE_SIZE}`,
      );

      const posts = payload?.data?.data || [];
      totalPages = payload?.data?.total_pages || 1;

      posts.forEach((post) => {
        if (post?.slug) {
          routes.push({
            path: `/blog/${post.slug}`,
            lastModified: post.updated_at || post.created_at || null,
          });
        }
      });

      page += 1;
    } while (page <= totalPages);
  } catch (error) {
    console.error('Failed to fetch dynamic prerender routes:', error);
    return [];
  }

  return routes;
}
