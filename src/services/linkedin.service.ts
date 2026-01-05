import api from './api';
import type {
  LinkedInProfile,
  LinkedInPost,
  LinkedInScraper,
  LinkedInSession,
  LinkedInStats,
  LinkedInTimelineEntry,
  LinkedInEngagementStats,
  LinkedInConnectionCode,
  LinkedInScrapersResponse,
  LinkedInTriggerScrapeResponse,
  LinkedInCSVUploadResponse,
  LinkedInProfileFilters,
  LinkedInPostFilters,
  LinkedInSessionFilters,
  AddLinkedInProfileDto,
  BulkAddLinkedInProfilesDto,
  UpdateLinkedInProfileDto,
  UpdateLinkedInScraperSettingsDto,
  UpdateLinkedInPostActionDto,
} from '@/types';
import { ApiResponse, PaginatedResponse } from '@/types';

const BASE_URL = '/linkedin';

export const linkedinService = {
  // ============================================
  // Dashboard & Stats
  // ============================================

  async getStats(): Promise<LinkedInStats> {
    const response = await api.get<ApiResponse<LinkedInStats>>(`${BASE_URL}/stats`);
    return response.data.data;
  },

  async getTimeline(days: number = 7): Promise<LinkedInTimelineEntry[]> {
    const response = await api.get<ApiResponse<{ timeline: LinkedInTimelineEntry[] }>>(
      `${BASE_URL}/stats/timeline?days=${days}`
    );
    return response.data.data.timeline;
  },

  async getEngagementStats(limit: number = 10): Promise<LinkedInEngagementStats> {
    const response = await api.get<ApiResponse<LinkedInEngagementStats>>(
      `${BASE_URL}/stats/engagement?limit=${limit}`
    );
    return response.data.data;
  },

  // ============================================
  // Scraper Management
  // ============================================

  async generateConnectionCode(): Promise<LinkedInConnectionCode> {
    const response = await api.post<ApiResponse<LinkedInConnectionCode>>(
      `${BASE_URL}/scrapers/connection-code`
    );
    return response.data.data;
  },

  async getScrapers(): Promise<LinkedInScrapersResponse> {
    const response = await api.get<ApiResponse<LinkedInScrapersResponse>>(`${BASE_URL}/scrapers`);
    return response.data.data;
  },

  async getScraper(id: string): Promise<LinkedInScraper> {
    const response = await api.get<ApiResponse<LinkedInScraper>>(`${BASE_URL}/scrapers/${id}`);
    return response.data.data;
  },

  async updateScraperSettings(
    id: string,
    settings: UpdateLinkedInScraperSettingsDto
  ): Promise<LinkedInScraper> {
    const response = await api.patch<ApiResponse<LinkedInScraper>>(
      `${BASE_URL}/scrapers/${id}/settings`,
      settings
    );
    return response.data.data;
  },

  async revokeScraper(id: string): Promise<void> {
    await api.post(`${BASE_URL}/scrapers/${id}/revoke`);
  },

  async deleteScraper(id: string): Promise<void> {
    await api.delete(`${BASE_URL}/scrapers/${id}`);
  },

  // ============================================
  // Profile Management
  // ============================================

  async getProfiles(
    filters: LinkedInProfileFilters = {}
  ): Promise<PaginatedResponse<LinkedInProfile>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    const response = await api.get<{
      success: boolean;
      data: { profiles: LinkedInProfile[]; pagination: any };
    }>(`${BASE_URL}/profiles?${params.toString()}`);

    return {
      success: true,
      data: response.data.data.profiles,
      pagination: response.data.data.pagination,
    };
  },

  async getProfile(id: string): Promise<LinkedInProfile> {
    const response = await api.get<ApiResponse<LinkedInProfile>>(`${BASE_URL}/profiles/${id}`);
    return response.data.data;
  },

  async addProfile(data: AddLinkedInProfileDto): Promise<LinkedInProfile> {
    const response = await api.post<ApiResponse<LinkedInProfile>>(`${BASE_URL}/profiles`, data);
    return response.data.data;
  },

  async addProfilesBulk(
    data: BulkAddLinkedInProfilesDto
  ): Promise<{ added: LinkedInProfile[]; errors: any[] }> {
    const response = await api.post<
      ApiResponse<{ added: LinkedInProfile[]; errors: any[] }>
    >(`${BASE_URL}/profiles/bulk`, data);
    return response.data.data;
  },

  async updateProfile(id: string, data: UpdateLinkedInProfileDto): Promise<LinkedInProfile> {
    const response = await api.patch<ApiResponse<LinkedInProfile>>(
      `${BASE_URL}/profiles/${id}`,
      data
    );
    return response.data.data;
  },

  async deleteProfile(id: string): Promise<void> {
    await api.delete(`${BASE_URL}/profiles/${id}`);
  },

  async triggerScrape(profileId: string, scraperId?: string): Promise<LinkedInTriggerScrapeResponse> {
    const response = await api.post<ApiResponse<LinkedInTriggerScrapeResponse>>(
      `${BASE_URL}/profiles/${profileId}/scrape`,
      scraperId ? { scraperId } : undefined
    );
    return response.data.data;
  },

  // CSV Import
  async downloadCSVTemplate(): Promise<Blob> {
    const response = await api.get(`${BASE_URL}/profiles/csv-template`, {
      responseType: 'blob',
    });
    return response.data;
  },

  async uploadCSV(file: File): Promise<LinkedInCSVUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<ApiResponse<LinkedInCSVUploadResponse>>(
      `${BASE_URL}/profiles/upload-csv`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data;
  },

  // ============================================
  // Posts & Content
  // ============================================

  async getPosts(filters: LinkedInPostFilters = {}): Promise<PaginatedResponse<LinkedInPost>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    const response = await api.get<{
      success: boolean;
      data: { posts: LinkedInPost[]; pagination: any };
    }>(`${BASE_URL}/posts?${params.toString()}`);

    return {
      success: true,
      data: response.data.data.posts,
      pagination: response.data.data.pagination,
    };
  },

  async getTrendingPosts(limit: number = 10): Promise<LinkedInPost[]> {
    const response = await api.get<ApiResponse<LinkedInPost[]>>(
      `${BASE_URL}/posts/trending?limit=${limit}`
    );
    return response.data.data;
  },

  async getActionablePosts(limit: number = 20): Promise<LinkedInPost[]> {
    const response = await api.get<ApiResponse<LinkedInPost[]>>(
      `${BASE_URL}/posts/actionable?limit=${limit}`
    );
    return response.data.data;
  },

  async getPost(id: string): Promise<LinkedInPost> {
    const response = await api.get<ApiResponse<LinkedInPost>>(`${BASE_URL}/posts/${id}`);
    return response.data.data;
  },

  async updatePostAction(id: string, data: UpdateLinkedInPostActionDto): Promise<LinkedInPost> {
    const response = await api.patch<ApiResponse<LinkedInPost>>(
      `${BASE_URL}/posts/${id}/action`,
      data
    );
    return response.data.data;
  },

  // ============================================
  // Session History
  // ============================================

  async getSessions(
    filters: LinkedInSessionFilters = {}
  ): Promise<PaginatedResponse<LinkedInSession>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    const response = await api.get<{
      success: boolean;
      data: { sessions: LinkedInSession[]; pagination: any };
    }>(`${BASE_URL}/sessions?${params.toString()}`);

    return {
      success: true,
      data: response.data.data.sessions,
      pagination: response.data.data.pagination,
    };
  },

  async getSession(id: string): Promise<LinkedInSession> {
    const response = await api.get<ApiResponse<LinkedInSession>>(`${BASE_URL}/sessions/${id}`);
    return response.data.data;
  },

  async getSessionPosts(sessionId: string): Promise<LinkedInPost[]> {
    const response = await api.get<ApiResponse<LinkedInPost[]>>(
      `${BASE_URL}/sessions/${sessionId}/posts`
    );
    return response.data.data;
  },
};
