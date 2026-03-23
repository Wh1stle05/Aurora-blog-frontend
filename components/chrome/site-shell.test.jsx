import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
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

beforeEach(() => {
  vi.useFakeTimers();
  push.mockReset();
  window.scrollTo = vi.fn();
});

afterEach(() => {
  vi.useRealTimers();
});

test('shows the large skeleton before pushing a new route', () => {
  const { container } = render(<SiteShell><div>page-body</div></SiteShell>);

  fireEvent.click(screen.getByRole('button', { name: 'go-blog' }));

  expect(screen.queryByText('页面切换中...')).not.toBeInTheDocument();
  expect(container.querySelectorAll('[data-testid="blog-list-skeleton-card"]').length).toBeGreaterThanOrEqual(1);
  expect(push).not.toHaveBeenCalled();

  vi.advanceTimersByTime(180);
  expect(push).toHaveBeenCalledWith('/blog');
});
