import adminApi, { setAdminToken, clearAdminToken } from './api';
import { 
  IAdminUser, 
  AdminAuthResponse, 
  AdminLoginDto, 
  AdminApiResponse 
} from '@/types/admin';

export const adminAuthService = {
  /**
   * Login as admin
   */
  async login(data: AdminLoginDto): Promise<AdminAuthResponse> {
    const response = await adminApi.post<AdminApiResponse<AdminAuthResponse>>('/auth/login', data);
    const { token } = response.data.data;
    setAdminToken(token);
    return response.data.data;
  },

  /**
   * Logout admin
   */
  async logout(): Promise<void> {
    try {
      await adminApi.post('/auth/logout');
    } finally {
      clearAdminToken();
    }
  },

  /**
   * Get current admin user
   */
  async getCurrentAdmin(): Promise<IAdminUser> {
    const response = await adminApi.get<AdminApiResponse<IAdminUser>>('/auth/me');
    return response.data.data;
  },
};
