import api from './api';
import {
  IResource,
  IResourceStats,
  IProviderInfo,
  IResourceAIContext,
  ApiResponse,
  ResourcePurpose,
} from '@/types';

// ============================================
// Resource Service Types
// ============================================

export interface ResourceFilters {
  clientId?: string;
  category?: string;
  purpose?: string;
  provider?: string;
  q?: string;
  page?: number;
  limit?: number;
}

export interface UploadResourceMetadata {
  attachedToModel: 'Ticket' | 'Project' | 'Review' | 'Client';
  attachedToId: string;
  clientId: string;
  displayName?: string;
  description?: string;
  purpose?: ResourcePurpose;
}

export interface AddLinkResourceDto {
  url: string;
  attachedToModel: 'Ticket' | 'Project' | 'Review' | 'Client';
  attachedToId: string;
  clientId: string;
  title?: string;
  description?: string;
  purpose?: ResourcePurpose;
}

export interface AddGitResourceDto {
  repoUrl: string;
  attachedToModel: 'Ticket' | 'Project' | 'Review' | 'Client';
  attachedToId: string;
  clientId: string;
  branch?: string;
  pullRequestUrl?: string;
  commitHash?: string;
  displayName?: string;
  purpose?: ResourcePurpose;
}

export interface UpdateResourceDto {
  displayName?: string;
  description?: string;
  purpose?: ResourcePurpose;
}

export interface ResourceSearchResponse {
  success: boolean;
  data: IResource[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ResourceAIContextResponse {
  resources: IResource[];
  summary: {
    totalResources: number;
    byCategory: Record<string, number>;
    byPurpose: Record<string, number>;
    hasDeliverables: boolean;
    openPRs: number;
  };
  context: Array<{
    resourceId: string;
    displayName: string;
    type: string;
    aiContext?: IResourceAIContext;
  }>;
}

// ============================================
// Resources Service
// ============================================

export const resourcesService = {
  /**
   * Upload multiple files as resources
   */
  async uploadFiles(
    files: File[],
    metadata: UploadResourceMetadata
  ): Promise<IResource[]> {
    const formData = new FormData();
    
    files.forEach((file) => {
      formData.append('files', file);
    });

    formData.append('attachedToModel', metadata.attachedToModel);
    formData.append('attachedToId', metadata.attachedToId);
    formData.append('clientId', metadata.clientId);

    if (metadata.displayName) {
      formData.append('displayName', metadata.displayName);
    }
    if (metadata.description) {
      formData.append('description', metadata.description);
    }
    if (metadata.purpose) {
      formData.append('purpose', metadata.purpose);
    }

    const response = await api.post<ApiResponse<IResource[]>>(
      '/resources/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data;
  },

  /**
   * Upload a single file as a resource
   */
  async uploadSingleFile(
    file: File,
    metadata: UploadResourceMetadata
  ): Promise<IResource> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('attachedToModel', metadata.attachedToModel);
    formData.append('attachedToId', metadata.attachedToId);
    formData.append('clientId', metadata.clientId);

    if (metadata.displayName) {
      formData.append('displayName', metadata.displayName);
    }
    if (metadata.description) {
      formData.append('description', metadata.description);
    }
    if (metadata.purpose) {
      formData.append('purpose', metadata.purpose);
    }

    const response = await api.post<ApiResponse<IResource>>(
      '/resources/upload/single',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data;
  },

  /**
   * Add an external link as a resource (auto-detects provider)
   */
  async addLink(data: AddLinkResourceDto): Promise<IResource> {
    const response = await api.post<ApiResponse<IResource>>(
      '/resources/link',
      data
    );
    return response.data.data;
  },

  /**
   * Add a git resource (repo, branch, PR, commit)
   */
  async addGitResource(data: AddGitResourceDto): Promise<IResource> {
    const response = await api.post<ApiResponse<IResource>>(
      '/resources/git',
      data
    );
    return response.data.data;
  },

  /**
   * Get all resources for an entity (Ticket, Project, Review)
   */
  async getResourcesForEntity(
    model: 'Ticket' | 'Project' | 'Review' | 'Client',
    id: string
  ): Promise<IResource[]> {
    const response = await api.get<ApiResponse<IResource[]>>(
      `/resources/entity/${model}/${id}`
    );
    return response.data.data;
  },

  /**
   * Get a single resource by ID
   */
  async getResource(id: string): Promise<IResource> {
    const response = await api.get<ApiResponse<IResource>>(`/resources/${id}`);
    return response.data.data;
  },

  /**
   * Get download URL for a file resource
   */
  getDownloadUrl(id: string): string {
    return `${api.defaults.baseURL}/resources/${id}/download`;
  },

  /**
   * Search resources across the system
   */
  async searchResources(
    filters: ResourceFilters
  ): Promise<ResourceSearchResponse> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    const response = await api.get<ResourceSearchResponse>(
      `/resources/search?${params.toString()}`
    );
    return response.data;
  },

  /**
   * Get resource statistics for an entity
   */
  async getResourceStats(
    model: 'Ticket' | 'Project' | 'Review',
    id: string
  ): Promise<IResourceStats> {
    const response = await api.get<ApiResponse<IResourceStats>>(
      `/resources/stats/${model}/${id}`
    );
    return response.data.data;
  },

  /**
   * Get AI context for resources (for AIPM features)
   */
  async getAIContext(
    model: 'Ticket' | 'Project' | 'Review',
    id: string
  ): Promise<ResourceAIContextResponse> {
    const response = await api.get<ApiResponse<ResourceAIContextResponse>>(
      `/resources/ai-context/${model}/${id}`
    );
    return response.data.data;
  },

  /**
   * Get list of supported providers
   */
  async getProviders(): Promise<IProviderInfo[]> {
    const response = await api.get<ApiResponse<IProviderInfo[]>>(
      '/resources/providers'
    );
    return response.data.data;
  },

  /**
   * Update resource metadata
   */
  async updateResource(
    id: string,
    data: UpdateResourceDto
  ): Promise<IResource> {
    const response = await api.patch<ApiResponse<IResource>>(
      `/resources/${id}`,
      data
    );
    return response.data.data;
  },

  /**
   * Refresh metadata for a link or git resource
   */
  async refreshMetadata(id: string): Promise<IResource> {
    const response = await api.post<ApiResponse<IResource>>(
      `/resources/${id}/refresh`
    );
    return response.data.data;
  },

  /**
   * Soft delete a resource
   */
  async deleteResource(id: string): Promise<void> {
    await api.delete(`/resources/${id}`);
  },
};




