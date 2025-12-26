'use client';

import { useQuery } from '@tanstack/react-query';
import { adminSupportService } from '@/services/admin/support.service';
import { AdminConversationParams, AdminActivityParams, AdminAuditParams, AdminListParams } from '@/types/admin';

const SUPPORT_KEY = 'admin-support';

// Conversations
export function useAdminConversations(params?: AdminConversationParams) {
  return useQuery({
    queryKey: [SUPPORT_KEY, 'conversations', params],
    queryFn: () => adminSupportService.listConversations(params),
  });
}

export function useAdminConversation(id: string) {
  return useQuery({
    queryKey: [SUPPORT_KEY, 'conversation', id],
    queryFn: () => adminSupportService.getConversation(id),
    enabled: !!id,
  });
}

// Activity Logs
export function useAdminActivity(params?: AdminActivityParams) {
  return useQuery({
    queryKey: [SUPPORT_KEY, 'activity', params],
    queryFn: () => adminSupportService.listActivity(params),
  });
}

// Tickets
export function useAdminTickets(params?: AdminListParams & { 
  organizationId?: string; 
  status?: string; 
  priority?: string 
}) {
  return useQuery({
    queryKey: [SUPPORT_KEY, 'tickets', params],
    queryFn: () => adminSupportService.listTickets(params),
  });
}

// Audit Logs
export function useAdminAuditLogs(params?: AdminAuditParams) {
  return useQuery({
    queryKey: [SUPPORT_KEY, 'audit-logs', params],
    queryFn: () => adminSupportService.listAuditLogs(params),
  });
}



