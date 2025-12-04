import api, { setTokens, clearTokens } from './api';
import { IUser, LoginDto, RegisterDto, ApiResponse } from '@/types';

interface AuthResponse {
  user: IUser;
  token: string;
  refreshToken: string;
}

export const authService = {
  async login(data: LoginDto): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', data);
    const { token, refreshToken, user } = response.data.data;
    setTokens(token, refreshToken);
    return response.data.data;
  },

  async register(data: RegisterDto): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', data);
    const { token, refreshToken } = response.data.data;
    setTokens(token, refreshToken);
    return response.data.data;
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } finally {
      clearTokens();
    }
  },

  async getCurrentUser(): Promise<IUser> {
    const response = await api.get<ApiResponse<IUser>>('/auth/me');
    return response.data.data;
  },

  async refreshTokens(): Promise<{ token: string; refreshToken: string }> {
    const response = await api.post<ApiResponse<{ token: string; refreshToken: string }>>('/auth/refresh');
    const { token, refreshToken } = response.data.data;
    setTokens(token, refreshToken);
    return response.data.data;
  },

  async updateProfile(data: Partial<IUser>): Promise<IUser> {
    const response = await api.put<ApiResponse<IUser>>('/auth/profile', data);
    return response.data.data;
  },

  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<void> {
    await api.post('/auth/change-password', data);
  },

  // Email verification
  async verifyEmail(token: string): Promise<{ message: string }> {
    const response = await api.post<ApiResponse<{ message: string }>>('/auth/verify-email', { token });
    return response.data.data;
  },

  async resendVerification(email: string): Promise<{ message: string }> {
    const response = await api.post<ApiResponse<{ message: string }>>('/auth/resend-verification', { email });
    return response.data.data;
  },

  // Password reset
  async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await api.post<ApiResponse<{ message: string }>>('/auth/forgot-password', { email });
    return response.data.data;
  },

  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    const response = await api.post<ApiResponse<{ message: string }>>('/auth/reset-password', { token, password });
    return response.data.data;
  },

  // Account setup (for invited users)
  async setupAccount(token: string, password: string): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/setup-account', { token, password });
    const { token: authToken, refreshToken } = response.data.data;
    setTokens(authToken, refreshToken);
    return response.data.data;
  },
};
