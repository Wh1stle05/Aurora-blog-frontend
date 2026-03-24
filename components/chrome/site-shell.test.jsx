import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';

import { SiteShell } from './site-shell.jsx';

const push = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
  usePathname: () => '/',
}));

vi.mock('../../src/components/layout/Header/Header.jsx', () => ({
  default: ({ onNavigate, routeTransitioning, transitionTargetPath }) => (
    <>
      <button type="button" onClick={() => onNavigate('/blog')}>
        go-blog
      </button>
      <div data-testid="route-state">
        {routeTransitioning ? `transitioning:${transitionTargetPath}` : 'idle'}
      </div>
    </>
  ),
}));

vi.mock('../../src/components/layout/Footer/Footer.jsx', () => ({
  default: () => <footer>footer</footer>,
}));

vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }) => <>{children}</>,
  motion: new Proxy({}, {
    get: () => ({ children, initial, animate, exit: _exit, transition: _transition, onAnimationComplete, ...props }) => (
      <div
        data-testid={props.className === 'page-transition-wrapper' ? 'page-transition-wrapper' : undefined}
        data-initial={typeof initial === 'boolean' ? String(initial) : JSON.stringify(initial)}
        data-animate-state={animate?.opacity === 0 ? 'hidden' : 'visible'}
        onAnimationEnd={onAnimationComplete}
        {...props}
      >
        {children}
      </div>
    ),
  }),
}));

vi.mock('../../src/components/features/auth/AuthModal.jsx', () => ({
  default: () => null,
}));

vi.mock('../../src/context/useAuth.js', () => ({
  useAuth: () => ({
    user: null,
    setUser: vi.fn(),
    logout: vi.fn(),
    loading: false,
  }),
}));

vi.mock('../providers/theme-provider.jsx', () => ({
  useTheme: () => ({
    theme: 'dark',
    toggleTheme: vi.fn(),
    ready: true,
  }),
}));

test('starts route transition first and only pushes after exit completes', () => {
  const { container } = render(<SiteShell><div>page-body</div></SiteShell>);
  push.mockReset();
  window.scrollTo = vi.fn();

  fireEvent.click(screen.getByRole('button', { name: 'go-blog' }));

  expect(screen.getByTestId('route-state')).toHaveTextContent('transitioning:/blog');
  expect(container.querySelectorAll('[data-testid="blog-list-skeleton-card"]').length).toBe(0);
  expect(push).not.toHaveBeenCalled();

  fireEvent.animationEnd(screen.getByTestId('page-transition-wrapper'));

  expect(push).toHaveBeenCalledWith('/blog');
});
