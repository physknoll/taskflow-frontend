import adminApi from './api';
import {
  AdminApiResponse,
  AdminPaginatedResponse,
  IAdminConversation,
  IAdminConversationDetail,
  IAdminActivityLog,
  IAdminAuditLog,
  IAdminTicket,
  AdminConversationParams,
  AdminActivityParams,
  AdminAuditParams,
  AdminListParams,
} from '@/types/admin';

export const adminSupportService = {
  // ============================================
  // Conversations
  // ============================================
  
  /**
   * List AI conversations
   */
  async listConversations(params?: AdminConversationParams): Promise<AdminPaginatedResponse<IAdminConversation>> {
    const response = await adminApi.get<AdminPaginatedResponse<IAdminConversation>>('/support/conversations', { params });
    return response.data;
  },

  /**
   * Get conversation details
   */
  async getConversation(id: string): Promise<IAdminConversationDetail> {
    const response = await adminApi.get<AdminApiResponse<IAdminConversationDetail>>(`/support/conversations/${id}`);
    return response.data.data;
  },

  // ============================================
  // Activity Logs
  // ============================================

  /**
   * List activity logs
   */
  async listActivity(params?: AdminActivityParams): Promise<AdminPaginatedResponse<IAdminActivityLog>> {
    const response = await adminApi.get<AdminPaginatedResponse<IAdminActivityLog>>('/support/activity', { params });
    return response.data;
  },

  // ============================================
  // Tickets
  // ============================================

  /**
   * List tickets
   */
  async listTickets(params?: AdminListParams & { 
    organizationId?: string; 
    status?: string; 
    priority?: string 
  }): Promise<AdminPaginatedResponse<IAdminTicket>> {
    const response = await adminApi.get<AdminPaginatedResponse<IAdminTicket>>('/support/tickets', { params });
    return response.data;
  },

  // ============================================
  // Audit Logs
  // ============================================

  /**
   * List admin audit logs
   */
  async listAuditLogs(params?: AdminAuditParams): Promise<AdminPaginatedResponse<IAdminAuditLog>> {
    const response = await adminApi.get<AdminPaginatedResponse<IAdminAuditLog>>('/support/audit-logs', { params });
    return response.data;
  },
};

