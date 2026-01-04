import api, { setTokens, clearTokens } from './api';
import {
  IUser,
  IOrganization,
  LoginDto,
  RegisterDto,
  ApiResponse,
  SignupDto,
  SignupResponse,
  SignupOptionsResponse,
  CompleteProfileDto,
  CompleteProfileResponse,
  CreateOrganizationDto,
  CreateOrganizationResponse,
  VerifyCodeResponse,
} from '@/types';

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

  async getCurrentOrganization(): Promise<IOrganization> {
    const response = await api.get<ApiResponse<IOrganization>>('/organizations/current');
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

  // ============================================
  // Multi-Step Signup Flow
  // ============================================

  // Get dropdown options for signup form
  async getSignupOptions(): Promise<SignupOptionsResponse> {
    const response = await api.get<ApiResponse<SignupOptionsResponse>>('/auth/signup/options');
    return response.data.data;
  },

  // Step 1: Create account with email/password (sends verification code)
  async signup(data: SignupDto): Promise<SignupResponse> {
    const response = await api.post<ApiResponse<SignupResponse>>('/auth/signup', data);
    return response.data.data;
  },

  // Step 1b: Verify email with 6-digit code
  async verifyCode(email: string, code: string): Promise<VerifyCodeResponse> {
    const response = await api.post<ApiResponse<VerifyCodeResponse>>('/auth/verify-code', { email, code });
    const { token, refreshToken } = response.data.data;
    setTokens(token, refreshToken);
    return response.data.data;
  },

  // Step 2: Complete profile (optional fields)
  async completeProfile(data: CompleteProfileDto): Promise<CompleteProfileResponse> {
    const response = await api.post<ApiResponse<CompleteProfileResponse>>('/auth/signup/complete-profile', data);
    return response.data.data;
  },

  // Step 3: Create organization
  async createOrganization(data: CreateOrganizationDto): Promise<CreateOrganizationResponse> {
    const response = await api.post<ApiResponse<CreateOrganizationResponse>>('/auth/signup/create-organization', data);
    return response.data.data;
  },

  // Get Google OAuth URL
  getGoogleOAuthUrl(): string {
    const baseUrl = api.defaults.baseURL || '';
    return `${baseUrl}/auth/google`;
  },

  // Delete own account
  async deleteAccount(data: { password?: string; confirmDelete: string }): Promise<{ message: string }> {
    const response = await api.delete<ApiResponse<{ message: string }>>('/auth/account', { data });
    clearTokens();
    return response.data.data;
  },
};
