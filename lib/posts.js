import { apiJson } from './api.js';

export function getPostHref(post) {
  return `/blog/${post?.slug || post?.id}`;
}

export async function getHomepagePosts() {
  const payload = await apiJson('/api/posts/paginated?page=1&page_size=3', {}, {
    next: { revalidate: 120 },
  });
  return payload?.data?.data || [];
}

export async function getHomepageStats() {
  const payload = await apiJson('/api/stats', {}, {
    next: { revalidate: 120 },
  });
  return payload?.data || { posts: 0, views: 0, comments: 0, likes: 0 };
}

export async function getBlogPage({ page = 1, pageSize = 5, search = '', tag = '', sortBy = 'created_at' } = {}) {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
    sort_by: sortBy,
  });

  if (search) params.set('search', search);
  if (tag) params.set('tag', tag);

  const payload = await apiJson(`/api/posts/paginated?${params.toString()}`, {}, {
    next: { revalidate: 120 },
  });

  return payload?.data || { data: [], total_pages: 1, page: 1, total: 0 };
}

export async function getPostBySlug(slug, { skipView = true } = {}) {
  const query = skipView ? '?skip_view=true' : '';
  return apiJson(`/api/posts/${slug}${query}`, {}, {
    next: { revalidate: 120 },
  });
}

export async function getAboutContent() {
  return apiJson('/api/about', {}, {
    next: { revalidate: 300 },
  });
}

export async function getTags() {
  return apiJson('/api/tags', {}, {
    next: { revalidate: 300 },
  });
}

export async function listAllPublishedPosts() {
  const pageSize = 50;
  let page = 1;
  const posts = [];

  while (true) {
    const payload = await apiJson(`/api/posts/paginated?page=${page}&page_size=${pageSize}`, {}, {
      next: { revalidate: 300 },
    });

    const current = payload?.data?.data || [];
    const totalPages = payload?.data?.total_pages || 1;
    posts.push(...current.filter((post) => post?.slug));

    if (page >= totalPages || current.length === 0) {
      break;
    }

    page += 1;
  }

  return posts;
}
