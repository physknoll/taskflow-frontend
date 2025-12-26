'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { SignupOptionsResponse } from '@/types';
import { Sparkles, Building2, Briefcase, Users } from 'lucide-react';

const organizationSchema = z.object({
  name: z.string().min(1, 'Organization name is required'),
  industry: z.string().optional(),
  size: z.string().optional(),
});

type OrganizationForm = z.infer<typeof organizationSchema>;

export default function OnboardingOrganizationPage() {
  const router = useRouter();
  const { user, createOrganization, getSignupOptions, isAuthenticated, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [signupOptions, setSignupOptions] = useState<SignupOptionsResponse | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<OrganizationForm>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: '',
      industry: '',
      size: '',
    },
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Redirect if user already has an organization
  useEffect(() => {
    if (user?.organizationId) {
      router.push('/');
    }
  }, [user, router]);

  // Fetch signup options on mount
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const options = await getSignupOptions();
        setSignupOptions(options);
      } catch (error) {
        // Error handled in hook
      }
    };
    fetchOptions();
  }, [getSignupOptions]);

  const onSubmit = async (data: OrganizationForm) => {
    setIsLoading(true);
    try {
      await createOrganization(data);
      // Redirect handled in hook
    } catch (error) {
      // Error handled in hook
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

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
            Almost there!
            <br />
            <span className="text-accent-300">Set up your</span>
            <br />
            workspace
          </h1>

          <p className="text-xl text-white/80 max-w-md">
            Create your organization to start managing projects with AI-powered intelligence.
          </p>

          {/* Benefits */}
          <div className="mt-12 space-y-4">
            {[
              'Invite your team members',
              'Create unlimited projects',
              'Access AI-powered features',
              'Collaborate in real-time',
            ].map((benefit, index) => (
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
                <span className="text-white/90">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Organization form */}
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

          {/* Welcome message */}
          {user && (
            <div className="mb-6 p-4 bg-primary-50 dark:bg-primary-900/30 rounded-xl">
              <p className="text-sm text-primary-700 dark:text-primary-300">
                Welcome, <strong>{user.firstName}</strong>! Let&apos;s set up your organization.
              </p>
            </div>
          )}

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-surface-900 dark:text-white mb-2">
              Create your organization
            </h2>
            <p className="text-surface-600 dark:text-surface-400">
              Set up your workspace to get started
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              {...register('name')}
              label="Organization name"
              placeholder="Acme Corporation"
              error={errors.name?.message}
              leftIcon={<Building2 className="h-5 w-5" />}
              autoComplete="organization"
            />

            {signupOptions && (
              <>
                <Select
                  label="Industry (optional)"
                  placeholder="Select your industry"
                  options={signupOptions.industries.map((industry) => ({
                    value: industry,
                    label: industry,
                  }))}
                  value={watch('industry')}
                  onChange={(value) => setValue('industry', value)}
                />

                <Select
                  label="Team size (optional)"
                  placeholder="Select team size"
                  options={signupOptions.organizationSizes.map((size) => ({
                    value: size,
                    label: size,
                  }))}
                  value={watch('size')}
                  onChange={(value) => setValue('size', value)}
                />
              </>
            )}

            {!signupOptions && (
              <>
                <Input
                  {...register('industry')}
                  label="Industry (optional)"
                  placeholder="Technology"
                  leftIcon={<Briefcase className="h-5 w-5" />}
                />
                <Input
                  {...register('size')}
                  label="Team size (optional)"
                  placeholder="11-25"
                  leftIcon={<Users className="h-5 w-5" />}
                />
              </>
            )}

            <Button
              type="submit"
              variant="gradient"
              className="w-full"
              size="lg"
              isLoading={isLoading}
            >
              Create Organization & Continue
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}




