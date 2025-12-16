import adminApi from './api';
import {
  AdminApiResponse,
  IAdminOverviewStats,
  IAdminUsageStats,
  IAdminGrowthStats,
  IAdminRevenueStats,
  IAdminAIStats,
  AdminAnalyticsParams,
} from '@/types/admin';

export const adminAnalyticsService = {
  /**
   * Get platform overview stats
   */
  async getOverview(): Promise<IAdminOverviewStats> {
    const response = await adminApi.get<AdminApiResponse<IAdminOverviewStats>>('/analytics/overview');
    return response.data.data;
  },

  /**
   * Get usage analytics
   */
  async getUsage(params?: AdminAnalyticsParams): Promise<IAdminUsageStats> {
    const response = await adminApi.get<AdminApiResponse<IAdminUsageStats>>('/analytics/usage', { params });
    return response.data.data;
  },

  /**
   * Get growth metrics
   */
  async getGrowth(params?: AdminAnalyticsParams): Promise<IAdminGrowthStats> {
    const response = await adminApi.get<AdminApiResponse<IAdminGrowthStats>>('/analytics/growth', { params });
    return response.data.data;
  },

  /**
   * Get revenue metrics
   */
  async getRevenue(): Promise<IAdminRevenueStats> {
    const response = await adminApi.get<AdminApiResponse<IAdminRevenueStats>>('/analytics/revenue');
    return response.data.data;
  },

  /**
   * Get AI usage analytics
   */
  async getAIAnalytics(params?: AdminAnalyticsParams): Promise<IAdminAIStats> {
    const response = await adminApi.get<AdminApiResponse<IAdminAIStats>>('/analytics/ai', { params });
    return response.data.data;
  },
};

