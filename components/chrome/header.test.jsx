import { render } from '@testing-library/react';
import { expect, test, vi } from 'vitest';

import Header from './header.jsx';

vi.mock('next/navigation', () => ({
  usePathname: () => '/blog',
}));

vi.mock('framer-motion', () => ({
  motion: new Proxy({}, {
    get: () => ({ children, ...props }) => {
      const {
        initial,
        animate,
        transition,
        layoutId,
        style,
        ...domProps
      } = props;
      void initial;
      void animate;
      void transition;
      void layoutId;
      return <div style={style} {...domProps}>{children}</div>;
    },
  }),
  LayoutGroup: ({ children }) => <div>{children}</div>,
  useScroll: () => ({ scrollY: {}, scrollYProgress: {} }),
  useMotionValueEvent: () => {},
  useSpring: () => 0,
}));

test('does not reset scroll on pathname render', () => {
  window.scrollTo = vi.fn();

  render(
    <Header
      theme="dark"
      onToggleTheme={vi.fn()}
      onLoginClick={vi.fn()}
      user={null}
      onLogout={vi.fn()}
    />,
  );

  expect(window.scrollTo).not.toHaveBeenCalled();
});
