'use client';

import { useQuery } from '@tanstack/react-query';
import { adminAnalyticsService } from '@/services/admin/analytics.service';
import { AdminAnalyticsParams } from '@/types/admin';

const ANALYTICS_KEY = 'admin-analytics';

export function useAdminOverview() {
  return useQuery({
    queryKey: [ANALYTICS_KEY, 'overview'],
    queryFn: () => adminAnalyticsService.getOverview(),
    staleTime: 60 * 1000, // 1 minute
  });
}

export function useAdminUsage(params?: AdminAnalyticsParams) {
  return useQuery({
    queryKey: [ANALYTICS_KEY, 'usage', params],
    queryFn: () => adminAnalyticsService.getUsage(params),
    staleTime: 60 * 1000,
  });
}

export function useAdminGrowth(params?: AdminAnalyticsParams) {
  return useQuery({
    queryKey: [ANALYTICS_KEY, 'growth', params],
    queryFn: () => adminAnalyticsService.getGrowth(params),
    staleTime: 60 * 1000,
  });
}

export function useAdminRevenue() {
  return useQuery({
    queryKey: [ANALYTICS_KEY, 'revenue'],
    queryFn: () => adminAnalyticsService.getRevenue(),
    staleTime: 60 * 1000,
  });
}

export function useAdminAIAnalytics(params?: AdminAnalyticsParams) {
  return useQuery({
    queryKey: [ANALYTICS_KEY, 'ai', params],
    queryFn: () => adminAnalyticsService.getAIAnalytics(params),
    staleTime: 60 * 1000,
  });
}

