import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from './useToast.js';
import { AuthContext } from './AuthContextBase.js';
import { apiUrl } from '../utils/api.js';
import { AUTH_EXPIRED_EVENT } from '../services/blogService.js';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const checkAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setUser(null);
        localStorage.removeItem('user');
        return;
      }
      const res = await fetch(apiUrl('/api/auth/me'), {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        localStorage.setItem('user', JSON.stringify(data));
      } else {
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('access_token');
      }
    } catch (e) {
      console.error("Auth check failed:", e);
      setUser(null);
      localStorage.removeItem('access_token');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    let notified = false;
    const handleAuthExpired = () => {
      localStorage.removeItem('user');
      localStorage.removeItem('access_token');
      setUser(null);
      if (!notified) {
        toast.info('登录已过期，请重新登录');
        notified = true;
      }
    };

    window.addEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired);
  }, [toast]);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = async () => {
    try {
      await fetch(apiUrl('/api/auth/logout'), { method: 'POST' });
    } catch (e) {
      console.error("Logout failed:", e);
    }
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');
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
