'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { authService } from '@/services/auth.service';
import { getTokens } from '@/services/api';
import { SignupDto, CompleteProfileDto, CreateOrganizationDto } from '@/types';
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(
    async (email: string, password: string, redirectTo?: string) => {
      try {
        const response = await authService.login({ email, password });
        setTokens(response.token, response.refreshToken);
        setUser(response.user);
        toast.success(`Welcome back, ${response.user.firstName}!`);
        router.push(redirectTo || '/');
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

  // ============================================
  // Multi-Step Signup Flow
  // ============================================

  const getSignupOptions = useCallback(async () => {
    try {
      return await authService.getSignupOptions();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to load signup options';
      toast.error(message);
      throw error;
    }
  }, []);

  // Step 1: Create account
  const signup = useCallback(
    async (data: SignupDto) => {
      try {
        const response = await authService.signup(data);
        setTokens(response.token, response.refreshToken);
        setUser(response.user);
        toast.success('Account created! Please complete your profile.');
        return response;
      } catch (error: any) {
        const message = error.response?.data?.message || 'Signup failed';
        toast.error(message);
        throw error;
      }
    },
    [setTokens, setUser]
  );

  // Step 2: Complete profile
  const completeProfile = useCallback(
    async (data: CompleteProfileDto) => {
      try {
        const response = await authService.completeProfile(data);
        setUser(response.user);
        toast.success('Profile updated!');
        return response;
      } catch (error: any) {
        const message = error.response?.data?.message || 'Failed to update profile';
        toast.error(message);
        throw error;
      }
    },
    [setUser]
  );

  // Step 3: Create organization
  const createOrganization = useCallback(
    async (data: CreateOrganizationDto) => {
      try {
        const response = await authService.createOrganization(data);
        setUser(response.user);
        toast.success('Organization created! Welcome to TaskFlow AI.');
        router.push('/');
        return response;
      } catch (error: any) {
        const message = error.response?.data?.message || 'Failed to create organization';
        toast.error(message);
        throw error;
      }
    },
    [router, setUser]
  );

  // Google OAuth
  const initiateGoogleAuth = useCallback(() => {
    const url = authService.getGoogleOAuthUrl();
    window.location.href = url;
  }, []);

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    register,
    // Signup flow
    getSignupOptions,
    signup,
    completeProfile,
    createOrganization,
    initiateGoogleAuth,
  };
}

