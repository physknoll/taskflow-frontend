'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { aipmService } from '@/services/aipm.service';
import { useAIPMSocket } from './useAIPMSocket';
import type {
  IDashboardMessage,
  ContextMode,
  IAIPMDashboardMessagePayload,
  IDashboardInitResponse,
} from '@/types/aipm';

interface UseAIPMSessionOptions {
  autoInitialize?: boolean;
}

export function useAIPMSession(options: UseAIPMSessionOptions = { autoInitialize: true }) {
  const queryClient = useQueryClient();
  const { subscribe, isConnected } = useAIPMSocket();
  
  const [messages, setMessages] = useState<IDashboardMessage[]>([]);
  const [isAITyping, setIsAITyping] = useState(false);
  const [contextMode, setContextMode] = useState<ContextMode>('general');
  const [initData, setInitData] = useState<IDashboardInitResponse | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const hasInitializedRef = useRef(false);

  // Initialize/resume dashboard session
  const initMutation = useMutation({
    mutationFn: aipmService.initiateDashboardSession,
    onSuccess: (data) => {
      sessionIdRef.current = data.sessionId;
      setInitData(data);
      
      // Convert the greeting into a message
      if (data.greeting) {
        const greetingMessage: IDashboardMessage = {
          id: `greeting-${Date.now()}`,
          role: 'aipm',
          content: data.greeting,
          timestamp: new Date().toISOString(),
          metadata: {
            suggestedActions: data.suggestedActions || [],
          },
        };
        setMessages([greetingMessage]);
      }
      
      // Cache the session data
      queryClient.setQueryData(['aipm', 'dashboard', 'session'], data);
      
      // Also update focus queue and stats caches
      if (data.focusQueue) {
        queryClient.setQueryData(['aipm', 'dashboard', 'focus-queue'], data.focusQueue);
      }
      if (data.stats) {
        queryClient.setQueryData(['aipm', 'dashboard', 'today-stats'], {
          completed: data.stats.completed,
          inProgress: data.stats.inProgress,
          blocked: 0,
          hoursLogged: data.stats.hoursLogged,
          checkInsCompleted: 0,
        });
      }
    },
  });

  // Send message mutation
  const sendMutation = useMutation({
    mutationFn: ({ sessionId, message }: { sessionId: string; message: string }) => 
      aipmService.sendDashboardMessage(sessionId, message),
    onMutate: async ({ message }) => {
      // Optimistic update - add user message immediately
      const userMessage: IDashboardMessage = {
        id: `temp-${Date.now()}`,
        role: 'user',
        content: message,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setIsAITyping(true);
    },
    onSuccess: (data) => {
      setIsAITyping(false);
      
      // Add AI response
      const aiMessage: IDashboardMessage = {
        id: `ai-${Date.now()}`,
        role: 'aipm',
        content: data.response,
        timestamp: new Date().toISOString(),
        metadata: { suggestedActions: data.suggestedActions },
      };
      setMessages((prev) => [...prev, aiMessage]);
    },
    onError: () => {
      setIsAITyping(false);
      // Remove the optimistic user message on error
      setMessages((prev) => prev.filter((m) => !m.id.startsWith('temp-')));
    },
  });

  // Execute action mutation
  const executeMutation = useMutation({
    mutationFn: ({ actionId, payload }: { actionId: string; payload?: Record<string, unknown> }) =>
      aipmService.executeAction(actionId, payload),
    onSuccess: (data, { actionId }) => {
      // Update action status in messages
      setMessages((prev) =>
        prev.map((msg) => ({
          ...msg,
          metadata: msg.metadata
            ? {
                ...msg.metadata,
                suggestedActions: msg.metadata.suggestedActions?.map((action) =>
                  action.id === actionId
                    ? { ...action, status: 'executed' as const }
                    : action
                ),
              }
            : msg.metadata,
        }))
      );
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['aipm', 'dashboard', 'focus-queue'] });
      queryClient.invalidateQueries({ queryKey: ['aipm', 'dashboard', 'today-stats'] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });

  // Subscribe to socket events for real-time AI messages
  useEffect(() => {
    const unsubMessage = subscribe(
      'aipm:dashboard:message',
      (data) => {
        const messageData = data as IAIPMDashboardMessagePayload;
        if (messageData.sessionId === sessionIdRef.current) {
          setIsAITyping(false);
          // Only add if not already present (avoids duplicate from HTTP response)
          setMessages((prev) => {
            const alreadyExists = prev.some(
              (m) => m.role === 'aipm' && m.content === messageData.message
            );
            if (alreadyExists) return prev;
            
            const aiMessage: IDashboardMessage = {
              id: `ai-${Date.now()}`,
              role: 'aipm',
              content: messageData.message,
              timestamp: new Date().toISOString(),
              metadata: { suggestedActions: messageData.suggestedActions },
            };
            return [...prev, aiMessage];
          });
        }
      }
    );

    return () => {
      unsubMessage();
    };
  }, [subscribe]);

  // Auto-initialize session on mount
  useEffect(() => {
    if (options.autoInitialize && !hasInitializedRef.current && !initMutation.isPending) {
      hasInitializedRef.current = true;
      initMutation.mutate();
    }
  }, [options.autoInitialize, initMutation]);

  // Initialize session manually
  const initializeSession = useCallback(async () => {
    if (!initMutation.isPending) {
      return initMutation.mutateAsync();
    }
    return null;
  }, [initMutation]);

  // Send a message
  const sendMessage = useCallback(async (message: string) => {
    let sessionId = sessionIdRef.current;
    
    // Initialize session if not already
    if (!sessionId && !initMutation.isPending) {
      const initData = await initMutation.mutateAsync();
      sessionId = initData.sessionId;
    }
    
    if (!sessionId) {
      console.error('No session ID available');
      return;
    }
    
    await sendMutation.mutateAsync({ sessionId, message });
  }, [initMutation, sendMutation]);

  // Execute a suggested action
  const executeAction = useCallback(async (actionId: string, accepted: boolean) => {
    if (!accepted) {
      // Mark as declined
      setMessages((prev) =>
        prev.map((msg) => ({
          ...msg,
          metadata: msg.metadata
            ? {
                ...msg.metadata,
                suggestedActions: msg.metadata.suggestedActions?.map((action) =>
                  action.id === actionId
                    ? { ...action, status: 'declined' as const }
                    : action
                ),
              }
            : msg.metadata,
        }))
      );
      return;
    }

    await executeMutation.mutateAsync({ actionId });
  }, [executeMutation]);

  // Change context mode
  const changeContextMode = useCallback((mode: ContextMode) => {
    setContextMode(mode);
  }, []);

  // Clear messages (for reset)
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    // State
    sessionId: sessionIdRef.current,
    messages,
    isLoading: initMutation.isPending,
    isAITyping,
    isSending: sendMutation.isPending,
    isExecuting: executeMutation.isPending,
    contextMode,
    isConnected,
    initData, // Expose init data (greeting, focusQueue, stats, suggestedActions)
    error: initMutation.error,

    // Actions
    initializeSession,
    sendMessage,
    executeAction,
    changeContextMode,
    clearMessages,
  };
}

