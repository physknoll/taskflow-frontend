'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Sparkles, Mail, Lock, Eye, EyeOff } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
    } catch (error) {
      // Error is handled in the hook
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
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
            Manage projects<br />
            with <span className="text-accent-300">AI-powered</span><br />
            intelligence
          </h1>
          
          <p className="text-xl text-white/80 max-w-md">
            Streamline your workflow with intelligent ticket management, 
            automated reviews, and AI-assisted project tracking.
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-white/90">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-surface-50 dark:bg-surface-900">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              TaskFlow AI
            </span>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-surface-900 dark:text-white mb-2">
              Welcome back
            </h2>
            <p className="text-surface-600 dark:text-surface-400">
              Sign in to continue to your dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              {...register('email')}
              type="email"
              label="Email address"
              placeholder="you@company.com"
              error={errors.email?.message}
              leftIcon={<Mail className="h-5 w-5" />}
              autoComplete="email"
            />

            <div className="relative">
              <Input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                label="Password"
                placeholder="Enter your password"
                error={errors.password?.message}
                leftIcon={<Lock className="h-5 w-5" />}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[38px] text-surface-500 hover:text-surface-700 dark:hover:text-surface-300"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            <div className="flex justify-end">
              <a
                href="/forgot-password"
                className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
              >
                Forgot password?
              </a>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isLoading}
            >
              Sign in
            </Button>
          </form>

          {/* Demo credentials */}
          <div className="mt-8 p-4 bg-primary-50 dark:bg-primary-900/30 rounded-xl">
            <p className="text-sm font-medium text-primary-800 dark:text-primary-300 mb-2">
              Demo Credentials
            </p>
            <div className="text-sm text-primary-700 dark:text-primary-400 space-y-1">
              <p><strong>Owner:</strong> owner@taskflow.ai / owner123!</p>
              <p><strong>Manager:</strong> manager@taskflow.ai / manager123!</p>
              <p><strong>Employee:</strong> employee@taskflow.ai / employee123!</p>
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-surface-500 dark:text-surface-400">
            Note: User registration is admin-only. Contact your administrator to get an account.
          </p>
        </div>
      </div>
    </div>
  );
}

