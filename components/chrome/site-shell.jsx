'use client';

import { useState } from 'react';

import Header from './header.jsx';
import Footer from './footer.jsx';
import AuthModal from '../../src/components/features/auth/AuthModal.jsx';
import PageSkeleton from '../../src/components/layout/PageSkeleton/PageSkeleton.jsx';
import { useAuth } from '../../src/context/useAuth.js';
import { useTheme } from '../providers/theme-provider.jsx';

export function SiteShell({ children }) {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const { user, setUser, logout, loading } = useAuth();
  const { theme, toggleTheme, ready } = useTheme();

  return (
    <div className="app-root">
      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        onLoginClick={() => setIsAuthOpen(true)}
        user={user}
        onLogout={logout}
      />
      <main className="page-shell">
        {!ready || loading ? <PageSkeleton message="同步站点状态..." /> : children}
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
