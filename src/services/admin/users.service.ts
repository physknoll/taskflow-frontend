import adminApi from './api';
import {
  AdminApiResponse,
  AdminPaginatedResponse,
  IAdminUserListItem,
  IAdminUserDetail,
  AdminUserParams,
} from '@/types/admin';

export const adminUsersService = {
  /**
   * List users with filters
   */
  async list(params?: AdminUserParams): Promise<AdminPaginatedResponse<IAdminUserListItem>> {
    const response = await adminApi.get<AdminPaginatedResponse<IAdminUserListItem>>('/users', { params });
    return response.data;
  },

  /**
   * Get user details
   */
  async getById(id: string): Promise<IAdminUserDetail> {
    const response = await adminApi.get<AdminApiResponse<IAdminUserDetail>>(`/users/${id}`);
    return response.data.data;
  },

  /**
   * Suspend user
   */
  async suspend(id: string, reason: string): Promise<IAdminUserDetail> {
    const response = await adminApi.post<AdminApiResponse<IAdminUserDetail>>(`/users/${id}/suspend`, { reason });
    return response.data.data;
  },

  /**
   * Unsuspend user
   */
  async unsuspend(id: string): Promise<IAdminUserDetail> {
    const response = await adminApi.post<AdminApiResponse<IAdminUserDetail>>(`/users/${id}/unsuspend`);
    return response.data.data;
  },

  /**
   * Impersonate user (super_admin only)
   */
  async impersonate(id: string): Promise<{
    token: string;
    expiresIn: string;
    targetUser: { id: string; email: string; firstName: string; lastName: string };
  }> {
    const response = await adminApi.post<AdminApiResponse<{
      token: string;
      expiresIn: string;
      targetUser: { id: string; email: string; firstName: string; lastName: string };
    }>>(`/users/${id}/impersonate`);
    return response.data.data;
  },

  /**
   * Delete user (requires email confirmation)
   */
  async delete(id: string, confirmEmail: string): Promise<void> {
    await adminApi.delete(`/users/${id}`, {
      data: { confirmEmail },
    });
  },
};

