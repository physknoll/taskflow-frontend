import api, { getTokens } from './api';
import {
  ApiResponse,
  TicketAgentStartResponse,
  TicketAgentMessageResponse,
  TicketAgentSessionState,
  TicketAgentHistoryResponse,
  UpdateTicketDraftDto,
  TicketStreamEvent,
} from '@/types';

export interface StartTicketSessionOptions {
  projectId?: string;
}

export const ticketAgentService = {
  /**
   * Start a new ticket creation session
   * Optionally pass projectId to pre-select a project
   */
  async startSession(options?: StartTicketSessionOptions): Promise<TicketAgentStartResponse> {
    const response = await api.post<ApiResponse<TicketAgentStartResponse>>(
      '/ticket-agent/sessions',
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
  ): Promise<TicketAgentMessageResponse> {
    const response = await api.post<ApiResponse<TicketAgentMessageResponse>>(
      `/ticket-agent/sessions/${sessionId}/messages`,
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
  ): AsyncGenerator<TicketStreamEvent, void, unknown> {
    const tokens = getTokens();
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/ticket-agent/sessions/${sessionId}/messages/stream`,
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
      const lines = buffer.split('\n\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const event: TicketStreamEvent = JSON.parse(line.slice(6));
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
        const event: TicketStreamEvent = JSON.parse(buffer.slice(6));
        yield event;
      } catch {
        // Skip malformed events
      }
    }
  },

  /**
   * Get the current state of a session
   */
  async getSession(sessionId: string): Promise<TicketAgentSessionState> {
    const response = await api.get<ApiResponse<TicketAgentSessionState>>(
      `/ticket-agent/sessions/${sessionId}`
    );
    return response.data.data;
  },

  /**
   * Get conversation history for a session
   */
  async getHistory(sessionId: string): Promise<TicketAgentHistoryResponse> {
    const response = await api.get<ApiResponse<TicketAgentHistoryResponse>>(
      `/ticket-agent/sessions/${sessionId}/history`
    );
    return response.data.data;
  },

  /**
   * Update draft directly from UI (bypassing conversation)
   */
  async updateDraft(
    sessionId: string,
    updates: UpdateTicketDraftDto
  ): Promise<TicketAgentSessionState> {
    const response = await api.patch<ApiResponse<TicketAgentSessionState>>(
      `/ticket-agent/sessions/${sessionId}/draft`,
      updates
    );
    return response.data.data;
  },

  /**
   * Cancel/delete an active session
   */
  async cancelSession(sessionId: string): Promise<void> {
    await api.delete(`/ticket-agent/sessions/${sessionId}`);
  },
};
