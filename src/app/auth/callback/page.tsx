'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { setTokens } from '@/services/api';
import { useAuthStore } from '@/stores/authStore';
import { authService } from '@/services/auth.service';
import { Sparkles, Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser, setTokens: setStoreTokens } = useAuthStore();
  const [status, setStatus] = useState<'loading' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');
      const refreshToken = searchParams.get('refreshToken');
      const redirect = searchParams.get('redirect') || '/';
      const error = searchParams.get('error');

      // Handle error from OAuth provider
      if (error) {
        setStatus('error');
        setErrorMessage(error);
        setTimeout(() => {
          router.push(`/auth/error?message=${encodeURIComponent(error)}`);
        }, 1500);
        return;
      }

      // Validate tokens
      if (!token || !refreshToken) {
        setStatus('error');
        setErrorMessage('Missing authentication tokens');
        setTimeout(() => {
          router.push('/auth/error?message=Missing+authentication+tokens');
        }, 1500);
        return;
      }

      try {
        // Store tokens
        setTokens(token, refreshToken);
        setStoreTokens(token, refreshToken);

        // Fetch user data
        const userData = await authService.getCurrentUser();
        setUser(userData);

        // Map backend redirects to our routes
        let finalRedirect = redirect;
        if (redirect === '/dashboard') {
          finalRedirect = '/';
        } else if (redirect === '/onboarding/organization') {
          finalRedirect = '/onboarding/organization';
        } else if (redirect === '/onboarding/profile') {
          finalRedirect = '/onboarding/profile';
        }

        // Redirect to appropriate page
        router.push(finalRedirect);
      } catch (error: any) {
        console.error('OAuth callback error:', error);
        setStatus('error');
        setErrorMessage(error.message || 'Authentication failed');
        setTimeout(() => {
          router.push(`/auth/error?message=${encodeURIComponent('Authentication failed')}`);
        }, 1500);
      }
    };

    handleCallback();
  }, [searchParams, router, setUser, setStoreTokens]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-900">
      <div className="text-center">
        {/* Logo */}
        <div className="flex items-center gap-3 justify-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <span className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
            TaskFlow AI
          </span>
        </div>

        {status === 'loading' && (
          <>
            <div className="flex justify-center mb-4">
              <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
            </div>
            <h2 className="text-xl font-semibold text-surface-900 dark:text-white mb-2">
              Completing sign in...
            </h2>
            <p className="text-surface-600 dark:text-surface-400">
              Please wait while we set up your session.
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-red-600 dark:text-red-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            </div>
            <h2 className="text-xl font-semibold text-surface-900 dark:text-white mb-2">
              Authentication failed
            </h2>
            <p className="text-surface-600 dark:text-surface-400 mb-4">
              {errorMessage || 'An error occurred during sign in.'}
            </p>
            <p className="text-sm text-surface-500 dark:text-surface-500">
              Redirecting to error page...
            </p>
          </>
        )}
      </div>
    </div>
  );
}

