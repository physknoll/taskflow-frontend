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
   */
  async updateSourceSettings(
    id: string,
    scrapeSettings: ExecutionScrapeSettings
  ): Promise<ScrapeTarget> {
    const response = await api.patch<ApiResponse<ScrapeTarget>>(
      `${BASE_URL}/sources/${id}`,
      { scrapeSettings }
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
};
