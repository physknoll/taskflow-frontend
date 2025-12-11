'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminUsersService } from '@/services/admin/users.service';
import { AdminUserParams } from '@/types/admin';
import toast from 'react-hot-toast';

const USERS_KEY = 'admin-users';

export function useAdminUsers(params?: AdminUserParams) {
  return useQuery({
    queryKey: [USERS_KEY, params],
    queryFn: () => adminUsersService.list(params),
  });
}

export function useAdminUser(id: string) {
  return useQuery({
    queryKey: [USERS_KEY, id],
    queryFn: () => adminUsersService.getById(id),
    enabled: !!id,
  });
}

export function useSuspendUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      adminUsersService.suspend(id, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [USERS_KEY] });
      queryClient.invalidateQueries({ queryKey: [USERS_KEY, id] });
      toast.success('User suspended successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to suspend user');
    },
  });
}

export function useUnsuspendUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminUsersService.unsuspend(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [USERS_KEY] });
      queryClient.invalidateQueries({ queryKey: [USERS_KEY, id] });
      toast.success('User unsuspended successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to unsuspend user');
    },
  });
}

export function useImpersonateUser() {
  return useMutation({
    mutationFn: (id: string) => adminUsersService.impersonate(id),
    onSuccess: (data) => {
      toast.success(`Impersonating ${data.targetUser.firstName} ${data.targetUser.lastName}`);
      // Open main app in new tab with impersonation token
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      window.open(`${appUrl}?impersonate_token=${data.token}`, '_blank');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to impersonate user');
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, confirmEmail }: { id: string; confirmEmail: string }) =>
      adminUsersService.delete(id, confirmEmail),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USERS_KEY] });
      toast.success('User deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    },
  });
}
