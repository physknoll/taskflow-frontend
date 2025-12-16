import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ADMIN_API_URL } from '@/lib/admin-constants';

// Create axios instance for admin API
const adminApi: AxiosInstance = axios.create({
  baseURL: ADMIN_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Admin token management (separate from regular app tokens)
let adminAccessToken: string | null = null;

const ADMIN_TOKEN_KEY = 'taskflow_admin_token';

export function setAdminToken(token: string | null) {
  adminAccessToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem(ADMIN_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(ADMIN_TOKEN_KEY);
    }
  }
}

export function getAdminToken(): string | null {
  if (typeof window !== 'undefined' && !adminAccessToken) {
    adminAccessToken = localStorage.getItem(ADMIN_TOKEN_KEY);
  }
  return adminAccessToken;
}

export function clearAdminToken() {
  adminAccessToken = null;
  if (typeof window !== 'undefined') {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    // Also clear the zustand admin auth store
    localStorage.removeItem('taskflow-admin-auth');
  }
}

// Request interceptor
adminApi.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAdminToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling admin-specific errors
adminApi.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 - token expired (admin tokens don't refresh, just redirect to login)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      clearAdminToken();
      
      if (typeof window !== 'undefined') {
        // Redirect to admin login
        window.location.href = '/admin/login';
      }
      
      return Promise.reject(error);
    }

    // Handle 403 - role changed or insufficient permissions
    if (error.response?.status === 403) {
      const errorData = error.response.data as { code?: string };
      
      if (errorData?.code === 'ROLE_CHANGED') {
        clearAdminToken();
        if (typeof window !== 'undefined') {
          window.location.href = '/admin/login?reason=role_changed';
        }
      }
    }

    return Promise.reject(error);
  }
);

export default adminApi;

// Helper function for handling API errors
export function getAdminErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.message || 'An error occurred';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
}

