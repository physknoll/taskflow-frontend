import adminApi from './api';
import {
  AdminApiResponse,
  IAdminUser,
  PlatformRole,
} from '@/types/admin';

export const adminAdminsService = {
  /**
   * List all platform admins
   */
  async list(): Promise<IAdminUser[]> {
    const response = await adminApi.get<AdminApiResponse<IAdminUser[]>>('/admins');
    return response.data.data;
  },

  /**
   * Invite a user to become a platform admin
   */
  async invite(email: string, platformRole: PlatformRole): Promise<IAdminUser> {
    const response = await adminApi.post<AdminApiResponse<IAdminUser>>('/admins/invite', {
      email,
      platformRole,
    });
    return response.data.data;
  },

  /**
   * Change an admin's platform role
   */
  async changeRole(id: string, platformRole: PlatformRole): Promise<IAdminUser> {
    const response = await adminApi.patch<AdminApiResponse<IAdminUser>>(`/admins/${id}/role`, {
      platformRole,
    });
    return response.data.data;
  },

  /**
   * Revoke admin access
   */
  async revoke(id: string): Promise<void> {
    await adminApi.delete(`/admins/${id}`);
  },
};

