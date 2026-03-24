import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';

import { Link, RouteNavigationProvider } from './compat.jsx';

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

test('Link disables next prefetch and delegates navigation through provider', () => {
  const navigate = vi.fn();
  nextLinkSpy.mockClear();

  render(
    <RouteNavigationProvider navigate={navigate}>
      <Link to="/blog/test-post">go</Link>
    </RouteNavigationProvider>,
  );

  fireEvent.click(screen.getByRole('link', { name: 'go' }));

  expect(nextLinkSpy).toHaveBeenCalledWith(expect.objectContaining({
    href: '/blog/test-post',
    prefetch: false,
  }));
  expect(navigate).toHaveBeenCalledWith('/blog/test-post');
});
