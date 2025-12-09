'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { aipmService } from '@/services/aipm.service';
import { useAIPMSocket } from './useAIPMSocket';
import type {
  IDashboardMessage,
  ChatMode,
  IAIPMDashboardMessagePayload,
  IDashboardInitResponse,
} from '@/types/aipm';
import { aiService } from '@/services/ai.service';

interface UseAIPMSessionOptions {
  autoInitialize?: boolean;
}

export function useAIPMSession(options: UseAIPMSessionOptions = { autoInitialize: true }) {
  const queryClient = useQueryClient();
  const { subscribe, isConnected } = useAIPMSocket();
  
  const [messages, setMessages] = useState<IDashboardMessage[]>([]);
  const [isAITyping, setIsAITyping] = useState(false);
  const [contextMode, setContextMode] = useState<ChatMode>('aipm');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [kbConversationId, setKbConversationId] = useState<string | null>(null);
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

  // Send message mutation (AIPM Dashboard mode)
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

  // Send message mutation (Client Knowledge Base mode)
  const sendKBMutation = useMutation({
    mutationFn: ({ clientId, message, conversationId }: { clientId: string; message: string; conversationId?: string }) => 
      aiService.sendKnowledgeChat({
        message,
        clientId,
        conversationId,
      }),
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
      // Store conversation ID for continuity
      if (data.conversationId) {
        setKbConversationId(data.conversationId);
      }
      
      // Add AI response with citations if available
      const aiMessage: IDashboardMessage = {
        id: `ai-${Date.now()}`,
        role: 'aipm',
        content: data.response,
        timestamp: new Date().toISOString(),
        metadata: data.knowledgeBase?.citations ? {
          citations: data.knowledgeBase.citations.map(c => ({
            documentId: c.documentId,
            title: c.title,
            excerpt: c.excerpt,
            relevanceScore: c.relevanceScore,
          })),
        } : undefined,
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

  // Send a message - routes to correct endpoint based on mode
  const sendMessage = useCallback(async (message: string) => {
    if (contextMode === 'client_kb') {
      // Client Knowledge Base mode
      if (!selectedClientId) {
        console.error('No client selected for knowledge base chat');
        return;
      }
      await sendKBMutation.mutateAsync({ 
        clientId: selectedClientId, 
        message,
        conversationId: kbConversationId || undefined,
      });
    } else {
      // AIPM Dashboard mode (default)
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
    }
  }, [contextMode, selectedClientId, kbConversationId, initMutation, sendMutation, sendKBMutation]);

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

  // Change chat mode - resets conversation when switching
  const changeContextMode = useCallback((mode: ChatMode, clientId?: string) => {
    if (mode === contextMode && (mode !== 'client_kb' || clientId === selectedClientId)) {
      return; // No change
    }
    
    setContextMode(mode);
    setMessages([]); // Clear messages when switching modes
    
    if (mode === 'client_kb') {
      setSelectedClientId(clientId || null);
      setKbConversationId(null); // Reset conversation
    } else {
      setSelectedClientId(null);
      setKbConversationId(null);
      // Re-initialize AIPM session if needed
      if (!sessionIdRef.current) {
        initMutation.mutate();
      } else if (initData?.greeting) {
        // Restore the greeting message
        const greetingMessage: IDashboardMessage = {
          id: `greeting-${Date.now()}`,
          role: 'aipm',
          content: initData.greeting,
          timestamp: new Date().toISOString(),
          metadata: {
            suggestedActions: initData.suggestedActions || [],
          },
        };
        setMessages([greetingMessage]);
      }
    }
  }, [contextMode, selectedClientId, initMutation, initData]);

  // Set client for knowledge base mode
  const selectClient = useCallback((clientId: string) => {
    setSelectedClientId(clientId);
    if (contextMode === 'client_kb') {
      setMessages([]); // Clear messages when changing client
      setKbConversationId(null);
    }
  }, [contextMode]);

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
    isSending: sendMutation.isPending || sendKBMutation.isPending,
    isExecuting: executeMutation.isPending,
    contextMode,
    selectedClientId,
    isConnected,
    initData, // Expose init data (greeting, focusQueue, stats, suggestedActions)
    error: initMutation.error || sendKBMutation.error,

    // Actions
    initializeSession,
    sendMessage,
    executeAction,
    changeContextMode,
    selectClient,
    clearMessages,
  };
}

