'use client';

import { useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { integrationsService, GoogleChatStatus, GoogleChatPreferences } from '@/services/integrations.service';
import toast from 'react-hot-toast';

// Query keys
export const googleChatKeys = {
  all: ['google-chat'] as const,
  status: () => [...googleChatKeys.all, 'status'] as const,
};

/**
 * Hook for managing Google Chat integration
 * Handles connection status, connecting/disconnecting, and preference updates
 */
export function useGoogleChatIntegration() {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  // Check for connection params from Google Chat redirect
  const pendingSpace = searchParams.get('space');
  const pendingEmail = searchParams.get('user');
  const hasPendingConnection = !!(pendingSpace && pendingEmail);

  // Fetch current connection status
  const {
    data: status,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: googleChatKeys.status(),
    queryFn: () => integrationsService.getGoogleChatStatus(),
    staleTime: 30000, // 30 seconds
    retry: 1,
  });

  // Connect mutation
  const connectMutation = useMutation({
    mutationFn: integrationsService.connectGoogleChat,
    onSuccess: () => {
      toast.success('Google Chat connected successfully!');
      queryClient.invalidateQueries({ queryKey: googleChatKeys.status() });
      // Clear URL params after successful connection
      if (typeof window !== 'undefined') {
        window.history.replaceState({}, '', window.location.pathname);
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to connect Google Chat';
      toast.error(message);
    },
  });

  // Disconnect mutation
  const disconnectMutation = useMutation({
    mutationFn: integrationsService.disconnectGoogleChat,
    onSuccess: () => {
      toast.success('Google Chat disconnected');
      queryClient.invalidateQueries({ queryKey: googleChatKeys.status() });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to disconnect Google Chat';
      toast.error(message);
    },
  });

  // Update preferences mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: integrationsService.updateGoogleChatPreferences,
    onSuccess: (data) => {
      toast.success('Preferences updated');
      // Optimistically update the cache
      queryClient.setQueryData<GoogleChatStatus>(googleChatKeys.status(), (old) => {
        if (!old) return old;
        return {
          ...old,
          preferences: data.preferences,
        };
      });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update preferences';
      toast.error(message);
    },
  });

  // Connect function that uses pending params
  const connect = useCallback(() => {
    if (!pendingSpace || !pendingEmail) {
      toast.error('Missing connection parameters. Please start from Google Chat.');
      return;
    }

    connectMutation.mutate({
      spaceName: pendingSpace,
      googleEmail: pendingEmail,
    });
  }, [pendingSpace, pendingEmail, connectMutation]);

  // Disconnect function
  const disconnect = useCallback(() => {
    disconnectMutation.mutate();
  }, [disconnectMutation]);

  // Update preferences function
  const updatePreferences = useCallback(
    (preferences: Partial<GoogleChatPreferences>) => {
      updatePreferencesMutation.mutate(preferences);
    },
    [updatePreferencesMutation]
  );

  return {
    // Status data
    status,
    isLoading,
    error: error ? (error as any).response?.data?.message || 'Failed to fetch status' : null,

    // Pending connection from URL params
    hasPendingConnection,
    pendingEmail,
    pendingSpace,

    // Actions
    connect,
    disconnect,
    updatePreferences,
    refetch,

    // Loading states for actions
    isConnecting: connectMutation.isPending,
    isDisconnecting: disconnectMutation.isPending,
    isUpdatingPreferences: updatePreferencesMutation.isPending,
  };
}




