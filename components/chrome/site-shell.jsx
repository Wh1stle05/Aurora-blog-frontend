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
    if (!nextPath || nextPath === pathname) return;
    // Allow interrupting existing transition if it's a different target
    if (routeTransitioning && nextPath === transitionTargetPath) return;
    
    setTransitionTargetPath(nextPath);
    setRouteTransitioning(true);
  };

  const handleExitComplete = () => {
    if (!routeTransitioning || !transitionTargetPath) return;
    setEnterPath(transitionTargetPath);
    router.push(transitionTargetPath);
  };

  const shellLoading = !ready || loading;
  const enteringCurrentPath = enterPath === pathname;
  
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
          ) : (
            <AnimatePresence mode="wait" onExitComplete={handleExitComplete}>
              {!routeTransitioning ? (
                <motion.div
                  key={pathname}
                  className="page-transition-wrapper"
                  initial={enteringCurrentPath ? { opacity: 0, y: 10, filter: 'blur(4px)' } : false}
                  animate={{ 
                    opacity: 1, 
                    y: 0, 
                    filter: 'blur(0px)',
                    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } 
                  }}
                  exit={{ 
                    opacity: 0, 
                    y: -12, 
                    filter: 'blur(4px)',
                    transition: { duration: 0.2, ease: 'easeInOut' } 
                  }}
                  onAnimationComplete={() => {
                    if (enteringCurrentPath) setEnterPath(null);
                  }}
                >
                  {children}
                </motion.div>
              ) : null}
            </AnimatePresence>
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
