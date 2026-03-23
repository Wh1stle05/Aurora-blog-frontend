import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import HomePage from './home-page.jsx';

vi.mock('../../src/router/compat.jsx', () => ({
  Link: ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>,
}));

vi.mock('framer-motion', () => ({
  motion: new Proxy({}, {
    get: () => ({ children, ...props }) => {
      const {
        initial,
        animate,
        transition,
        variants,
        whileHover,
        whileInView,
        viewport,
        ...domProps
      } = props;
      void initial;
      void animate;
      void transition;
      void variants;
      void whileHover;
      void whileInView;
      void viewport;
      return <div {...domProps}>{children}</div>;
    },
  }),
}));

test('renders the frozen legacy home UI with badge, title, action buttons, second screen, and static uptime copy', () => {
  render(
    <HomePage
      initialLatestPosts={[
        {
          id: 1,
          slug: 'git-commands',
          title: 'Git 命令速查表',
          summary: '一份常用命令整理。',
          created_at: '2026-03-23T00:00:00.000Z',
          view_count: 12,
        },
      ]}
      initialStats={{ posts: 3, views: 10, likes: 2, comments: 0 }}
    />,
  );

  expect(screen.getByText('Explore the edge of code')).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /欢迎来到/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '开始阅读' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '关于作者' })).toBeInTheDocument();
  expect(screen.getByText('关于本站')).toBeInTheDocument();
  expect(screen.getByText('核心技术栈')).toBeInTheDocument();
  expect(screen.getByText('关于空间')).toBeInTheDocument();
  expect(screen.getByText('365d+')).toBeInTheDocument();
});
