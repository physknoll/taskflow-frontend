'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { linkedinService } from '@/services/linkedin.service';
import {
  LinkedInProfile,
  LinkedInPost,
  LinkedInScraper,
  LinkedInSession,
  LinkedInStats,
  LinkedInProfileFilters,
  LinkedInPostFilters,
  LinkedInSessionFilters,
  AddLinkedInProfileDto,
  UpdateLinkedInProfileDto,
  UpdateLinkedInScraperSettingsDto,
  UpdateLinkedInPostActionDto,
  LinkedInActionStatus,
  LinkedInCSVUploadResponse,
} from '@/types';
import toast from 'react-hot-toast';

// ============================================
// Query Keys - Updated for unified scraping API
// ============================================

export const linkedinKeys = {
  all: ['scraping'] as const,
  stats: () => [...linkedinKeys.all, 'stats'] as const,
  timeline: (days: number) => [...linkedinKeys.all, 'timeline', days] as const,
  engagement: (limit: number) => [...linkedinKeys.all, 'engagement', limit] as const,
  scrapers: () => [...linkedinKeys.all, 'scrapers'] as const,
  scraper: (id: string) => [...linkedinKeys.all, 'scraper', id] as const,
  profiles: (filters: LinkedInProfileFilters) => [...linkedinKeys.all, 'sources', filters] as const,
  profile: (id: string) => [...linkedinKeys.all, 'source', id] as const,
  posts: (filters: LinkedInPostFilters) => [...linkedinKeys.all, 'items', filters] as const,
  post: (id: string) => [...linkedinKeys.all, 'item', id] as const,
  trendingPosts: (limit: number) => [...linkedinKeys.all, 'trending', limit] as const,
  actionablePosts: (limit: number) => [...linkedinKeys.all, 'actionable', limit] as const,
  sessions: (filters: LinkedInSessionFilters) => [...linkedinKeys.all, 'sessions', filters] as const,
  session: (id: string) => [...linkedinKeys.all, 'session', id] as const,
  sessionPosts: (sessionId: string) => [...linkedinKeys.all, 'session', sessionId, 'items'] as const,
};

// Alias for new API naming convention
export const scrapingKeys = linkedinKeys;

// ============================================
// Dashboard Stats Hooks
// ============================================

export function useLinkedInStats() {
  return useQuery({
    queryKey: linkedinKeys.stats(),
    queryFn: () => linkedinService.getStats(),
    refetchInterval: 30000, // Poll every 30 seconds
  });
}

// Alias for new naming
export const useScrapingStats = useLinkedInStats;

export function useLinkedInTimeline(days: number = 7) {
  return useQuery({
    queryKey: linkedinKeys.timeline(days),
    queryFn: () => linkedinService.getTimeline(days),
  });
}

export function useLinkedInEngagement(limit: number = 10) {
  return useQuery({
    queryKey: linkedinKeys.engagement(limit),
    queryFn: () => linkedinService.getEngagementStats(limit),
  });
}

// ============================================
// Scraper Hooks
// ============================================

export function useLinkedInScrapers() {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: linkedinKeys.scrapers(),
    queryFn: () => linkedinService.getScrapers(),
    refetchInterval: 15000, // Poll every 15 seconds for status updates
  });

  const generateCodeMutation = useMutation({
    mutationFn: () => linkedinService.generateConnectionCode(),
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to generate connection code');
    },
  });

  /**
   * @deprecated Scraper-level settings are deprecated. 
   * Settings are now configured at the Source level (scrapeSettings) 
   * or passed as overrides when triggering scrapes.
   * Use useSourceScrape().updateSettings() from useScraping hook instead.
   */
  const updateSettingsMutation = useMutation({
    mutationFn: ({ id, settings }: { id: string; settings: UpdateLinkedInScraperSettingsDto }) =>
      linkedinService.updateScraperSettings(id, settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: linkedinKeys.scrapers() });
      toast.success('Scraper settings updated');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update settings');
    },
  });

  const revokeMutation = useMutation({
    mutationFn: (id: string) => linkedinService.revokeScraper(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: linkedinKeys.scrapers() });
      toast.success('Scraper revoked');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to revoke scraper');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => linkedinService.deleteScraper(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: linkedinKeys.scrapers() });
      toast.success('Scraper deleted');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete scraper');
    },
  });

  return {
    scrapers: data?.scrapers || [],
    onlineCount: data?.onlineCount || 0,
    isLoading,
    error,
    refetch,
    generateConnectionCode: generateCodeMutation.mutateAsync,
    isGeneratingCode: generateCodeMutation.isPending,
    connectionCode: generateCodeMutation.data,
    updateSettings: (id: string, settings: UpdateLinkedInScraperSettingsDto) =>
      updateSettingsMutation.mutateAsync({ id, settings }),
    isUpdatingSettings: updateSettingsMutation.isPending,
    revokeScraper: revokeMutation.mutateAsync,
    isRevoking: revokeMutation.isPending,
    deleteScraper: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}

// Alias for new naming
export const useScrapers = useLinkedInScrapers;

export function useLinkedInScraper(id: string) {
  return useQuery({
    queryKey: linkedinKeys.scraper(id),
    queryFn: () => linkedinService.getScraper(id),
    enabled: !!id,
  });
}

// Alias for new naming
export const useScraper = useLinkedInScraper;

// ============================================
// Profile/Source Hooks
// ============================================

export function useLinkedInProfiles(filters: LinkedInProfileFilters = {}) {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: linkedinKeys.profiles(filters),
    queryFn: () => linkedinService.getProfiles(filters),
  });

  const addMutation = useMutation({
    mutationFn: (data: AddLinkedInProfileDto) => linkedinService.addProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: linkedinKeys.all });
      toast.success('Source added');
    },
    onError: (error: any) => {
      const code = error.response?.data?.code;
      switch (code) {
        case 'MAX_PROFILES_REACHED':
        case 'MAX_SOURCES_REACHED':
          toast.error('Maximum sources reached. Remove some or upgrade your plan.');
          break;
        case 'PROFILE_ALREADY_EXISTS':
        case 'SOURCE_ALREADY_EXISTS':
          toast.error('This source is already being monitored.');
          break;
        case 'INVALID_LINKEDIN_URL':
        case 'INVALID_URL':
          toast.error('Please enter a valid URL.');
          break;
        default:
          toast.error(error.response?.data?.message || 'Failed to add source');
      }
    },
  });

  const bulkAddMutation = useMutation({
    mutationFn: (profiles: AddLinkedInProfileDto[]) =>
      linkedinService.addProfilesBulk({ profiles }),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: linkedinKeys.all });
      if (result.errors.length > 0) {
        toast.success(`Added ${result.added.length} sources. ${result.errors.length} failed.`);
      } else {
        toast.success(`Added ${result.added.length} sources`);
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add sources');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLinkedInProfileDto }) =>
      linkedinService.updateProfile(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: linkedinKeys.all });
      toast.success('Source updated');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update source');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => linkedinService.deleteProfile(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: linkedinKeys.all });
      toast.success('Source deleted');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete source');
    },
  });

  const scrapeMutation = useMutation({
    mutationFn: ({ profileId, scraperId }: { profileId: string; scraperId?: string }) => 
      linkedinService.triggerScrape(profileId, scraperId),
    onSuccess: (result) => {
      const scraperInfo = result.scraperName ? ` using ${result.scraperName}` : '';
      toast.success(`Scrape started${scraperInfo}`);
    },
    onError: (error: any) => {
      const code = error.response?.data?.code;
      if (code === 'NO_ONLINE_SCRAPER') {
        toast.error('No scrapers are online. Please check your desktop agents.');
      } else if (code === 'SCRAPER_OFFLINE') {
        toast.error('Selected scraper is offline. Please choose another scraper.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to start scrape');
      }
    },
  });

  return {
    profiles: data?.data || [],
    // Alias for new naming
    sources: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    error,
    refetch,
    addProfile: addMutation.mutateAsync,
    // Alias for new naming
    addSource: addMutation.mutateAsync,
    isAdding: addMutation.isPending,
    addProfilesBulk: bulkAddMutation.mutateAsync,
    addSourcesBulk: bulkAddMutation.mutateAsync,
    isBulkAdding: bulkAddMutation.isPending,
    updateProfile: (id: string, data: UpdateLinkedInProfileDto) =>
      updateMutation.mutateAsync({ id, data }),
    // Alias for new naming
    updateSource: (id: string, data: UpdateLinkedInProfileDto) =>
      updateMutation.mutateAsync({ id, data }),
    isUpdating: updateMutation.isPending,
    deleteProfile: deleteMutation.mutateAsync,
    // Alias for new naming
    deleteSource: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    triggerScrape: (profileId: string, scraperId?: string) => 
      scrapeMutation.mutateAsync({ profileId, scraperId }),
    isScraping: scrapeMutation.isPending,
  };
}

// Alias for new naming
export const useSources = useLinkedInProfiles;
export const useScrapingSources = useLinkedInProfiles;

export function useLinkedInProfile(id: string) {
  return useQuery({
    queryKey: linkedinKeys.profile(id),
    queryFn: () => linkedinService.getProfile(id),
    enabled: !!id,
  });
}

// Alias for new naming
export const useSource = useLinkedInProfile;

export function useLinkedInCSVUpload() {
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: (file: File) => linkedinService.uploadCSV(file),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: linkedinKeys.all });
      if (result.skipped > 0) {
        toast.success(`Imported ${result.created} sources. ${result.skipped} skipped.`);
      } else {
        toast.success(`Imported ${result.created} sources`);
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to upload CSV');
    },
  });

  const downloadTemplate = async () => {
    try {
      const blob = await linkedinService.downloadCSVTemplate();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'scraping-sources-template.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to download template');
    }
  };

  return {
    uploadCSV: uploadMutation.mutateAsync,
    isUploading: uploadMutation.isPending,
    uploadResult: uploadMutation.data,
    resetUpload: uploadMutation.reset,
    downloadTemplate,
  };
}

// ============================================
// Post/Item Hooks
// ============================================

export function useLinkedInPosts(filters: LinkedInPostFilters = {}) {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: linkedinKeys.posts(filters),
    queryFn: () => linkedinService.getPosts(filters),
    refetchInterval: 60000, // Poll every 60 seconds
  });

  const updateActionMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLinkedInPostActionDto }) =>
      linkedinService.updatePostAction(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: linkedinKeys.all });
      toast.success('Item status updated');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update item');
    },
  });

  return {
    posts: data?.data || [],
    // Alias for new naming
    items: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    error,
    refetch,
    updateAction: (id: string, status: LinkedInActionStatus, notes?: string, ticketId?: string) =>
      updateActionMutation.mutateAsync({ id, data: { status, notes, ticketId } }),
    isUpdatingAction: updateActionMutation.isPending,
  };
}

// Alias for new naming
export const useItems = useLinkedInPosts;
export const useScrapingItems = useLinkedInPosts;

export function useLinkedInPost(id: string) {
  return useQuery({
    queryKey: linkedinKeys.post(id),
    queryFn: () => linkedinService.getPost(id),
    enabled: !!id,
  });
}

// Alias for new naming
export const useItem = useLinkedInPost;

export function useLinkedInTrendingPosts(limit: number = 10) {
  return useQuery({
    queryKey: linkedinKeys.trendingPosts(limit),
    queryFn: () => linkedinService.getTrendingPosts(limit),
    refetchInterval: 30000, // Poll every 30 seconds
  });
}

// Alias for new naming
export const useTrendingItems = useLinkedInTrendingPosts;

export function useLinkedInActionablePosts(limit: number = 20) {
  return useQuery({
    queryKey: linkedinKeys.actionablePosts(limit),
    queryFn: () => linkedinService.getActionablePosts(limit),
    refetchInterval: 60000, // Poll every 60 seconds
  });
}

// Alias for new naming
export const useActionableItems = useLinkedInActionablePosts;

// ============================================
// Session Hooks
// ============================================

export function useLinkedInSessions(filters: LinkedInSessionFilters = {}) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: linkedinKeys.sessions(filters),
    queryFn: () => linkedinService.getSessions(filters),
  });

  return {
    sessions: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    error,
    refetch,
  };
}

// Alias for new naming
export const useSessions = useLinkedInSessions;
export const useScrapingSessions = useLinkedInSessions;

export function useLinkedInSession(id: string) {
  return useQuery({
    queryKey: linkedinKeys.session(id),
    queryFn: () => linkedinService.getSession(id),
    enabled: !!id,
  });
}

// Alias for new naming
export const useSession = useLinkedInSession;

export function useLinkedInSessionPosts(sessionId: string) {
  return useQuery({
    queryKey: linkedinKeys.sessionPosts(sessionId),
    queryFn: () => linkedinService.getSessionPosts(sessionId),
    enabled: !!sessionId,
  });
}

// Alias for new naming
export const useSessionItems = useLinkedInSessionPosts;
