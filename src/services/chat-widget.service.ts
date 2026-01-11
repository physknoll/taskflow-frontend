import api from './api';
import {
  ChatWidgetConfig,
  ChatWidgetConfigForm,
  ChatWidgetConfigResponse,
  RegenerateKeyResponse,
  WidgetAnalytics,
  WidgetSession,
  WidgetSessionsResponse,
  WidgetSessionsQuery,
  GeoData,
} from '@/types/chat-widget';
import { ApiResponse } from '@/types';

export const chatWidgetService = {
  /**
   * Get widget configuration for a client
   * Returns 404 if not configured yet
   */
  async getConfig(clientId: string): Promise<ChatWidgetConfig> {
    const response = await api.get<ApiResponse<ChatWidgetConfig>>(
      `/chat-widget/clients/${clientId}`
    );
    return response.data.data;
  },

  /**
   * Create or update widget configuration
   * On first creation, response includes the API key (only shown once!)
   */
  async saveConfig(
    clientId: string,
    config: ChatWidgetConfigForm
  ): Promise<ChatWidgetConfigResponse> {
    const response = await api.post<ApiResponse<ChatWidgetConfigResponse>>(
      `/chat-widget/clients/${clientId}`,
      config
    );
    return response.data.data;
  },

  /**
   * Update existing widget configuration
   */
  async updateConfig(
    clientId: string,
    config: Partial<ChatWidgetConfigForm>
  ): Promise<ChatWidgetConfig> {
    const response = await api.put<ApiResponse<ChatWidgetConfig>>(
      `/chat-widget/clients/${clientId}`,
      config
    );
    return response.data.data;
  },

  /**
   * Disable/delete widget for a client
   */
  async deleteConfig(clientId: string): Promise<void> {
    await api.delete(`/chat-widget/clients/${clientId}`);
  },

  /**
   * Regenerate API key for the widget
   * Warning: This invalidates the previous key immediately
   */
  async regenerateKey(clientId: string): Promise<RegenerateKeyResponse> {
    const response = await api.post<ApiResponse<RegenerateKeyResponse>>(
      `/chat-widget/clients/${clientId}/regenerate-key`
    );
    return response.data.data;
  },

  /**
   * Get analytics overview for the widget
   */
  async getAnalytics(clientId: string): Promise<WidgetAnalytics> {
    const response = await api.get<ApiResponse<WidgetAnalytics>>(
      `/chat-widget/clients/${clientId}/analytics`
    );
    return response.data.data;
  },

  /**
   * Get paginated list of chat sessions
   */
  async getSessions(
    clientId: string,
    query: WidgetSessionsQuery = {}
  ): Promise<WidgetSessionsResponse> {
    const params = new URLSearchParams();
    if (query.limit) params.append('limit', String(query.limit));
    if (query.offset) params.append('offset', String(query.offset));
    if (query.status) params.append('status', query.status);

    const response = await api.get<ApiResponse<WidgetSessionsResponse>>(
      `/chat-widget/clients/${clientId}/analytics/sessions?${params.toString()}`
    );
    return response.data.data;
  },

  /**
   * Get a single session by ID with full message history
   */
  async getSession(clientId: string, sessionId: string): Promise<WidgetSession> {
    const response = await api.get<ApiResponse<WidgetSession>>(
      `/chat-widget/sessions/${sessionId}`
    );
    return response.data.data;
  },

  /**
   * Get geographic breakdown of sessions
   */
  async getGeoAnalytics(clientId: string): Promise<GeoData[]> {
    const response = await api.get<ApiResponse<GeoData[]>>(
      `/chat-widget/clients/${clientId}/analytics/geo`
    );
    return response.data.data;
  },
};
