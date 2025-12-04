import api from './api';
import { INotification, ApiResponse, PaginatedResponse } from '@/types';

export interface NotificationFilters {
  isRead?: boolean;
  type?: string;
  page?: number;
  limit?: number;
}

export const notificationsService = {
  async getNotifications(filters: NotificationFilters = {}): Promise<{ data: INotification[]; unreadCount: number }> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    const response = await api.get<PaginatedResponse<INotification> & { unreadCount: number }>(`/notifications?${params.toString()}`);
    return {
      data: response.data.data,
      unreadCount: response.data.unreadCount || response.data.data.filter(n => !n.isRead).length,
    };
  },

  async markAsRead(id: string): Promise<INotification> {
    const response = await api.patch<ApiResponse<INotification>>(`/notifications/${id}/read`);
    return response.data.data;
  },

  async markAllAsRead(): Promise<void> {
    await api.patch('/notifications/read-all');
  },

  async dismiss(id: string): Promise<void> {
    await api.delete(`/notifications/${id}`);
  },

  async getUnreadCount(): Promise<number> {
    const response = await api.get<ApiResponse<{ count: number }>>('/notifications/unread-count');
    return response.data.data.count;
  },
};

