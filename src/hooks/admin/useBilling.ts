'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminBillingService } from '@/services/admin/billing.service';
import { SubscriptionPlan, SubscriptionStatus, AdminListParams } from '@/types/admin';
import toast from 'react-hot-toast';

const BILLING_KEY = 'admin-billing';

interface BillingListParams extends AdminListParams {
  plan?: SubscriptionPlan;
  status?: SubscriptionStatus;
}

export function useAdminSubscriptions(params?: BillingListParams) {
  return useQuery({
    queryKey: [BILLING_KEY, 'subscriptions', params],
    queryFn: () => adminBillingService.listSubscriptions(params),
  });
}

export function useAdminSubscription(orgId: string) {
  return useQuery({
    queryKey: [BILLING_KEY, 'subscription', orgId],
    queryFn: () => adminBillingService.getSubscription(orgId),
    enabled: !!orgId,
  });
}

export function useExtendTrial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orgId, days }: { orgId: string; days: number }) =>
      adminBillingService.extendTrial(orgId, days),
    onSuccess: (_, { orgId }) => {
      queryClient.invalidateQueries({ queryKey: [BILLING_KEY] });
      queryClient.invalidateQueries({ queryKey: ['admin-organizations', orgId] });
      toast.success('Trial extended successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to extend trial');
    },
  });
}

export function useApplyCredit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orgId, amount, reason }: { orgId: string; amount: number; reason: string }) =>
      adminBillingService.applyCredit(orgId, amount, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BILLING_KEY] });
      toast.success('Credit applied successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to apply credit');
    },
  });
}

export function useAdjustSeats() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orgId, seats }: { orgId: string; seats: number }) =>
      adminBillingService.adjustSeats(orgId, seats),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BILLING_KEY] });
      toast.success('Seat count updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to adjust seats');
    },
  });
}

export function useCancelSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orgId, immediately, reason }: { orgId: string; immediately: boolean; reason: string }) =>
      adminBillingService.cancelSubscription(orgId, immediately, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BILLING_KEY] });
      toast.success('Subscription cancelled');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to cancel subscription');
    },
  });
}

export function useProcessRefund() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orgId, amount, reason }: { orgId: string; amount: number; reason: string }) =>
      adminBillingService.processRefund(orgId, amount, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BILLING_KEY] });
      toast.success('Refund processed successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to process refund');
    },
  });
}
