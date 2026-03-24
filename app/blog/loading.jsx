import { BlogListSkeleton, BlogPageShell } from '../../components/pages/blog-page-shell.jsx';

export default function BlogLoading() {
  return (
    <BlogPageShell>
      <BlogListSkeleton pageSize={5} />
    </BlogPageShell>
  );
}
