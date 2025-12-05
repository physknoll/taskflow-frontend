import api from './api';
import {
  ApiResponse,
  ProjectAgentStartResponse,
  ProjectAgentMessageResponse,
  ProjectAgentSessionState,
  ProjectAgentConfirmResponse,
} from '@/types';

export interface StartSessionOptions {
  guidelineId?: string;
}

export const projectAgentService = {
  /**
   * Start a new project creation session
   * Returns sessionId and AI greeting message
   * Optionally pass a guidelineId to use an SOP template
   */
  async startSession(options?: StartSessionOptions): Promise<ProjectAgentStartResponse> {
    const response = await api.post<ApiResponse<ProjectAgentStartResponse>>(
      '/project-agent/sessions',
      options
    );
    return response.data.data;
  },

  /**
   * Send a message in an active session
   * Returns AI response, draft state, and whether ready for confirmation
   */
  async sendMessage(
    sessionId: string,
    message: string
  ): Promise<ProjectAgentMessageResponse> {
    const response = await api.post<ApiResponse<ProjectAgentMessageResponse>>(
      `/project-agent/sessions/${sessionId}/messages`,
      { message }
    );
    return response.data.data;
  },

  /**
   * Get the current state of a session
   */
  async getSession(sessionId: string): Promise<ProjectAgentSessionState> {
    const response = await api.get<ApiResponse<ProjectAgentSessionState>>(
      `/project-agent/sessions/${sessionId}`
    );
    return response.data.data;
  },

  /**
   * Confirm and create the project with all tickets
   */
  async confirmAndCreate(sessionId: string): Promise<ProjectAgentConfirmResponse> {
    const response = await api.post<ApiResponse<ProjectAgentConfirmResponse>>(
      `/project-agent/sessions/${sessionId}/confirm`
    );
    return response.data.data;
  },

  /**
   * Cancel/delete an active session
   */
  async cancelSession(sessionId: string): Promise<void> {
    await api.delete(`/project-agent/sessions/${sessionId}`);
  },
};
