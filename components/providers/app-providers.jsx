'use client';

import { ToastProvider } from '../../src/context/ToastContext.jsx';
import { AuthProvider } from '../../src/context/AuthContext.jsx';
import { ThemeProvider } from './theme-provider.jsx';

export function AppProviders({ children }) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>{children}</AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
