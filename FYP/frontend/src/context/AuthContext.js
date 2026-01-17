import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../api/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('access_token');

    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password, role) => {
    try {
      const response = await authAPI.login({ email, password, role });
      const { user: userData, access, refresh } = response.data;

      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user', JSON.stringify(userData));

      setUser(userData);
      return { success: true, user: userData };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Login failed';
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const registerStudent = async (data) => {
    try {
      console.log('Registering student with data:', { ...data, password: '[HIDDEN]', confirm_password: '[HIDDEN]' });
      const response = await authAPI.registerStudent(data);
      console.log('Registration response:', response.data);
      const { user: userData, access, refresh } = response.data;

      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user', JSON.stringify(userData));

      setUser(userData);
      return { success: true, user: userData };
    } catch (error) {
      console.error('Student registration error:', error.response?.data || error.message);
      const errorMessage = error.response?.data || 'Registration failed';
      return { success: false, error: errorMessage };
    }
  };

  const registerCleaner = async (data) => {
    try {
      console.log('Registering cleaner with data:', { ...data, password: '[HIDDEN]', confirm_password: '[HIDDEN]' });
      const response = await authAPI.registerCleaner(data);
      console.log('Registration response:', response.data);
      const { user: userData, access, refresh } = response.data;

      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user', JSON.stringify(userData));

      setUser(userData);
      return { success: true, user: userData };
    } catch (error) {
      console.error('Cleaner registration error:', error.response?.data || error.message);
      const errorMessage = error.response?.data || 'Registration failed';
      return { success: false, error: errorMessage };
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    registerStudent,
    registerCleaner,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
