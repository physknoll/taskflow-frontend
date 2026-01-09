'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { scrapingService } from '@/services/scraping.service';
import type {
  ScrapeSchedule,
  ScrapeTarget,
  ScrapeScheduleFilters,
  CreateScrapeScheduleDto,
  UpdateScrapeScheduleDto,
  CreateScrapeTargetDto,
  UpdateScrapeTargetDto,
  QueueFilters,
} from '@/types/scraping';
import toast from 'react-hot-toast';

// ============================================
// Query Keys
// ============================================

export const scrapingKeys = {
  all: ['scraping'] as const,
  schedules: (filters?: ScrapeScheduleFilters) => [...scrapingKeys.all, 'schedules', filters] as const,
  schedule: (id: string) => [...scrapingKeys.all, 'schedule', id] as const,
  targets: (scheduleId: string) => [...scrapingKeys.all, 'targets', scheduleId] as const,
  queue: (filters?: QueueFilters) => [...scrapingKeys.all, 'queue', filters] as const,
  queueStats: () => [...scrapingKeys.all, 'queue', 'stats'] as const,
};

// ============================================
// Schedule Hooks
// ============================================

export function useScrapingSchedules(filters: ScrapeScheduleFilters = {}) {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: scrapingKeys.schedules(filters),
    queryFn: () => scrapingService.getSchedules(filters),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateScrapeScheduleDto) => scrapingService.createSchedule(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scrapingKeys.all });
      toast.success('Schedule created');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create schedule');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateScrapeScheduleDto }) =>
      scrapingService.updateSchedule(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scrapingKeys.all });
      toast.success('Schedule updated');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update schedule');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => scrapingService.deleteSchedule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scrapingKeys.all });
      toast.success('Schedule deleted');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete schedule');
    },
  });

  const triggerMutation = useMutation({
    mutationFn: (id: string) => scrapingService.triggerSchedule(id),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: scrapingKeys.all });
      if (result.commandsQueued > 0) {
        toast.success(
          `Triggered ${result.targetsProcessed} targets. ${result.commandsSent} sent, ${result.commandsQueued} queued.`
        );
      } else {
        toast.success(`Triggered ${result.targetsProcessed} targets`);
      }
    },
    onError: (error: any) => {
      const code = error.response?.data?.code;
      if (code === 'NO_ONLINE_SCRAPER') {
        toast.error('No scrapers are online. Commands will be queued for retry.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to trigger schedule');
      }
    },
  });

  return {
    schedules: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    error,
    refetch,
    createSchedule: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateSchedule: (id: string, data: UpdateScrapeScheduleDto) =>
      updateMutation.mutateAsync({ id, data }),
    isUpdating: updateMutation.isPending,
    deleteSchedule: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    triggerSchedule: triggerMutation.mutateAsync,
    isTriggering: triggerMutation.isPending,
  };
}

export function useScrapingSchedule(id: string) {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: scrapingKeys.schedule(id),
    queryFn: () => scrapingService.getSchedule(id),
    enabled: !!id,
  });

  const addTargetMutation = useMutation({
    mutationFn: (targetData: CreateScrapeTargetDto) =>
      scrapingService.addTarget(id, targetData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scrapingKeys.schedule(id) });
      queryClient.invalidateQueries({ queryKey: scrapingKeys.schedules() });
      toast.success('Target added');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add target');
    },
  });

  const updateTargetMutation = useMutation({
    mutationFn: ({ targetId, data }: { targetId: string; data: UpdateScrapeTargetDto }) =>
      scrapingService.updateTarget(id, targetId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scrapingKeys.schedule(id) });
      toast.success('Target updated');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update target');
    },
  });

  const removeTargetMutation = useMutation({
    mutationFn: (targetId: string) => scrapingService.removeTarget(id, targetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scrapingKeys.schedule(id) });
      queryClient.invalidateQueries({ queryKey: scrapingKeys.schedules() });
      toast.success('Target removed');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to remove target');
    },
  });

  return {
    schedule: data?.schedule,
    targets: data?.targets || [],
    isLoading,
    error,
    refetch,
    addTarget: addTargetMutation.mutateAsync,
    isAddingTarget: addTargetMutation.isPending,
    updateTarget: (targetId: string, data: UpdateScrapeTargetDto) =>
      updateTargetMutation.mutateAsync({ targetId, data }),
    isUpdatingTarget: updateTargetMutation.isPending,
    removeTarget: removeTargetMutation.mutateAsync,
    isRemovingTarget: removeTargetMutation.isPending,
  };
}

// ============================================
// Queue Hooks
// ============================================

export function useScrapingQueue(filters: QueueFilters = {}) {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: scrapingKeys.queue(filters),
    queryFn: () => scrapingService.getQueue(filters),
    refetchInterval: 15000, // Poll every 15 seconds
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => scrapingService.cancelQueuedCommand(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scrapingKeys.queue() });
      queryClient.invalidateQueries({ queryKey: scrapingKeys.queueStats() });
      toast.success('Command cancelled');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to cancel command');
    },
  });

  const retryMutation = useMutation({
    mutationFn: (id: string) => scrapingService.retryQueuedCommand(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scrapingKeys.queue() });
      queryClient.invalidateQueries({ queryKey: scrapingKeys.queueStats() });
      toast.success('Command queued for retry');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to retry command');
    },
  });

  const clearFailedMutation = useMutation({
    mutationFn: () => scrapingService.clearFailedCommands(),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: scrapingKeys.queue() });
      queryClient.invalidateQueries({ queryKey: scrapingKeys.queueStats() });
      toast.success(`Cleared ${result.deleted} failed commands`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to clear commands');
    },
  });

  return {
    status: data?.status,
    commands: data?.commands || [],
    isLoading,
    error,
    refetch,
    cancelCommand: cancelMutation.mutateAsync,
    isCancelling: cancelMutation.isPending,
    retryCommand: retryMutation.mutateAsync,
    isRetrying: retryMutation.isPending,
    clearFailed: clearFailedMutation.mutateAsync,
    isClearing: clearFailedMutation.isPending,
  };
}

export function useScrapingQueueStats() {
  return useQuery({
    queryKey: scrapingKeys.queueStats(),
    queryFn: () => scrapingService.getQueueStats(),
    refetchInterval: 15000, // Poll every 15 seconds
  });
}
