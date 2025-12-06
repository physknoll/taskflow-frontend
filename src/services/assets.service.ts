import api from './api';
import { IAsset, ApiResponse, PaginatedResponse } from '@/types';

export interface AssetFilters {
  client?: string;
  ticket?: string;
  type?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const assetsService = {
  async uploadAssets(files: File[], metadata?: {
    client?: string;
    ticket?: string;
    review?: string;
    description?: string;
    tags?: string[];
  }): Promise<IAsset[]> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    if (metadata) {
      Object.entries(metadata).forEach(([key, value]) => {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, value);
          }
        }
      });
    }

    const response = await api.post<ApiResponse<IAsset[]>>('/assets/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  async getAsset(id: string): Promise<IAsset> {
    const response = await api.get<ApiResponse<IAsset>>(`/assets/${id}`);
    return response.data.data;
  },

  async getAssets(filters: AssetFilters = {}): Promise<PaginatedResponse<IAsset>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    const response = await api.get<PaginatedResponse<IAsset>>(`/assets?${params.toString()}`);
    return response.data;
  },

  async deleteAsset(id: string): Promise<void> {
    await api.delete(`/assets/${id}`);
  },

  async getAssetsByTicket(ticketId: string): Promise<IAsset[]> {
    const response = await api.get<ApiResponse<IAsset[]>>(`/assets/ticket/${ticketId}`);
    return response.data.data;
  },

  async getAssetsByClient(clientId: string): Promise<IAsset[]> {
    const response = await api.get<ApiResponse<IAsset[]>>(`/assets/client/${clientId}`);
    return response.data.data;
  },

  async updateAsset(id: string, data: Partial<IAsset>): Promise<IAsset> {
    const response = await api.put<ApiResponse<IAsset>>(`/assets/${id}`, data);
    return response.data.data;
  },

  getDownloadUrl(id: string): string {
    return `${api.defaults.baseURL}/assets/${id}/download`;
  },

  getPreviewUrl(id: string): string {
    return `${api.defaults.baseURL}/assets/${id}/preview`;
  },
};


