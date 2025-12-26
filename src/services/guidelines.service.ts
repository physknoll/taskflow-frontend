import api from './api';
import {
  ApiResponse,
  PaginatedResponse,
  Guideline,
  GroupedGuidelines,
  CreateGuidelineDto,
  UpdateGuidelineDto,
} from '@/types';

export interface GuidelinesFilters {
  isActive?: boolean;
  projectType?: string;
  client?: string;
  isDefault?: boolean;
  page?: number;
  limit?: number;
}

export const guidelinesService = {
  /**
   * Get all guidelines with optional filters
   */
  async getGuidelines(filters?: GuidelinesFilters): Promise<{ data: Guideline[]; pagination?: any }> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, String(value));
        }
      });
    }
    const response = await api.get<PaginatedResponse<Guideline>>(
      `/guidelines${params.toString() ? `?${params.toString()}` : ''}`
    );
    return {
      data: response.data.data,
      pagination: response.data.pagination,
    };
  },

  /**
   * Get a single guideline by ID
   */
  async getGuideline(id: string): Promise<Guideline> {
    const response = await api.get<ApiResponse<Guideline>>(`/guidelines/${id}`);
    return response.data.data;
  },

  /**
   * Get guidelines grouped by project type
   */
  async getGroupedGuidelines(): Promise<GroupedGuidelines> {
    const response = await api.get<ApiResponse<GroupedGuidelines>>('/guidelines/grouped');
    return response.data.data;
  },

  /**
   * Get best matching guideline for a project type
   */
  async getGuidelineForProject(projectType: string): Promise<Guideline | null> {
    const response = await api.get<ApiResponse<Guideline | null>>(
      `/guidelines/for-project?projectType=${projectType}`
    );
    return response.data.data;
  },

  /**
   * Create a new guideline
   */
  async createGuideline(data: CreateGuidelineDto): Promise<Guideline> {
    const response = await api.post<ApiResponse<Guideline>>('/guidelines', data);
    return response.data.data;
  },

  /**
   * Update an existing guideline
   */
  async updateGuideline(id: string, data: UpdateGuidelineDto): Promise<Guideline> {
    const response = await api.put<ApiResponse<Guideline>>(`/guidelines/${id}`, data);
    return response.data.data;
  },

  /**
   * Delete (soft delete) a guideline
   */
  async deleteGuideline(id: string): Promise<void> {
    await api.delete(`/guidelines/${id}`);
  },
};





