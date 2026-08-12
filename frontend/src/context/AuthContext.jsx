import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import api from '../services/api';

const TOKEN_KEY = 'accessToken';
const USER_KEY = 'social_app_user';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const setToken = useCallback((token) => {
    localStorage.setItem(TOKEN_KEY, token);
  }, []);

  const cacheUser = useCallback((userData) => {
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }, []);

  const initAuth = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    console.log('[AuthContext] initAuth() START - token present:', !!token, 'token preview:', token?.substring(0, 20) + '...');

    if (!token) {
      console.log('[AuthContext] initAuth() - NO token, clearing session');
      clearSession();
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      console.log('[AuthContext] initAuth() - calling getMe()...');
      const res = await authService.getMe();
      const currentUser = res.data.data.user;
      console.log('[AuthContext] initAuth() - getMe() SUCCESS, user:', currentUser.name);
      setUser(currentUser);
      cacheUser(currentUser);
    } catch (err) {
      console.warn('[AuthContext] initAuth() - getMe() FAILED:', err.response?.status, err.message);

      try {
        console.log('[AuthContext] initAuth() - attempting refreshToken()...');
        const refreshRes = await authService.refreshToken();
        const newToken = refreshRes.data.data.accessToken;
        console.log('[AuthContext] initAuth() - refreshToken() SUCCESS');
        setToken(newToken);

        const res = await authService.getMe();
        const currentUser = res.data.data.user;
        console.log('[AuthContext] initAuth() - getMe() after refresh SUCCESS, user:', currentUser.name);
        setUser(currentUser);
        cacheUser(currentUser);
      } catch (refreshErr) {
        console.error('[AuthContext] initAuth() - refreshToken() FAILED:', refreshErr.response?.status, refreshErr.message);
        clearSession();
        setUser(null);
      }
    } finally {
      console.log('[AuthContext] initAuth() END - loading set to false.');
      setLoading(false);
    }
  }, [cacheUser, clearSession, setToken]);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  const login = async (email, password) => {
    const res = await authService.login(email, password);
    const { accessToken, user: userData } = res.data.data;
    setToken(accessToken);
    cacheUser(userData);
    setUser(userData);
    navigate('/');
    return res;
  };

  const register = async (name, email, password) => {
    const res = await authService.register(name, email, password);
    const { accessToken, user: userData } = res.data.data;
    setToken(accessToken);
    cacheUser(userData);
    setUser(userData);
    navigate('/');
    return res;
  };

  const logout = async () => {
    console.log('[AuthContext] logout() START');
    console.log('[AuthContext] logout() - localStorage BEFORE clear:', {
      accessToken: localStorage.getItem(TOKEN_KEY)?.substring(0, 20) + '...',
      social_app_user: localStorage.getItem(USER_KEY)?.substring(0, 30) + '...',
    });

    try {
      console.log('[AuthContext] logout() - calling authService.logout()...');
      await authService.logout();
      console.log('[AuthContext] logout() - authService.logout() SUCCESS');
    } catch (err) {
      console.error('[AuthContext] logout() - authService.logout() FAILED:', err.response?.status, err.message);
    }

    clearSession();
    console.log('[AuthContext] logout() - clearSession() done. AFTER clear:', {
      accessToken: localStorage.getItem(TOKEN_KEY),
      social_app_user: localStorage.getItem(USER_KEY),
    });

    delete api.defaults.headers.common['Authorization'];
    console.log('[AuthContext] logout() - deleted Authorization header');

    setUser(null);
    console.log('[AuthContext] logout() - setUser(null) called');

    console.log('[AuthContext] logout() - navigating to /login');
    navigate('/login', { replace: true });
    console.log('[AuthContext] logout() END');
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    cacheUser(updatedUser);
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, register, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
