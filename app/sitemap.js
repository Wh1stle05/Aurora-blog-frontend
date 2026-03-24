import { listAllPublishedPosts } from '../lib/posts.js';
import { buildCanonical } from '../lib/seo.js';

export default async function sitemap() {
  const posts = await listAllPublishedPosts().catch(() => []);
  const staticRoutes = ['/', '/blog', '/about', '/contact'];

  const staticEntries = staticRoutes.map((path) => ({
    url: buildCanonical(path),
    lastModified: new Date(),
    changeFrequency: path === '/' ? 'daily' : 'weekly',
    priority: path === '/' ? 1 : 0.7,
  }));

  const postEntries = posts.map((post) => ({
    url: buildCanonical(`/blog/${post.slug}`),
    lastModified: post.updated_at || post.created_at,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticEntries, ...postEntries];
}
