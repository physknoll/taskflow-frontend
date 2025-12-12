'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

// Pages that should be accessible even when logged in
const ALWAYS_ACCESSIBLE_PATHS = ['/setup-account', '/verify-email'];

// Pages that are part of the onboarding flow (accessible during signup even when authenticated)
const ONBOARDING_PATHS = ['/register', '/onboarding'];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading } = useAuthStore();

  // Check if current path should bypass auth redirect
  const shouldBypassAuthRedirect = ALWAYS_ACCESSIBLE_PATHS.some(path => pathname?.startsWith(path));
  
  // Check if current path is part of onboarding flow
  const isOnboardingPath = ONBOARDING_PATHS.some(path => pathname?.startsWith(path));

  // Check if user has completed onboarding (has an organization)
  const hasCompletedOnboarding = user?.organizationId && user?.onboardingCompleted !== false;

  useEffect(() => {
    // Don't redirect if on a page that should always be accessible
    if (shouldBypassAuthRedirect) return;
    
    if (!isLoading && isAuthenticated) {
      // If user hasn't completed onboarding, don't redirect away from onboarding paths
      if (!hasCompletedOnboarding && isOnboardingPath) {
        return;
      }
      
      // If user hasn't completed onboarding and trying to access non-onboarding auth pages (like login)
      // redirect them to complete their onboarding
      if (!hasCompletedOnboarding && !isOnboardingPath) {
        // Check what step they need to complete
        if (!user?.organizationId) {
          router.push('/onboarding/organization');
        } else {
          router.push('/');
        }
        return;
      }
      
      // User is authenticated and has completed onboarding - redirect to dashboard
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router, shouldBypassAuthRedirect, hasCompletedOnboarding, isOnboardingPath, user?.organizationId]);

  // Don't show loading spinner for always-accessible paths
  if (isLoading && !shouldBypassAuthRedirect) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // Allow rendering for onboarding paths even when authenticated (if onboarding not complete)
  if (isAuthenticated && !shouldBypassAuthRedirect && !isOnboardingPath) {
    // Only block if user has completed onboarding
    if (hasCompletedOnboarding) {
      return null;
    }
  }

  return <>{children}</>;
}


