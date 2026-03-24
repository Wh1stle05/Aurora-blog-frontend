import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, expect, test, vi } from 'vitest';

import BlogDetail from './BlogDetail.jsx';
import { ToastContext } from '../../context/ToastContextBase.js';

const serviceMocks = vi.hoisted(() => ({
  getPost: vi.fn(),
  reactPost: vi.fn(),
}));

vi.mock('../../services/blogService.js', () => ({
  getPost: serviceMocks.getPost,
  reactPost: serviceMocks.reactPost,
}));

vi.mock('../../router/compat.jsx', () => ({
  Link: ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>,
  useParams: () => ({ slug: 'git-commands' }),
}));

vi.mock('../../components/layout/PageContainer/PageContainer.jsx', () => ({
  default: ({ children }) => <div>{children}</div>,
}));

vi.mock('../../components/layout/Body/Body.jsx', () => ({
  default: ({ children }) => <div>{children}</div>,
}));

vi.mock('../../components/layout/PageWrapper/PageWrapper.jsx', () => ({
  default: ({ children }) => <div>{children}</div>,
}));

vi.mock('../../components/features/blog/CommentSection.jsx', () => ({
  default: () => <div>comments</div>,
}));

vi.mock('../../components/features/blog/HighlightedCode.jsx', () => ({
  default: ({ code }) => <code>{code}</code>,
}));

vi.mock('react-markdown', () => ({
  default: ({ children }) => <div>{children}</div>,
}));

vi.mock('remark-gfm', () => ({
  default: () => null,
}));

vi.mock('./imageTransform.js', () => ({
  transformImageUri: (src) => src,
}));

vi.mock('../../utils/assets.js', () => ({
  resolveAssetUrl: (value) => value,
}));

vi.mock('framer-motion', () => ({
  motion: new Proxy({}, {
    get: () => ({ children, ...props }) => <div {...props}>{children}</div>,
  }),
  AnimatePresence: ({ children }) => <>{children}</>,
}));

beforeEach(() => {
  serviceMocks.getPost.mockReset();
  serviceMocks.reactPost.mockReset();
  window.Prism = undefined;
});

test('keeps SSR detail content on first mount instead of immediately refetching it', async () => {
  serviceMocks.getPost.mockRejectedValue(new Error('should not refetch on first mount'));

  render(
    <ToastContext.Provider value={{ success: vi.fn(), error: vi.fn(), info: vi.fn() }}>
      <BlogDetail
        routeParam="git-commands"
        initialPost={{
          id: 1,
          title: 'Git 命令速查表',
          content: '正文',
          tags: null,
          created_at: '2026-03-24T00:00:00.000Z',
          view_count: 3,
          like_count: 0,
          dislike_count: 0,
          comment_count: 0,
          user_reaction: 0,
          images: [],
          author: { nickname: 'Wh1stle' },
        }}
      />
    </ToastContext.Provider>,
  );

  expect(screen.getByRole('heading', { name: 'Git 命令速查表' })).toBeInTheDocument();
  expect(screen.getByText('正文')).toBeInTheDocument();

  await waitFor(() => {
    expect(serviceMocks.getPost).not.toHaveBeenCalled();
  });
});
