'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

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
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
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
      {isAuthOpen ? (
        <AuthModal
          onClose={() => setIsAuthOpen(false)}
          onAuth={(data) => setUser(data.user)}
        />
      ) : null}
    </div>
  );
}
