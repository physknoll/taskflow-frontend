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
import { 
  mapScraperResponse,
  mapSourceResponse,
  mapItemResponse,
  mapStatsResponse,
} from '@/types/linkedin';
import { ApiResponse, PaginatedResponse } from '@/types';

// Updated base URL for unified scraping API
const BASE_URL = '/scraping';

export const linkedinService = {
  // ============================================
  // Dashboard & Stats
  // ============================================

  async getStats(): Promise<LinkedInStats> {
    const response = await api.get<ApiResponse<LinkedInStats>>(`${BASE_URL}/stats`);
    // Map new API response to component-expected format
    return mapStatsResponse(response.data.data);
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
    const response = await api.get<{
      success: boolean;
      data: { scrapers: LinkedInScraper[] };
    }>(`${BASE_URL}/scrapers`);
    
    // Map scrapers to component-expected format
    const scrapers = response.data.data.scrapers.map(mapScraperResponse);
    const onlineCount = scrapers.filter(s => s.isOnlineNow || s.status === 'online').length;
    
    return { scrapers, onlineCount };
  },

  async getScraper(id: string): Promise<LinkedInScraper> {
    const response = await api.get<ApiResponse<LinkedInScraper>>(`${BASE_URL}/scrapers/${id}`);
    return mapScraperResponse(response.data.data);
  },

  async updateScraperSettings(
    id: string,
    settings: UpdateLinkedInScraperSettingsDto
  ): Promise<LinkedInScraper> {
    const response = await api.patch<ApiResponse<LinkedInScraper>>(
      `${BASE_URL}/scrapers/${id}/settings`,
      settings
    );
    return mapScraperResponse(response.data.data);
  },

  async revokeScraper(id: string): Promise<void> {
    await api.post(`${BASE_URL}/scrapers/${id}/revoke`);
  },

  async deleteScraper(id: string): Promise<void> {
    await api.delete(`${BASE_URL}/scrapers/${id}`);
  },

  // ============================================
  // Source Management (Previously Profile)
  // ============================================

  async getProfiles(
    filters: LinkedInProfileFilters = {}
  ): Promise<PaginatedResponse<LinkedInProfile>> {
    const params = new URLSearchParams();
    
    // Map legacy filter names to new API
    const filterMapping: Record<string, string> = {
      profileId: 'sourceId',
      monitoringEnabled: 'status', // Will need special handling
    };
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        // Handle special case for monitoringEnabled -> status
        if (key === 'monitoringEnabled') {
          params.append('status', value ? 'active' : 'paused');
        } else {
          const mappedKey = filterMapping[key] || key;
          params.append(mappedKey, String(value));
        }
      }
    });

    const response = await api.get<{
      success: boolean;
      data: { sources?: LinkedInProfile[]; profiles?: LinkedInProfile[]; pagination: any };
    }>(`${BASE_URL}/sources?${params.toString()}`);

    // Handle both old and new response format
    const sources = response.data.data.sources || response.data.data.profiles || [];

    return {
      success: true,
      data: sources.map(mapSourceResponse),
      pagination: response.data.data.pagination,
    };
  },

  // Alias for new API naming
  async getSources(filters: LinkedInProfileFilters = {}): Promise<PaginatedResponse<LinkedInProfile>> {
    return this.getProfiles(filters);
  },

  async getProfile(id: string): Promise<LinkedInProfile> {
    const response = await api.get<ApiResponse<LinkedInProfile>>(`${BASE_URL}/sources/${id}`);
    return mapSourceResponse(response.data.data);
  },

  // Alias for new API naming
  async getSource(id: string): Promise<LinkedInProfile> {
    return this.getProfile(id);
  },

  async addProfile(data: AddLinkedInProfileDto): Promise<LinkedInProfile> {
    // Transform legacy DTO to new API format
    const newApiData = {
      platform: data.platform || 'linkedin',
      sourceType: data.sourceType || 'profile',
      url: data.url,
      name: data.displayName || data.name,
      scrapeSettings: data.scrapeSettings || {
        frequency: data.intervalMinutes ? `${data.intervalMinutes}m` : 'daily',
        maxItems: 50,
      },
      priority: data.priority,
      // Pass through other fields the backend might still support
      profileType: data.profileType,
      clientId: data.clientId,
      tags: data.tags,
    };
    
    const response = await api.post<ApiResponse<LinkedInProfile>>(`${BASE_URL}/sources`, newApiData);
    return mapSourceResponse(response.data.data);
  },

  // Alias for new API naming
  async addSource(data: AddLinkedInProfileDto): Promise<LinkedInProfile> {
    return this.addProfile(data);
  },

  async addProfilesBulk(
    data: BulkAddLinkedInProfilesDto
  ): Promise<{ added: LinkedInProfile[]; errors: any[] }> {
    const response = await api.post<
      ApiResponse<{ added: LinkedInProfile[]; errors: any[] }>
    >(`${BASE_URL}/sources/bulk`, { sources: data.profiles });
    return {
      added: response.data.data.added.map(mapSourceResponse),
      errors: response.data.data.errors,
    };
  },

  async updateProfile(id: string, data: UpdateLinkedInProfileDto): Promise<LinkedInProfile> {
    // Transform legacy DTO to new API format
    const newApiData: any = {
      ...data,
      name: data.displayName || data.name,
    };
    
    // Map monitoringEnabled to status
    if (data.monitoringEnabled !== undefined) {
      newApiData.status = data.monitoringEnabled ? 'active' : 'paused';
    }
    
    // Map intervalMinutes to scrapeSettings
    if (data.intervalMinutes) {
      newApiData.scrapeSettings = {
        frequency: `${data.intervalMinutes}m`,
      };
    }
    
    const response = await api.patch<ApiResponse<LinkedInProfile>>(
      `${BASE_URL}/sources/${id}`,
      newApiData
    );
    return mapSourceResponse(response.data.data);
  },

  // Alias for new API naming
  async updateSource(id: string, data: UpdateLinkedInProfileDto): Promise<LinkedInProfile> {
    return this.updateProfile(id, data);
  },

  async deleteProfile(id: string): Promise<void> {
    await api.delete(`${BASE_URL}/sources/${id}`);
  },

  // Alias for new API naming
  async deleteSource(id: string): Promise<void> {
    return this.deleteProfile(id);
  },

  async triggerScrape(profileId: string, scraperId?: string): Promise<LinkedInTriggerScrapeResponse> {
    const response = await api.post<ApiResponse<LinkedInTriggerScrapeResponse>>(
      `${BASE_URL}/sources/${profileId}/scrape`,
      scraperId ? { scraperId } : undefined
    );
    return response.data.data;
  },

  // CSV Import
  async downloadCSVTemplate(): Promise<Blob> {
    const response = await api.get(`${BASE_URL}/sources/csv-template`, {
      responseType: 'blob',
    });
    return response.data;
  },

  async uploadCSV(file: File): Promise<LinkedInCSVUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<ApiResponse<LinkedInCSVUploadResponse>>(
      `${BASE_URL}/sources/upload-csv`,
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
  // Items & Content (Previously Posts)
  // ============================================

  async getPosts(filters: LinkedInPostFilters = {}): Promise<PaginatedResponse<LinkedInPost>> {
    const params = new URLSearchParams();
    
    // Map legacy filter names to new API
    const filterMapping: Record<string, string> = {
      profileId: 'sourceId',
      actionStatus: 'status',
      activityType: 'itemType',
    };
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        const mappedKey = filterMapping[key] || key;
        params.append(mappedKey, String(value));
      }
    });

    const response = await api.get<{
      success: boolean;
      data: { items?: LinkedInPost[]; posts?: LinkedInPost[]; pagination: any };
    }>(`${BASE_URL}/items?${params.toString()}`);

    // Handle both old and new response format
    const items = response.data.data.items || response.data.data.posts || [];

    return {
      success: true,
      data: items.map(mapItemResponse),
      pagination: response.data.data.pagination,
    };
  },

  // Alias for new API naming
  async getItems(filters: LinkedInPostFilters = {}): Promise<PaginatedResponse<LinkedInPost>> {
    return this.getPosts(filters);
  },

  async getTrendingPosts(limit: number = 10): Promise<LinkedInPost[]> {
    const response = await api.get<ApiResponse<LinkedInPost[]>>(
      `${BASE_URL}/items/trending?limit=${limit}`
    );
    return response.data.data.map(mapItemResponse);
  },

  // Alias for new API naming
  async getTrendingItems(limit: number = 10): Promise<LinkedInPost[]> {
    return this.getTrendingPosts(limit);
  },

  async getActionablePosts(limit: number = 20): Promise<LinkedInPost[]> {
    const response = await api.get<ApiResponse<LinkedInPost[]>>(
      `${BASE_URL}/items/actionable?limit=${limit}`
    );
    return response.data.data.map(mapItemResponse);
  },

  // Alias for new API naming
  async getActionableItems(limit: number = 20): Promise<LinkedInPost[]> {
    return this.getActionablePosts(limit);
  },

  async getPost(id: string): Promise<LinkedInPost> {
    const response = await api.get<ApiResponse<LinkedInPost>>(`${BASE_URL}/items/${id}`);
    return mapItemResponse(response.data.data);
  },

  // Alias for new API naming
  async getItem(id: string): Promise<LinkedInPost> {
    return this.getPost(id);
  },

  getScreenshotUrl(postId: string, token?: string): string {
    // Returns the URL to fetch the screenshot image
    // The API returns the raw image with proper Content-Type header
    // Token is passed as query param for use in <img> tags
    const baseUrl = api.defaults.baseURL || '';
    const url = `${baseUrl}${BASE_URL}/items/${postId}/screenshot`;
    return token ? `${url}?token=${token}` : url;
  },

  async updatePostAction(id: string, data: UpdateLinkedInPostActionDto): Promise<LinkedInPost> {
    const response = await api.patch<ApiResponse<LinkedInPost>>(
      `${BASE_URL}/items/${id}/action`,
      data
    );
    return mapItemResponse(response.data.data);
  },

  // Alias for new API naming
  async updateItemAction(id: string, data: UpdateLinkedInPostActionDto): Promise<LinkedInPost> {
    return this.updatePostAction(id, data);
  },

  // ============================================
  // Session History
  // ============================================

  async getSessions(
    filters: LinkedInSessionFilters = {}
  ): Promise<PaginatedResponse<LinkedInSession>> {
    const params = new URLSearchParams();
    
    // Map legacy filter names to new API
    const filterMapping: Record<string, string> = {
      profileId: 'sourceId',
    };
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        const mappedKey = filterMapping[key] || key;
        params.append(mappedKey, String(value));
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
      `${BASE_URL}/sessions/${sessionId}/items`
    );
    return response.data.data.map(mapItemResponse);
  },

  // Alias for new API naming
  async getSessionItems(sessionId: string): Promise<LinkedInPost[]> {
    return this.getSessionPosts(sessionId);
  },
};
