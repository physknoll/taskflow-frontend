'use client';

import { useState, useCallback, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  aiService,
  SendMessageDto,
  ParseUpdateResponse,
  ChatResponse,
} from '@/services/ai.service';
import { GeneralChatRequest, KnowledgeChatRequest } from '@/types';
import toast from 'react-hot-toast';

export function useAI() {
  const [isLoading, setIsLoading] = useState(false);
  // Track conversation ID for continuity
  const conversationIdRef = useRef<string | null>(null);

  // General chat mutation
  const generalChatMutation = useMutation({
    mutationFn: (data: GeneralChatRequest) => aiService.sendGeneralChat(data),
    onSuccess: (data) => {
      conversationIdRef.current = data.conversationId;
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'AI request failed. Please try again.');
    },
  });

  // Knowledge base chat mutation
  const knowledgeChatMutation = useMutation({
    mutationFn: (data: KnowledgeChatRequest) => aiService.sendKnowledgeChat(data),
    onSuccess: (data) => {
      conversationIdRef.current = data.conversationId;
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Knowledge base request failed. Please try again.');
    },
  });

  // Legacy chat mutation (routes internally)
  const chatMutation = useMutation({
    mutationFn: (data: SendMessageDto) => aiService.sendMessage({
      ...data,
      conversationId: data.conversationId || conversationIdRef.current || undefined,
    }),
    onSuccess: (data) => {
      conversationIdRef.current = data.conversationId;
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'AI request failed. Please try again.');
    },
  });

  // Parse update mutation
  const parseUpdateMutation = useMutation({
    mutationFn: (input: string) => aiService.parseUpdate(input),
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to parse update');
    },
  });

  // Compose question mutation
  const composeQuestionMutation = useMutation({
    mutationFn: (data: {
      question: string;
      recipientType: 'client' | 'internal';
      clientId?: string;
      context?: string;
    }) => aiService.composeQuestion(data),
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to compose email');
    },
  });

  // Generate ticket mutation
  const generateTicketMutation = useMutation({
    mutationFn: (data: {
      title: string;
      description: string;
      type: string;
      clientId: string;
    }) => aiService.generateTicket(data),
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to generate ticket content');
    },
  });

  // Apply updates mutation
  const applyUpdatesMutation = useMutation({
    mutationFn: (updates: any[]) => aiService.applyDailyUpdates(updates),
    onSuccess: (data) => {
      toast.success(`Applied ${data.applied} updates successfully`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to apply updates');
    },
  });

  /**
   * Send a general AI chat message
   */
  const sendGeneralChat = useCallback(
    async (message: string, conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>) => {
      setIsLoading(true);
      try {
        const response = await generalChatMutation.mutateAsync({
          message,
          conversationHistory,
          conversationId: conversationIdRef.current || undefined,
        });
        return response;
      } finally {
        setIsLoading(false);
      }
    },
    [generalChatMutation]
  );

  /**
   * Send a knowledge base chat message (requires clientId)
   */
  const sendKnowledgeChat = useCallback(
    async (message: string, clientId: string) => {
      setIsLoading(true);
      try {
        const response = await knowledgeChatMutation.mutateAsync({
          message,
          clientId,
          conversationId: conversationIdRef.current || undefined,
        });
        return response;
      } finally {
        setIsLoading(false);
      }
    },
    [knowledgeChatMutation]
  );

  /**
   * Legacy unified send message (routes based on mode)
   */
  const sendMessage = useCallback(
    async (data: SendMessageDto): Promise<ChatResponse> => {
      setIsLoading(true);
      try {
        const response = await chatMutation.mutateAsync(data);
        return response;
      } finally {
        setIsLoading(false);
      }
    },
    [chatMutation]
  );

  const parseUpdate = useCallback(
    async (input: string): Promise<ParseUpdateResponse> => {
      return await parseUpdateMutation.mutateAsync(input);
    },
    [parseUpdateMutation]
  );

  const composeQuestion = useCallback(
    async (data: any) => {
      return await composeQuestionMutation.mutateAsync(data);
    },
    [composeQuestionMutation]
  );

  const generateTicketContent = useCallback(
    async (data: any) => {
      return await generateTicketMutation.mutateAsync(data);
    },
    [generateTicketMutation]
  );

  const applyUpdates = useCallback(
    async (updates: any[]) => {
      return await applyUpdatesMutation.mutateAsync(updates);
    },
    [applyUpdatesMutation]
  );

  /**
   * Reset conversation context (start fresh)
   */
  const resetConversation = useCallback(() => {
    conversationIdRef.current = null;
  }, []);

  /**
   * Set conversation ID (for resuming)
   */
  const setConversationId = useCallback((id: string | null) => {
    conversationIdRef.current = id;
  }, []);

  return {
    // New specific methods
    sendGeneralChat,
    sendKnowledgeChat,
    // Legacy method
    sendMessage,
    parseUpdate,
    composeQuestion,
    generateTicketContent,
    applyUpdates,
    // Conversation management
    conversationId: conversationIdRef.current,
    resetConversation,
    setConversationId,
    // Loading states
    isLoading:
      isLoading ||
      generalChatMutation.isPending ||
      knowledgeChatMutation.isPending ||
      chatMutation.isPending ||
      parseUpdateMutation.isPending ||
      composeQuestionMutation.isPending ||
      generateTicketMutation.isPending ||
      applyUpdatesMutation.isPending,
    isGeneratingTicket: generateTicketMutation.isPending,
    isParsing: parseUpdateMutation.isPending,
  };
}
