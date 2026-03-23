'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';

import Header from './header.jsx';
import Footer from './footer.jsx';
import AuthModal from '../../src/components/features/auth/AuthModal.jsx';
import PageSkeleton from '../../src/components/layout/PageSkeleton/PageSkeleton.jsx';
import { useAuth } from '../../src/context/useAuth.js';
import { useTheme } from '../providers/theme-provider.jsx';

function PageTransitionLayer({ pathname, children }) {
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const raf = window.requestAnimationFrame(() => {
      setEntered(true);
    });

    return () => window.cancelAnimationFrame(raf);
  }, [pathname]);

  return (
    <motion.div
      key={pathname}
      data-enter-state={entered ? 'visible' : 'hidden'}
      className="page-transition-wrapper"
      initial={false}
      animate={{
        opacity: entered ? 1 : 0,
        y: entered ? 0 : 18,
        filter: entered ? 'blur(0px)' : 'blur(8px)',
        transition: entered
          ? { type: 'spring', stiffness: 220, damping: 26 }
          : { duration: 0 },
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
  );
}

export function SiteShell({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const { user, setUser, logout, loading } = useAuth();
  const { theme, toggleTheme, ready } = useTheme();

  const handleNavigate = (nextPath) => {
    if (!nextPath || nextPath === pathname) return;
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    router.push(nextPath);
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
      />
      <main className="page-shell">
        {shellLoading ? (
          <PageSkeleton message="同步站点状态..." />
        ) : (
          <AnimatePresence mode="wait">
            <PageTransitionLayer pathname={pathname} key={pathname}>
              {children}
            </PageTransitionLayer>
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
