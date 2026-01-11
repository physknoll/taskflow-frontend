'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatWidgetService } from '@/services/chat-widget.service';
import {
  ChatWidgetConfigForm,
  WidgetSessionsQuery,
} from '@/types/chat-widget';
import toast from 'react-hot-toast';

/**
 * Query keys for chat widget data
 */
export const chatWidgetKeys = {
  all: ['chatWidget'] as const,
  config: (clientId: string) => [...chatWidgetKeys.all, 'config', clientId] as const,
  analytics: (clientId: string) => [...chatWidgetKeys.all, 'analytics', clientId] as const,
  sessions: (clientId: string, query?: WidgetSessionsQuery) =>
    [...chatWidgetKeys.all, 'sessions', clientId, query] as const,
  geo: (clientId: string) => [...chatWidgetKeys.all, 'geo', clientId] as const,
};

/**
 * Fetch chat widget configuration for a client
 * Returns undefined if not configured (404)
 */
export function useChatWidgetConfig(clientId: string) {
  return useQuery({
    queryKey: chatWidgetKeys.config(clientId),
    queryFn: () => chatWidgetService.getConfig(clientId),
    enabled: !!clientId,
    retry: false, // Don't retry on 404 - widget may not be configured yet
  });
}

/**
 * Save (create or update) chat widget configuration
 */
export function useSaveChatWidgetConfig(clientId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (config: ChatWidgetConfigForm) =>
      chatWidgetService.saveConfig(clientId, config),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: chatWidgetKeys.config(clientId) });
      toast.success('Chat widget configuration saved');

      // If this is a new widget, show the API key
      if (data.apiKey) {
        // The API key is returned - it should be displayed to the user
        // This is handled in the component via the return value
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to save configuration');
    },
  });
}

/**
 * Update existing chat widget configuration
 */
export function useUpdateChatWidgetConfig(clientId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (config: Partial<ChatWidgetConfigForm>) =>
      chatWidgetService.updateConfig(clientId, config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatWidgetKeys.config(clientId) });
      toast.success('Configuration updated');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update configuration');
    },
  });
}

/**
 * Delete/disable chat widget
 */
export function useDeleteChatWidgetConfig(clientId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => chatWidgetService.deleteConfig(clientId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatWidgetKeys.config(clientId) });
      queryClient.invalidateQueries({ queryKey: chatWidgetKeys.analytics(clientId) });
      toast.success('Chat widget disabled');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to disable widget');
    },
  });
}

/**
 * Regenerate API key for the widget
 */
export function useRegenerateApiKey(clientId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => chatWidgetService.regenerateKey(clientId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatWidgetKeys.config(clientId) });
      // Note: The new API key is returned in the mutation result
      // The component should display it to the user
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to regenerate API key');
    },
  });
}

/**
 * Fetch widget analytics overview
 */
export function useChatWidgetAnalytics(clientId: string, enabled = true) {
  return useQuery({
    queryKey: chatWidgetKeys.analytics(clientId),
    queryFn: () => chatWidgetService.getAnalytics(clientId),
    enabled: !!clientId && enabled,
    staleTime: 60_000, // 1 minute
  });
}

/**
 * Fetch paginated session list
 */
export function useChatWidgetSessions(
  clientId: string,
  query: WidgetSessionsQuery = {},
  enabled = true
) {
  return useQuery({
    queryKey: chatWidgetKeys.sessions(clientId, query),
    queryFn: () => chatWidgetService.getSessions(clientId, query),
    enabled: !!clientId && enabled,
    staleTime: 30_000, // 30 seconds
  });
}

/**
 * Fetch geographic analytics
 */
export function useChatWidgetGeoAnalytics(clientId: string, enabled = true) {
  return useQuery({
    queryKey: chatWidgetKeys.geo(clientId),
    queryFn: () => chatWidgetService.getGeoAnalytics(clientId),
    enabled: !!clientId && enabled,
    staleTime: 60_000, // 1 minute
  });
}
