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
  TriggerScheduleWithOverridesDto,
  TriggerSourceScrapeDto,
  ExecutionScrapeSettings,
  ScrapeSessionFilters,
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
  // Session keys
  sessions: (filters?: ScrapeSessionFilters) => [...scrapingKeys.all, 'sessions', filters] as const,
  session: (id: string) => [...scrapingKeys.all, 'session', id] as const,
  sessionDetails: (id: string) => [...scrapingKeys.all, 'session', id, 'details'] as const,
  sessionLogs: (id: string) => [...scrapingKeys.all, 'session', id, 'logs'] as const,
  sessionItems: (id: string, page?: number) => [...scrapingKeys.all, 'session', id, 'items', page] as const,
  sessionScreenshots: (id: string) => [...scrapingKeys.all, 'session', id, 'screenshots'] as const,
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
    mutationFn: ({ id, overrides }: { id: string; overrides?: TriggerScheduleWithOverridesDto }) => 
      scrapingService.triggerSchedule(id, overrides),
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
    triggerSchedule: (id: string, overrides?: TriggerScheduleWithOverridesDto) =>
      triggerMutation.mutateAsync({ id, overrides }),
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
// Source Scrape Hook (New Architecture)
// ============================================

export function useSourceScrape() {
  const queryClient = useQueryClient();

  const triggerMutation = useMutation({
    mutationFn: ({ sourceId, overrides }: { sourceId: string; overrides?: TriggerSourceScrapeDto }) =>
      scrapingService.triggerSourceScrape(sourceId, overrides),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scrapingKeys.all });
      toast.success('Scrape started');
    },
    onError: (error: any) => {
      const code = error.response?.data?.code;
      if (code === 'NO_ONLINE_SCRAPER') {
        toast.error('No scrapers are online. Command will be queued for retry.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to trigger scrape');
      }
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: ({ sourceId, settings }: { sourceId: string; settings: ExecutionScrapeSettings }) =>
      scrapingService.updateSourceSettings(sourceId, settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scrapingKeys.all });
      toast.success('Source settings updated');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update settings');
    },
  });

  return {
    triggerScrape: (sourceId: string, overrides?: TriggerSourceScrapeDto) =>
      triggerMutation.mutateAsync({ sourceId, overrides }),
    isTriggering: triggerMutation.isPending,
    updateSettings: (sourceId: string, settings: ExecutionScrapeSettings) =>
      updateSettingsMutation.mutateAsync({ sourceId, settings }),
    isUpdatingSettings: updateSettingsMutation.isPending,
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

// ============================================
// Session Hooks
// ============================================

export function useScrapeSessions(filters: ScrapeSessionFilters = {}) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: scrapingKeys.sessions(filters),
    queryFn: () => scrapingService.getSessions(filters),
    refetchInterval: 30000, // Poll every 30 seconds
  });

  return {
    sessions: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    error,
    refetch,
  };
}

export function useScrapeSession(id: string) {
  return useQuery({
    queryKey: scrapingKeys.session(id),
    queryFn: () => scrapingService.getSession(id),
    enabled: !!id,
  });
}

export function useScrapeSessionDetails(id: string) {
  return useQuery({
    queryKey: scrapingKeys.sessionDetails(id),
    queryFn: () => scrapingService.getSessionDetails(id),
    enabled: !!id,
    refetchInterval: (query) => {
      // Poll more frequently for in-progress sessions
      const status = query.state.data?.session?.status;
      if (status === 'in_progress' || status === 'pending') {
        return 5000;
      }
      return false;
    },
  });
}

export function useScrapeSessionLogs(id: string, limit: number = 100) {
  return useQuery({
    queryKey: scrapingKeys.sessionLogs(id),
    queryFn: () => scrapingService.getSessionLogs(id, limit),
    enabled: !!id,
  });
}

export function useScrapeSessionItems(id: string, page: number = 1, limit: number = 50) {
  return useQuery({
    queryKey: scrapingKeys.sessionItems(id, page),
    queryFn: () => scrapingService.getSessionItems(id, page, limit),
    enabled: !!id,
  });
}

export function useScrapeSessionScreenshots(id: string) {
  return useQuery({
    queryKey: scrapingKeys.sessionScreenshots(id),
    queryFn: () => scrapingService.getSessionScreenshots(id),
    enabled: !!id,
  });
}
