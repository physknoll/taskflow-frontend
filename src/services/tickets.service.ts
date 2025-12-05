import api from './api';
import { ITicket, ITicketTask, CreateTicketDto, ApiResponse, PaginatedResponse } from '@/types';

export interface TicketFilters {
  client?: string;
  project?: string;  // Filter by project ID, 'standalone' for tickets without project
  status?: string;
  assignedTo?: string;
  priority?: string;
  type?: string;
  search?: string;
  dueDate?: string;
  page?: number;
  limit?: number;
}

export interface AIGeneratedContent {
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

export const ticketsService = {
  async getTickets(filters: TicketFilters = {}): Promise<PaginatedResponse<ITicket>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    const response = await api.get<PaginatedResponse<ITicket>>(`/tickets?${params.toString()}`);
    return response.data;
  },

  async getTicket(id: string): Promise<ITicket> {
    const response = await api.get<ApiResponse<ITicket>>(`/tickets/${id}`);
    return response.data.data;
  },

  async createTicket(data: CreateTicketDto): Promise<ITicket> {
    const response = await api.post<ApiResponse<ITicket>>('/tickets', data);
    return response.data.data;
  },

  async updateTicket(id: string, data: Partial<ITicket>): Promise<ITicket> {
    const response = await api.put<ApiResponse<ITicket>>(`/tickets/${id}`, data);
    return response.data.data;
  },

  async deleteTicket(id: string): Promise<void> {
    await api.delete(`/tickets/${id}`);
  },

  async updateStatus(id: string, status: string): Promise<ITicket> {
    const response = await api.patch<ApiResponse<ITicket>>(`/tickets/${id}/status`, { status });
    return response.data.data;
  },

  async updateTask(ticketId: string, taskId: string, data: Partial<ITicketTask>): Promise<ITicket> {
    const response = await api.patch<ApiResponse<ITicket>>(`/tickets/${ticketId}/tasks/${taskId}`, data);
    return response.data.data;
  },

  // Add a new task to ticket
  async addTask(ticketId: string, data: {
    title: string;
    description?: string;
    estimatedMinutes?: number;
    requiresAttachment?: boolean;
  }): Promise<{ ticket: ITicket; addedTask: ITicketTask }> {
    const response = await api.post<ApiResponse<ITicket> & { addedTask: ITicketTask }>(
      `/tickets/${ticketId}/tasks`,
      data
    );
    return { ticket: response.data.data, addedTask: response.data.addedTask };
  },

  // Delete a task from ticket
  async deleteTask(ticketId: string, taskId: string): Promise<ITicket> {
    const response = await api.delete<ApiResponse<ITicket>>(`/tickets/${ticketId}/tasks/${taskId}`);
    return response.data.data;
  },

  // Reorder tasks
  async reorderTasks(ticketId: string, taskOrder: string[]): Promise<ITicket> {
    const response = await api.patch<ApiResponse<ITicket>>(
      `/tickets/${ticketId}/tasks/reorder`,
      { taskOrder }
    );
    return response.data.data;
  },

  async addComment(ticketId: string, content: string): Promise<ITicket> {
    const response = await api.post<ApiResponse<ITicket>>(`/tickets/${ticketId}/comments`, { content });
    return response.data.data;
  },

  async submitForReview(ticketId: string, data: { notes?: string; assetIds?: string[] }): Promise<{ ticket: ITicket; review: any }> {
    const response = await api.post<ApiResponse<{ ticket: ITicket; review: any }>>(`/tickets/${ticketId}/submit-for-review`, data);
    return response.data.data;
  },

  async generateAIContent(data: { title: string; description: string; type: string; clientId: string }): Promise<AIGeneratedContent> {
    const response = await api.post<ApiResponse<AIGeneratedContent>>('/ai/generate-ticket', data);
    return response.data.data;
  },

  async getMyTickets(): Promise<ITicket[]> {
    const response = await api.get<ApiResponse<ITicket[]>>('/tickets/my');
    return response.data.data;
  },

  async assignTicket(ticketId: string, userIds: string[]): Promise<ITicket> {
    const response = await api.patch<ApiResponse<ITicket>>(`/tickets/${ticketId}/assign`, { assignedTo: userIds });
    return response.data.data;
  },

  async addWatcher(ticketId: string, userId: string): Promise<ITicket> {
    const response = await api.post<ApiResponse<ITicket>>(`/tickets/${ticketId}/watchers`, { userId });
    return response.data.data;
  },

  async removeWatcher(ticketId: string, userId: string): Promise<ITicket> {
    const response = await api.delete<ApiResponse<ITicket>>(`/tickets/${ticketId}/watchers/${userId}`);
    return response.data.data;
  },
};

