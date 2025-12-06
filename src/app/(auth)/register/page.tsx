'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { SignupOptionsResponse } from '@/types';
import {
  Sparkles,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  Briefcase,
  Building2,
  Users,
  ChevronLeft,
  ChevronRight,
  Check,
} from 'lucide-react';

// Step 1 Schema - Account Creation
const step1Schema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

// Step 2 Schema - Profile (all optional)
const step2Schema = z.object({
  phone: z.string().optional(),
  jobTitle: z.string().optional(),
  referralSource: z.string().optional(),
});

// Step 3 Schema - Organization
const step3Schema = z.object({
  name: z.string().min(1, 'Organization name is required'),
  industry: z.string().optional(),
  size: z.string().optional(),
});

type Step1Form = z.infer<typeof step1Schema>;
type Step2Form = z.infer<typeof step2Schema>;
type Step3Form = z.infer<typeof step3Schema>;

// Google Icon Component
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

// Password Requirements Component
function PasswordRequirements({ password }: { password: string }) {
  const requirements = [
    { label: '8+ characters', met: password.length >= 8 },
    { label: 'Uppercase', met: /[A-Z]/.test(password) },
    { label: 'Lowercase', met: /[a-z]/.test(password) },
    { label: 'Number', met: /[0-9]/.test(password) },
  ];

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {requirements.map((req, index) => (
        <span
          key={index}
          className={`flex items-center gap-1 text-xs ${
            req.met
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-surface-400 dark:text-surface-500'
          }`}
        >
          {req.met ? (
            <Check className="w-3 h-3" />
          ) : (
            <div className="w-3 h-3 rounded-full border border-current" />
          )}
          {req.label}
        </span>
      ))}
    </div>
  );
}

// Step Indicator Component
function StepIndicator({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div
          key={index}
          className={`w-2.5 h-2.5 rounded-full transition-colors ${
            index < currentStep
              ? 'bg-primary-600'
              : index === currentStep
              ? 'bg-primary-600'
              : 'bg-surface-300 dark:bg-surface-600'
          }`}
        />
      ))}
    </div>
  );
}

export default function RegisterPage() {
  const { signup, completeProfile, createOrganization, getSignupOptions, initiateGoogleAuth } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [signupOptions, setSignupOptions] = useState<SignupOptionsResponse | null>(null);

  // Form for Step 1
  const step1Form = useForm<Step1Form>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
    },
  });

  // Form for Step 2
  const step2Form = useForm<Step2Form>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      phone: '',
      jobTitle: '',
      referralSource: '',
    },
  });

  // Form for Step 3
  const step3Form = useForm<Step3Form>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      name: '',
      industry: '',
      size: '',
    },
  });

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

  // Step 1 Submit
  const onStep1Submit = async (data: Step1Form) => {
    setIsLoading(true);
    try {
      await signup(data);
      setCurrentStep(1);
    } catch (error) {
      // Error handled in hook
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2 Submit
  const onStep2Submit = async (data: Step2Form) => {
    setIsLoading(true);
    try {
      await completeProfile(data);
      setCurrentStep(2);
    } catch (error) {
      // Error handled in hook
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2 Skip
  const onStep2Skip = () => {
    setCurrentStep(2);
  };

  // Step 3 Submit
  const onStep3Submit = async (data: Step3Form) => {
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

  const password = step1Form.watch('password');

  const stepTitles = [
    { title: 'Create your account', subtitle: 'Start your journey with TaskFlow AI' },
    { title: 'Tell us about yourself', subtitle: 'Help us personalize your experience' },
    { title: 'Create your organization', subtitle: 'Set up your workspace' },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding (same as login) */}
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

      {/* Right side - Registration form */}
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

          {/* Step Indicator */}
          <div className="flex items-center justify-between mb-6">
            <span className="text-sm font-medium text-surface-600 dark:text-surface-400">
              Step {currentStep + 1} of 3
            </span>
            <StepIndicator currentStep={currentStep} totalSteps={3} />
          </div>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-surface-900 dark:text-white mb-2">
              {stepTitles[currentStep].title}
            </h2>
            <p className="text-surface-600 dark:text-surface-400">
              {stepTitles[currentStep].subtitle}
            </p>
          </div>

          {/* Step 1: Account Creation */}
          {currentStep === 0 && (
            <>
              <form onSubmit={step1Form.handleSubmit(onStep1Submit)} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    {...step1Form.register('firstName')}
                    label="First name"
                    placeholder="John"
                    error={step1Form.formState.errors.firstName?.message}
                    leftIcon={<User className="h-5 w-5" />}
                    autoComplete="given-name"
                  />
                  <Input
                    {...step1Form.register('lastName')}
                    label="Last name"
                    placeholder="Doe"
                    error={step1Form.formState.errors.lastName?.message}
                    autoComplete="family-name"
                  />
                </div>

                <Input
                  {...step1Form.register('email')}
                  type="email"
                  label="Email address"
                  placeholder="you@company.com"
                  error={step1Form.formState.errors.email?.message}
                  leftIcon={<Mail className="h-5 w-5" />}
                  autoComplete="email"
                />

                <div className="relative">
                  <Input
                    {...step1Form.register('password')}
                    type={showPassword ? 'text' : 'password'}
                    label="Password"
                    placeholder="Create a strong password"
                    error={step1Form.formState.errors.password?.message}
                    leftIcon={<Lock className="h-5 w-5" />}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-[38px] text-surface-500 hover:text-surface-700 dark:hover:text-surface-300"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                  <PasswordRequirements password={password || ''} />
                </div>

                <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
                  Continue
                  <ChevronRight className="w-5 h-5 ml-1" />
                </Button>
              </form>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-surface-300 dark:border-surface-600" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-surface-50 dark:bg-surface-900 text-surface-500 dark:text-surface-400">
                    or
                  </span>
                </div>
              </div>

              {/* Google OAuth */}
              <Button
                type="button"
                variant="outline"
                className="w-full"
                size="lg"
                onClick={initiateGoogleAuth}
              >
                <GoogleIcon className="w-5 h-5 mr-2" />
                Continue with Google
              </Button>

              <p className="mt-6 text-center text-sm text-surface-500 dark:text-surface-400">
                Already have an account?{' '}
                <Link
                  href="/login"
                  className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
                >
                  Sign in
                </Link>
              </p>
            </>
          )}

          {/* Step 2: Profile */}
          {currentStep === 1 && (
            <>
              <form onSubmit={step2Form.handleSubmit(onStep2Submit)} className="space-y-5">
                <Input
                  {...step2Form.register('phone')}
                  type="tel"
                  label="Phone number (optional)"
                  placeholder="+1 (555) 123-4567"
                  leftIcon={<Phone className="h-5 w-5" />}
                  autoComplete="tel"
                />

                <Input
                  {...step2Form.register('jobTitle')}
                  label="Job title (optional)"
                  placeholder="Project Manager"
                  leftIcon={<Briefcase className="h-5 w-5" />}
                  autoComplete="organization-title"
                />

                {signupOptions && (
                  <Select
                    label="How did you hear about us? (optional)"
                    placeholder="Select an option"
                    options={signupOptions.referralSources.map((source) => ({
                      value: source,
                      label: source,
                    }))}
                    value={step2Form.watch('referralSource')}
                    onChange={(value) => step2Form.setValue('referralSource', value)}
                  />
                )}

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    size="lg"
                    onClick={() => setCurrentStep(0)}
                  >
                    <ChevronLeft className="w-5 h-5 mr-1" />
                    Back
                  </Button>
                  <Button type="submit" className="flex-1" size="lg" isLoading={isLoading}>
                    Continue
                    <ChevronRight className="w-5 h-5 ml-1" />
                  </Button>
                </div>
              </form>

              <button
                type="button"
                onClick={onStep2Skip}
                className="w-full mt-4 text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
              >
                Skip this step
              </button>
            </>
          )}

          {/* Step 3: Organization */}
          {currentStep === 2 && (
            <form onSubmit={step3Form.handleSubmit(onStep3Submit)} className="space-y-5">
              <Input
                {...step3Form.register('name')}
                label="Organization name"
                placeholder="Acme Corporation"
                error={step3Form.formState.errors.name?.message}
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
                    value={step3Form.watch('industry')}
                    onChange={(value) => step3Form.setValue('industry', value)}
                  />

                  <Select
                    label="Team size (optional)"
                    placeholder="Select team size"
                    options={signupOptions.organizationSizes.map((size) => ({
                      value: size,
                      label: size,
                    }))}
                    value={step3Form.watch('size')}
                    onChange={(value) => step3Form.setValue('size', value)}
                    className="mb-2"
                  />
                </>
              )}

              {!signupOptions && (
                <>
                  <Input
                    {...step3Form.register('industry')}
                    label="Industry (optional)"
                    placeholder="Technology"
                    leftIcon={<Briefcase className="h-5 w-5" />}
                  />
                  <Input
                    {...step3Form.register('size')}
                    label="Team size (optional)"
                    placeholder="11-25"
                    leftIcon={<Users className="h-5 w-5" />}
                  />
                </>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  size="lg"
                  onClick={() => setCurrentStep(1)}
                >
                  <ChevronLeft className="w-5 h-5 mr-1" />
                  Back
                </Button>
                <Button type="submit" variant="gradient" className="flex-1" size="lg" isLoading={isLoading}>
                  Create Organization
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

