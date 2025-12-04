import api from './api';
import { IParsedUpdate, ApiResponse, INotification, IAICheckinResponse, IAICheckinProcessingResult } from '@/types';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface SendMessageDto {
  message: string;
  clientId?: string;
  ticketId?: string;
  mode?: 'general' | 'knowledge_base' | 'daily_update';
  conversationHistory?: ChatMessage[];
}

export interface ChatResponse {
  response: string;
  citations?: Array<{
    source: string;
    content: string;
  }>;
  suggestedActions?: Array<{
    type: string;
    label: string;
    data: any;
  }>;
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
  async sendMessage(data: SendMessageDto): Promise<ChatResponse> {
    const response = await api.post<ApiResponse<ChatResponse>>('/ai/knowledge-chat', data);
    return response.data.data;
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

