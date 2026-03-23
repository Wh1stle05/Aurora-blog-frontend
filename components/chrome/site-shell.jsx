'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';

import Header from './header.jsx';
import Footer from './footer.jsx';
import AuthModal from '../../src/components/features/auth/AuthModal.jsx';
import PageSkeleton from '../../src/components/layout/PageSkeleton/PageSkeleton.jsx';
import { useAuth } from '../../src/context/useAuth.js';
import { useTheme } from '../providers/theme-provider.jsx';

export function SiteShell({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isRouteLoading, setIsRouteLoading] = useState(false);
  const [pendingPath, setPendingPath] = useState(null);
  const { user, setUser, logout, loading } = useAuth();
  const { theme, toggleTheme, ready } = useTheme();
  const navigateTimerRef = useRef(null);
  const revealTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (navigateTimerRef.current) window.clearTimeout(navigateTimerRef.current);
      if (revealTimerRef.current) window.clearTimeout(revealTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!pendingPath || pathname !== pendingPath) return;
    if (revealTimerRef.current) window.clearTimeout(revealTimerRef.current);
    revealTimerRef.current = window.setTimeout(() => {
      setIsRouteLoading(false);
      setPendingPath(null);
    }, 280);
  }, [pathname, pendingPath]);

  const handleNavigate = (nextPath) => {
    if (!nextPath || nextPath === pathname || pendingPath === nextPath) return;
    if (navigateTimerRef.current) window.clearTimeout(navigateTimerRef.current);
    if (revealTimerRef.current) window.clearTimeout(revealTimerRef.current);

    setPendingPath(nextPath);
    setIsRouteLoading(true);

    navigateTimerRef.current = window.setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      router.push(nextPath);
    }, 180);
  };

  const shellLoading = !ready || loading;

  return (
    <div className="app-root">
      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        onLoginClick={() => setIsAuthOpen(true)}
        user={user}
        onLogout={logout}
        onNavigate={handleNavigate}
        routeTransitioning={isRouteLoading}
      />
      <main className="page-shell">
        {shellLoading || isRouteLoading ? (
          <PageSkeleton message={shellLoading ? '同步站点状态...' : '页面切换中...'} />
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              className="page-transition-wrapper"
              initial={{ opacity: 0, y: 18, filter: 'blur(8px)' }}
              animate={{
                opacity: 1,
                y: 0,
                filter: 'blur(0px)',
                transition: { type: 'spring', stiffness: 220, damping: 26 },
              }}
              exit={{
                opacity: 0,
                y: -16,
                filter: 'blur(8px)',
                transition: { duration: 0.24, ease: 'easeInOut' },
              }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        )}
      </main>
      <Footer />
      {isAuthOpen ? (
        <AuthModal
          onClose={() => setIsAuthOpen(false)}
          onAuth={(data) => setUser(data.user)}
        />
      ) : null}
    </div>
  );
}
