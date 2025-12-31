'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sopsService } from '@/services/sops.service';
import { SOP, SOPFilters, CreateSOPRequest, UpdateSOPRequest } from '@/types';
import toast from 'react-hot-toast';

/**
 * Hook for fetching and managing SOPs from the Knowledge Base
 * SOPs are KB documents with category: 'sop'
 */
export function useSOPs(clientId: string | undefined, filters?: SOPFilters) {
  const queryClient = useQueryClient();

  // Fetch SOPs list
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['sops', clientId, filters],
    queryFn: () => sopsService.getSOPs(clientId!, filters),
    enabled: !!clientId,
  });

  // Create SOP mutation
  const createMutation = useMutation({
    mutationFn: (sopData: Omit<CreateSOPRequest, 'category'>) =>
      sopsService.createSOP(clientId!, sopData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sops', clientId] });
      toast.success('SOP created successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to create SOP');
    },
  });

  // Update SOP mutation
  const updateMutation = useMutation({
    mutationFn: ({ sopId, data }: { sopId: string; data: UpdateSOPRequest }) =>
      sopsService.updateSOP(clientId!, sopId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sops', clientId] });
      toast.success('SOP updated successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update SOP');
    },
  });

  // Delete SOP mutation
  const deleteMutation = useMutation({
    mutationFn: (sopId: string) => sopsService.deleteSOP(clientId!, sopId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sops', clientId] });
      toast.success('SOP deleted');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to delete SOP');
    },
  });

  return {
    // Data
    sops: data?.data || [],
    pagination: data?.pagination,

    // Loading states
    isLoading,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,

    // Error states
    isError,
    error,

    // Actions
    refetch,
    createSOP: createMutation.mutateAsync,
    updateSOP: (sopId: string, data: UpdateSOPRequest) =>
      updateMutation.mutateAsync({ sopId, data }),
    deleteSOP: deleteMutation.mutateAsync,
  };
}

/**
 * Hook for fetching a single SOP by ID
 */
export function useSOP(clientId: string | undefined, sopId: string | null) {
  const {
    data: sop,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['sop', clientId, sopId],
    queryFn: () => sopsService.getSOP(clientId!, sopId!),
    enabled: !!clientId && !!sopId,
  });

  return {
    sop,
    isLoading,
    isError,
    error,
  };
}
