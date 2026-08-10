import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('careerforge_token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.success) {
            setUser(res.user);
          } else {
            localStorage.removeItem('careerforge_token');
          }
        } catch (err) {
          console.warn('Auth check session expired:', err.message);
          localStorage.removeItem('careerforge_token');
        }
      }
      setLoading(false);
    };
    checkLoggedIn();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.success && res.token) {
      localStorage.setItem('careerforge_token', res.token);
      setUser(res.user);
    }
    return res;
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.success && res.token) {
      localStorage.setItem('careerforge_token', res.token);
      setUser(res.user);
    }
    return res;
  };

  const googleLogin = async (googleData) => {
    const res = await api.post('/auth/google', googleData);
    if (res.success && res.token) {
      localStorage.setItem('careerforge_token', res.token);
      setUser(res.user);
    }
    return res;
  };

  const logout = () => {
    localStorage.removeItem('careerforge_token');
    setUser(null);
  };

  const updateUserProfile = (newProfile) => {
    if (user) {
      setUser({ ...user, profile: newProfile });
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, googleLogin, logout, updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
