import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from './api';
import {
  KnowledgeBaseSource,
  KnowledgeBaseSourceWithStats,
  KBSourcesFilters,
  CreateKBSourceInput,
  UpdateKBSourceInput,
  CreateSourceResponse,
  SyncJobStarted,
  SyncJobStatus,
  SyncedUrl,
  SyncedUrlsFilters,
  SyncHistoryEntry,
  SyncHistoryFilters,
  TestConnectionResult,
  PaginatedKBSourcesResponse,
  PaginatedSyncedUrlsResponse,
  PaginatedSyncHistoryResponse,
} from '@/types/kb-sources';
import { ApiResponse } from '@/types';

// ============================================
// API Service
// ============================================

export const kbSourcesService = {
  // List sources for a client
  async getSources(
    clientId: string,
    filters: KBSourcesFilters = {}
  ): Promise<PaginatedKBSourcesResponse> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });
    const response = await api.get<ApiResponse<PaginatedKBSourcesResponse>>(
      `/clients/${clientId}/kb-sources?${params.toString()}`
    );
    return response.data.data;
  },

  // Get single source with stats
  async getSource(
    clientId: string,
    sourceId: string
  ): Promise<KnowledgeBaseSourceWithStats> {
    const response = await api.get<ApiResponse<KnowledgeBaseSourceWithStats>>(
      `/clients/${clientId}/kb-sources/${sourceId}`
    );
    return response.data.data;
  },

  // Create a new source (returns source + discovered URLs + sync job)
  async createSource(
    clientId: string,
    data: CreateKBSourceInput
  ): Promise<CreateSourceResponse> {
    const response = await api.post<ApiResponse<CreateSourceResponse>>(
      `/clients/${clientId}/kb-sources`,
      data
    );
    return response.data.data;
  },

  // Update a source
  async updateSource(
    clientId: string,
    sourceId: string,
    data: UpdateKBSourceInput
  ): Promise<KnowledgeBaseSource> {
    const response = await api.put<ApiResponse<KnowledgeBaseSource>>(
      `/clients/${clientId}/kb-sources/${sourceId}`,
      data
    );
    return response.data.data;
  },

  // Delete a source
  async deleteSource(clientId: string, sourceId: string): Promise<void> {
    await api.delete(`/clients/${clientId}/kb-sources/${sourceId}`);
  },

  // Trigger manual sync (returns jobId immediately)
  async triggerSync(
    clientId: string,
    sourceId: string
  ): Promise<SyncJobStarted> {
    const response = await api.post<ApiResponse<SyncJobStarted>>(
      `/clients/${clientId}/kb-sources/${sourceId}/sync`
    );
    return response.data.data;
  },

  // Get sync job status (for polling)
  async getSyncJobStatus(
    clientId: string,
    jobId: string
  ): Promise<SyncJobStatus> {
    const response = await api.get<ApiResponse<SyncJobStatus>>(
      `/clients/${clientId}/kb-sources/sync-status/${jobId}`
    );
    return response.data.data;
  },

  // Get synced URLs for a source
  async getSyncedUrls(
    clientId: string,
    sourceId: string,
    filters: SyncedUrlsFilters = {}
  ): Promise<PaginatedSyncedUrlsResponse> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });
    const response = await api.get<ApiResponse<PaginatedSyncedUrlsResponse>>(
      `/clients/${clientId}/kb-sources/${sourceId}/urls?${params.toString()}`
    );
    return response.data.data;
  },

  // Get sync history for a source
  async getSyncHistory(
    clientId: string,
    sourceId: string,
    filters: SyncHistoryFilters = {}
  ): Promise<PaginatedSyncHistoryResponse> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });
    const response = await api.get<ApiResponse<PaginatedSyncHistoryResponse>>(
      `/clients/${clientId}/kb-sources/${sourceId}/history?${params.toString()}`
    );
    return response.data.data;
  },

  // Test connection to a sitemap URL
  async testConnection(
    clientId: string,
    sitemapUrl: string
  ): Promise<TestConnectionResult> {
    const response = await api.post<ApiResponse<TestConnectionResult>>(
      `/clients/${clientId}/kb-sources/test-connection`,
      { sitemapUrl }
    );
    return response.data.data;
  },

  // Toggle sync enabled/disabled
  async toggleSync(
    clientId: string,
    sourceId: string,
    enabled: boolean
  ): Promise<KnowledgeBaseSource> {
    const response = await api.patch<ApiResponse<KnowledgeBaseSource>>(
      `/clients/${clientId}/kb-sources/${sourceId}/toggle-sync`,
      { enabled }
    );
    return response.data.data;
  },
};

// ============================================
// React Query Hooks
// ============================================

// List sources for a client
export function useKBSources(clientId: string, filters: KBSourcesFilters = {}) {
  return useQuery({
    queryKey: ['kb-sources', clientId, filters],
    queryFn: () => kbSourcesService.getSources(clientId, filters),
    enabled: !!clientId,
  });
}

// Get single source with stats
export function useKBSource(clientId: string, sourceId: string) {
  return useQuery({
    queryKey: ['kb-source', clientId, sourceId],
    queryFn: () => kbSourcesService.getSource(clientId, sourceId),
    enabled: !!clientId && !!sourceId,
  });
}

// Create source (returns source + discovered URLs + sync job)
export function useCreateKBSource(clientId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateKBSourceInput) =>
      kbSourcesService.createSource(clientId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kb-sources', clientId] });
    },
  });
}

// Update source
export function useUpdateKBSource(clientId: string, sourceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateKBSourceInput) =>
      kbSourcesService.updateSource(clientId, sourceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kb-sources', clientId] });
      queryClient.invalidateQueries({
        queryKey: ['kb-source', clientId, sourceId],
      });
    },
  });
}

// Delete source
export function useDeleteKBSource(clientId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sourceId: string) =>
      kbSourcesService.deleteSource(clientId, sourceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kb-sources', clientId] });
    },
  });
}

// Trigger sync (returns jobId immediately)
export function useTriggerSync(clientId: string, sourceId: string) {
  return useMutation({
    mutationFn: () => kbSourcesService.triggerSync(clientId, sourceId),
  });
}

// Poll sync job status (for progress tracking)
export function useSyncJobStatus(clientId: string, jobId: string | null) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['sync-job', clientId, jobId],
    queryFn: () => kbSourcesService.getSyncJobStatus(clientId, jobId!),
    enabled: !!clientId && !!jobId,
    refetchInterval: (query) => {
      const data = query.state.data;
      // Stop polling when job completes or fails
      if (data?.state === 'completed' || data?.state === 'failed') {
        // Invalidate sources to refresh stats
        queryClient.invalidateQueries({ queryKey: ['kb-sources', clientId] });
        return false;
      }
      return 1000; // Poll every 1 second
    },
  });
}

// Test connection
export function useTestConnection(clientId: string) {
  return useMutation({
    mutationFn: (sitemapUrl: string) =>
      kbSourcesService.testConnection(clientId, sitemapUrl),
  });
}

// Get synced URLs with optional polling for pending URLs
export function useSyncedUrls(
  clientId: string,
  sourceId: string,
  options?: SyncedUrlsFilters & { pollWhilePending?: boolean }
) {
  const { pollWhilePending, ...filters } = options || {};
  
  return useQuery({
    queryKey: ['synced-urls', clientId, sourceId, filters],
    queryFn: () => kbSourcesService.getSyncedUrls(clientId, sourceId, filters),
    enabled: !!clientId && !!sourceId,
    refetchInterval: (query) => {
      if (!pollWhilePending) return false;
      // Check if there are still pending URLs
      const hasPending = query.state.data?.data?.some(
        (url: SyncedUrl) => url.status === 'pending'
      );
      return hasPending ? 5000 : false; // Poll every 5 seconds while pending
    },
  });
}

// Toggle sync enabled
export function useToggleSync(clientId: string, sourceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (enabled: boolean) =>
      kbSourcesService.toggleSync(clientId, sourceId, enabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kb-sources', clientId] });
      queryClient.invalidateQueries({
        queryKey: ['kb-source', clientId, sourceId],
      });
    },
  });
}

// Get sync history (activity feed)
export function useSyncHistory(
  clientId: string,
  sourceId: string,
  filters: SyncHistoryFilters = {}
) {
  return useQuery({
    queryKey: ['sync-history', clientId, sourceId, filters],
    queryFn: () => kbSourcesService.getSyncHistory(clientId, sourceId, filters),
    enabled: !!clientId && !!sourceId,
  });
}

