'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useLinkedInFeature } from '@/hooks/useOrganization';
import { Linkedin, Lock } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface LinkedInLayoutProps {
  children: React.ReactNode;
}

export default function LinkedInLayout({ children }: LinkedInLayoutProps) {
  const router = useRouter();
  const { isEnabled, isLoading } = useLinkedInFeature();

  // Show loading state while checking feature
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-surface-600 dark:text-surface-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Show upgrade message if feature is not enabled
  if (!isEnabled) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-16 h-16 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center mx-auto mb-6">
            <Lock className="h-8 w-8 text-surface-400" />
          </div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-3">
            LinkedIn Monitoring
          </h1>
          <p className="text-surface-600 dark:text-surface-400 mb-6">
            LinkedIn Monitoring is not enabled for your organization. This feature allows you to
            monitor LinkedIn profiles, track posts, and analyze engagement.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="outline" onClick={() => router.push('/')}>
              Go to Dashboard
            </Button>
            <Button onClick={() => router.push('/settings')}>
              Contact Admin
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
