'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';

function IntegrationsRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    // Check for error or success messages in URL
    const error = searchParams.get('error');
    const success = searchParams.get('success');
    const message = searchParams.get('message');
    
    // Show toast notifications for OAuth callback results
    if (error) {
      switch (error) {
        case 'connection_failed':
          toast.error('Failed to connect Google Calendar. Please try again.');
          break;
        case 'access_denied':
          toast.error('Access was denied. Please grant the required permissions.');
          break;
        case 'invalid_state':
          toast.error('Invalid OAuth state. Please try connecting again.');
          break;
        case 'missing_code':
          toast.error('Authorization failed. Please try again.');
          break;
        default:
          toast.error(message || 'Connection failed. Please try again.');
      }
    }
    
    if (success) {
      switch (success) {
        case 'connected':
          toast.success('Google Calendar connected successfully!');
          break;
        case 'disconnected':
          toast.success('Integration disconnected successfully.');
          break;
        default:
          toast.success(message || 'Operation completed successfully.');
      }
    }
    
    // Redirect to the main settings page with integrations tab active
    // Use replace to avoid adding to browser history
    router.replace('/settings?tab=integrations');
  }, [router, searchParams]);
  
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="flex items-center gap-3 text-surface-500 dark:text-surface-400">
        <div className="w-5 h-5 border-2 border-surface-300 dark:border-surface-600 border-t-primary-500 rounded-full animate-spin" />
        <span>Redirecting to settings...</span>
      </div>
    </div>
  );
}

export default function IntegrationsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex items-center gap-3 text-surface-500 dark:text-surface-400">
          <div className="w-5 h-5 border-2 border-surface-300 dark:border-surface-600 border-t-primary-500 rounded-full animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    }>
      <IntegrationsRedirect />
    </Suspense>
  );
}

