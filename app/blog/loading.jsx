import { BlogListSkeleton } from '../../components/pages/blog-list-page.jsx';

export default function BlogLoading() {
  return <BlogListSkeleton pageSize={5} />;
}
