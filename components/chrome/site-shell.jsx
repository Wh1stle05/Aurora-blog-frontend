'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';

import Header from '../../src/components/layout/Header/Header.jsx';
import Footer from '../../src/components/layout/Footer/Footer.jsx';
import AuthModal from '../../src/components/features/auth/AuthModal.jsx';
import PageSkeleton from '../../src/components/layout/PageSkeleton/PageSkeleton.jsx';
import { useAuth } from '../../src/context/useAuth.js';
import { RouteNavigationProvider } from '../../src/router/compat.jsx';
import { useTheme } from '../providers/theme-provider.jsx';

export function SiteShell({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [routeTransitioning, setRouteTransitioning] = useState(false);
  const [transitionTargetPath, setTransitionTargetPath] = useState(null);
  const { user, setUser, logout, loading } = useAuth();
  const { theme, toggleTheme, ready } = useTheme();

  useEffect(() => {
    if (!transitionTargetPath || pathname !== transitionTargetPath) return;
    setTransitionTargetPath(null);
  }, [pathname, transitionTargetPath]);

  const handleNavigate = (nextPath) => {
    if (!nextPath || nextPath === pathname || routeTransitioning) return;
    setTransitionTargetPath(nextPath);
    setRouteTransitioning(true);
  };

  const handleExitComplete = () => {
    if (!routeTransitioning || !transitionTargetPath) return;
    setRouteTransitioning(false);
    router.push(transitionTargetPath);
  };

  const shellLoading = !ready || loading;

  return (
    <RouteNavigationProvider navigate={handleNavigate} pendingPath={transitionTargetPath}>
      <div className="app-root">
        <Header
          theme={theme}
          onToggleTheme={toggleTheme}
          onLoginClick={() => setIsAuthOpen(true)}
          user={user}
          onLogout={logout}
          onNavigate={handleNavigate}
          routeTransitioning={routeTransitioning}
          transitionTargetPath={transitionTargetPath}
        />
        <main className="page-shell">
          {shellLoading ? (
            <PageSkeleton message="同步站点状态..." />
          ) : routeTransitioning ? (
            <motion.div
              className="page-transition-wrapper"
              initial={false}
              animate={{
                opacity: 0,
                y: -16,
                filter: 'blur(8px)',
                transition: { duration: 0.24, ease: 'easeInOut' },
              }}
              onAnimationComplete={handleExitComplete}
            >
              {children}
            </motion.div>
          ) : (
            children
          )}
        </main>
        <Footer />
        <AnimatePresence>
          {isAuthOpen ? (
            <AuthModal
              onClose={() => setIsAuthOpen(false)}
              onAuth={(data) => setUser(data.user)}
            />
          ) : null}
        </AnimatePresence>
      </div>
    </RouteNavigationProvider>
  );
}
