import HomePage from '../components/pages/home-page.jsx';
import { buildDefaultMetadata } from '../lib/seo.js';
import { getHomepagePosts, getHomepageStats } from '../lib/posts.js';

export const revalidate = 10;
export const metadata = buildDefaultMetadata({
  title: 'Aurora Blog',
  description: '一个充满科技感的个人博客系统，记录技术与生活的每一个瞬间。',
  path: '/',
  image: 'images/background.webp',
});

export default async function HomeRoute() {
  const [latestPosts, stats] = await Promise.all([
    getHomepagePosts(),
    getHomepageStats(),
  ]);

  return <HomePage initialLatestPosts={latestPosts} initialStats={stats} />;
}
