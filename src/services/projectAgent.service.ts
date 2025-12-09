import api, { getTokens } from './api';
import {
  ApiResponse,
  ProjectAgentStartResponse,
  ProjectAgentMessageResponse,
  ProjectAgentSessionState,
  ProjectAgentConfirmResponse,
  ProjectAgentHistoryResponse,
  UpdateProjectDraftDto,
  ProjectStreamEvent,
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
   * Send a message with SSE streaming response
   * Returns an async generator that yields stream events
   */
  async *sendMessageStream(
    sessionId: string,
    message: string
  ): AsyncGenerator<ProjectStreamEvent, void, unknown> {
    const tokens = getTokens();
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/project-agent/sessions/${sessionId}/messages/stream`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokens?.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      }
    );

    if (!response.ok) {
      throw new Error(`Stream request failed: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const event: ProjectStreamEvent = JSON.parse(line.slice(6));
            yield event;
          } catch {
            // Skip malformed events
          }
        }
      }
    }

    // Process any remaining buffer
    if (buffer.startsWith('data: ')) {
      try {
        const event: ProjectStreamEvent = JSON.parse(buffer.slice(6));
        yield event;
      } catch {
        // Skip malformed events
      }
    }
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
   * Get conversation history for a session
   */
  async getHistory(sessionId: string): Promise<ProjectAgentHistoryResponse> {
    const response = await api.get<ApiResponse<ProjectAgentHistoryResponse>>(
      `/project-agent/sessions/${sessionId}/history`
    );
    return response.data.data;
  },

  /**
   * Update draft directly from UI (bypassing conversation)
   */
  async updateDraft(
    sessionId: string,
    updates: UpdateProjectDraftDto
  ): Promise<ProjectAgentSessionState> {
    const response = await api.patch<ApiResponse<ProjectAgentSessionState>>(
      `/project-agent/sessions/${sessionId}/draft`,
      updates
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
