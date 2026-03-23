import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import BlogLoading from './loading.jsx';

vi.mock('../../components/pages/blog-list-page.jsx', () => ({
  BlogListSkeleton: ({ pageSize = 5 }) => (
    <div data-testid="blog-list-skeleton" data-page-size={pageSize}>blog-skeleton</div>
  ),
  BlogListLoadingShell: ({ pageSize = 5 }) => (
    <div className="PageContainer">
      <div>技术博客</div>
      <div data-testid="blog-list-skeleton" data-page-size={pageSize}>blog-skeleton</div>
    </div>
  ),
}));

test('renders blog loading inside the blog page container shell', () => {
  const { container } = render(<BlogLoading />);

  expect(screen.getByText('技术博客')).toBeInTheDocument();
  expect(screen.getByTestId('blog-list-skeleton')).toBeInTheDocument();
  expect(container.querySelector('.PageContainer')).toBeInTheDocument();
});
