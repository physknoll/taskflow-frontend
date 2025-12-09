'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { getSocket, AI_SOCKET_EVENTS, AIToolUsageData } from '@/lib/socket';
import { toast } from 'sonner';
import type {
  IAIPMDashboardGreetingPayload,
  IAIPMDashboardMessagePayload,
  IAIPMActionExecutedPayload,
  IAIPMPointsEarnedPayload,
  IAIPMFocusUpdatedPayload,
  IAIPMDashboardSocketEvents,
} from '@/types/aipm';

// Socket event names
export const AIPM_DASHBOARD_EVENTS = {
  GREETING: 'aipm:dashboard:greeting',
  MESSAGE: 'aipm:dashboard:message',
  ACTION_EXECUTED: 'aipm:action:executed',
  POINTS_EARNED: 'aipm:points:earned',
  FOCUS_UPDATED: 'aipm:focus:updated',
  TOOL_USAGE: 'ai:tool_usage',
} as const;

// Extended socket events type including tool usage
export interface IAIPMExtendedSocketEvents extends IAIPMDashboardSocketEvents {
  'ai:tool_usage': AIToolUsageData;
}

type EventHandler<T> = (data: T) => void;
type EventName = keyof IAIPMExtendedSocketEvents;

export function useAIPMSocket() {
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const handlersRef = useRef<Map<string, Set<EventHandler<unknown>>>>(new Map());
  const socket = getSocket();

  // Emit to local handlers
  const emitToHandlers = useCallback((event: string, data: unknown) => {
    const handlers = handlersRef.current.get(event);
    if (handlers) {
      handlers.forEach((handler) => handler(data));
    }
  }, []);

  // Set up socket event listeners
  useEffect(() => {
    if (!isAuthenticated || !socket) return;

    // Dashboard greeting handler
    const handleGreeting = (data: IAIPMDashboardGreetingPayload) => {
      queryClient.invalidateQueries({ queryKey: ['aipm', 'dashboard', 'session'] });
      emitToHandlers(AIPM_DASHBOARD_EVENTS.GREETING, data);
    };

    // Dashboard message handler
    const handleMessage = (data: IAIPMDashboardMessagePayload) => {
      emitToHandlers(AIPM_DASHBOARD_EVENTS.MESSAGE, data);
    };

    // Action executed handler
    const handleActionExecuted = (data: IAIPMActionExecutedPayload) => {
      if (data.success) {
        toast.success('Action completed!', {
          description: 'The task has been updated.',
        });
      } else {
        toast.error('Action failed', {
          description: 'Please try again or do it manually.',
        });
      }
      queryClient.invalidateQueries({ queryKey: ['aipm', 'dashboard', 'focus-queue'] });
      queryClient.invalidateQueries({ queryKey: ['aipm', 'dashboard', 'today-stats'] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      emitToHandlers(AIPM_DASHBOARD_EVENTS.ACTION_EXECUTED, data);
    };

    // Points earned handler
    const handlePointsEarned = (data: IAIPMPointsEarnedPayload) => {
      toast.success(`+${data.points} points!`, {
        description: data.reason,
        icon: '🎉',
      });
      queryClient.invalidateQueries({ queryKey: ['aipm', 'gamification', 'streak'] });
      emitToHandlers(AIPM_DASHBOARD_EVENTS.POINTS_EARNED, data);
    };

    // Focus queue updated handler
    const handleFocusUpdated = (data: IAIPMFocusUpdatedPayload) => {
      queryClient.setQueryData(['aipm', 'dashboard', 'focus-queue'], data.focusQueue);
      emitToHandlers(AIPM_DASHBOARD_EVENTS.FOCUS_UPDATED, data);
    };

    // Tool usage handler - shows what the AI is doing
    const handleToolUsage = (data: AIToolUsageData) => {
      emitToHandlers(AIPM_DASHBOARD_EVENTS.TOOL_USAGE, data);
    };

    // Register all event listeners
    socket.on(AIPM_DASHBOARD_EVENTS.GREETING, handleGreeting);
    socket.on(AIPM_DASHBOARD_EVENTS.MESSAGE, handleMessage);
    socket.on(AIPM_DASHBOARD_EVENTS.ACTION_EXECUTED, handleActionExecuted);
    socket.on(AIPM_DASHBOARD_EVENTS.POINTS_EARNED, handlePointsEarned);
    socket.on(AIPM_DASHBOARD_EVENTS.FOCUS_UPDATED, handleFocusUpdated);
    socket.on(AI_SOCKET_EVENTS.TOOL_USAGE, handleToolUsage);

    return () => {
      socket.off(AIPM_DASHBOARD_EVENTS.GREETING, handleGreeting);
      socket.off(AIPM_DASHBOARD_EVENTS.MESSAGE, handleMessage);
      socket.off(AIPM_DASHBOARD_EVENTS.ACTION_EXECUTED, handleActionExecuted);
      socket.off(AIPM_DASHBOARD_EVENTS.POINTS_EARNED, handlePointsEarned);
      socket.off(AIPM_DASHBOARD_EVENTS.FOCUS_UPDATED, handleFocusUpdated);
      socket.off(AI_SOCKET_EVENTS.TOOL_USAGE, handleToolUsage);
    };
  }, [isAuthenticated, socket, queryClient, emitToHandlers]);

  // Subscribe to specific events
  const subscribe = useCallback(<K extends EventName>(
    event: K,
    handler: EventHandler<IAIPMExtendedSocketEvents[K]>
  ) => {
    if (!handlersRef.current.has(event)) {
      handlersRef.current.set(event, new Set());
    }
    handlersRef.current.get(event)!.add(handler as EventHandler<unknown>);

    // Return unsubscribe function
    return () => {
      handlersRef.current.get(event)?.delete(handler as EventHandler<unknown>);
    };
  }, []);

  // Emit socket events
  const emit = useCallback((event: string, data?: unknown) => {
    socket?.emit(event, data);
  }, [socket]);

  return {
    socket,
    isConnected: socket?.connected ?? false,
    subscribe,
    emit,
  };
}

