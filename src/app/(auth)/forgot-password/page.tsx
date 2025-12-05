'use client';

import { useState } from 'react';
import Link from 'next/link';
import { authService } from '@/services/auth.service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import {
  Mail,
  CheckCircle,
  ArrowLeft,
  Loader2,
  Send,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await authService.forgotPassword(email);
      setIsSuccess(true);
      toast.success('Password reset email sent!');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to send reset email. Please try again.';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-2">
              Check Your Email
            </h1>
            <p className="text-surface-600 dark:text-surface-400 mb-2">
              We have sent a password reset link to:
            </p>
            <p className="font-medium text-surface-900 dark:text-white mb-6">
              {email}
            </p>
            <p className="text-sm text-surface-500 mb-6">
              Did not receive the email? Check your spam folder or{' '}
              <button
                onClick={() => setIsSuccess(false)}
                className="text-primary-600 hover:underline"
              >
                try again
              </button>
            </p>
            <Link href="/login">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Mail className="h-8 w-8 text-primary-600 dark:text-primary-400" />
            </div>
            <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-2">
              Forgot Password?
            </h1>
            <p className="text-surface-600 dark:text-surface-400">
              No worries! Enter your email and we will send you a reset link.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                Email Address
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                disabled={isLoading}
                autoFocus
              />
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isLoading || !email.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Reset Link
                </>
              )}
            </Button>

            <Link
              href="/login"
              className="flex items-center justify-center gap-2 text-sm text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to login
            </Link>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

