import api from './api';
import type {
  ScrapeSchedule,
  ScrapeTarget,
  ScrapeScheduleWithTargets,
  ScrapeScheduleFilters,
  CreateScrapeScheduleDto,
  UpdateScrapeScheduleDto,
  CreateScrapeTargetDto,
  UpdateScrapeTargetDto,
  CreateScheduleResponse,
  TriggerScheduleResponse,
  QueueResponse,
  QueueStats,
  QueueFilters,
  QueuedCommand,
  TriggerSourceScrapeDto,
  TriggerScheduleWithOverridesDto,
  ExecutionScrapeSettings,
  SourceUpdatePayload,
  ScrapeSession,
  ScrapeSessionFilters,
  ScrapeSessionDetails,
  SessionLog,
  ScrapedItem,
  SessionItemsResponse,
} from '@/types/scraping';
import { ApiResponse, PaginatedResponse } from '@/types';

const BASE_URL = '/scraping';

export const scrapingService = {
  // ============================================
  // Schedule CRUD
  // ============================================

  async getSchedules(
    filters: ScrapeScheduleFilters = {}
  ): Promise<PaginatedResponse<ScrapeSchedule>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    const response = await api.get<{
      success: boolean;
      data: { schedules: ScrapeSchedule[]; pagination: any };
    }>(`${BASE_URL}/schedules?${params.toString()}`);

    return {
      success: true,
      data: response.data.data.schedules,
      pagination: response.data.data.pagination,
    };
  },

  async getSchedule(id: string): Promise<ScrapeScheduleWithTargets> {
    const response = await api.get<ApiResponse<ScrapeScheduleWithTargets>>(
      `${BASE_URL}/schedules/${id}`
    );
    return response.data.data;
  },

  async createSchedule(data: CreateScrapeScheduleDto): Promise<CreateScheduleResponse> {
    const response = await api.post<ApiResponse<CreateScheduleResponse>>(
      `${BASE_URL}/schedules`,
      data
    );
    return response.data.data;
  },

  async updateSchedule(id: string, data: UpdateScrapeScheduleDto): Promise<ScrapeSchedule> {
    const response = await api.patch<ApiResponse<ScrapeSchedule>>(
      `${BASE_URL}/schedules/${id}`,
      data
    );
    return response.data.data;
  },

  async deleteSchedule(id: string): Promise<void> {
    await api.delete(`${BASE_URL}/schedules/${id}`);
  },

  async triggerSchedule(id: string, overrides?: TriggerScheduleWithOverridesDto): Promise<TriggerScheduleResponse> {
    const response = await api.post<ApiResponse<TriggerScheduleResponse>>(
      `${BASE_URL}/schedules/${id}/run`,
      overrides || {}
    );
    return response.data.data;
  },

  // ============================================
  // Target Management
  // ============================================

  async getTargets(scheduleId: string): Promise<ScrapeTarget[]> {
    const response = await api.get<ApiResponse<ScrapeTarget[]>>(
      `${BASE_URL}/schedules/${scheduleId}/targets`
    );
    return response.data.data;
  },

  async addTarget(scheduleId: string, data: CreateScrapeTargetDto): Promise<ScrapeTarget> {
    const response = await api.post<ApiResponse<ScrapeTarget>>(
      `${BASE_URL}/schedules/${scheduleId}/targets`,
      data
    );
    return response.data.data;
  },

  async updateTarget(
    scheduleId: string,
    targetId: string,
    data: UpdateScrapeTargetDto
  ): Promise<ScrapeTarget> {
    const response = await api.patch<ApiResponse<ScrapeTarget>>(
      `${BASE_URL}/schedules/${scheduleId}/targets/${targetId}`,
      data
    );
    return response.data.data;
  },

  async removeTarget(scheduleId: string, targetId: string): Promise<void> {
    await api.delete(`${BASE_URL}/schedules/${scheduleId}/targets/${targetId}`);
  },

  // ============================================
  // Source Settings & Manual Scrape (New Architecture)
  // ============================================

  /**
   * Get source with its default scrape settings
   */
  async getSource(id: string): Promise<ScrapeTarget> {
    const response = await api.get<ApiResponse<ScrapeTarget>>(
      `${BASE_URL}/sources/${id}`
    );
    return response.data.data;
  },

  /**
   * Update source settings including default scrape settings
   * Supports partial updates - only include fields you want to change
   */
  async updateSourceSettings(
    id: string,
    payload: SourceUpdatePayload | ExecutionScrapeSettings
  ): Promise<ScrapeTarget> {
    // Check if it's the old format (just scrape settings) or new full payload
    const body = 'scrapeSettings' in payload || 'name' in payload || 'status' in payload
      ? payload
      : { scrapeSettings: payload };
    
    const response = await api.patch<ApiResponse<ScrapeTarget>>(
      `${BASE_URL}/sources/${id}`,
      body
    );
    return response.data.data;
  },

  /**
   * Update source with full payload (name, description, settings, etc.)
   */
  async updateSource(
    id: string,
    payload: SourceUpdatePayload
  ): Promise<ScrapeTarget> {
    const response = await api.patch<ApiResponse<ScrapeTarget>>(
      `${BASE_URL}/sources/${id}`,
      payload
    );
    return response.data.data;
  },

  /**
   * Trigger manual scrape for a source with optional setting overrides
   */
  async triggerSourceScrape(
    sourceId: string,
    overrides?: TriggerSourceScrapeDto
  ): Promise<{ commandId: string; sessionId: string; status: string }> {
    const response = await api.post<ApiResponse<{ commandId: string; sessionId: string; status: string }>>(
      `${BASE_URL}/sources/${sourceId}/scrape`,
      overrides || {}
    );
    return response.data.data;
  },

  // ============================================
  // Command Queue
  // ============================================

  async getQueue(filters: QueueFilters = {}): Promise<QueueResponse> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    const response = await api.get<ApiResponse<QueueResponse>>(
      `${BASE_URL}/queue?${params.toString()}`
    );
    return response.data.data;
  },

  async getQueueStats(): Promise<QueueStats> {
    const response = await api.get<ApiResponse<QueueStats>>(`${BASE_URL}/queue/stats`);
    return response.data.data;
  },

  async cancelQueuedCommand(id: string): Promise<void> {
    await api.delete(`${BASE_URL}/queue/${id}`);
  },

  async retryQueuedCommand(id: string): Promise<QueuedCommand> {
    const response = await api.post<ApiResponse<QueuedCommand>>(
      `${BASE_URL}/queue/${id}/retry`
    );
    return response.data.data;
  },

  async clearFailedCommands(): Promise<{ deleted: number }> {
    const response = await api.delete<ApiResponse<{ deleted: number }>>(
      `${BASE_URL}/queue?status=failed`
    );
    return response.data.data;
  },

  // ============================================
  // Session Management
  // ============================================

  async getSessions(
    filters: ScrapeSessionFilters = {}
  ): Promise<PaginatedResponse<ScrapeSession>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    const response = await api.get<{
      success: boolean;
      data: { sessions: ScrapeSession[]; pagination: any };
    }>(`${BASE_URL}/sessions?${params.toString()}`);

    return {
      success: true,
      data: response.data.data.sessions,
      pagination: response.data.data.pagination,
    };
  },

  async getSession(id: string): Promise<ScrapeSession> {
    const response = await api.get<ApiResponse<ScrapeSession>>(
      `${BASE_URL}/sessions/${id}`
    );
    return response.data.data;
  },

  async getSessionDetails(id: string): Promise<ScrapeSessionDetails> {
    const response = await api.get<ApiResponse<ScrapeSessionDetails>>(
      `${BASE_URL}/sessions/${id}/details`
    );
    return response.data.data;
  },

  async getSessionLogs(
    id: string,
    limit: number = 100
  ): Promise<SessionLog[]> {
    const response = await api.get<ApiResponse<{ logs: SessionLog[] }>>(
      `${BASE_URL}/sessions/${id}/logs?limit=${limit}`
    );
    return response.data.data.logs;
  },

  async getSessionItems(
    id: string,
    page: number = 1,
    limit: number = 50
  ): Promise<SessionItemsResponse> {
    const response = await api.get<ApiResponse<SessionItemsResponse>>(
      `${BASE_URL}/sessions/${id}/items?page=${page}&limit=${limit}`
    );
    return response.data.data;
  },

  async getSessionScreenshots(id: string): Promise<string[]> {
    const response = await api.get<ApiResponse<{ screenshots: string[] }>>(
      `${BASE_URL}/sessions/${id}/screenshots`
    );
    return response.data.data.screenshots;
  },

  getSessionScreenshotUrl(sessionId: string, filename: string): string {
    const baseUrl = api.defaults.baseURL || '';
    return `${baseUrl}${BASE_URL}/sessions/${sessionId}/screenshots/${filename}`;
  },

  // ============================================
  // Stats
  // ============================================

  /**
   * Get scraping stats (now working correctly)
   * Note: Set staleTime: 0 on the query to always get fresh data
   */
  async getStats(): Promise<{
    overview: {
      totalSources: number;
      totalItems: number;
      activeSources: number;
    };
    recentActivity: {
      itemsLast24h: number;
      itemsLast7d: number;
      scrapesLast24h: number;
    };
    byPlatform: Record<string, {
      sources: number;
      items: number;
    }>;
  }> {
    const response = await api.get<ApiResponse<{
      overview: {
        totalSources: number;
        totalItems: number;
        activeSources: number;
      };
      recentActivity: {
        itemsLast24h: number;
        itemsLast7d: number;
        scrapesLast24h: number;
      };
      byPlatform: Record<string, {
        sources: number;
        items: number;
      }>;
    }>>(`${BASE_URL}/stats`);
    return response.data.data;
  },

  // ============================================
  // Items
  // ============================================

  /**
   * Get scraped items with filtering
   */
  async getItems(filters: {
    sourceId?: string;
    platform?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{
    items: ScrapedItem[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    const response = await api.get<ApiResponse<{
      items: ScrapedItem[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    }>>(`${BASE_URL}/items?${params.toString()}`);
    return response.data.data;
  },
};
