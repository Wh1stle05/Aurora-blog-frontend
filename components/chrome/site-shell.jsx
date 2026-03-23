'use client';

import { useState } from 'react';
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
