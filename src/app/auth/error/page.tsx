'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button, buttonVariants } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { Sparkles, AlertTriangle, ArrowLeft, RefreshCw, Loader2 } from 'lucide-react';

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const message = searchParams.get('message') || 'An error occurred during authentication.';

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding (same as login/register) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-700 to-accent-600 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-gradient-mesh opacity-10" />

        {/* Floating shapes */}
        <div className="absolute top-20 left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-accent-500/20 rounded-full blur-3xl" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Sparkles className="w-8 h-8" />
            </div>
            <span className="text-4xl font-bold">TaskFlow AI</span>
          </div>

          <h1 className="text-5xl font-bold mb-6 leading-tight">
            Manage projects
            <br />
            with <span className="text-accent-300">AI-powered</span>
            <br />
            intelligence
          </h1>

          <p className="text-xl text-white/80 max-w-md">
            Streamline your workflow with intelligent ticket management, automated reviews, and
            AI-assisted project tracking.
          </p>

          {/* Features */}
          <div className="mt-12 space-y-4">
            {[
              'AI-generated task breakdowns',
              'Smart daily update parsing',
              'Intelligent knowledge base Q&A',
              'Automated review workflows',
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <span className="text-white/90">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Error message */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-surface-50 dark:bg-surface-900">
        <div className="w-full max-w-md text-center">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              TaskFlow AI
            </span>
          </div>

          {/* Error Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400" />
            </div>
          </div>

          <h2 className="text-3xl font-bold text-surface-900 dark:text-white mb-3">
            Authentication Error
          </h2>

          <p className="text-lg text-surface-600 dark:text-surface-400 mb-8">{message}</p>

          <div className="space-y-3">
            <Link
              href="/login"
              className={cn(buttonVariants({ size: 'lg' }), 'w-full')}
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Sign In
            </Link>

            <Button
              variant="outline"
              className="w-full"
              size="lg"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Try Again
            </Button>
          </div>

          <div className="mt-8 p-4 bg-surface-100 dark:bg-surface-800 rounded-xl text-left">
            <p className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
              Having trouble?
            </p>
            <ul className="text-sm text-surface-600 dark:text-surface-400 space-y-1">
              <li>• Make sure you&apos;re using a supported browser</li>
              <li>• Check that cookies are enabled</li>
              <li>• Try clearing your browser cache</li>
              <li>• Contact support if the problem persists</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-900">
      <div className="text-center">
        <div className="flex items-center gap-3 justify-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <span className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
            TaskFlow AI
          </span>
        </div>
        <div className="flex justify-center mb-4">
          <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
        </div>
        <h2 className="text-xl font-semibold text-surface-900 dark:text-white mb-2">
          Loading...
        </h2>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AuthErrorContent />
    </Suspense>
  );
}
