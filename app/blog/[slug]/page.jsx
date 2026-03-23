import { notFound } from 'next/navigation';

import BlogDetailPage from '../../../components/pages/blog-detail-page.jsx';
import { getPostBySlug } from '../../../lib/posts.js';
import { buildPostJsonLd, buildPostMetadata } from '../../../lib/seo.js';

export const revalidate = 120;

export async function generateMetadata({ params }) {
  try {
    const { slug } = await params;
    const post = await getPostBySlug(slug, { skipView: true });
    return buildPostMetadata(post);
  } catch {
    return {};
  }
}

export default async function BlogDetailRoute({ params }) {
  try {
    const { slug } = await params;
    const post = await getPostBySlug(slug, { skipView: true });
    const jsonLd = buildPostJsonLd(post);

    return (
      <>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <BlogDetailPage initialPost={post} slug={slug} />
      </>
    );
  } catch {
    notFound();
  }
}
