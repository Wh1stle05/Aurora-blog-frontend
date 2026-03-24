import { BlogPageShell, BlogListSkeleton } from '../../../components/pages/blog-page-shell.jsx';

export default function PostLoading() {
  return (
    <BlogPageShell>
      <BlogListSkeleton pageSize={1} />
    </BlogPageShell>
  );
}
