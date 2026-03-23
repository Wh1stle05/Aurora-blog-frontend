import { render, screen } from '@testing-library/react';

import PageSkeleton from './PageSkeleton.jsx';

test('renders a substantial page skeleton shell to avoid footer jump during route loading', () => {
  const { container } = render(<PageSkeleton message="页面加载中..." />);

  expect(screen.getByText('页面加载中...')).toBeInTheDocument();
  expect(container.querySelectorAll('.skeleton').length).toBeGreaterThanOrEqual(5);
});
