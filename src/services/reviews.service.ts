import api from './api';
import { IReview, IReviewCriteria, ITicketInReview, ApiResponse, PaginatedResponse } from '@/types';

export interface ReviewFilters {
  status?: string;
  assignedReviewers?: string;
  ticket?: string;
  page?: number;
  limit?: number;
}

export interface CompleteReviewDto {
  status: 'approved' | 'rejected' | 'needs_revision';
  criteria: IReviewCriteria[];
  feedback: string;
  privateNotes?: string;
}

export const reviewsService = {
  async getReviews(filters: ReviewFilters = {}): Promise<PaginatedResponse<IReview>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    const response = await api.get<PaginatedResponse<IReview>>(`/reviews?${params.toString()}`);
    return response.data;
  },

  async getPendingReviews(): Promise<{ data: IReview[] }> {
    const response = await api.get<ApiResponse<IReview[]>>('/reviews/pending');
    return { data: response.data.data };
  },

  async getTicketsInReview(): Promise<{ data: ITicketInReview[]; count: number }> {
    const response = await api.get<{ success: boolean; data: ITicketInReview[]; count: number }>('/reviews/tickets-in-review');
    return { data: response.data.data, count: response.data.count };
  },

  async getReview(id: string): Promise<IReview> {
    const response = await api.get<ApiResponse<IReview>>(`/reviews/${id}`);
    return response.data.data;
  },

  async startReview(id: string): Promise<IReview> {
    const response = await api.post<ApiResponse<IReview>>(`/reviews/${id}/start`);
    return response.data.data;
  },

  async completeReview(id: string, data: CompleteReviewDto): Promise<IReview> {
    const response = await api.post<ApiResponse<IReview>>(`/reviews/${id}/complete`, data);
    return response.data.data;
  },

  async submitRevision(id: string, data: { notes: string; assetIds: string[] }): Promise<IReview> {
    const response = await api.post<ApiResponse<IReview>>(`/reviews/${id}/revision`, data);
    return response.data.data;
  },

  async updateReview(id: string, data: Partial<IReview>): Promise<IReview> {
    const response = await api.put<ApiResponse<IReview>>(`/reviews/${id}`, data);
    return response.data.data;
  },

  async getReviewsByTicket(ticketId: string): Promise<IReview[]> {
    const response = await api.get<ApiResponse<IReview[]>>(`/reviews/ticket/${ticketId}`);
    return response.data.data;
  },

  async assignReviewer(reviewId: string, userId: string): Promise<IReview> {
    const response = await api.post<ApiResponse<IReview>>(`/reviews/${reviewId}/assign`, { userId });
    return response.data.data;
  },
};

