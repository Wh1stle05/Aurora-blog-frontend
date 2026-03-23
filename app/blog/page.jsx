import BlogListPage from '../../components/pages/blog-list-page.jsx';
import { getBlogPage, getTags } from '../../lib/posts.js';
import { buildDefaultMetadata } from '../../lib/seo.js';

export const revalidate = 120;
export const metadata = buildDefaultMetadata({
  title: '技术博客',
  description: '按发布时间、阅读量和点赞量浏览 Aurora Blog 的公开文章。',
  path: '/blog',
  image: 'images/background.webp',
});

export default async function BlogRoute() {
  const [pageData, tags] = await Promise.all([
    getBlogPage({ page: 1, pageSize: 5 }),
    getTags(),
  ]);

  return (
    <BlogListPage
      initialPosts={pageData.data || []}
      initialTags={tags || []}
      initialPageSize={5}
      initialPage={pageData.page || 1}
      initialTotalPages={pageData.total_pages || 1}
    />
  );
}
