'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAdminsService } from '@/services/admin/admins.service';
import { PlatformRole } from '@/types/admin';
import toast from 'react-hot-toast';

const ADMINS_KEY = 'admin-platform-admins';

export function useAdminAdmins() {
  return useQuery({
    queryKey: [ADMINS_KEY],
    queryFn: () => adminAdminsService.list(),
  });
}

export function useInviteAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, platformRole }: { email: string; platformRole: PlatformRole }) =>
      adminAdminsService.invite(email, platformRole),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMINS_KEY] });
      toast.success('Admin invited successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to invite admin');
    },
  });
}

export function useChangeAdminRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, platformRole }: { id: string; platformRole: PlatformRole }) =>
      adminAdminsService.changeRole(id, platformRole),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMINS_KEY] });
      toast.success('Admin role updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to change admin role');
    },
  });
}

export function useRevokeAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminAdminsService.revoke(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMINS_KEY] });
      toast.success('Admin access revoked');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to revoke admin access');
    },
  });
}
