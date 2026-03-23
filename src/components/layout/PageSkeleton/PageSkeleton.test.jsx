import { render, screen } from '@testing-library/react';

import PageSkeleton from './PageSkeleton.jsx';

test('renders the legacy-style centered skeleton with slightly larger placeholder lines', () => {
  const { container } = render(<PageSkeleton message="页面加载中..." />);

  expect(screen.getByText('页面加载中...')).toBeInTheDocument();
  expect(container.querySelector('[data-testid="page-skeleton-inner"]')).toBeInTheDocument();
  expect(container.querySelector('[data-testid="page-skeleton-frame"]')).not.toBeInTheDocument();
  expect(container.querySelectorAll('.skeleton').length).toBe(3);
});
