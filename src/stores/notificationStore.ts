import { create } from 'zustand';
import { INotification } from '@/types';

interface NotificationState {
  notifications: INotification[];
  unreadCount: number;
  isOpen: boolean;
  isLoading: boolean;

  // Actions
  setNotifications: (notifications: INotification[]) => void;
  addNotification: (notification: INotification) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  removeNotification: (notificationId: string) => void;
  toggleOpen: () => void;
  setOpen: (open: boolean) => void;
  setLoading: (loading: boolean) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isOpen: false,
  isLoading: false,

  setNotifications: (notifications) =>
    set({
      notifications,
      unreadCount: notifications.filter((n) => !n.isRead).length,
    }),

  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + (notification.isRead ? 0 : 1),
    })),

  markAsRead: (notificationId) =>
    set((state) => {
      const notification = state.notifications.find((n) => n._id === notificationId);
      if (!notification || notification.isRead) return state;

      return {
        notifications: state.notifications.map((n) =>
          n._id === notificationId ? { ...n, isRead: true, readAt: new Date() } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      };
    }),

  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({
        ...n,
        isRead: true,
        readAt: n.readAt || new Date(),
      })),
      unreadCount: 0,
    })),

  removeNotification: (notificationId) =>
    set((state) => {
      const notification = state.notifications.find((n) => n._id === notificationId);
      return {
        notifications: state.notifications.filter((n) => n._id !== notificationId),
        unreadCount:
          notification && !notification.isRead
            ? Math.max(0, state.unreadCount - 1)
            : state.unreadCount,
      };
    }),

  toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),

  setOpen: (open) => set({ isOpen: open }),

  setLoading: (loading) => set({ isLoading: loading }),

  clearAll: () => set({ notifications: [], unreadCount: 0 }),
}));



