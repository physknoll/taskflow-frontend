'use client';

import { useQuery } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/stores/authStore';

export const organizationKeys = {
  current: ['organization', 'current'] as const,
};

export function useOrganization() {
  const { isAuthenticated } = useAuthStore();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: organizationKeys.current,
    queryFn: () => authService.getCurrentOrganization(),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: false, // Don't retry if org fetch fails
  });

  return {
    organization: data,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook to check if LinkedIn Monitoring feature is enabled for the organization
 */
export function useLinkedInFeature() {
  const { organization, isLoading } = useOrganization();

  const isEnabled = organization?.features?.linkedInMonitoring?.enabled === true;
  const config = organization?.features?.linkedInMonitoring;

  return {
    isEnabled,
    isLoading,
    config,
    maxProfiles: config?.maxProfiles,
    maxScrapers: config?.maxScrapers,
  };
}
