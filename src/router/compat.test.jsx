import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';

import { Link, NavLink, RouteNavigationProvider } from './compat.jsx';

const nextLinkSpy = vi.fn();

vi.mock('next/link', () => ({
  default: ({ href, prefetch, onClick, children, ...props }) => {
    nextLinkSpy({ href, prefetch, ...props });
    return (
      <a href={href} onClick={onClick} data-prefetch={String(prefetch)} {...props}>
        {children}
      </a>
    );
  },
}));

vi.mock('next/navigation', () => ({
  useParams: () => ({}),
  usePathname: () => '/',
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

test('Link disables next prefetch and does not delegate navigation by default', () => {
  const navigate = vi.fn();
  nextLinkSpy.mockClear();

  render(
    <RouteNavigationProvider navigate={navigate}>
      <Link to="/blog/test-post" onClick={(event) => event.preventDefault()}>go</Link>
    </RouteNavigationProvider>,
  );

  fireEvent.click(screen.getByRole('link', { name: 'go' }));

  expect(nextLinkSpy).toHaveBeenCalledWith(expect.objectContaining({
    href: '/blog/test-post',
    prefetch: false,
  }));
  expect(navigate).not.toHaveBeenCalled();
});

test('NavLink delegates navigation through provider for animated top-level routes', () => {
  const navigate = vi.fn();
  nextLinkSpy.mockClear();

  render(
    <RouteNavigationProvider navigate={navigate}>
      <NavLink to="/blog">blog</NavLink>
    </RouteNavigationProvider>,
  );

  fireEvent.click(screen.getByRole('link', { name: 'blog' }));

  expect(navigate).toHaveBeenCalledWith('/blog');
});
