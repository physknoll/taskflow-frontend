'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsService, workflowColumnsService, ProjectOption } from '@/services/projects.service';
import {
  IProject,
  CreateProjectDto,
  UpdateProjectDto,
  ProjectFilters,
  ProjectBoardData,
  ProjectDetailBoard,
  ProjectStats,
} from '@/types';
import toast from 'react-hot-toast';

// ============================================
// Project Options Hook (for dropdowns)
// ============================================

export function useProjectOptions() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['project-options'],
    queryFn: () => projectsService.getProjectOptions(),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  return {
    projectOptions: data || [],
    isLoading,
    error,
    refetch,
  };
}

// Re-export the ProjectOption type for convenience
export type { ProjectOption };

// ============================================
// Projects List Hook
// ============================================

export function useProjects(filters: ProjectFilters = {}) {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['projects', filters],
    queryFn: () => projectsService.getProjects(filters),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateProjectDto) => projectsService.createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects-board'] });
      toast.success('Project created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create project');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProjectDto }) =>
      projectsService.updateProject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects-board'] });
      queryClient.invalidateQueries({ queryKey: ['project'] });
      toast.success('Project updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update project');
    },
  });

  const archiveMutation = useMutation({
    mutationFn: (projectId: string) => projectsService.archiveProject(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects-board'] });
      toast.success('Project archived');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to archive project');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (projectId: string) => projectsService.deleteProject(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects-board'] });
      toast.success('Project deleted');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete project');
    },
  });

  return {
    projects: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    error,
    refetch,
    createProject: createMutation.mutateAsync,
    updateProject: (id: string, data: UpdateProjectDto) =>
      updateMutation.mutateAsync({ id, data }),
    archiveProject: archiveMutation.mutateAsync,
    deleteProject: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isArchiving: archiveMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

// ============================================
// Projects Board Hook (Kanban View)
// ============================================

export function useProjectsBoard(clientId?: string) {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['projects-board', clientId],
    queryFn: () => projectsService.getProjectsBoard(clientId),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ projectId, status }: { projectId: string; status: string }) =>
      projectsService.updateProjectStatus(projectId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects-board'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update project status');
    },
  });

  return {
    board: data,
    columns: data?.columns || [],
    isLoading,
    error,
    refetch,
    updateProjectStatus: (projectId: string, status: string) =>
      updateStatusMutation.mutateAsync({ projectId, status }),
    isUpdatingStatus: updateStatusMutation.isPending,
  };
}

// ============================================
// Single Project Hook
// ============================================

export function useProject(projectId: string) {
  const queryClient = useQueryClient();

  // Project details
  const { data: project, isLoading, error } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectsService.getProject(projectId),
    enabled: !!projectId,
  });

  // Project board (tickets)
  const { data: board, isLoading: isBoardLoading } = useQuery({
    queryKey: ['project-board', projectId],
    queryFn: () => projectsService.getProjectBoard(projectId),
    enabled: !!projectId,
  });

  // Project stats
  const { data: stats } = useQuery({
    queryKey: ['project-stats', projectId],
    queryFn: () => projectsService.getProjectStats(projectId),
    enabled: !!projectId,
  });

  // Update project mutation
  const updateMutation = useMutation({
    mutationFn: (data: UpdateProjectDto) =>
      projectsService.updateProject(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project-board', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project updated');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update project');
    },
  });

  // Update project status
  const updateStatusMutation = useMutation({
    mutationFn: (status: string) =>
      projectsService.updateProjectStatus(projectId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects-board'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update project status');
    },
  });

  // Add ticket to project
  const addTicketMutation = useMutation({
    mutationFn: (ticketId: string) =>
      projectsService.addTicketToProject(projectId, ticketId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project-board', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project-stats', projectId] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      toast.success('Ticket added to project');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add ticket');
    },
  });

  // Remove ticket from project
  const removeTicketMutation = useMutation({
    mutationFn: (ticketId: string) =>
      projectsService.removeTicketFromProject(projectId, ticketId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project-board', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project-stats', projectId] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      toast.success('Ticket removed from project');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to remove ticket');
    },
  });

  // Generate AI brief
  const generateBriefMutation = useMutation({
    mutationFn: () => projectsService.generateAIBrief(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      toast.success('AI brief generated');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to generate AI brief');
    },
  });

  // Archive project
  const archiveMutation = useMutation({
    mutationFn: () => projectsService.archiveProject(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects-board'] });
      toast.success('Project archived');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to archive project');
    },
  });

  // Delete project
  const deleteMutation = useMutation({
    mutationFn: () => projectsService.deleteProject(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects-board'] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      toast.success('Project deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete project');
    },
  });

  return {
    project,
    board,
    stats,
    isLoading,
    isBoardLoading,
    error,
    updateProject: updateMutation.mutateAsync,
    updateStatus: updateStatusMutation.mutateAsync,
    addTicket: addTicketMutation.mutateAsync,
    removeTicket: removeTicketMutation.mutateAsync,
    generateBrief: generateBriefMutation.mutateAsync,
    archiveProject: archiveMutation.mutateAsync,
    deleteProject: deleteMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    isGeneratingBrief: generateBriefMutation.isPending,
    isArchiving: archiveMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

// ============================================
// Workflow Columns Hook
// ============================================

export function useWorkflowColumns(
  scope: 'system' | 'client' | 'project',
  scopeId?: string
) {
  const queryClient = useQueryClient();

  const { data: columns = [], isLoading, error } = useQuery({
    queryKey: ['workflow-columns', scope, scopeId],
    queryFn: () => {
      if (scope === 'project' && scopeId) {
        return workflowColumnsService.getProjectColumns(scopeId);
      }
      if (scope === 'client' && scopeId) {
        return workflowColumnsService.getClientColumns(scopeId);
      }
      return workflowColumnsService.getSystemColumns();
    },
    enabled: scope === 'system' || !!scopeId,
  });

  const createMutation = useMutation({
    mutationFn: workflowColumnsService.createColumn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-columns'] });
      toast.success('Column created');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create column');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      workflowColumnsService.updateColumn(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-columns'] });
      toast.success('Column updated');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update column');
    },
  });

  const reorderMutation = useMutation({
    mutationFn: workflowColumnsService.reorderColumns,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-columns'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to reorder columns');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ({ columnId, moveToColumnId }: { columnId: string; moveToColumnId: string }) =>
      workflowColumnsService.deleteColumn(columnId, moveToColumnId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-columns'] });
      toast.success('Column deleted');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete column');
    },
  });

  return {
    columns,
    isLoading,
    error,
    createColumn: createMutation.mutateAsync,
    updateColumn: (id: string, data: any) => updateMutation.mutateAsync({ id, data }),
    reorderColumns: reorderMutation.mutateAsync,
    deleteColumn: (columnId: string, moveToColumnId: string) =>
      deleteMutation.mutateAsync({ columnId, moveToColumnId }),
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
  };
}

