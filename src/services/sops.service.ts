import api from './api';
import {
  SOP,
  SOPFilters,
  CreateSOPRequest,
  UpdateSOPRequest,
  PaginatedSOPsResponse,
  ApiResponse,
  PaginatedResponse,
} from '@/types';

// ============================================
// SOP Service - CRUD operations via Knowledge Base endpoints
// ============================================

export const sopsService = {
  /**
   * List all SOPs for a client
   * Uses Knowledge Base endpoint with category=sop filter
   */
  async getSOPs(
    clientId: string,
    filters: SOPFilters = {}
  ): Promise<PaginatedSOPsResponse> {
    const params = new URLSearchParams();
    params.append('category', 'sop');
    
    if (filters.page) params.append('page', String(filters.page));
    if (filters.limit) params.append('limit', String(filters.limit));
    if (filters.search) params.append('search', filters.search);
    if (filters.tags?.length) params.append('tags', filters.tags.join(','));

    const response = await api.get<PaginatedResponse<SOP>>(
      `/clients/${clientId}/knowledge-base?${params.toString()}`
    );

    return {
      data: response.data.data,
      pagination: response.data.pagination,
    };
  },

  /**
   * Get a single SOP by ID
   */
  async getSOP(clientId: string, sopId: string): Promise<SOP> {
    const response = await api.get<ApiResponse<SOP>>(
      `/clients/${clientId}/knowledge-base/${sopId}`
    );
    return response.data.data;
  },

  /**
   * Create a new SOP
   * Automatically sets category to 'sop'
   */
  async createSOP(
    clientId: string,
    data: Omit<CreateSOPRequest, 'category'>
  ): Promise<SOP> {
    const response = await api.post<ApiResponse<SOP>>(
      `/clients/${clientId}/knowledge-base`,
      {
        ...data,
        category: 'sop',
        contentType: data.contentType || 'markdown',
      }
    );
    return response.data.data;
  },

  /**
   * Update an existing SOP
   */
  async updateSOP(
    clientId: string,
    sopId: string,
    data: UpdateSOPRequest
  ): Promise<SOP> {
    const response = await api.put<ApiResponse<SOP>>(
      `/clients/${clientId}/knowledge-base/${sopId}`,
      data
    );
    return response.data.data;
  },

  /**
   * Delete an SOP (soft-delete)
   */
  async deleteSOP(clientId: string, sopId: string): Promise<void> {
    await api.delete(`/clients/${clientId}/knowledge-base/${sopId}`);
  },
};
