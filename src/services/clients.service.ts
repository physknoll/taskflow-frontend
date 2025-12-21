import api from './api';
import { IClient, CreateClientDto, ApiResponse, PaginatedResponse } from '@/types';

export interface ClientFilters {
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface KnowledgeBaseDocument {
  _id: string;
  title: string;
  content?: string;
  category: string;
  contentType: 'markdown' | 'text' | 'html' | 'file';
  tags: string[];
  fileName?: string;
  fileSize?: number;
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeBaseFilters {
  category?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedKnowledgeBase {
  data: KnowledgeBaseDocument[];
  total: number;
  page: number;
  limit: number;
}

export interface AddDocumentDto {
  title: string;
  content: string;
  category: string;
  contentType: 'markdown' | 'text' | 'html';
  tags?: string[];
}

export interface QueryKnowledgeBaseResponse {
  answer: string;
  citations: Array<{
    documentId: string;
    title: string;
    excerpt: string;
  }>;
  confidence: number;
}

// Batch Upload Types
export interface BatchUploadResponse {
  batchId: string;
  totalFiles: number;
}

export interface BatchUploadStatus {
  total: number;
  completed: number;
  failed: number;
  inProgress: number;
  pending: number;
  errors: Array<{ fileName: string; error: string }>;
}

// Suggested categories for upload modals (shown when creating new documents)
export const SUGGESTED_KB_CATEGORIES = [
  { id: 'brand_guidelines', label: 'Brand Guidelines', icon: '🎨' },
  { id: 'products', label: 'Products', icon: '📦' },
  { id: 'processes', label: 'Processes', icon: '⚙️' },
  { id: 'contacts', label: 'Contacts', icon: '👥' },
  { id: 'history', label: 'History', icon: '📜' },
  { id: 'competitors', label: 'Competitors', icon: '🏢' },
  { id: 'seo', label: 'SEO', icon: '🔍' },
  { id: 'general', label: 'General', icon: '📄' },
] as const;

// Legacy alias for backward compatibility
export const KNOWLEDGE_BASE_CATEGORIES = SUGGESTED_KB_CATEGORIES;

export const clientsService = {
  async getClients(filters: ClientFilters = {}): Promise<PaginatedResponse<IClient>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    const response = await api.get<PaginatedResponse<IClient>>(`/clients?${params.toString()}`);
    return response.data;
  },

  async getClient(id: string): Promise<IClient> {
    const response = await api.get<ApiResponse<IClient>>(`/clients/${id}`);
    return response.data.data;
  },

  async createClient(data: CreateClientDto): Promise<IClient> {
    const response = await api.post<ApiResponse<IClient>>('/clients', data);
    return response.data.data;
  },

  async updateClient(id: string, data: Partial<IClient>): Promise<IClient> {
    const response = await api.put<ApiResponse<IClient>>(`/clients/${id}`, data);
    return response.data.data;
  },

  async deleteClient(id: string): Promise<void> {
    await api.delete(`/clients/${id}`);
  },

  // Contacts
  async addContact(clientId: string, contact: {
    name: string;
    email: string;
    role: string;
    phone?: string;
    department?: string;
    isDecisionMaker?: boolean;
    notes?: string;
  }): Promise<IClient> {
    const response = await api.post<ApiResponse<IClient>>(`/clients/${clientId}/contacts`, contact);
    return response.data.data;
  },

  async updateContact(clientId: string, contactIndex: number, contact: any): Promise<IClient> {
    const response = await api.put<ApiResponse<IClient>>(`/clients/${clientId}/contacts/${contactIndex}`, contact);
    return response.data.data;
  },

  async removeContact(clientId: string, contactIndex: number): Promise<IClient> {
    const response = await api.delete<ApiResponse<IClient>>(`/clients/${clientId}/contacts/${contactIndex}`);
    return response.data.data;
  },

  // Knowledge Base
  async getKnowledgeBase(clientId: string, filters: KnowledgeBaseFilters = {}): Promise<PaginatedKnowledgeBase> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    const response = await api.get<{
      success: boolean;
      data: PaginatedKnowledgeBase | KnowledgeBaseDocument[];
      pagination?: { total: number; page: number; limit: number; pages: number };
    }>(
      `/clients/${clientId}/knowledge-base?${params.toString()}`
    );
    
    // Handle different response formats:
    // 1. PaginatedResponse format: { data: [...], pagination: { total, page, limit, pages } }
    // 2. Nested paginated format: { data: { data: [...], total, page, limit } }
    // 3. Simple array format (legacy): { data: [...] }
    const data = response.data.data;
    const pagination = response.data.pagination;
    
    // If pagination object exists at root level (PaginatedResponse format)
    if (pagination && Array.isArray(data)) {
      return {
        data,
        total: pagination.total,
        page: pagination.page,
        limit: pagination.limit,
      };
    }
    
    // If data is an array without pagination info (legacy format)
    if (Array.isArray(data)) {
      return {
        data,
        total: data.length,
        page: filters.page || 1,
        limit: filters.limit || data.length,
      };
    }
    
    // Nested paginated format: data contains { data, total, page, limit }
    return data;
  },

  async addDocument(clientId: string, data: AddDocumentDto): Promise<KnowledgeBaseDocument> {
    const response = await api.post<ApiResponse<KnowledgeBaseDocument>>(
      `/clients/${clientId}/knowledge-base`,
      data
    );
    return response.data.data;
  },

  async uploadFile(clientId: string, file: File, category: string, tags?: string): Promise<KnowledgeBaseDocument> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);
    if (tags) {
      formData.append('tags', tags);
    }

    const response = await api.post<ApiResponse<KnowledgeBaseDocument>>(
      `/clients/${clientId}/knowledge-base/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data;
  },

  async queryKnowledgeBase(clientId: string, question: string, conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>): Promise<{
    response: string;
    citations: any[];
    suggestedActions: any[];
    knowledgeBase?: {
      answer: string;
      citations: Array<{ documentId: string; title: string; excerpt: string }>;
      confidence: number;
    };
  }> {
    const response = await api.post<ApiResponse<any>>(
      `/ai/knowledge-chat`,
      { 
        message: question, 
        clientId,
        conversationHistory: conversationHistory || []
      }
    );
    return response.data.data;
  },

  async deleteDocument(clientId: string, documentId: string): Promise<void> {
    await api.delete(`/clients/${clientId}/knowledge-base/${documentId}`);
  },

  // Batch Upload
  async uploadBatch(clientId: string, files: File[], category: string): Promise<BatchUploadResponse> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    formData.append('category', category);

    const response = await api.post<ApiResponse<BatchUploadResponse>>(
      `/clients/${clientId}/knowledge-base/upload-batch`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data;
  },

  async getBatchStatus(clientId: string, batchId: string): Promise<BatchUploadStatus> {
    const response = await api.get<ApiResponse<BatchUploadStatus>>(
      `/clients/${clientId}/knowledge-base/upload-status/${batchId}`
    );
    return response.data.data;
  },

  async cancelBatch(clientId: string, batchId: string): Promise<void> {
    await api.delete(`/clients/${clientId}/knowledge-base/upload-batch/${batchId}`);
  },

  // Brand Guidelines
  async updateBrandGuidelines(clientId: string, guidelines: IClient['brandGuidelines']): Promise<IClient> {
    const response = await api.put<ApiResponse<IClient>>(`/clients/${clientId}/brand-guidelines`, guidelines);
    return response.data.data;
  },

  // Analytics
  async getClientStats(clientId: string): Promise<any> {
    const response = await api.get<ApiResponse<any>>(`/analytics/client/${clientId}`);
    return response.data.data;
  },

  // Knowledge Base Categories
  async getKBCategories(clientId: string): Promise<string[]> {
    const response = await api.get<{ success: boolean; data: { categories: string[] } }>(
      `/clients/${clientId}/knowledge-base/categories`
    );
    return response.data.data.categories;
  },
};
