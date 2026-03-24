'use client';

import NextLink from 'next/link';
import { useParams as useNextParams, usePathname, useRouter } from 'next/navigation';
import { createContext, useContext, useMemo } from 'react';

const RouteNavigationContext = createContext({
  navigate: null,
  pendingPath: null,
});

function isModifiedEvent(event) {
  return event.metaKey || event.altKey || event.ctrlKey || event.shiftKey;
}

function isExternalPath(value) {
  return typeof value === 'string' && /^(https?:)?\/\//.test(value);
}

function normalizeTo(value) {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object' && typeof value.pathname === 'string') {
    const search = value.search || '';
    const hash = value.hash || '';
    return `${value.pathname}${search}${hash}`;
  }
  return String(value || '/');
}

export function RouteNavigationProvider({ children, navigate, pendingPath = null }) {
  const value = useMemo(() => ({ navigate, pendingPath }), [navigate, pendingPath]);
  return <RouteNavigationContext.Provider value={value}>{children}</RouteNavigationContext.Provider>;
}

export function Link({ to, onClick, children, target, managedNavigation = false, ...props }) {
  const href = normalizeTo(to);
  const { navigate } = useContext(RouteNavigationContext);

  if (isExternalPath(href)) {
    return (
      <a href={href} onClick={onClick} target={target} {...props}>
        {children}
      </a>
    );
  }

  const handleClick = (event) => {
    onClick?.(event);
    if (
      event.defaultPrevented ||
      !managedNavigation ||
      !navigate ||
      target === '_blank' ||
      event.button !== 0 ||
      isModifiedEvent(event)
    ) {
      return;
    }
    event.preventDefault();
    navigate(href);
  };

  return (
    <NextLink href={href} prefetch={false} onClick={handleClick} target={target} {...props}>
      {children}
    </NextLink>
  );
}

export function NavLink({ to, className, children, ...props }) {
  const pathname = usePathname();
  const { pendingPath } = useContext(RouteNavigationContext);
  const href = normalizeTo(to);
  const activePath = pendingPath || pathname;
  const isActive = href === '/' ? activePath === '/' : activePath === href || activePath?.startsWith(`${href}/`);
  const resolvedClassName = typeof className === 'function' ? className({ isActive }) : className;
  const resolvedChildren = typeof children === 'function' ? children({ isActive }) : children;

  return (
    <Link to={href} managedNavigation className={resolvedClassName} {...props}>
      {resolvedChildren}
    </Link>
  );
}

export function useLocation() {
  const pathname = usePathname();

  return useMemo(() => ({
    pathname,
    search: '',
    hash: '',
  }), [pathname]);
}

export function useNavigate() {
  const router = useRouter();
  const { navigate } = useContext(RouteNavigationContext);

  return (to, options = {}) => {
    const href = normalizeTo(to);
    if (options.replace) {
      router.replace(href);
      return;
    }
    if (navigate) {
      navigate(href);
      return;
    }
    router.push(href);
  };
}

export function useParams() {
  return useNextParams();
}
