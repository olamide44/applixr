import { useRouter } from 'next/router';
import React, { createContext, useContext, useEffect, useState } from 'react';
import api from './api';
import { User } from './types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (token: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await api.get('/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setUser(response.data);
    } catch (err) {
      localStorage.removeItem('token');
      setError('Session expired. Please login again.');
    } finally {
      setLoading(false);
    }
  };

  const login = async (token: string) => {
    try {
      localStorage.setItem('token', token);
      const response = await api.get('/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setUser(response.data);
      router.push('/dashboard');
    } catch (err) {
      setError('Failed to login');
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 