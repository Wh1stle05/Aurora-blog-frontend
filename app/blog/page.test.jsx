import React from 'react';
import { render, screen } from '@testing-library/react';
import { beforeEach, expect, test, vi } from 'vitest';

const getBlogPage = vi.fn();
const getTags = vi.fn();

vi.mock('../../lib/posts.js', () => ({
  getBlogPage,
  getTags,
}));

vi.mock('../../components/pages/blog-page-shell.jsx', () => ({
  default: ({ initialPosts, initialTags, initialPage, initialTotalPages }) => (
    <div>
      <div data-testid="posts-count">{initialPosts.length}</div>
      <div data-testid="tags-count">{initialTags.length}</div>
      <div data-testid="page">{initialPage}</div>
      <div data-testid="total-pages">{initialTotalPages}</div>
    </div>
  ),
}));

beforeEach(() => {
  getBlogPage.mockReset();
  getTags.mockReset();
});

test('falls back to an empty blog page when prerender data fetch fails', async () => {
  getBlogPage.mockRejectedValue(new Error('Request failed: 502'));
  getTags.mockRejectedValue(new Error('Request failed: 502'));

  const { default: BlogRoute } = await import('./page.jsx');
  const ui = await BlogRoute();
  render(ui);

  expect(screen.getByTestId('posts-count')).toHaveTextContent('0');
  expect(screen.getByTestId('tags-count')).toHaveTextContent('0');
  expect(screen.getByTestId('page')).toHaveTextContent('1');
  expect(screen.getByTestId('total-pages')).toHaveTextContent('1');
});
