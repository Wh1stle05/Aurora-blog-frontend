import BlogPage from '../../components/pages/blog-page-shell.jsx';
import { getBlogPage, getTags } from '../../lib/posts.js';
import { buildDefaultMetadata } from '../../lib/seo.js';

export const revalidate = 10;
export const metadata = buildDefaultMetadata({
  title: '技术博客',
  description: '浏览 Aurora Blog 的公开文章。',
  path: '/blog',
  image: 'images/background.webp',
});

export default async function BlogRoute() {
  const [pageResult, tagsResult] = await Promise.allSettled([
    getBlogPage({ page: 1, pageSize: 5 }),
    getTags(),
  ]);

  const pageData = pageResult.status === 'fulfilled'
    ? pageResult.value
    : { data: [], page: 1, total_pages: 1 };
  const tags = tagsResult.status === 'fulfilled' ? tagsResult.value : [];

  return (
    <BlogPage
      initialPosts={pageData.data || []}
      initialTags={tags || []}
      initialPageSize={5}
      initialPage={pageData.page || 1}
      initialTotalPages={pageData.total_pages || 1}
    />
  );
}
