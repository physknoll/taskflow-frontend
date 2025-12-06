'use client';

import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { aipmService } from '@/services/aipm.service';
import { useAIPMStore } from '@/stores/aipmStore';
import { useAuthStore } from '@/stores/authStore';
import {
  IAIPMConfig,
  ICheckInSession,
  IAIPMReport,
  INextCheckIn,
  UpdateAIPMConfigDto,
  SessionFilters,
  ReportFilters,
  ISessionMessage,
} from '@/types/aipm';
import toast from 'react-hot-toast';

// ============================================
// Configuration Hook
// ============================================

export function useAIPMConfig() {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();

  const {
    data: config,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['aipm', 'config'],
    queryFn: () => aipmService.getConfig(),
    enabled: isAuthenticated,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  const updateMutation = useMutation({
    mutationFn: (updates: UpdateAIPMConfigDto) => aipmService.updateConfig(updates),
    onSuccess: (updatedConfig) => {
      queryClient.setQueryData(['aipm', 'config'], updatedConfig);
      toast.success('Settings updated');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update settings');
    },
  });

  const updateConfig = useCallback(
    async (updates: UpdateAIPMConfigDto) => {
      return updateMutation.mutateAsync(updates);
    },
    [updateMutation]
  );

  return {
    config,
    isLoading,
    error: error?.message,
    updateConfig,
    isUpdating: updateMutation.isPending,
    refetch,
  };
}

// ============================================
// Next Check-in Hook
// ============================================

export function useNextCheckIn() {
  const { isAuthenticated } = useAuthStore();

  const { data: nextCheckIn, isLoading } = useQuery({
    queryKey: ['aipm', 'next-checkin'],
    queryFn: () => aipmService.getNextCheckIn(),
    enabled: isAuthenticated,
    staleTime: 60000, // 1 minute
    refetchInterval: 60000, // Refresh every minute
  });

  return { nextCheckIn, isLoading };
}

// ============================================
// Active Check-in Session Hook
// ============================================

export function useAIPMCheckIn() {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();
  const store = useAIPMStore();

  // Fetch active session
  const { data: activeSessionData, isLoading: isLoadingSession } = useQuery({
    queryKey: ['aipm', 'session', 'active'],
    queryFn: () => aipmService.getActiveSession(),
    enabled: isAuthenticated && !store.isCheckInModalOpen,
    staleTime: 10000,
    refetchOnWindowFocus: false,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: ({ sessionId, message }: { sessionId: string; message: string }) =>
      aipmService.sendMessage(sessionId, message),
    onMutate: async ({ message }) => {
      // Optimistic update: add user message
      const userMessage: ISessionMessage = {
        role: 'user',
        content: message,
        timestamp: new Date().toISOString(),
      };
      store.addMessage(userMessage);
    },
    onSuccess: (result) => {
      // Add AI response
      const aiMessage: ISessionMessage = {
        role: 'aipm',
        content: result.response,
        timestamp: new Date().toISOString(),
      };
      store.addMessage(aiMessage);
      store.updateSessionStatus(result.sessionStatus);

      // If completed, show result
      if (result.sessionStatus === 'completed') {
        queryClient.invalidateQueries({ queryKey: ['aipm'] });
      }
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to send message');
    },
    onSettled: () => {
      store.setSendingMessage(false);
    },
  });

  // Skip session mutation
  const skipMutation = useMutation({
    mutationFn: ({ sessionId, reason }: { sessionId: string; reason: string }) =>
      aipmService.skipSession(sessionId, reason),
    onSuccess: () => {
      store.closeCheckInModal();
      store.reset();
      queryClient.invalidateQueries({ queryKey: ['aipm'] });
      toast.success('Check-in skipped');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to skip check-in');
    },
  });

  const sendMessage = useCallback(
    async (message: string) => {
      const session = store.activeSession;
      if (!session) return;

      store.setSendingMessage(true);
      await sendMessageMutation.mutateAsync({
        sessionId: session.sessionId,
        message,
      });
    },
    [store, sendMessageMutation]
  );

  const skipCheckIn = useCallback(
    async (reason: string) => {
      const session = store.activeSession;
      if (!session) return;

      await skipMutation.mutateAsync({
        sessionId: session.sessionId,
        reason,
      });
    },
    [store, skipMutation]
  );

  // Open modal with active session
  const openCheckIn = useCallback(() => {
    if (activeSessionData) {
      store.openCheckInModal(activeSessionData);
    }
  }, [activeSessionData, store]);

  return {
    // State
    activeSession: store.activeSession || activeSessionData,
    isCheckInModalOpen: store.isCheckInModalOpen,
    isSendingMessage: store.isSendingMessage,
    isLoadingSession,

    // Result modal
    checkInResult: store.checkInResult,
    showResultModal: store.showResultModal,

    // Actions
    openCheckIn,
    closeCheckIn: store.closeCheckInModal,
    sendMessage,
    skipCheckIn,
    hideResult: store.hideResult,

    // For socket updates
    setActiveSession: store.setActiveSession,
    openCheckInModal: store.openCheckInModal,
    addMessage: store.addMessage,
    showResult: store.showResult,
  };
}

// ============================================
// Sessions List Hook
// ============================================

export function useAIPMSessions(filters?: SessionFilters) {
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  const {
    data: sessions,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['aipm', 'sessions', filters],
    queryFn: () => aipmService.getSessions(filters),
    enabled: isAuthenticated,
    staleTime: 30000,
  });

  // Get single session
  const getSession = useCallback(
    async (sessionId: string): Promise<ICheckInSession> => {
      return aipmService.getSession(sessionId);
    },
    []
  );

  // Add feedback mutation
  const feedbackMutation = useMutation({
    mutationFn: ({ sessionId, feedback }: { sessionId: string; feedback: string }) =>
      aipmService.addFeedback(sessionId, feedback),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aipm', 'sessions'] });
      toast.success('Feedback added');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to add feedback');
    },
  });

  const addFeedback = useCallback(
    async (sessionId: string, feedback: string) => {
      await feedbackMutation.mutateAsync({ sessionId, feedback });
    },
    [feedbackMutation]
  );

  return {
    sessions: sessions || [],
    isLoading,
    error: error?.message,
    refetch,
    getSession,
    addFeedback,
    isAddingFeedback: feedbackMutation.isPending,
  };
}

// ============================================
// Flagged Sessions Hook
// ============================================

export function useFlaggedSessions() {
  const { isAuthenticated } = useAuthStore();

  const { data: flaggedSessions, isLoading, refetch } = useQuery({
    queryKey: ['aipm', 'sessions', 'flagged'],
    queryFn: () => aipmService.getFlaggedSessions(),
    enabled: isAuthenticated,
    staleTime: 30000,
  });

  return {
    flaggedSessions: flaggedSessions || [],
    isLoading,
    refetch,
    count: flaggedSessions?.length || 0,
  };
}

// ============================================
// Reports Hook
// ============================================

export function useAIPMReports(filters?: ReportFilters) {
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  const {
    data: reports,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['aipm', 'reports', filters],
    queryFn: () => aipmService.getReports(filters),
    enabled: isAuthenticated,
    staleTime: 60000,
  });

  // Get single report
  const getReport = useCallback(
    async (reportId: string): Promise<IAIPMReport> => {
      return aipmService.getReport(reportId);
    },
    []
  );

  // Generate report mutation
  const generateMutation = useMutation({
    mutationFn: (type: 'daily_digest' | 'weekly_retrospective') =>
      aipmService.generateReport(type),
    onSuccess: (newReport) => {
      queryClient.invalidateQueries({ queryKey: ['aipm', 'reports'] });
      toast.success(`${newReport.type === 'daily_digest' ? 'Daily digest' : 'Weekly retrospective'} generated`);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to generate report');
    },
  });

  // Resolve intervention mutation
  const resolveMutation = useMutation({
    mutationFn: ({
      reportId,
      interventionId,
      resolution,
    }: {
      reportId: string;
      interventionId: string;
      resolution: string;
    }) => aipmService.resolveIntervention(reportId, interventionId, resolution),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aipm', 'reports'] });
      toast.success('Intervention resolved');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to resolve intervention');
    },
  });

  const generateReport = useCallback(
    async (type: 'daily_digest' | 'weekly_retrospective') => {
      await generateMutation.mutateAsync(type);
    },
    [generateMutation]
  );

  const resolveIntervention = useCallback(
    async (reportId: string, interventionId: string, resolution: string) => {
      await resolveMutation.mutateAsync({ reportId, interventionId, resolution });
    },
    [resolveMutation]
  );

  return {
    reports: reports || [],
    isLoading,
    error: error?.message,
    refetch,
    getReport,
    generateReport,
    isGenerating: generateMutation.isPending,
    resolveIntervention,
    isResolving: resolveMutation.isPending,
  };
}

// ============================================
// Combined Dashboard Hook
// ============================================

export function useAIPMDashboard() {
  const { config, isLoading: isLoadingConfig } = useAIPMConfig();
  const { nextCheckIn, isLoading: isLoadingNextCheckIn } = useNextCheckIn();
  const { flaggedSessions, isLoading: isLoadingFlagged, count: flaggedCount } = useFlaggedSessions();
  const { reports, isLoading: isLoadingReports } = useAIPMReports({ limit: 5 });
  const { sessions, isLoading: isLoadingSessions } = useAIPMSessions({ limit: 10 });

  return {
    config,
    nextCheckIn,
    flaggedSessions,
    flaggedCount,
    recentReports: reports,
    recentSessions: sessions,
    isLoading: isLoadingConfig || isLoadingNextCheckIn || isLoadingFlagged || isLoadingReports || isLoadingSessions,
  };
}

