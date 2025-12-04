'use client';

import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { aiService } from '@/services/ai.service';
import { useAICheckinStore } from '@/stores/aiCheckinStore';
import { useAuthStore } from '@/stores/authStore';
import { INotification, IAICheckinResponse } from '@/types';
import toast from 'react-hot-toast';

// Hook for components that just need modal state (no queries)
export function useAICheckinModal() {
  const store = useAICheckinStore();
  return store;
}

// Full hook with queries - only use in ONE place (the provider)
export function useAICheckin() {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();
  const {
    currentCheckin,
    isModalOpen,
    isSubmitting,
    processingResult,
    showResultModal,
    openModal,
    closeModal,
    setSubmitting,
    showResult,
    hideResult,
    reset,
  } = useAICheckinStore();

  // Only fetch when authenticated and modal is not open
  const shouldFetch = isAuthenticated && !isModalOpen && !showResultModal;

  // Fetch pending check-ins
  const { data: pendingCheckins, isLoading: isLoadingPending } = useQuery({
    queryKey: ['ai-checkins', 'pending'],
    queryFn: () => aiService.getPendingCheckins(),
    enabled: shouldFetch,
    refetchOnWindowFocus: false,
    refetchInterval: false,
    staleTime: 30000, // 30 seconds
  });

  // Fetch check-in history (less frequent)
  const { data: checkinHistory } = useQuery({
    queryKey: ['ai-checkins', 'history'],
    queryFn: () => aiService.getCheckinHistory(),
    enabled: isAuthenticated,
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: false,
  });

  // Submit response mutation
  const respondMutation = useMutation({
    mutationFn: ({ notificationId, responses }: { notificationId: string; responses: IAICheckinResponse[] }) =>
      aiService.respondToCheckin(notificationId, responses),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['ai-checkins'] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      showResult(result);
      toast.success(`AI updated ${result.ticketsUpdated} ticket${result.ticketsUpdated !== 1 ? 's' : ''}!`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to submit check-in');
      setSubmitting(false);
    },
  });

  // Dismiss mutation
  const dismissMutation = useMutation({
    mutationFn: (notificationId: string) => aiService.dismissCheckin(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-checkins'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      closeModal();
      reset();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to dismiss check-in');
    },
  });

  // Handle incoming socket event for interactive check-in
  const handleInteractiveCheckin = useCallback((data: {
    notificationId: string;
    type: 'morning' | 'evening';
    title: string;
    message: string;
    questions: INotification['questions'];
    isBlocking: boolean;
    timestamp: string;
  }) => {
    // Create a notification object from socket data
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

    openModal(notification);
  }, [openModal]);

  // Handle processed result from socket
  const handleCheckinProcessed = useCallback((result: {
    notificationId: string;
    ticketsUpdated: number;
    tasksCompleted: number;
    notesAdded: number;
    summary: string;
  }) => {
    toast.success(`AI updated ${result.ticketsUpdated} ticket${result.ticketsUpdated !== 1 ? 's' : ''}!`);
    queryClient.invalidateQueries({ queryKey: ['tickets'] });
    queryClient.invalidateQueries({ queryKey: ['ai-checkins'] });
  }, [queryClient]);

  // Submit responses
  const submitResponses = async (responses: IAICheckinResponse[]) => {
    if (!currentCheckin) return;
    setSubmitting(true);
    await respondMutation.mutateAsync({
      notificationId: currentCheckin._id,
      responses,
    });
    setSubmitting(false);
  };

  // Dismiss check-in (only if not blocking)
  const dismissCheckin = async () => {
    if (!currentCheckin) return;
    if (currentCheckin.isBlocking) {
      toast.error('This check-in requires a response');
      return;
    }
    await dismissMutation.mutateAsync(currentCheckin._id);
  };

  return {
    // State
    currentCheckin,
    isModalOpen,
    isSubmitting,
    processingResult,
    showResultModal,
    pendingCheckins: pendingCheckins || [],
    checkinHistory: checkinHistory || [],
    isLoadingPending,

    // Actions
    openModal,
    closeModal,
    submitResponses,
    dismissCheckin,
    hideResult,
    reset,

    // Socket handlers (to be connected in provider)
    handleInteractiveCheckin,
    handleCheckinProcessed,
  };
}

