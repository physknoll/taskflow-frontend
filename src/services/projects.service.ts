import api from './api';
import {
  IProject,
  IWorkflowColumn,
  CreateProjectDto,
  UpdateProjectDto,
  ProjectFilters,
  ProjectBoardData,
  ProjectDetailBoard,
  ProjectStats,
  ApiResponse,
  PaginatedResponse,
  CreateWorkflowColumnDto,
} from '@/types';

// ============================================
// Projects Service
// ============================================

export const projectsService = {
  /**
   * Get all projects with filters and pagination
   */
  async getProjects(filters: ProjectFilters = {}): Promise<PaginatedResponse<IProject>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    const response = await api.get<PaginatedResponse<IProject>>(`/projects?${params.toString()}`);
    return response.data;
  },

  /**
   * Get projects board (Kanban view)
   */
  async getProjectsBoard(clientId?: string): Promise<ProjectBoardData> {
    const params = clientId ? `?client=${clientId}` : '';
    const response = await api.get<ApiResponse<ProjectBoardData>>(`/projects/board${params}`);
    return response.data.data;
  },

  /**
   * Get a single project by ID
   */
  async getProject(projectId: string): Promise<IProject> {
    const response = await api.get<ApiResponse<IProject>>(`/projects/${projectId}`);
    return response.data.data;
  },

  /**
   * Get project board (tickets in Kanban view)
   */
  async getProjectBoard(projectId: string): Promise<ProjectDetailBoard> {
    const response = await api.get<ApiResponse<ProjectDetailBoard>>(`/projects/${projectId}/board`);
    return response.data.data;
  },

  /**
   * Get project statistics
   */
  async getProjectStats(projectId: string): Promise<ProjectStats> {
    const response = await api.get<ApiResponse<ProjectStats>>(`/projects/${projectId}/stats`);
    return response.data.data;
  },

  /**
   * Create a new project
   */
  async createProject(data: CreateProjectDto): Promise<IProject> {
    const response = await api.post<ApiResponse<IProject>>('/projects', data);
    return response.data.data;
  },

  /**
   * Update a project
   */
  async updateProject(projectId: string, data: UpdateProjectDto): Promise<IProject> {
    const response = await api.patch<ApiResponse<IProject>>(`/projects/${projectId}`, data);
    return response.data.data;
  },

  /**
   * Update project status (for Kanban drag-drop)
   */
  async updateProjectStatus(projectId: string, status: string): Promise<IProject> {
    const response = await api.patch<ApiResponse<IProject>>(`/projects/${projectId}/status`, { status });
    return response.data.data;
  },

  /**
   * Add a ticket to a project
   */
  async addTicketToProject(projectId: string, ticketId: string): Promise<IProject> {
    const response = await api.post<ApiResponse<IProject>>(`/projects/${projectId}/tickets`, { ticketId });
    return response.data.data;
  },

  /**
   * Create a ticket within a project
   */
  async createProjectTicket(projectId: string, ticketData: any): Promise<IProject> {
    const response = await api.post<ApiResponse<IProject>>(`/projects/${projectId}/tickets`, ticketData);
    return response.data.data;
  },

  /**
   * Remove a ticket from a project
   */
  async removeTicketFromProject(projectId: string, ticketId: string): Promise<void> {
    await api.delete(`/projects/${projectId}/tickets/${ticketId}`);
  },

  /**
   * Generate AI brief for a project
   */
  async generateAIBrief(projectId: string): Promise<string> {
    const response = await api.post<ApiResponse<{ brief: string }>>(`/projects/${projectId}/generate-brief`);
    return response.data.data.brief;
  },

  /**
   * Archive a project
   */
  async archiveProject(projectId: string): Promise<IProject> {
    const response = await api.post<ApiResponse<IProject>>(`/projects/${projectId}/archive`);
    return response.data.data;
  },

  /**
   * Unarchive a project
   */
  async unarchiveProject(projectId: string): Promise<IProject> {
    const response = await api.post<ApiResponse<IProject>>(`/projects/${projectId}/unarchive`);
    return response.data.data;
  },

  /**
   * Delete a project
   */
  async deleteProject(projectId: string): Promise<void> {
    await api.delete(`/projects/${projectId}`);
  },
};

// ============================================
// Workflow Columns Service
// ============================================

export const workflowColumnsService = {
  /**
   * Get system-level workflow columns
   */
  async getSystemColumns(): Promise<IWorkflowColumn[]> {
    const response = await api.get<ApiResponse<IWorkflowColumn[]>>('/workflow-columns/system');
    return response.data.data;
  },

  /**
   * Get client-specific workflow columns
   */
  async getClientColumns(clientId: string): Promise<IWorkflowColumn[]> {
    const response = await api.get<ApiResponse<IWorkflowColumn[]>>(`/workflow-columns/client/${clientId}`);
    return response.data.data;
  },

  /**
   * Get project-specific workflow columns
   */
  async getProjectColumns(projectId: string): Promise<IWorkflowColumn[]> {
    const response = await api.get<ApiResponse<IWorkflowColumn[]>>(`/workflow-columns/project/${projectId}`);
    return response.data.data;
  },

  /**
   * Create a new workflow column
   */
  async createColumn(data: CreateWorkflowColumnDto): Promise<IWorkflowColumn> {
    const response = await api.post<ApiResponse<IWorkflowColumn>>('/workflow-columns', data);
    return response.data.data;
  },

  /**
   * Update a workflow column
   */
  async updateColumn(columnId: string, data: Partial<IWorkflowColumn>): Promise<IWorkflowColumn> {
    const response = await api.put<ApiResponse<IWorkflowColumn>>(`/workflow-columns/${columnId}`, data);
    return response.data.data;
  },

  /**
   * Reorder workflow columns
   */
  async reorderColumns(columns: Array<{ id: string; order: number }>): Promise<void> {
    await api.patch('/workflow-columns/reorder', { columns });
  },

  /**
   * Delete a workflow column
   */
  async deleteColumn(columnId: string, moveToColumnId: string): Promise<void> {
    await api.delete(`/workflow-columns/${columnId}`, { data: { moveToColumnId } });
  },

  /**
   * Clone columns from one scope to another
   */
  async cloneColumns(
    fromScope: 'system' | 'client' | 'project',
    fromScopeId: string | undefined,
    toScope: 'client' | 'project',
    toScopeId: string
  ): Promise<IWorkflowColumn[]> {
    const response = await api.post<ApiResponse<IWorkflowColumn[]>>('/workflow-columns/clone', {
      fromScope,
      fromScopeId,
      toScope,
      toScopeId,
    });
    return response.data.data;
  },
};





