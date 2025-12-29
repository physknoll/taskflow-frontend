'use client';

import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsService } from '@/services/notifications.service';
import { useNotificationStore } from '@/stores/notificationStore';
import { INotification } from '@/types';

interface NotificationsData {
  data: INotification[];
  unreadCount: number;
}

export function useNotifications() {
  const queryClient = useQueryClient();
  const { setNotifications, markAsRead: storeMarkAsRead, markAllAsRead: storeMarkAllAsRead, removeNotification } = useNotificationStore();

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
    onMutate: async (notificationId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['notifications'] });
      
      // Snapshot the previous value
      const previousData = queryClient.getQueryData<NotificationsData>(['notifications']);
      
      // Optimistically update the cache
      queryClient.setQueryData<NotificationsData>(['notifications'], (old) => {
        if (!old) return old;
        const notification = old.data.find(n => n._id === notificationId);
        const wasUnread = notification && !notification.isRead;
        return {
          data: old.data.filter(n => n._id !== notificationId),
          unreadCount: wasUnread ? Math.max(0, old.unreadCount - 1) : old.unreadCount,
        };
      });
      
      // Also update the store
      removeNotification(notificationId);
      
      // Return context with previous data for rollback
      return { previousData };
    },
    onError: (_err, _notificationId, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(['notifications'], context.previousData);
      }
    },
    onSettled: () => {
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





