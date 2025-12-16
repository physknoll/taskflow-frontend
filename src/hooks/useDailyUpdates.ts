'use client';

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  aiService,
  ParseProgressResponse,
  AcceptUpdatesResponse,
  DailyUpdatesHistoryParams,
} from '@/services/ai.service';
import { IDailyUpdate } from '@/types';
import toast from 'react-hot-toast';

const QUERY_KEY_TODAY = ['daily-update', 'today'];
const QUERY_KEY_HISTORY = ['daily-updates', 'history'];

export function useDailyUpdates() {
  const queryClient = useQueryClient();
  const [parseResult, setParseResult] = useState<ParseProgressResponse | null>(null);

  // Fetch today's update
  const {
    data: todayUpdate,
    isLoading: isLoadingToday,
    error: todayError,
    refetch: refetchToday,
  } = useQuery({
    queryKey: QUERY_KEY_TODAY,
    queryFn: () => aiService.getDailyUpdateToday(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Parse progress update mutation
  const parseMutation = useMutation({
    mutationFn: (input: string) => aiService.parseProgressUpdate(input),
    onSuccess: (data) => {
      setParseResult(data);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to parse progress update');
    },
  });

  // Accept updates mutation
  const acceptMutation = useMutation({
    mutationFn: ({ dailyUpdateId, acceptedIndices }: { dailyUpdateId: string; acceptedIndices: number[] }) =>
      aiService.acceptUpdates(dailyUpdateId, acceptedIndices),
    onSuccess: (data) => {
      if (data.errors.length > 0) {
        toast.error(`Applied ${data.applied} updates with ${data.errors.length} error(s)`);
      } else {
        toast.success(`Applied ${data.applied} update${data.applied !== 1 ? 's' : ''} successfully`);
      }
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_TODAY });
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_HISTORY });
      setParseResult(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to accept updates');
    },
  });

  // Reject updates mutation
  const rejectMutation = useMutation({
    mutationFn: (dailyUpdateId: string) => aiService.rejectUpdates(dailyUpdateId),
    onSuccess: () => {
      toast.success('Updates rejected');
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_TODAY });
      setParseResult(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to reject updates');
    },
  });

  // Parse a progress update
  const parseProgress = useCallback(
    async (input: string): Promise<ParseProgressResponse | null> => {
      try {
        const result = await parseMutation.mutateAsync(input);
        return result;
      } catch {
        return null;
      }
    },
    [parseMutation]
  );

  // Accept selected updates
  const acceptUpdates = useCallback(
    async (dailyUpdateId: string, acceptedIndices: number[]): Promise<AcceptUpdatesResponse | null> => {
      try {
        const result = await acceptMutation.mutateAsync({ dailyUpdateId, acceptedIndices });
        return result;
      } catch {
        return null;
      }
    },
    [acceptMutation]
  );

  // Reject all updates
  const rejectUpdates = useCallback(
    async (dailyUpdateId: string): Promise<boolean> => {
      try {
        await rejectMutation.mutateAsync(dailyUpdateId);
        return true;
      } catch {
        return false;
      }
    },
    [rejectMutation]
  );

  // Clear parse result (e.g., when closing modal)
  const clearParseResult = useCallback(() => {
    setParseResult(null);
  }, []);

  // Check if user has logged anything today
  const hasLoggedToday = !!todayUpdate;

  return {
    // Today's update
    todayUpdate,
    hasLoggedToday,
    isLoadingToday,
    todayError,
    refetchToday,

    // Parse result (for modal review step)
    parseResult,
    clearParseResult,

    // Actions
    parseProgress,
    acceptUpdates,
    rejectUpdates,

    // Loading states
    isParsing: parseMutation.isPending,
    isAccepting: acceptMutation.isPending,
    isRejecting: rejectMutation.isPending,
    isSubmitting: acceptMutation.isPending || rejectMutation.isPending,
  };
}

// Hook for fetching daily updates history (lazy loaded)
export function useDailyUpdatesHistory(params?: DailyUpdatesHistoryParams) {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [...QUERY_KEY_HISTORY, params],
    queryFn: () => aiService.getDailyUpdatesHistory(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: true, // Always enabled, but can be controlled by parent
  });

  return {
    updates: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    error,
    refetch,
  };
}

// Hook for getting weekly summary
export function useWeeklySummary() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['daily-updates', 'weekly-summary'],
    queryFn: () => aiService.getWeeklySummary(),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  return {
    summary: data?.summary,
    updates: data?.updates || [],
    isLoading,
    error,
    refetch,
  };
}

