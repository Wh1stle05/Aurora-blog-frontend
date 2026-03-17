import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from './useToast.js';
import { AuthContext } from './AuthContextBase.js';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/me`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        localStorage.setItem('user', JSON.stringify(data));
      } else {
        setUser(null);
        localStorage.removeItem('user');
      }
    } catch (e) {
      console.error("Auth check failed:", e);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, { method: 'POST', credentials: 'include' });
    } catch (e) {
      console.error("Logout failed:", e);
    }
    localStorage.removeItem('user');
    setUser(null);
    toast.info('已退出登录');
  };

  const value = {
    user,
    loading,
    login,
    logout,
    checkAuth,
    setUser // 兼容旧代码直接 setUser 的需求
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
