import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import Blog from './Blog.jsx';

vi.mock('../../services/blogService.js', () => ({
  getPosts: vi.fn(),
  getTags: vi.fn(),
}));

const { getPosts, getTags } = await import('../../services/blogService.js');

describe('Blog', () => {
  beforeEach(() => {
    getTags.mockResolvedValue([]);
    getPosts.mockResolvedValue({
      data: [
        {
          id: 12,
          slug: 'git-commands',
          title: 'Git 命令速查表',
          summary: 'summary',
          created_at: '2026-03-25T00:00:00.000Z',
          view_count: 1,
          like_count: 0,
          dislike_count: 0,
          comment_count: 0,
          author: 'Wh1stle',
        },
      ],
      total_pages: 1,
    });
  });

  it('links blog cards by slug when available', async () => {
    render(
      <MemoryRouter>
        <Blog />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByRole('link', { name: /Git 命令速查表/i })).toHaveAttribute('href', '/blog/git-commands');
    });
  });
});
