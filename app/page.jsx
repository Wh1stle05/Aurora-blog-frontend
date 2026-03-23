import HomePage from '../components/pages/home-page.jsx';
import { buildDefaultMetadata } from '../lib/seo.js';
import { getHomepagePosts, getHomepageStats } from '../lib/posts.js';

export const revalidate = 120;
export const metadata = buildDefaultMetadata({
  title: 'Aurora Blog',
  description: '一个聚焦开发、部署与实践记录的技术博客。',
  path: '/',
  image: 'images/background.webp',
});

export default async function HomeRoute() {
  const [latestPosts, stats] = await Promise.all([
    getHomepagePosts(),
    getHomepageStats(),
  ]);

  return <HomePage latestPosts={latestPosts} stats={stats} />;
}
