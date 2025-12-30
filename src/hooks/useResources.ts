'use client';

import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  resourcesService,
  ResourceFilters,
  UploadResourceMetadata,
  AddLinkResourceDto,
  AddGitResourceDto,
  UpdateResourceDto,
} from '@/services/resources.service';
import { IResource, IResourceStats, ResourcePurpose } from '@/types';
import toast from 'react-hot-toast';

// ============================================
// Query Keys
// ============================================

export const resourceKeys = {
  all: ['resources'] as const,
  entity: (model: string, id: string) =>
    [...resourceKeys.all, 'entity', model, id] as const,
  single: (id: string) => [...resourceKeys.all, 'single', id] as const,
  stats: (model: string, id: string) =>
    [...resourceKeys.all, 'stats', model, id] as const,
  search: (filters: ResourceFilters) =>
    [...resourceKeys.all, 'search', filters] as const,
  providers: () => [...resourceKeys.all, 'providers'] as const,
  aiContext: (model: string, id: string) =>
    [...resourceKeys.all, 'ai-context', model, id] as const,
};

// ============================================
// useResources Hook - Get resources for an entity
// ============================================

interface UseResourcesOptions {
  enabled?: boolean;
  /**
   * When provided, skip the fetch query and use this data instead.
   * Useful when resources are already embedded in the parent entity (e.g., ticket.resources).
   * Mutations will still work and invalidate the parent entity's query.
   */
  initialData?: IResource[];
}

export function useResources(
  entityType: 'Ticket' | 'Project' | 'Review' | 'Client',
  entityId: string,
  options: UseResourcesOptions = {}
) {
  const queryClient = useQueryClient();

  // Skip fetch if initialData is provided (resources already embedded in parent response)
  const shouldFetch = options.initialData === undefined;

  // Fetch resources for entity (skipped when initialData is provided)
  const {
    data: fetchedResources = [],
    isLoading: isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: resourceKeys.entity(entityType, entityId),
    queryFn: () => resourcesService.getResourcesForEntity(entityType, entityId),
    enabled: shouldFetch && options.enabled !== false && !!entityId,
  });

  // Use initialData if provided, otherwise use fetched data
  const resources = options.initialData ?? fetchedResources;
  const isLoading = shouldFetch ? isFetching : false;

  // Upload files mutation
  const uploadMutation = useMutation({
    mutationFn: ({
      files,
      metadata,
    }: {
      files: File[];
      metadata: Omit<UploadResourceMetadata, 'attachedToModel' | 'attachedToId'>;
    }) =>
      resourcesService.uploadFiles(files, {
        ...metadata,
        attachedToModel: entityType,
        attachedToId: entityId,
      }),
    onSuccess: (newResources) => {
      queryClient.invalidateQueries({
        queryKey: resourceKeys.entity(entityType, entityId),
      });
      toast.success(
        newResources.length === 1
          ? 'File uploaded successfully'
          : `${newResources.length} files uploaded successfully`
      );
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to upload files');
    },
  });

  // Upload single file mutation
  const uploadSingleMutation = useMutation({
    mutationFn: ({
      file,
      metadata,
    }: {
      file: File;
      metadata: Omit<UploadResourceMetadata, 'attachedToModel' | 'attachedToId'>;
    }) =>
      resourcesService.uploadSingleFile(file, {
        ...metadata,
        attachedToModel: entityType,
        attachedToId: entityId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: resourceKeys.entity(entityType, entityId),
      });
      toast.success('File uploaded successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to upload file');
    },
  });

  // Add link mutation
  const addLinkMutation = useMutation({
    mutationFn: (
      data: Omit<AddLinkResourceDto, 'attachedToModel' | 'attachedToId'>
    ) =>
      resourcesService.addLink({
        ...data,
        attachedToModel: entityType,
        attachedToId: entityId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: resourceKeys.entity(entityType, entityId),
      });
      toast.success('Link added successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add link');
    },
  });

  // Add git resource mutation
  const addGitMutation = useMutation({
    mutationFn: (
      data: Omit<AddGitResourceDto, 'attachedToModel' | 'attachedToId'>
    ) =>
      resourcesService.addGitResource({
        ...data,
        attachedToModel: entityType,
        attachedToId: entityId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: resourceKeys.entity(entityType, entityId),
      });
      toast.success('Git resource added successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add git resource');
    },
  });

  // Update resource mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateResourceDto }) =>
      resourcesService.updateResource(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: resourceKeys.entity(entityType, entityId),
      });
      toast.success('Resource updated');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update resource');
    },
  });

  // Delete resource mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => resourcesService.deleteResource(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({
        queryKey: resourceKeys.entity(entityType, entityId),
      });

      const previousResources = queryClient.getQueryData<IResource[]>(
        resourceKeys.entity(entityType, entityId)
      );

      // Optimistically remove the resource
      queryClient.setQueryData<IResource[]>(
        resourceKeys.entity(entityType, entityId),
        (old) => old?.filter((r) => r._id !== id) || []
      );

      return { previousResources };
    },
    onError: (err, id, context) => {
      if (context?.previousResources) {
        queryClient.setQueryData(
          resourceKeys.entity(entityType, entityId),
          context.previousResources
        );
      }
      toast.error('Failed to delete resource');
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: resourceKeys.entity(entityType, entityId),
      });
    },
    onSuccess: () => {
      toast.success('Resource deleted');
    },
  });

  // Refresh metadata mutation
  const refreshMutation = useMutation({
    mutationFn: (id: string) => resourcesService.refreshMetadata(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: resourceKeys.entity(entityType, entityId),
      });
      toast.success('Metadata refreshed');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Failed to refresh metadata'
      );
    },
  });

  // Grouped resources by type
  const resourcesByType = {
    files: resources.filter((r) => r.resourceType === 'file'),
    links: resources.filter((r) => r.resourceType === 'link'),
    git: resources.filter((r) => r.resourceType === 'git'),
    integrations: resources.filter((r) => r.resourceType === 'integration'),
  };

  // Grouped resources by category
  const resourcesByCategory = {
    video: resources.filter((r) => r.provider.category === 'video'),
    design: resources.filter((r) => r.provider.category === 'design'),
    code: resources.filter((r) => r.provider.category === 'code'),
    cloud_storage: resources.filter(
      (r) => r.provider.category === 'cloud_storage'
    ),
    docs: resources.filter((r) => r.provider.category === 'docs'),
    other: resources.filter((r) => r.provider.category === 'other'),
  };

  return {
    resources,
    resourcesByType,
    resourcesByCategory,
    isLoading,
    error,
    refetch,

    // Mutations
    uploadFiles: useCallback(
      (
        files: File[],
        metadata: Omit<
          UploadResourceMetadata,
          'attachedToModel' | 'attachedToId'
        > = { clientId: '' }
      ) => uploadMutation.mutateAsync({ files, metadata }),
      [uploadMutation]
    ),
    uploadSingleFile: useCallback(
      (
        file: File,
        metadata: Omit<
          UploadResourceMetadata,
          'attachedToModel' | 'attachedToId'
        > = { clientId: '' }
      ) => uploadSingleMutation.mutateAsync({ file, metadata }),
      [uploadSingleMutation]
    ),
    addLink: useCallback(
      (
        data: Omit<AddLinkResourceDto, 'attachedToModel' | 'attachedToId'>
      ) => addLinkMutation.mutateAsync(data),
      [addLinkMutation]
    ),
    addGitResource: useCallback(
      (
        data: Omit<AddGitResourceDto, 'attachedToModel' | 'attachedToId'>
      ) => addGitMutation.mutateAsync(data),
      [addGitMutation]
    ),
    updateResource: useCallback(
      (id: string, data: UpdateResourceDto) =>
        updateMutation.mutateAsync({ id, data }),
      [updateMutation]
    ),
    deleteResource: useCallback(
      (id: string) => deleteMutation.mutateAsync(id),
      [deleteMutation]
    ),
    refreshMetadata: useCallback(
      (id: string) => refreshMutation.mutateAsync(id),
      [refreshMutation]
    ),

    // Loading states
    isUploading: uploadMutation.isPending || uploadSingleMutation.isPending,
    isAddingLink: addLinkMutation.isPending,
    isAddingGit: addGitMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isRefreshing: refreshMutation.isPending,
  };
}

// ============================================
// useResourceStats Hook - Get resource statistics
// ============================================

export function useResourceStats(
  entityType: 'Ticket' | 'Project' | 'Review',
  entityId: string,
  options: UseResourcesOptions = {}
) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: resourceKeys.stats(entityType, entityId),
    queryFn: () => resourcesService.getResourceStats(entityType, entityId),
    enabled: options.enabled !== false && !!entityId,
  });

  return {
    stats: data,
    isLoading,
    error,
    refetch,
  };
}

// ============================================
// useResource Hook - Get single resource
// ============================================

export function useResource(resourceId: string, options: UseResourcesOptions = {}) {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: resourceKeys.single(resourceId),
    queryFn: () => resourcesService.getResource(resourceId),
    enabled: options.enabled !== false && !!resourceId,
  });

  const updateMutation = useMutation({
    mutationFn: (updateData: UpdateResourceDto) =>
      resourcesService.updateResource(resourceId, updateData),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: resourceKeys.single(resourceId),
      });
      toast.success('Resource updated');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update resource');
    },
  });

  return {
    resource: data,
    isLoading,
    error,
    refetch,
    updateResource: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
}

// ============================================
// useResourceSearch Hook - Search resources
// ============================================

export function useResourceSearch(
  filters: ResourceFilters,
  options: UseResourcesOptions = {}
) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: resourceKeys.search(filters),
    queryFn: () => resourcesService.searchResources(filters),
    enabled: options.enabled !== false,
  });

  return {
    resources: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    error,
    refetch,
  };
}

// ============================================
// useProviders Hook - Get supported providers
// ============================================

export function useProviders(options: UseResourcesOptions = {}) {
  const { data, isLoading, error } = useQuery({
    queryKey: resourceKeys.providers(),
    queryFn: () => resourcesService.getProviders(),
    enabled: options.enabled !== false,
    staleTime: 1000 * 60 * 60, // Cache for 1 hour - providers don't change often
  });

  return {
    providers: data || [],
    isLoading,
    error,
  };
}

// ============================================
// useResourceAIContext Hook - Get AI context
// ============================================

export function useResourceAIContext(
  entityType: 'Ticket' | 'Project' | 'Review',
  entityId: string,
  options: UseResourcesOptions = {}
) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: resourceKeys.aiContext(entityType, entityId),
    queryFn: () => resourcesService.getAIContext(entityType, entityId),
    enabled: options.enabled !== false && !!entityId,
  });

  return {
    aiContext: data,
    isLoading,
    error,
    refetch,
  };
}




