'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/services/auth.service';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import {
  CheckCircle,
  AlertCircle,
  Loader2,
  Mail,
  ArrowRight,
} from 'lucide-react';
import toast from 'react-hot-toast';

type VerificationState = 'verifying' | 'success' | 'error' | 'no-token';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [state, setState] = useState<VerificationState>('verifying');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    if (!token) {
      setState('no-token');
      return;
    }

    const verifyEmail = async () => {
      try {
        await authService.verifyEmail(token);
        setState('success');
        toast.success('Email verified successfully!');
      } catch (error: any) {
        setState('error');
        setErrorMessage(error.response?.data?.message || 'Verification failed. The link may have expired.');
      }
    };

    verifyEmail();
  }, [token]);

  const renderContent = () => {
    switch (state) {
      case 'verifying':
        return (
          <>
            <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader2 className="h-8 w-8 text-primary-600 dark:text-primary-400 animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-2">
              Verifying Your Email
            </h1>
            <p className="text-surface-600 dark:text-surface-400">
              Please wait while we verify your email address...
            </p>
          </>
        );

      case 'success':
        return (
          <>
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-2">
              Email Verified!
            </h1>
            <p className="text-surface-600 dark:text-surface-400 mb-6">
              Your email has been verified successfully. You can now access all features.
            </p>
            <Button onClick={() => router.push('/login')} className="w-full">
              Continue to Login
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </>
        );

      case 'error':
        return (
          <>
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-2">
              Verification Failed
            </h1>
            <p className="text-surface-600 dark:text-surface-400 mb-6">
              {errorMessage}
            </p>
            <div className="space-y-3">
              <Button onClick={() => router.push('/login')} variant="outline" className="w-full">
                Go to Login
              </Button>
              <p className="text-sm text-surface-500 text-center">
                Need a new verification link?{' '}
                <Link href="/login" className="text-primary-600 hover:underline">
                  Contact support
                </Link>
              </p>
            </div>
          </>
        );

      case 'no-token':
        return (
          <>
            <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="h-8 w-8 text-amber-600 dark:text-amber-400" />
            </div>
            <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-2">
              Invalid Verification Link
            </h1>
            <p className="text-surface-600 dark:text-surface-400 mb-6">
              This verification link is invalid or missing. Please check your email for the correct link.
            </p>
            <Button onClick={() => router.push('/login')} className="w-full">
              Go to Login
            </Button>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  );
}

