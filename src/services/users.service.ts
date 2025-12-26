import api from './api';
import { IUser, RegisterDto, ApiResponse, PaginatedResponse, IUserPermissions } from '@/types';

export interface UserFilters {
  role?: string;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

// Minimal user info for dropdowns/assignments
export interface IUserMinimal {
  _id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  avatar?: string;
  role: string;
  department?: string;
  jobTitle?: string;
}

// DTO for creating a new user (extends RegisterDto with all fields)
export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'manager' | 'employee' | 'client_viewer';
  // Required for client_viewer role
  clientId?: string;
  // Per-user permission settings
  permissions?: IUserPermissions;
}

// DTO for updating user permissions and settings
export interface UpdateUserPermissionsDto {
  role?: 'manager' | 'employee' | 'client_viewer';
  clientId?: string;
  permissions?: IUserPermissions;
}

export const usersService = {
  async getUsers(filters: UserFilters = {}): Promise<PaginatedResponse<IUser>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    const response = await api.get<PaginatedResponse<IUser>>(`/users?${params.toString()}`);
    return response.data;
  },

  async getUser(id: string): Promise<IUser> {
    const response = await api.get<ApiResponse<IUser>>(`/users/${id}`);
    return response.data.data;
  },

  async createUser(data: CreateUserDto): Promise<IUser> {
    const response = await api.post<ApiResponse<{ user: IUser }>>('/auth/register', data);
    return response.data.data.user;
  },

  async updateUser(id: string, data: Partial<IUser>): Promise<IUser> {
    const response = await api.put<ApiResponse<IUser>>(`/users/${id}`, data);
    return response.data.data;
  },

  // Update user permissions and role settings (owner only)
  async updateUserPermissions(id: string, data: UpdateUserPermissionsDto): Promise<IUser> {
    const response = await api.put<ApiResponse<IUser>>(`/users/${id}`, data);
    return response.data.data;
  },

  // Soft delete (deactivate) - sets isActive: false
  async deactivateUser(id: string): Promise<{ message: string }> {
    const response = await api.delete<ApiResponse<{ message: string }>>(`/users/${id}`);
    return response.data.data;
  },

  // Permanently delete user
  async permanentlyDeleteUser(id: string): Promise<{ message: string }> {
    const response = await api.delete<ApiResponse<{ message: string }>>(`/users/${id}/permanent`);
    return response.data.data;
  },

  // Reactivate a deactivated user
  async reactivateUser(id: string): Promise<IUser> {
    const response = await api.put<ApiResponse<IUser>>(`/users/${id}`, { isActive: true });
    return response.data.data;
  },

  async getUserStats(id: string): Promise<{
    ticketsCompleted: number;
    ticketsInProgress: number;
    averageCompletionTime: number;
    reviewPassRate: number;
    recentActivity: any[];
  }> {
    const response = await api.get<ApiResponse<any>>(`/users/${id}/stats`);
    return response.data.data;
  },

  async getUserTickets(id: string): Promise<any[]> {
    const response = await api.get<ApiResponse<any[]>>(`/users/${id}/tickets`);
    return response.data.data;
  },

  async assignClientToUser(userId: string, clientId: string): Promise<IUser> {
    const response = await api.post<ApiResponse<IUser>>(`/users/${userId}/clients`, { clientId });
    return response.data.data;
  },

  async removeClientFromUser(userId: string, clientId: string): Promise<IUser> {
    const response = await api.delete<ApiResponse<IUser>>(`/users/${userId}/clients/${clientId}`);
    return response.data.data;
  },

  // Search users for autocomplete/assignment
  async searchAssignableUsers(query: string, options?: { clientId?: string; limit?: number }): Promise<IUserMinimal[]> {
    const params = new URLSearchParams();
    params.append('q', query);
    if (options?.clientId) params.append('clientId', options.clientId);
    if (options?.limit) params.append('limit', String(options.limit));

    const response = await api.get<ApiResponse<IUserMinimal[]>>(`/users/search/assignable?${params.toString()}`);
    return response.data.data;
  },

  // Get minimal user list for dropdowns
  async getMinimalUserList(options?: { clientId?: string; role?: string }): Promise<IUserMinimal[]> {
    const params = new URLSearchParams();
    if (options?.clientId) params.append('clientId', options.clientId);
    if (options?.role) params.append('role', options.role);

    const response = await api.get<ApiResponse<IUserMinimal[]>>(`/users/list/minimal?${params.toString()}`);
    return response.data.data;
  },

  // Upload avatar image
  async uploadAvatar(userId: string, file: Blob): Promise<{ avatarUrl: string }> {
    const formData = new FormData();
    formData.append('avatar', file, 'avatar.jpg');

    const response = await api.post<ApiResponse<{ avatarUrl: string }>>(
      `/users/${userId}/avatar`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data;
  },

  // Delete avatar
  async deleteAvatar(userId: string): Promise<{ message: string }> {
    const response = await api.delete<ApiResponse<{ message: string }>>(`/users/${userId}/avatar`);
    return response.data.data;
  },
};

