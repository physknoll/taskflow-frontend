import api from './api';
import {
  ApiResponse,
  SOPAgentStartResponse,
  SOPAgentMessageResponse,
  SOPAgentSessionState,
  SOPAgentConfirmResponse,
} from '@/types';

export const sopAgentService = {
  /**
   * Start a new SOP creation session
   * Returns sessionId and AI greeting message
   */
  async startSession(): Promise<SOPAgentStartResponse> {
    const response = await api.post<ApiResponse<SOPAgentStartResponse>>(
      '/sop-agent/sessions'
    );
    return response.data.data;
  },

  /**
   * Send a message in an active SOP session
   * Returns AI response, draft state, and whether ready for confirmation
   */
  async sendMessage(
    sessionId: string,
    message: string
  ): Promise<SOPAgentMessageResponse> {
    const response = await api.post<ApiResponse<SOPAgentMessageResponse>>(
      `/sop-agent/sessions/${sessionId}/messages`,
      { message }
    );
    return response.data.data;
  },

  /**
   * Get the current state of an SOP session
   */
  async getSession(sessionId: string): Promise<SOPAgentSessionState> {
    const response = await api.get<ApiResponse<SOPAgentSessionState>>(
      `/sop-agent/sessions/${sessionId}`
    );
    return response.data.data;
  },

  /**
   * Confirm and save the generated SOP as a guideline
   */
  async confirmAndSave(sessionId: string): Promise<SOPAgentConfirmResponse> {
    const response = await api.post<ApiResponse<SOPAgentConfirmResponse>>(
      `/sop-agent/sessions/${sessionId}/confirm`
    );
    return response.data.data;
  },

  /**
   * Cancel/delete an active SOP session
   */
  async cancelSession(sessionId: string): Promise<void> {
    await api.delete(`/sop-agent/sessions/${sessionId}`);
  },
};


