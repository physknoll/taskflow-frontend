import api from './api';
import {
  IParsedUpdate,
  ApiResponse,
  INotification,
  IAICheckinResponse,
  IAICheckinProcessingResult,
  GeneralChatRequest,
  GeneralChatResponse,
  KnowledgeChatRequest,
  KnowledgeChatResponse,
  KnowledgeChatCitation,
} from '@/types';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Legacy interface for backwards compat during transition
export interface SendMessageDto {
  message: string;
  clientId?: string;
  ticketId?: string;
  mode?: 'general' | 'knowledge_base' | 'daily_update';
  conversationHistory?: ChatMessage[];
  conversationId?: string;
}

export interface ChatResponse {
  response: string;
  conversationId: string;
  citations?: Array<{
    source: string;
    content: string;
  }>;
  suggestedActions?: Array<{
    type: string;
    label: string;
    data: any;
  }>;
  knowledgeBase?: {
    answer: string;
    citations: KnowledgeChatCitation[];
    confidence: number;
  };
}

export interface ParseUpdateResponse {
  parsedUpdates: IParsedUpdate[];
  aiResponse: string;
  clarificationNeeded: boolean;
  clarificationQuestion?: string;
}

export interface GeneratedTicketContent {
  enhancedDescription: string;
  aiGeneratedInstructions: string;
  tasks: Array<{
    title: string;
    description: string;
    estimatedMinutes: number;
    order: number;
  }>;
  estimatedTotalHours: number;
  acceptanceCriteria: string[];
  tags: string[];
}

export interface ComposeEmailResponse {
  to: string;
  subject: string;
  body: string;
  suggestedRecipients: Array<{
    name: string;
    email: string;
    role: string;
    reason: string;
  }>;
}

export const aiService = {
  /**
   * Send a general AI chat message (no knowledge base context)
   * POST /api/v1/ai/chat
   */
  async sendGeneralChat(data: GeneralChatRequest): Promise<GeneralChatResponse> {
    const response = await api.post<ApiResponse<GeneralChatResponse>>('/ai/chat', data);
    return response.data.data;
  },

  /**
   * Send a knowledge base chat message (requires clientId)
   * POST /api/v1/ai/knowledge-chat
   */
  async sendKnowledgeChat(data: KnowledgeChatRequest): Promise<KnowledgeChatResponse> {
    const response = await api.post<ApiResponse<KnowledgeChatResponse>>('/ai/knowledge-chat', data);
    return response.data.data;
  },

  /**
   * Legacy unified method - routes to appropriate endpoint based on mode
   * @deprecated Use sendGeneralChat or sendKnowledgeChat instead
   */
  async sendMessage(data: SendMessageDto): Promise<ChatResponse> {
    // Route to appropriate endpoint based on mode
    if (data.mode === 'knowledge_base' && data.clientId) {
      const kbResponse = await this.sendKnowledgeChat({
        message: data.message,
        clientId: data.clientId,
        conversationId: data.conversationId,
      });
      return {
        response: kbResponse.response,
        conversationId: kbResponse.conversationId,
        knowledgeBase: kbResponse.knowledgeBase,
        citations: kbResponse.knowledgeBase?.citations?.map(c => ({
          source: c.title,
          content: c.excerpt,
        })),
      };
    }

    // Default to general chat
    const generalResponse = await this.sendGeneralChat({
      message: data.message,
      clientId: data.clientId,
      conversationHistory: data.conversationHistory,
      conversationId: data.conversationId,
    });
    return {
      response: generalResponse.response,
      conversationId: generalResponse.conversationId,
    };
  },

  async parseUpdate(input: string): Promise<ParseUpdateResponse> {
    const response = await api.post<ApiResponse<ParseUpdateResponse>>('/ai/parse-daily-update', { input });
    return response.data.data;
  },

  async composeQuestion(data: {
    question: string;
    recipientType: 'client' | 'internal';
    clientId?: string;
    context?: string;
  }): Promise<ComposeEmailResponse> {
    const response = await api.post<ApiResponse<ComposeEmailResponse>>('/ai/compose-email', data);
    return response.data.data;
  },

  async generateTicket(data: {
    title: string;
    description: string;
    type: string;
    clientId: string;
  }): Promise<GeneratedTicketContent> {
    const response = await api.post<ApiResponse<GeneratedTicketContent>>('/ai/generate-ticket', data);
    return response.data.data;
  },

  async getProjectManagerCheckin(userId?: string): Promise<{ message: string }> {
    const response = await api.post<ApiResponse<{ message: string }>>('/ai/project-manager-checkin', { userId });
    return response.data.data;
  },

  async applyDailyUpdates(updates: IParsedUpdate[]): Promise<{ success: boolean; applied: number }> {
    const response = await api.post<ApiResponse<{ success: boolean; applied: number }>>('/ai/apply-updates', { updates });
    return response.data.data;
  },

  // AI Check-in Methods
  async getPendingCheckins(): Promise<INotification[]> {
    const response = await api.get<ApiResponse<INotification[]>>('/ai/checkin/pending');
    return response.data.data;
  },

  async respondToCheckin(
    notificationId: string,
    responses: IAICheckinResponse[]
  ): Promise<IAICheckinProcessingResult> {
    const response = await api.post<ApiResponse<IAICheckinProcessingResult>>('/ai/checkin/respond', {
      notificationId,
      responses,
    });
    return response.data.data;
  },

  async dismissCheckin(notificationId: string): Promise<void> {
    await api.post('/ai/checkin/dismiss', { notificationId });
  },

  async getCheckinHistory(): Promise<INotification[]> {
    const response = await api.get<ApiResponse<INotification[]>>('/ai/checkin/history');
    return response.data.data;
  },

  // Test triggers (for development)
  async triggerMorningCheckin(): Promise<INotification> {
    const response = await api.post<ApiResponse<INotification>>('/ai/checkin/trigger-morning');
    return response.data.data;
  },

  async triggerEveningCheckin(): Promise<INotification> {
    const response = await api.post<ApiResponse<INotification>>('/ai/checkin/trigger-evening');
    return response.data.data;
  },
};
