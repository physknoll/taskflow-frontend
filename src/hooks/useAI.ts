'use client';

import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { aiService, SendMessageDto, ParseUpdateResponse } from '@/services/ai.service';
import toast from 'react-hot-toast';

export function useAI() {
  const [isLoading, setIsLoading] = useState(false);

  // Chat mutation
  const chatMutation = useMutation({
    mutationFn: (data: SendMessageDto) => aiService.sendMessage(data),
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

  const sendMessage = useCallback(
    async (data: SendMessageDto) => {
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

  return {
    sendMessage,
    parseUpdate,
    composeQuestion,
    generateTicketContent,
    applyUpdates,
    isLoading:
      isLoading ||
      chatMutation.isPending ||
      parseUpdateMutation.isPending ||
      composeQuestionMutation.isPending ||
      generateTicketMutation.isPending ||
      applyUpdatesMutation.isPending,
    isGeneratingTicket: generateTicketMutation.isPending,
    isParsing: parseUpdateMutation.isPending,
  };
}

