'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

// Pages that should be accessible even when logged in
const ALWAYS_ACCESSIBLE_PATHS = ['/setup-account', '/verify-email'];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuthStore();

  // Check if current path should bypass auth redirect
  const shouldBypassAuthRedirect = ALWAYS_ACCESSIBLE_PATHS.some(path => pathname?.startsWith(path));

  useEffect(() => {
    // Don't redirect if on a page that should always be accessible
    if (shouldBypassAuthRedirect) return;
    
    if (!isLoading && isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router, shouldBypassAuthRedirect]);

  // Don't show loading spinner for always-accessible paths
  if (isLoading && !shouldBypassAuthRedirect) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // Don't block rendering for always-accessible paths
  if (isAuthenticated && !shouldBypassAuthRedirect) {
    return null;
  }

  return <>{children}</>;
}


