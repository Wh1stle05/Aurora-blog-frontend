import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import Home from './Home.jsx';

vi.mock('../../services/blogService.js', () => ({
  getPosts: vi.fn(),
  getStats: vi.fn(),
}));

const { getPosts, getStats } = await import('../../services/blogService.js');

describe('Home', () => {
  beforeEach(() => {
    getPosts.mockResolvedValue({
      data: [
        {
          id: 12,
          slug: 'git-commands',
          title: 'Git 命令速查表',
          summary: 'summary',
          created_at: '2026-03-25T00:00:00.000Z',
          view_count: 1,
        },
      ],
    });
    getStats.mockResolvedValue({
      success: true,
      data: { posts: 1, views: 1, comments: 0, likes: 0 },
    });
  });

  it('links latest posts by slug when available', async () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );

    const link = await screen.findByRole('link', { name: /Git 命令速查表/i });
    expect(link).toHaveAttribute('href', '/blog/git-commands');
  });
});
