import { fireEvent, render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { SiteShell } from './site-shell.jsx';

const push = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
  usePathname: () => '/',
}));

vi.mock('./header.jsx', () => ({
  default: ({ onNavigate }) => (
    <button type="button" onClick={() => onNavigate('/blog')}>
      go-blog
    </button>
  ),
}));

vi.mock('./footer.jsx', () => ({
  default: () => <footer>footer</footer>,
}));

vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }) => <>{children}</>,
  motion: new Proxy({}, {
    get: () => ({ children, initial, animate, exit: _exit, transition: _transition, ...props }) => (
      <div
        data-testid={props.className === 'page-transition-wrapper' ? 'page-transition-wrapper' : undefined}
        data-initial={typeof initial === 'boolean' ? String(initial) : JSON.stringify(initial)}
        data-animate-state={animate?.opacity === 0 ? 'hidden' : 'visible'}
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

test('navigates immediately without forcing a route skeleton', () => {
  const { container } = render(<SiteShell><div>page-body</div></SiteShell>);
  push.mockReset();
  window.scrollTo = vi.fn();

  fireEvent.click(screen.getByRole('button', { name: 'go-blog' }));

  expect(screen.queryByText('页面切换中...')).not.toBeInTheDocument();
  expect(container.querySelectorAll('[data-testid="blog-list-skeleton-card"]').length).toBe(0);
  expect(push).toHaveBeenCalledWith('/blog');
});

test('disables initial page transition on first render to avoid hydration flash', () => {
  window.requestAnimationFrame = vi.fn(() => 1);
  window.cancelAnimationFrame = vi.fn();
  const { container } = render(<SiteShell><div>page-body</div></SiteShell>);

  expect(container.querySelector('[data-testid="page-transition-wrapper"]')).toHaveAttribute('data-animate-state', 'hidden');
});
