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
  const [enterPath, setEnterPath] = useState(null);
  const { user, setUser, logout, loading } = useAuth();
  const { theme, toggleTheme, ready } = useTheme();

  useEffect(() => {
    if (transitionTargetPath !== pathname) return;
    setTransitionTargetPath(null);
    setRouteTransitioning(false);
  }, [pathname, transitionTargetPath]);

  const handleNavigate = (nextPath) => {
    if (!nextPath || nextPath === pathname || routeTransitioning) return;
    setTransitionTargetPath(nextPath);
    setRouteTransitioning(true);
  };

  const handleExitComplete = () => {
    if (!routeTransitioning || !transitionTargetPath || enterPath === transitionTargetPath) return;
    setEnterPath(transitionTargetPath);
    router.push(transitionTargetPath);
  };

  const shellLoading = !ready || loading;
  const enteringCurrentPath = enterPath === pathname;
  const showingExitTransition = routeTransitioning && !enteringCurrentPath;
  const pageContent = (
    <motion.div
      key={pathname}
      className={`page-transition-wrapper${enteringCurrentPath ? ' page-transition-enter' : ''}`}
      initial={false}
      animate={{
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        transition: { duration: 0 },
      }}
      onAnimationComplete={enteringCurrentPath ? () => setEnterPath(null) : undefined}
    >
      {children}
    </motion.div>
  );

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
          ) : showingExitTransition ? (
            <motion.div
              className="page-transition-wrapper"
              initial={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
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
            pageContent
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
