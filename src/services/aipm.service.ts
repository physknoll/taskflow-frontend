import api from './api';
import {
  IAIPMConfig,
  ICheckInSession,
  IAIPMReport,
  INextCheckIn,
  IMessageResponse,
  UpdateAIPMConfigDto,
  SessionFilters,
  ReportFilters,
  IIntervention,
} from '@/types/aipm';
import { ApiResponse } from '@/types';

export const aipmService = {
  // ============================================
  // Configuration
  // ============================================

  /**
   * Get organization AIPM configuration
   */
  async getConfig(): Promise<IAIPMConfig> {
    const response = await api.get<ApiResponse<IAIPMConfig>>('/aipm/config');
    return response.data.data;
  },

  /**
   * Update AIPM configuration
   */
  async updateConfig(updates: UpdateAIPMConfigDto): Promise<IAIPMConfig> {
    const response = await api.put<ApiResponse<IAIPMConfig>>('/aipm/config', updates);
    return response.data.data;
  },

  /**
   * Get next scheduled check-in time
   */
  async getNextCheckIn(): Promise<INextCheckIn | null> {
    const response = await api.get<ApiResponse<INextCheckIn | null>>('/aipm/config/next-checkin');
    return response.data.data;
  },

  // ============================================
  // Sessions
  // ============================================

  /**
   * List check-in sessions with optional filters
   */
  async getSessions(filters?: SessionFilters): Promise<ICheckInSession[]> {
    const response = await api.get<ApiResponse<ICheckInSession[]>>('/aipm/sessions', {
      params: filters,
    });
    return response.data.data;
  },

  /**
   * Get current user's active session
   */
  async getActiveSession(): Promise<ICheckInSession | null> {
    const response = await api.get<ApiResponse<ICheckInSession | null>>('/aipm/sessions/active');
    return response.data.data;
  },

  /**
   * Get session details with transcript
   */
  async getSession(sessionId: string): Promise<ICheckInSession> {
    const response = await api.get<ApiResponse<ICheckInSession>>(`/aipm/sessions/${sessionId}`);
    return response.data.data;
  },

  /**
   * Send a message in an active session
   */
  async sendMessage(sessionId: string, message: string): Promise<IMessageResponse> {
    const response = await api.post<ApiResponse<IMessageResponse>>(
      `/aipm/sessions/${sessionId}/messages`,
      { message }
    );
    return response.data.data;
  },

  /**
   * Skip a scheduled check-in
   */
  async skipSession(sessionId: string, reason: string): Promise<ICheckInSession> {
    const response = await api.post<ApiResponse<ICheckInSession>>(
      `/aipm/sessions/${sessionId}/skip`,
      { reason }
    );
    return response.data.data;
  },

  /**
   * Add manager feedback to a session
   */
  async addFeedback(sessionId: string, feedback: string): Promise<ICheckInSession> {
    const response = await api.post<ApiResponse<ICheckInSession>>(
      `/aipm/sessions/${sessionId}/feedback`,
      { feedback }
    );
    return response.data.data;
  },

  /**
   * Get flagged sessions
   */
  async getFlaggedSessions(): Promise<ICheckInSession[]> {
    const response = await api.get<ApiResponse<ICheckInSession[]>>('/aipm/sessions', {
      params: { flagged: true },
    });
    return response.data.data;
  },

  // ============================================
  // Reports
  // ============================================

  /**
   * List reports with optional filters
   */
  async getReports(filters?: ReportFilters): Promise<IAIPMReport[]> {
    const response = await api.get<ApiResponse<IAIPMReport[]>>('/aipm/reports', {
      params: filters,
    });
    return response.data.data;
  },

  /**
   * Get report details
   */
  async getReport(reportId: string): Promise<IAIPMReport> {
    const response = await api.get<ApiResponse<IAIPMReport>>(`/aipm/reports/${reportId}`);
    return response.data.data;
  },

  /**
   * Manually generate a report
   */
  async generateReport(type: 'daily_digest' | 'weekly_retrospective'): Promise<IAIPMReport> {
    const response = await api.post<ApiResponse<IAIPMReport>>('/aipm/reports/generate', { type });
    return response.data.data;
  },

  /**
   * Resolve an intervention
   */
  async resolveIntervention(
    reportId: string,
    interventionId: string,
    resolution: string
  ): Promise<IIntervention> {
    const response = await api.patch<ApiResponse<IIntervention>>(
      `/aipm/reports/${reportId}/interventions/${interventionId}`,
      { resolution }
    );
    return response.data.data;
  },
};

