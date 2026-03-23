'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('dark');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const storedTheme = window.localStorage.getItem('theme') || document.documentElement.getAttribute('data-theme') || 'dark';
    setTheme(storedTheme === 'light' ? 'light' : 'dark');
    document.documentElement.setAttribute('data-theme', storedTheme === 'light' ? 'light' : 'dark');
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.setAttribute('data-theme', theme);
    window.localStorage.setItem('theme', theme);
  }, [ready, theme]);

  const value = useMemo(() => ({
    theme,
    ready,
    toggleTheme: () => setTheme((current) => (current === 'dark' ? 'light' : 'dark')),
  }), [ready, theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('useTheme must be used within ThemeProvider');
  return value;
}
