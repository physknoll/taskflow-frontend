'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { guidelinesService, GuidelinesFilters } from '@/services/guidelines.service';
import { Guideline, CreateGuidelineDto, UpdateGuidelineDto } from '@/types';
import toast from 'react-hot-toast';

export function useGuidelines(filters?: GuidelinesFilters) {
  const queryClient = useQueryClient();

  // Fetch guidelines
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['guidelines', filters],
    queryFn: () => guidelinesService.getGuidelines(filters),
  });

  // Fetch grouped guidelines
  const {
    data: groupedData,
    isLoading: isLoadingGrouped,
  } = useQuery({
    queryKey: ['guidelines', 'grouped'],
    queryFn: () => guidelinesService.getGroupedGuidelines(),
  });

  // Create guideline
  const createMutation = useMutation({
    mutationFn: (data: CreateGuidelineDto) => guidelinesService.createGuideline(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guidelines'] });
      toast.success('Guideline created successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to create guideline');
    },
  });

  // Update guideline
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateGuidelineDto }) =>
      guidelinesService.updateGuideline(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guidelines'] });
      toast.success('Guideline updated successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update guideline');
    },
  });

  // Delete guideline
  const deleteMutation = useMutation({
    mutationFn: (id: string) => guidelinesService.deleteGuideline(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guidelines'] });
      toast.success('Guideline deleted');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to delete guideline');
    },
  });

  return {
    // Data
    guidelines: data?.data || [],
    groupedGuidelines: groupedData || {},
    pagination: data?.pagination,

    // Loading states
    isLoading,
    isLoadingGrouped,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,

    // Error states
    isError,
    error,

    // Actions
    refetch,
    createGuideline: createMutation.mutateAsync,
    updateGuideline: (id: string, data: UpdateGuidelineDto) =>
      updateMutation.mutateAsync({ id, data }),
    deleteGuideline: deleteMutation.mutateAsync,
  };
}

// Hook for fetching a single guideline
export function useGuideline(id: string | null) {
  const {
    data: guideline,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['guidelines', id],
    queryFn: () => guidelinesService.getGuideline(id!),
    enabled: !!id,
  });

  return {
    guideline,
    isLoading,
    isError,
    error,
  };
}


