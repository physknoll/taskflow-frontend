'use client';

import { useEffect, useCallback, createContext, useContext, ReactNode, useState, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { useAICheckinStore } from '@/stores/aiCheckinStore';
import { 
  initializeSocket, 
  disconnectSocket, 
  getSocket,
  AIInteractiveCheckinData,
  AICheckinProcessedData,
  NotificationData,
  KB_UPLOAD_EVENTS,
  KBUploadStartedData,
  KBUploadProgressData,
  KBUploadCompleteData,
} from '@/lib/socket';
import { INotification } from '@/types';
import type {
  IAIPMDashboardGreetingPayload,
  IAIPMDashboardMessagePayload,
  IAIPMActionExecutedPayload,
  IAIPMPointsEarnedPayload,
  IAIPMFocusUpdatedPayload,
} from '@/types/aipm';
import toast from 'react-hot-toast';
import { toast as sonnerToast } from 'sonner';

// AIPM Dashboard Socket Event Names
const AIPM_DASHBOARD_EVENTS = {
  GREETING: 'aipm:dashboard:greeting',
  MESSAGE: 'aipm:dashboard:message',
  ACTION_EXECUTED: 'aipm:action:executed',
  POINTS_EARNED: 'aipm:points:earned',
  FOCUS_UPDATED: 'aipm:focus:updated',
} as const;

// KB Upload event handlers type
type KBUploadHandler = {
  onStarted?: (data: KBUploadStartedData) => void;
  onProgress?: (data: KBUploadProgressData) => void;
  onComplete?: (data: KBUploadCompleteData) => void;
};

interface SocketContextValue {
  socket: Socket | null;
  isConnected: boolean;
  subscribeToKBUpload: (handler: KBUploadHandler) => () => void;
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  isConnected: false,
  subscribeToKBUpload: () => () => {},
});

export const useSocket = () => useContext(SocketContext);

interface SocketProviderProps {
  children: ReactNode;
}

export function SocketProvider({ children }: SocketProviderProps) {
  const queryClient = useQueryClient();
  const { token, isAuthenticated } = useAuthStore();
  const { addNotification } = useNotificationStore();
  const { openModal: openCheckinModal } = useAICheckinStore();
  
  // Track socket connection state
  const [isConnected, setIsConnected] = useState(false);
  const [socketInstance, setSocketInstance] = useState<Socket | null>(null);
  
  // KB Upload handlers
  const kbUploadHandlersRef = useRef<Set<KBUploadHandler>>(new Set());
  
  // Subscribe to KB upload events
  const subscribeToKBUpload = useCallback((handler: KBUploadHandler) => {
    kbUploadHandlersRef.current.add(handler);
    return () => {
      kbUploadHandlersRef.current.delete(handler);
    };
  }, []);

  // Handle new notification
  const handleNotification = useCallback((data: NotificationData) => {
    console.log('📬 New notification:', data);
    addNotification(data.notification as INotification);
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
  }, [addNotification, queryClient]);

  // Handle AI interactive check-in
  const handleInteractiveCheckin = useCallback((data: AIInteractiveCheckinData) => {
    console.log('🤖 AI Interactive Check-in received:', data);
    
    // Create notification object from socket data
    const notification: INotification = {
      _id: data.notificationId,
      user: '',
      type: 'ai_checkin_interactive',
      title: data.title,
      message: data.message,
      questions: data.questions,
      requiresResponse: true,
      isBlocking: data.isBlocking,
      isRead: false,
      isDismissed: false,
      emailSent: false,
      createdAt: new Date(data.timestamp),
    };

    // Open the check-in modal
    openCheckinModal(notification);
  }, [openCheckinModal]);

  // Handle AI check-in processed
  const handleCheckinProcessed = useCallback((data: AICheckinProcessedData) => {
    console.log('✅ AI Check-in processed:', data);
    
    // Show success toast
    toast.success(
      `AI updated ${data.ticketsUpdated} ticket${data.ticketsUpdated !== 1 ? 's' : ''}!`,
      { duration: 5000 }
    );

    // Refresh relevant queries
    queryClient.invalidateQueries({ queryKey: ['tickets'] });
    queryClient.invalidateQueries({ queryKey: ['ai-checkins'] });
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
  }, [queryClient]);

  // Handle ticket updates
  const handleTicketUpdate = useCallback((data: { ticketId: string; action: string }) => {
    console.log('🎫 Ticket update:', data);
    queryClient.invalidateQueries({ queryKey: ['tickets'] });
    queryClient.invalidateQueries({ queryKey: ['ticket', data.ticketId] });
  }, [queryClient]);

  // Handle review updates  
  const handleReviewUpdate = useCallback((data: { reviewId: string; action: string }) => {
    console.log('📝 Review update:', data);
    queryClient.invalidateQueries({ queryKey: ['reviews'] });
  }, [queryClient]);

  // ============================================
  // AIPM Dashboard Event Handlers
  // ============================================

  // Handle dashboard greeting
  const handleDashboardGreeting = useCallback((data: IAIPMDashboardGreetingPayload) => {
    console.log('🤖 AIPM Dashboard greeting:', data);
    queryClient.invalidateQueries({ queryKey: ['aipm', 'dashboard', 'session'] });
  }, [queryClient]);

  // Handle dashboard message
  const handleDashboardMessage = useCallback((data: IAIPMDashboardMessagePayload) => {
    console.log('💬 AIPM Dashboard message:', data);
    // Messages are handled by useAIPMSocket hook - this is just for logging
  }, []);

  // Handle action executed
  const handleActionExecuted = useCallback((data: IAIPMActionExecutedPayload) => {
    console.log('✅ AIPM Action executed:', data);
    
    if (data.success) {
      sonnerToast.success('Action completed!', {
        description: 'The task has been updated.',
      });
    } else {
      sonnerToast.error('Action failed', {
        description: 'Please try again or do it manually.',
      });
    }

    // Refresh related queries
    queryClient.invalidateQueries({ queryKey: ['aipm', 'dashboard', 'focus-queue'] });
    queryClient.invalidateQueries({ queryKey: ['aipm', 'dashboard', 'today-stats'] });
    queryClient.invalidateQueries({ queryKey: ['tickets'] });
  }, [queryClient]);

  // Handle points earned
  const handlePointsEarned = useCallback((data: IAIPMPointsEarnedPayload) => {
    console.log('🎉 Points earned:', data);
    
    sonnerToast.success(`+${data.points} points!`, {
      description: data.reason,
      icon: '🎉',
    });

    // Refresh gamification data
    queryClient.invalidateQueries({ queryKey: ['aipm', 'gamification', 'streak'] });
    queryClient.invalidateQueries({ queryKey: ['aipm', 'gamification', 'leaderboard'] });
  }, [queryClient]);

  // Handle focus queue updated
  const handleFocusUpdated = useCallback((data: IAIPMFocusUpdatedPayload) => {
    console.log('🎯 Focus queue updated:', data);
    queryClient.setQueryData(['aipm', 'dashboard', 'focus-queue'], data.focusQueue);
  }, [queryClient]);

  // Initialize socket connection
  useEffect(() => {
    if (!isAuthenticated || !token) {
      disconnectSocket();
      setIsConnected(false);
      setSocketInstance(null);
      return;
    }

    const socket = initializeSocket(token);
    setSocketInstance(socket);

    // Track connection state
    const handleConnect = () => {
      console.log('🔌 SocketProvider: Connected');
      setIsConnected(true);
    };

    const handleDisconnect = () => {
      console.log('🔌 SocketProvider: Disconnected');
      setIsConnected(false);
    };

    // Set initial connection state
    setIsConnected(socket.connected);

    // Listen for connection state changes
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    // Set up event listeners
    socket.on('notification', handleNotification);
    socket.on('ai:interactive_checkin', handleInteractiveCheckin);
    socket.on('ai:checkin_processed', handleCheckinProcessed);
    socket.on('ticket:update', handleTicketUpdate);
    socket.on('review:update', handleReviewUpdate);

    // AIPM Dashboard events
    socket.on(AIPM_DASHBOARD_EVENTS.GREETING, handleDashboardGreeting);
    socket.on(AIPM_DASHBOARD_EVENTS.MESSAGE, handleDashboardMessage);
    socket.on(AIPM_DASHBOARD_EVENTS.ACTION_EXECUTED, handleActionExecuted);
    socket.on(AIPM_DASHBOARD_EVENTS.POINTS_EARNED, handlePointsEarned);
    socket.on(AIPM_DASHBOARD_EVENTS.FOCUS_UPDATED, handleFocusUpdated);

    // KB Upload events - dispatch to subscribers
    const handleKBUploadStarted = (data: KBUploadStartedData) => {
      console.log('📤 KB Upload Started:', data);
      kbUploadHandlersRef.current.forEach((handler) => handler.onStarted?.(data));
    };

    const handleKBUploadProgress = (data: KBUploadProgressData) => {
      console.log('📤 KB Upload Progress:', data);
      kbUploadHandlersRef.current.forEach((handler) => handler.onProgress?.(data));
    };

    const handleKBUploadComplete = (data: KBUploadCompleteData) => {
      console.log('📤 KB Upload Complete:', data);
      kbUploadHandlersRef.current.forEach((handler) => handler.onComplete?.(data));
    };

    socket.on(KB_UPLOAD_EVENTS.STARTED, handleKBUploadStarted);
    socket.on(KB_UPLOAD_EVENTS.PROGRESS, handleKBUploadProgress);
    socket.on(KB_UPLOAD_EVENTS.COMPLETE, handleKBUploadComplete);

    // Debug: Log all kb: events
    socket.onAny((eventName, ...args) => {
      if (eventName.startsWith('kb:')) {
        console.log('📨 KB Event received:', eventName, args);
      }
    });

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('notification', handleNotification);
      socket.off('ai:interactive_checkin', handleInteractiveCheckin);
      socket.off('ai:checkin_processed', handleCheckinProcessed);
      socket.off('ticket:update', handleTicketUpdate);
      socket.off('review:update', handleReviewUpdate);

      // AIPM Dashboard events
      socket.off(AIPM_DASHBOARD_EVENTS.GREETING, handleDashboardGreeting);
      socket.off(AIPM_DASHBOARD_EVENTS.MESSAGE, handleDashboardMessage);
      socket.off(AIPM_DASHBOARD_EVENTS.ACTION_EXECUTED, handleActionExecuted);
      socket.off(AIPM_DASHBOARD_EVENTS.POINTS_EARNED, handlePointsEarned);
      socket.off(AIPM_DASHBOARD_EVENTS.FOCUS_UPDATED, handleFocusUpdated);

      // KB Upload events
      socket.off(KB_UPLOAD_EVENTS.STARTED, handleKBUploadStarted);
      socket.off(KB_UPLOAD_EVENTS.PROGRESS, handleKBUploadProgress);
      socket.off(KB_UPLOAD_EVENTS.COMPLETE, handleKBUploadComplete);
      socket.offAny();
    };
  }, [
    isAuthenticated, 
    token, 
    handleNotification, 
    handleInteractiveCheckin, 
    handleCheckinProcessed,
    handleTicketUpdate,
    handleReviewUpdate,
    handleDashboardGreeting,
    handleDashboardMessage,
    handleActionExecuted,
    handlePointsEarned,
    handleFocusUpdated,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnectSocket();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket: socketInstance, isConnected, subscribeToKBUpload }}>
      {children}
    </SocketContext.Provider>
  );
}

