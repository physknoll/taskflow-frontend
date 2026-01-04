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
// Query Keys
// ============================================

export const linkedinKeys = {
  all: ['linkedin'] as const,
  stats: () => [...linkedinKeys.all, 'stats'] as const,
  timeline: (days: number) => [...linkedinKeys.all, 'timeline', days] as const,
  engagement: (limit: number) => [...linkedinKeys.all, 'engagement', limit] as const,
  scrapers: () => [...linkedinKeys.all, 'scrapers'] as const,
  scraper: (id: string) => [...linkedinKeys.all, 'scraper', id] as const,
  profiles: (filters: LinkedInProfileFilters) => [...linkedinKeys.all, 'profiles', filters] as const,
  profile: (id: string) => [...linkedinKeys.all, 'profile', id] as const,
  posts: (filters: LinkedInPostFilters) => [...linkedinKeys.all, 'posts', filters] as const,
  post: (id: string) => [...linkedinKeys.all, 'post', id] as const,
  trendingPosts: (limit: number) => [...linkedinKeys.all, 'trending', limit] as const,
  actionablePosts: (limit: number) => [...linkedinKeys.all, 'actionable', limit] as const,
  sessions: (filters: LinkedInSessionFilters) => [...linkedinKeys.all, 'sessions', filters] as const,
  session: (id: string) => [...linkedinKeys.all, 'session', id] as const,
  sessionPosts: (sessionId: string) => [...linkedinKeys.all, 'session', sessionId, 'posts'] as const,
};

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

export function useLinkedInScraper(id: string) {
  return useQuery({
    queryKey: linkedinKeys.scraper(id),
    queryFn: () => linkedinService.getScraper(id),
    enabled: !!id,
  });
}

// ============================================
// Profile Hooks
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
      toast.success('Profile added');
    },
    onError: (error: any) => {
      const code = error.response?.data?.code;
      switch (code) {
        case 'MAX_PROFILES_REACHED':
          toast.error('Maximum profiles reached. Remove some or upgrade your plan.');
          break;
        case 'PROFILE_ALREADY_EXISTS':
          toast.error('This profile is already being monitored.');
          break;
        case 'INVALID_LINKEDIN_URL':
          toast.error('Please enter a valid LinkedIn profile or company URL.');
          break;
        default:
          toast.error(error.response?.data?.message || 'Failed to add profile');
      }
    },
  });

  const bulkAddMutation = useMutation({
    mutationFn: (profiles: AddLinkedInProfileDto[]) =>
      linkedinService.addProfilesBulk({ profiles }),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: linkedinKeys.all });
      if (result.errors.length > 0) {
        toast.success(`Added ${result.added.length} profiles. ${result.errors.length} failed.`);
      } else {
        toast.success(`Added ${result.added.length} profiles`);
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add profiles');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLinkedInProfileDto }) =>
      linkedinService.updateProfile(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: linkedinKeys.all });
      toast.success('Profile updated');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => linkedinService.deleteProfile(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: linkedinKeys.all });
      toast.success('Profile deleted');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete profile');
    },
  });

  const scrapeMutation = useMutation({
    mutationFn: (profileId: string) => linkedinService.triggerScrape(profileId),
    onSuccess: () => {
      toast.success('Scrape started');
    },
    onError: (error: any) => {
      const code = error.response?.data?.code;
      if (code === 'NO_ONLINE_SCRAPER') {
        toast.error('No scrapers are online. Please check your desktop agents.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to start scrape');
      }
    },
  });

  return {
    profiles: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    error,
    refetch,
    addProfile: addMutation.mutateAsync,
    isAdding: addMutation.isPending,
    addProfilesBulk: bulkAddMutation.mutateAsync,
    isBulkAdding: bulkAddMutation.isPending,
    updateProfile: (id: string, data: UpdateLinkedInProfileDto) =>
      updateMutation.mutateAsync({ id, data }),
    isUpdating: updateMutation.isPending,
    deleteProfile: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    triggerScrape: scrapeMutation.mutateAsync,
    isScraping: scrapeMutation.isPending,
  };
}

export function useLinkedInProfile(id: string) {
  return useQuery({
    queryKey: linkedinKeys.profile(id),
    queryFn: () => linkedinService.getProfile(id),
    enabled: !!id,
  });
}

export function useLinkedInCSVUpload() {
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: (file: File) => linkedinService.uploadCSV(file),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: linkedinKeys.all });
      if (result.skipped > 0) {
        toast.success(`Imported ${result.created} profiles. ${result.skipped} skipped.`);
      } else {
        toast.success(`Imported ${result.created} profiles`);
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
      a.download = 'linkedin-profiles-template.csv';
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
// Post Hooks
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
      toast.success('Post status updated');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update post');
    },
  });

  return {
    posts: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    error,
    refetch,
    updateAction: (id: string, status: LinkedInActionStatus, notes?: string, ticketId?: string) =>
      updateActionMutation.mutateAsync({ id, data: { status, notes, ticketId } }),
    isUpdatingAction: updateActionMutation.isPending,
  };
}

export function useLinkedInPost(id: string) {
  return useQuery({
    queryKey: linkedinKeys.post(id),
    queryFn: () => linkedinService.getPost(id),
    enabled: !!id,
  });
}

export function useLinkedInTrendingPosts(limit: number = 10) {
  return useQuery({
    queryKey: linkedinKeys.trendingPosts(limit),
    queryFn: () => linkedinService.getTrendingPosts(limit),
    refetchInterval: 30000, // Poll every 30 seconds
  });
}

export function useLinkedInActionablePosts(limit: number = 20) {
  return useQuery({
    queryKey: linkedinKeys.actionablePosts(limit),
    queryFn: () => linkedinService.getActionablePosts(limit),
    refetchInterval: 60000, // Poll every 60 seconds
  });
}

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

export function useLinkedInSession(id: string) {
  return useQuery({
    queryKey: linkedinKeys.session(id),
    queryFn: () => linkedinService.getSession(id),
    enabled: !!id,
  });
}

export function useLinkedInSessionPosts(sessionId: string) {
  return useQuery({
    queryKey: linkedinKeys.sessionPosts(sessionId),
    queryFn: () => linkedinService.getSessionPosts(sessionId),
    enabled: !!sessionId,
  });
}
