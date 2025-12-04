'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { authService } from '@/services/auth.service';
import { getTokens } from '@/services/api';
import toast from 'react-hot-toast';

export function useAuth() {
  const router = useRouter();
  const { user, token, isAuthenticated, isLoading, setUser, setTokens, logout: storeLogout, setLoading } = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      const { accessToken } = getTokens();
      
      if (accessToken && !user) {
        try {
          const userData = await authService.getCurrentUser();
          setUser(userData);
        } catch (error) {
          // Token invalid, logout
          storeLogout();
        }
      } else {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const response = await authService.login({ email, password });
        setTokens(response.token, response.refreshToken);
        setUser(response.user);
        toast.success(`Welcome back, ${response.user.firstName}!`);
        router.push('/');
        return response;
      } catch (error: any) {
        const message = error.response?.data?.message || 'Login failed';
        toast.error(message);
        throw error;
      }
    },
    [router, setTokens, setUser]
  );

  const logout = useCallback(() => {
    authService.logout().catch(() => {});
    storeLogout();
    toast.success('Logged out successfully');
    router.push('/login');
  }, [router, storeLogout]);

  const register = useCallback(
    async (data: { email: string; password: string; firstName: string; lastName: string; role: 'manager' | 'employee' }) => {
      try {
        const response = await authService.register(data);
        toast.success('User created successfully');
        return response;
      } catch (error: any) {
        const message = error.response?.data?.message || 'Registration failed';
        toast.error(message);
        throw error;
      }
    },
    []
  );

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    register,
  };
}

