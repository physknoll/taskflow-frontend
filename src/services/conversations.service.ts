import api from './api';
import {
  ApiResponse,
  Conversation,
  ConversationType,
  ConversationStatus,
  ConversationChannel,
  ConversationsQuery,
  ConversationsResponse,
  ResumeConversationResponse,
  ConversationFeedbackDto,
  MessageFeedbackDto,
  ConversationStats,
  ConversationStatsQuery,
} from '@/types';

export interface SearchConversationsQuery {
  q: string;
  type?: ConversationType;
  limit?: number;
}

export const conversationsService = {
  /**
   * List user's conversations with optional filters
   * GET /api/v1/aipm/conversations
   */
  async getConversations(query?: ConversationsQuery): Promise<ConversationsResponse> {
    const response = await api.get<ApiResponse<Conversation[]> & { pagination: ConversationsResponse['pagination'] }>(
      '/aipm/conversations',
      { params: query }
    );
    return {
      conversations: response.data.data,
      pagination: response.data.pagination || {
        total: response.data.data.length,
        limit: query?.limit || 20,
        offset: query?.offset || 0,
      },
    };
  },

  /**
   * Get a single conversation by ID
   * GET /api/v1/aipm/conversations/:conversationId
   */
  async getConversation(conversationId: string): Promise<Conversation> {
    const response = await api.get<ApiResponse<Conversation>>(
      `/aipm/conversations/${conversationId}`
    );
    return response.data.data;
  },

  /**
   * Search conversations by query string
   * GET /api/v1/aipm/conversations/search
   */
  async searchConversations(query: SearchConversationsQuery): Promise<Conversation[]> {
    const response = await api.get<ApiResponse<Conversation[]>>(
      '/aipm/conversations/search',
      { params: query }
    );
    return response.data.data;
  },

  /**
   * Get conversations related to a specific ticket
   * GET /api/v1/aipm/conversations/ticket/:ticketId
   */
  async getConversationsForTicket(ticketId: string): Promise<Conversation[]> {
    const response = await api.get<ApiResponse<Conversation[]>>(
      `/aipm/conversations/ticket/${ticketId}`
    );
    return response.data.data;
  },

  /**
   * Get conversations related to a specific project
   * GET /api/v1/aipm/conversations/project/:projectId
   */
  async getConversationsForProject(projectId: string): Promise<Conversation[]> {
    const response = await api.get<ApiResponse<Conversation[]>>(
      `/aipm/conversations/project/${projectId}`
    );
    return response.data.data;
  },

  /**
   * Resume a conversation - returns routing info to restore UI
   * POST /api/v1/aipm/conversations/:conversationId/resume
   */
  async resumeConversation(conversationId: string): Promise<ResumeConversationResponse> {
    const response = await api.post<ApiResponse<ResumeConversationResponse>>(
      `/aipm/conversations/${conversationId}/resume`
    );
    return response.data.data;
  },

  /**
   * Rename/update conversation title
   * PATCH /api/v1/aipm/conversations/:conversationId/title
   */
  async renameConversation(conversationId: string, title: string): Promise<Conversation> {
    const response = await api.patch<ApiResponse<Conversation>>(
      `/aipm/conversations/${conversationId}/title`,
      { title }
    );
    return response.data.data;
  },

  /**
   * Submit feedback for a conversation
   * POST /api/v1/aipm/conversations/:conversationId/feedback
   */
  async submitFeedback(
    conversationId: string,
    feedback: ConversationFeedbackDto
  ): Promise<void> {
    await api.post(
      `/aipm/conversations/${conversationId}/feedback`,
      feedback
    );
  },

  /**
   * Submit feedback for a specific message (thumbs up/down)
   * POST /api/v1/aipm/conversations/:conversationId/messages/:messageId/feedback
   */
  async submitMessageFeedback(
    conversationId: string,
    messageId: string,
    feedback: MessageFeedbackDto
  ): Promise<void> {
    await api.post(
      `/aipm/conversations/${conversationId}/messages/${messageId}/feedback`,
      feedback
    );
  },

  /**
   * Get user's conversation statistics
   * GET /api/v1/aipm/conversations/stats
   */
  async getStats(query?: ConversationStatsQuery): Promise<ConversationStats> {
    const response = await api.get<ApiResponse<ConversationStats>>(
      '/aipm/conversations/stats',
      { params: query }
    );
    return response.data.data;
  },
};




