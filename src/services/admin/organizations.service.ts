import adminApi from './api';
import {
  AdminApiResponse,
  AdminPaginatedResponse,
  IAdminOrganization,
  IAdminOrganizationDetail,
  AdminOrganizationParams,
} from '@/types/admin';

export const adminOrganizationsService = {
  /**
   * List organizations with filters
   */
  async list(params?: AdminOrganizationParams): Promise<AdminPaginatedResponse<IAdminOrganization>> {
    const response = await adminApi.get<AdminPaginatedResponse<IAdminOrganization>>('/organizations', { params });
    return response.data;
  },

  /**
   * Get organization details
   */
  async getById(id: string): Promise<IAdminOrganizationDetail> {
    const response = await adminApi.get<AdminApiResponse<IAdminOrganizationDetail>>(`/organizations/${id}`);
    return response.data.data;
  },

  /**
   * Update organization
   */
  async update(id: string, data: Partial<{ name: string; isActive: boolean }>): Promise<IAdminOrganization> {
    const response = await adminApi.patch<AdminApiResponse<IAdminOrganization>>(`/organizations/${id}`, data);
    return response.data.data;
  },

  /**
   * Flag organization
   */
  async flag(id: string, flag: boolean, reason?: string): Promise<IAdminOrganization> {
    const response = await adminApi.post<AdminApiResponse<IAdminOrganization>>(`/organizations/${id}/flag`, {
      flag,
      reason,
    });
    return response.data.data;
  },

  /**
   * Delete organization (requires name confirmation)
   */
  async delete(id: string, confirmName: string): Promise<void> {
    await adminApi.delete(`/organizations/${id}`, {
      data: { confirmName },
    });
  },
};
