'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, AlertTriangle, ArrowLeft, RefreshCw, Loader2 } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

function AdminAuthErrorContent() {
  const searchParams = useSearchParams();
  const message = searchParams.get('message') || 'An error occurred during authentication.';

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-900 via-surface-800 to-primary-900 flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />

      <div className="relative w-full max-w-md text-center">
        {/* Logo */}
        <div className="flex items-center gap-3 justify-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/30">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <span className="text-4xl font-bold text-white">
            Admin Panel
          </span>
        </div>

        {/* Error Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-red-400" />
          </div>
        </div>

        <h2 className="text-3xl font-bold text-white mb-3">
          Authentication Error
        </h2>

        <p className="text-lg text-surface-400 mb-8">{message}</p>

        <div className="space-y-3">
          <Link
            href="/admin/login"
            className={cn(
              buttonVariants({ size: 'lg' }),
              'w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800'
            )}
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Sign In
          </Link>

          <Button
            variant="outline"
            className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20"
            size="lg"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Try Again
          </Button>
        </div>

        <div className="mt-8 p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl text-left">
          <p className="text-sm font-medium text-surface-300 mb-2">
            Having trouble?
          </p>
          <ul className="text-sm text-surface-400 space-y-1">
            <li>• Make sure you have admin access (platformRole)</li>
            <li>• Contact a super admin if you need access</li>
            <li>• Try clearing your browser cache</li>
            <li>• Check that cookies are enabled</li>
          </ul>
        </div>
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

export default function AdminAuthErrorPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AdminAuthErrorContent />
    </Suspense>
  );
}
