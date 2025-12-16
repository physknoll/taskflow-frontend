'use client';

import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsService } from '@/services/notifications.service';
import { useNotificationStore } from '@/stores/notificationStore';

export function useNotifications() {
  const queryClient = useQueryClient();
  const { setNotifications, markAsRead: storeMarkAsRead, markAllAsRead: storeMarkAllAsRead } = useNotificationStore();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsService.getNotifications(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Sync with store
  useEffect(() => {
    if (data?.data) {
      setNotifications(data.data);
    }
  }, [data, setNotifications]);

  const markReadMutation = useMutation({
    mutationFn: (notificationId: string) => notificationsService.markAsRead(notificationId),
    onMutate: async (notificationId) => {
      storeMarkAsRead(notificationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationsService.markAllAsRead(),
    onMutate: async () => {
      storeMarkAllAsRead();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const dismissMutation = useMutation({
    mutationFn: (notificationId: string) => notificationsService.dismiss(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  return {
    notifications: data?.data || [],
    unreadCount: data?.unreadCount || 0,
    isLoading,
    refetch,
    markAsRead: markReadMutation.mutateAsync,
    markAllAsRead: markAllReadMutation.mutateAsync,
    dismiss: dismissMutation.mutateAsync,
  };
}



