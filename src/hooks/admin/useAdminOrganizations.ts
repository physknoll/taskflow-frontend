'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminOrganizationsService } from '@/services/admin/organizations.service';
import { AdminOrganizationParams } from '@/types/admin';
import toast from 'react-hot-toast';

const ORGANIZATIONS_KEY = 'admin-organizations';

export function useAdminOrganizations(params?: AdminOrganizationParams) {
  return useQuery({
    queryKey: [ORGANIZATIONS_KEY, params],
    queryFn: () => adminOrganizationsService.list(params),
  });
}

export function useAdminOrganization(id: string) {
  return useQuery({
    queryKey: [ORGANIZATIONS_KEY, id],
    queryFn: () => adminOrganizationsService.getById(id),
    enabled: !!id,
  });
}

export function useUpdateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<{ name: string; isActive: boolean }> }) =>
      adminOrganizationsService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [ORGANIZATIONS_KEY] });
      queryClient.invalidateQueries({ queryKey: [ORGANIZATIONS_KEY, id] });
      toast.success('Organization updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update organization');
    },
  });
}

export function useFlagOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, flag, reason }: { id: string; flag: boolean; reason?: string }) =>
      adminOrganizationsService.flag(id, flag, reason),
    onSuccess: (_, { flag }) => {
      queryClient.invalidateQueries({ queryKey: [ORGANIZATIONS_KEY] });
      toast.success(flag ? 'Organization flagged' : 'Organization unflagged');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to flag organization');
    },
  });
}

export function useDeleteOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, confirmName }: { id: string; confirmName: string }) =>
      adminOrganizationsService.delete(id, confirmName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ORGANIZATIONS_KEY] });
      toast.success('Organization deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete organization');
    },
  });
}

