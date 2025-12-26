import adminApi from './api';
import {
  AdminApiResponse,
  AdminPaginatedResponse,
  IAdminSubscription,
  IAdminSubscriptionDetail,
  AdminListParams,
  SubscriptionPlan,
  SubscriptionStatus,
} from '@/types/admin';

interface BillingListParams extends AdminListParams {
  plan?: SubscriptionPlan;
  status?: SubscriptionStatus;
}

export const adminBillingService = {
  /**
   * List subscriptions
   */
  async listSubscriptions(params?: BillingListParams): Promise<AdminPaginatedResponse<IAdminSubscription>> {
    const response = await adminApi.get<AdminPaginatedResponse<IAdminSubscription>>('/billing/subscriptions', { params });
    return response.data;
  },

  /**
   * Get subscription details for an organization
   */
  async getSubscription(orgId: string): Promise<IAdminSubscriptionDetail> {
    const response = await adminApi.get<AdminApiResponse<IAdminSubscriptionDetail>>(`/billing/subscriptions/${orgId}`);
    return response.data.data;
  },

  /**
   * Extend trial period
   */
  async extendTrial(orgId: string, days: number): Promise<IAdminSubscription> {
    const response = await adminApi.post<AdminApiResponse<IAdminSubscription>>(`/billing/subscriptions/${orgId}/extend-trial`, { days });
    return response.data.data;
  },

  /**
   * Apply credit to organization
   */
  async applyCredit(orgId: string, amount: number, reason: string): Promise<{ message: string }> {
    const response = await adminApi.post<AdminApiResponse<{ message: string }>>(`/billing/subscriptions/${orgId}/apply-credit`, {
      amount,
      reason,
    });
    return response.data.data;
  },

  /**
   * Adjust seat count
   */
  async adjustSeats(orgId: string, seats: number): Promise<IAdminSubscription> {
    const response = await adminApi.put<AdminApiResponse<IAdminSubscription>>(`/billing/subscriptions/${orgId}/seats`, { seats });
    return response.data.data;
  },

  /**
   * Cancel subscription
   */
  async cancelSubscription(orgId: string, immediately: boolean, reason: string): Promise<IAdminSubscription> {
    const response = await adminApi.post<AdminApiResponse<IAdminSubscription>>(`/billing/subscriptions/${orgId}/cancel`, {
      immediately,
      reason,
    });
    return response.data.data;
  },

  /**
   * Process refund
   */
  async processRefund(orgId: string, amount: number, reason: string): Promise<{ message: string }> {
    const response = await adminApi.post<AdminApiResponse<{ message: string }>>(`/billing/subscriptions/${orgId}/refund`, {
      amount,
      reason,
    });
    return response.data.data;
  },
};



