import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import HomePage from './home-page.jsx';

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }) => <a href={href} {...props}>{children}</a>,
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

vi.mock('../../src/legacy-pages/Home/uptime.js', () => ({
  formatUptimeDays: () => '2d',
}));

test('renders the restored home second screen content without uptime duplication or stray undefined text', () => {
  render(
    <HomePage
      latestPosts={[
        {
          id: 1,
          slug: 'git-commands',
          title: 'Git 命令速查表',
          summary: '一份常用命令整理。',
          created_at: '2026-03-23T00:00:00.000Z',
          view_count: 12,
        },
      ]}
      stats={{ posts: 3, views: 10, likes: 2 }}
    />,
  );

  expect(screen.getByText('关于我')).toBeInTheDocument();
  expect(screen.getByText('这里是我的博客，记录着技术学习和感悟。')).toBeInTheDocument();
  expect(screen.getByText('2d')).toBeInTheDocument();
  expect(screen.queryByText('2dd')).not.toBeInTheDocument();
  expect(screen.queryByText('undefined')).not.toBeInTheDocument();
  expect(screen.queryByText('站点定位')).not.toBeInTheDocument();
});
