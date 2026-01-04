'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { useAdminAuthStore } from '@/stores/adminAuthStore';
import { adminAuthService } from '@/services/admin/auth.service';
import { setAdminToken } from '@/services/admin/api';

function AdminAuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser, setToken } = useAdminAuthStore();
  const [status, setStatus] = useState<'loading' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');
      const redirect = searchParams.get('redirect') || '/admin/dashboard';
      const error = searchParams.get('message');

      // Handle error from OAuth provider
      if (error) {
        setStatus('error');
        setErrorMessage(error);
        setTimeout(() => {
          router.push(`/admin/auth/error?message=${encodeURIComponent(error)}`);
        }, 1500);
        return;
      }

      // Validate token
      if (!token) {
        setStatus('error');
        setErrorMessage('Missing authentication token');
        setTimeout(() => {
          router.push('/admin/auth/error?message=Missing+authentication+token');
        }, 1500);
        return;
      }

      try {
        // Store the admin token
        setAdminToken(token);
        setToken(token);

        // Fetch admin user data
        const userData = await adminAuthService.getCurrentAdmin();
        setUser(userData);

        // Redirect to dashboard or specified redirect
        router.push(redirect);
      } catch (error: any) {
        console.error('Admin OAuth callback error:', error);
        setStatus('error');
        setErrorMessage(error.message || 'Authentication failed');
        setTimeout(() => {
          router.push(`/admin/auth/error?message=${encodeURIComponent('Authentication failed')}`);
        }, 1500);
      }
    };

    handleCallback();
  }, [searchParams, router, setUser, setToken]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-900 via-surface-800 to-primary-900 flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />

      <div className="relative text-center">
        {/* Logo */}
        <div className="flex items-center gap-3 justify-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/30">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <span className="text-4xl font-bold text-white">
            Admin Panel
          </span>
        </div>

        {status === 'loading' && (
          <>
            <div className="flex justify-center mb-4">
              <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">
              Completing sign in...
            </h2>
            <p className="text-surface-400">
              Please wait while we set up your admin session.
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-red-400"
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
            <h2 className="text-xl font-semibold text-white mb-2">
              Authentication failed
            </h2>
            <p className="text-surface-400 mb-4">
              {errorMessage || 'An error occurred during sign in.'}
            </p>
            <p className="text-sm text-surface-500">
              Redirecting to error page...
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-900 via-surface-800 to-primary-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
      <div className="relative text-center">
        <div className="flex items-center gap-3 justify-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/30">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <span className="text-4xl font-bold text-white">
            Admin Panel
          </span>
        </div>
        <div className="flex justify-center mb-4">
          <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">
          Loading...
        </h2>
      </div>
    </div>
  );
}

export default function AdminAuthCallbackPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AdminAuthCallbackContent />
    </Suspense>
  );
}
