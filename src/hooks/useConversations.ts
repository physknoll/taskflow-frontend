'use client';

import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { conversationsService, SearchConversationsQuery } from '@/services/conversations.service';
import {
  Conversation,
  ConversationType,
  ConversationsQuery,
  ConversationFeedbackDto,
  MessageFeedbackDto,
  MessageFeedbackRating,
} from '@/types';
import toast from 'react-hot-toast';

// Query keys
export const conversationKeys = {
  all: ['conversations'] as const,
  lists: () => [...conversationKeys.all, 'list'] as const,
  list: (filters: ConversationsQuery) => [...conversationKeys.lists(), filters] as const,
  details: () => [...conversationKeys.all, 'detail'] as const,
  detail: (id: string) => [...conversationKeys.details(), id] as const,
  search: (query: SearchConversationsQuery) => [...conversationKeys.all, 'search', query] as const,
  forTicket: (ticketId: string) => [...conversationKeys.all, 'ticket', ticketId] as const,
  forProject: (projectId: string) => [...conversationKeys.all, 'project', projectId] as const,
  stats: (query?: { startDate?: string; endDate?: string }) => [...conversationKeys.all, 'stats', query] as const,
};

/**
 * Hook to list conversations with optional filters
 */
export function useConversations(query?: ConversationsQuery) {
  return useQuery({
    queryKey: conversationKeys.list(query || {}),
    queryFn: () => conversationsService.getConversations(query),
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook to get a single conversation by ID
 */
export function useConversation(conversationId: string | null) {
  return useQuery({
    queryKey: conversationKeys.detail(conversationId || ''),
    queryFn: () => conversationsService.getConversation(conversationId!),
    enabled: !!conversationId,
  });
}

/**
 * Hook to search conversations
 */
export function useConversationSearch(query: SearchConversationsQuery | null) {
  return useQuery({
    queryKey: conversationKeys.search(query || { q: '' }),
    queryFn: () => conversationsService.searchConversations(query!),
    enabled: !!query && query.q.length > 0,
  });
}

/**
 * Hook to get conversations for a ticket
 */
export function useConversationsForTicket(ticketId: string | null) {
  return useQuery({
    queryKey: conversationKeys.forTicket(ticketId || ''),
    queryFn: () => conversationsService.getConversationsForTicket(ticketId!),
    enabled: !!ticketId,
  });
}

/**
 * Hook to get conversations for a project
 */
export function useConversationsForProject(projectId: string | null) {
  return useQuery({
    queryKey: conversationKeys.forProject(projectId || ''),
    queryFn: () => conversationsService.getConversationsForProject(projectId!),
    enabled: !!projectId,
  });
}

/**
 * Hook to get conversation stats
 */
export function useConversationStats(query?: { startDate?: string; endDate?: string }) {
  return useQuery({
    queryKey: conversationKeys.stats(query),
    queryFn: () => conversationsService.getStats(query),
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Hook for conversation actions (resume, rename, feedback)
 */
export function useConversationActions() {
  const queryClient = useQueryClient();

  // Resume conversation mutation
  const resumeMutation = useMutation({
    mutationFn: (conversationId: string) => conversationsService.resumeConversation(conversationId),
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to resume conversation');
    },
  });

  // Rename conversation mutation
  const renameMutation = useMutation({
    mutationFn: ({ conversationId, title }: { conversationId: string; title: string }) =>
      conversationsService.renameConversation(conversationId, title),
    onSuccess: (data, { conversationId }) => {
      // Update the cache
      queryClient.setQueryData(conversationKeys.detail(conversationId), data);
      queryClient.invalidateQueries({ queryKey: conversationKeys.lists() });
      toast.success('Conversation renamed');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to rename conversation');
    },
  });

  // Conversation feedback mutation
  const feedbackMutation = useMutation({
    mutationFn: ({ conversationId, feedback }: { conversationId: string; feedback: ConversationFeedbackDto }) =>
      conversationsService.submitFeedback(conversationId, feedback),
    onSuccess: () => {
      toast.success('Thank you for your feedback!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to submit feedback');
    },
  });

  // Message feedback mutation (thumbs up/down)
  const messageFeedbackMutation = useMutation({
    mutationFn: ({
      conversationId,
      messageId,
      feedback,
    }: {
      conversationId: string;
      messageId: string;
      feedback: MessageFeedbackDto;
    }) => conversationsService.submitMessageFeedback(conversationId, messageId, feedback),
    onSuccess: (_, { conversationId }) => {
      // Invalidate the conversation detail to refresh feedback state
      queryClient.invalidateQueries({ queryKey: conversationKeys.detail(conversationId) });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to submit feedback');
    },
  });

  const resumeConversation = useCallback(
    async (conversationId: string) => {
      return resumeMutation.mutateAsync(conversationId);
    },
    [resumeMutation]
  );

  const renameConversation = useCallback(
    async (conversationId: string, title: string) => {
      return renameMutation.mutateAsync({ conversationId, title });
    },
    [renameMutation]
  );

  const submitFeedback = useCallback(
    async (conversationId: string, feedback: ConversationFeedbackDto) => {
      return feedbackMutation.mutateAsync({ conversationId, feedback });
    },
    [feedbackMutation]
  );

  const submitMessageFeedback = useCallback(
    async (conversationId: string, messageId: string, rating: MessageFeedbackRating, comment?: string) => {
      return messageFeedbackMutation.mutateAsync({
        conversationId,
        messageId,
        feedback: { rating, comment },
      });
    },
    [messageFeedbackMutation]
  );

  return {
    resumeConversation,
    renameConversation,
    submitFeedback,
    submitMessageFeedback,
    isResuming: resumeMutation.isPending,
    isRenaming: renameMutation.isPending,
    isSubmittingFeedback: feedbackMutation.isPending || messageFeedbackMutation.isPending,
  };
}

/**
 * Combined hook for common conversation use cases
 */
export function useConversationHistory(options?: {
  type?: ConversationType;
  limit?: number;
}) {
  const queryClient = useQueryClient();
  const { type, limit = 20 } = options || {};

  const query: ConversationsQuery = {
    type,
    limit,
  };

  const { data, isLoading, error, refetch } = useConversations(query);
  const { resumeConversation, isResuming } = useConversationActions();

  const handleResume = useCallback(
    async (conversation: Conversation) => {
      const result = await resumeConversation(conversation.conversationId);
      return result;
    },
    [resumeConversation]
  );

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: conversationKeys.lists() });
  }, [queryClient]);

  return {
    conversations: data?.conversations || [],
    pagination: data?.pagination,
    isLoading,
    error,
    refetch,
    invalidate,
    handleResume,
    isResuming,
  };
}

