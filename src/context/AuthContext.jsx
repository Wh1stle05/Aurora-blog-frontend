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
      const token = localStorage.getItem('access_token');
      if (!token) {
        setUser(null);
        localStorage.removeItem('user');
        return;
      }
      const res = await fetch(`${API_BASE_URL}/auth/me`, {
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
      await fetch(`${API_BASE_URL}/auth/logout`, { method: 'POST' });
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
