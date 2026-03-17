import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, test, expect } from 'vitest';
import Home from './Home.jsx';

vi.mock('../../services/blogService.js', () => ({
  getPosts: vi.fn(() => Promise.resolve({
    data: [
      { id: 1, title: 'A', summary: 'S', created_at: new Date().toISOString(), view_count: 1 },
      { id: 2, title: 'B', summary: 'S', created_at: new Date().toISOString(), view_count: 2 },
      { id: 3, title: 'C', summary: 'S', created_at: new Date().toISOString(), view_count: 3 }
    ]
  })),
  getStats: vi.fn(() => Promise.resolve({
    success: true,
    data: { posts: 3, views: 10, comments: 1, likes: 2 }
  }))
}));

test('renders latest posts and about sections', async () => {
  render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>
  );

  expect(await screen.findByText('最新发布')).toBeInTheDocument();
  expect(screen.getByText('关于本站')).toBeInTheDocument();
});
