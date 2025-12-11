'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuthStore } from '@/stores/adminAuthStore';
import { adminAuthService } from '@/services/admin/auth.service';
import { getAdminToken } from '@/services/admin/api';
import { AdminLoginDto } from '@/types/admin';
import toast from 'react-hot-toast';

export function useAdminAuth() {
  const router = useRouter();
  const { 
    user, 
    token, 
    isAuthenticated, 
    isLoading, 
    setUser, 
    setToken, 
    logout: storeLogout, 
    setLoading 
  } = useAdminAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      const adminToken = getAdminToken();
      
      if (adminToken && !user) {
        try {
          const userData = await adminAuthService.getCurrentAdmin();
          setUser(userData);
        } catch (error: any) {
          // Token invalid or network error - logout
          console.error('Admin auth initialization failed:', error?.message || error);
          storeLogout();
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    initAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(
    async (data: AdminLoginDto, redirectTo?: string) => {
      try {
        const response = await adminAuthService.login(data);
        setToken(response.token);
        setUser(response.user);
        toast.success(`Welcome, ${response.user.firstName}!`);
        router.push(redirectTo || '/admin/dashboard');
        return response;
      } catch (error: any) {
        const message = error.response?.data?.message || 'Login failed';
        toast.error(message);
        throw error;
      }
    },
    [router, setToken, setUser]
  );

  const logout = useCallback(() => {
    adminAuthService.logout().catch(() => {});
    storeLogout();
    toast.success('Logged out successfully');
    router.push('/admin/login');
  }, [router, storeLogout]);

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    platformRole: user?.platformRole,
    login,
    logout,
  };
}
