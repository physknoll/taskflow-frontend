'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import {
  KeyRound,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  Shield,
} from 'lucide-react';
import toast from 'react-hot-toast';

function SetupAccountContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const { setUser, setTokens } = useAuthStore();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Password validation
  const passwordRequirements = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'Contains uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'Contains lowercase letter', met: /[a-z]/.test(password) },
    { label: 'Contains number', met: /\d/.test(password) },
    { label: 'Contains special character', met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ];

  const isPasswordValid = passwordRequirements.every((req) => req.met);
  const doPasswordsMatch = password === confirmPassword && confirmPassword.length > 0;

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing setup token. Please check your invitation email.');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      setError('Invalid setup token');
      return;
    }

    if (!isPasswordValid) {
      toast.error('Please meet all password requirements');
      return;
    }

    if (!doPasswordsMatch) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.setupAccount(token, password);
      setUser(response.user);
      setTokens(response.token, response.refreshToken);
      setIsSuccess(true);
      toast.success('Account setup complete! Welcome to TaskFlow.');
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to setup account. The link may have expired.';
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
              Welcome to TaskFlow!
            </h1>
            <p className="text-surface-600 dark:text-surface-400 mb-6">
              Your account is all set up. Redirecting you to the dashboard...
            </p>
            <div className="flex items-center justify-center gap-2 text-primary-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Redirecting...</span>
            </div>
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
              <Shield className="h-8 w-8 text-primary-600 dark:text-primary-400" />
            </div>
            <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-2">
              Set Up Your Account
            </h1>
            <p className="text-surface-600 dark:text-surface-400">
              Create a secure password to complete your account setup
            </p>
          </div>

          {error && !token && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                  <Link
                    href="/login"
                    className="text-sm text-red-600 dark:text-red-400 underline mt-2 inline-block"
                  >
                    Go to login
                  </Link>
                </div>
              </div>
            </div>
          )}

          {token && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Password Input */}
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a strong password"
                    className="pr-10"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Password Requirements */}
              <div className="bg-surface-50 dark:bg-surface-800 rounded-xl p-4">
                <p className="text-xs font-medium text-surface-600 dark:text-surface-400 uppercase tracking-wide mb-3">
                  Password Requirements
                </p>
                <div className="space-y-2">
                  {passwordRequirements.map((req, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      {req.met ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border-2 border-surface-300 dark:border-surface-600" />
                      )}
                      <span className={req.met ? 'text-green-600 dark:text-green-400' : 'text-surface-500'}>
                        {req.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                  Confirm Password
                </label>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  disabled={isLoading}
                />
                {confirmPassword && !doPasswordsMatch && (
                  <p className="text-sm text-red-500 mt-1">Passwords do not match</p>
                )}
                {doPasswordsMatch && (
                  <p className="text-sm text-green-500 mt-1 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" /> Passwords match
                  </p>
                )}
              </div>

              {error && token && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
              )}

              {/* Terms and Privacy Policy Acceptance */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="acceptTerms"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500 dark:border-surface-600 dark:bg-surface-800"
                  disabled={isLoading}
                />
                <label htmlFor="acceptTerms" className="text-sm text-surface-600 dark:text-surface-400">
                  I agree to the{' '}
                  <a
                    href="https://www.taskflowai.biz/legal/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 underline"
                  >
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a
                    href="https://www.taskflowai.biz/legal/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 underline"
                  >
                    Privacy Policy
                  </a>
                </label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isLoading || !isPasswordValid || !doPasswordsMatch || !acceptedTerms}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Setting up account...
                  </>
                ) : (
                  <>
                    Complete Setup
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function SetupAccountPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary-600" />
            <p className="mt-4 text-surface-600">Loading...</p>
          </CardContent>
        </Card>
      </div>
    }>
      <SetupAccountContent />
    </Suspense>
  );
}


