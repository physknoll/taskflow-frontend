'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { CodeInput } from '@/components/ui/CodeInput';
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
  RefreshCw,
  Clock,
  AlertCircle,
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

// Step 3 Schema - Profile (all optional)
const step3Schema = z.object({
  phone: z.string().optional(),
  jobTitle: z.string().optional(),
  referralSource: z.string().optional(),
});

// Step 4 Schema - Organization
const step4Schema = z.object({
  name: z.string().min(1, 'Organization name is required'),
  industry: z.string().optional(),
  size: z.string().optional(),
});

type Step1Form = z.infer<typeof step1Schema>;
type Step3Form = z.infer<typeof step3Schema>;
type Step4Form = z.infer<typeof step4Schema>;

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
              ? 'text-success-500'
              : 'text-[var(--text-muted)]'
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
            index <= currentStep
              ? 'bg-primary-500'
              : 'bg-[var(--bg-tertiary)]'
          }`}
        />
      ))}
    </div>
  );
}

// Format seconds to MM:SS
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function RegisterPage() {
  const { signup, verifyCode, resendVerificationCode, completeProfile, createOrganization, getSignupOptions, initiateGoogleAuth } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [signupOptions, setSignupOptions] = useState<SignupOptionsResponse | null>(null);

  // Verification step state
  const [pendingEmail, setPendingEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes in seconds
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Terms acceptance state
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Form for Step 1 (Account Creation)
  const step1Form = useForm<Step1Form>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
    },
  });

  // Form for Step 3 (Profile)
  const step3Form = useForm<Step3Form>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      phone: '',
      jobTitle: '',
      referralSource: '',
    },
  });

  // Form for Step 4 (Organization)
  const step4Form = useForm<Step4Form>({
    resolver: zodResolver(step4Schema),
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

  // Countdown timer for verification code
  useEffect(() => {
    if (currentStep !== 1 || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentStep, timeRemaining]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;

    const timer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Step 1 Submit - Account Creation
  const onStep1Submit = async (data: Step1Form) => {
    setIsLoading(true);
    try {
      const response = await signup(data);
      setPendingEmail(response.email);
      setTimeRemaining(response.expiresIn || 600);
      setVerificationCode('');
      setCodeError('');
      setCurrentStep(1);
    } catch (error) {
      // Error handled in hook
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2 - Verify Code
  const onVerifyCode = useCallback(async (code: string) => {
    if (code.length !== 6) return;
    
    setIsLoading(true);
    setCodeError('');
    try {
      await verifyCode(pendingEmail, code);
      setCurrentStep(2);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Invalid verification code';
      setCodeError(message);
      setVerificationCode('');
    } finally {
      setIsLoading(false);
    }
  }, [pendingEmail, verifyCode]);

  // Handle code change
  const handleCodeChange = (code: string) => {
    setVerificationCode(code);
    setCodeError('');
  };

  // Handle resend code
  const handleResendCode = async () => {
    if (resendCooldown > 0 || isResending) return;

    setIsResending(true);
    try {
      await resendVerificationCode(pendingEmail);
      setTimeRemaining(600);
      setResendCooldown(60); // 60 second cooldown between resends
      setVerificationCode('');
      setCodeError('');
    } catch (error) {
      // Error handled in hook
    } finally {
      setIsResending(false);
    }
  };

  // Step 3 Submit - Profile
  const onStep3Submit = async (data: Step3Form) => {
    setIsLoading(true);
    try {
      await completeProfile(data);
      setCurrentStep(3);
    } catch (error) {
      // Error handled in hook
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3 Skip
  const onStep3Skip = () => {
    setCurrentStep(3);
  };

  // Step 4 Submit - Organization
  const onStep4Submit = async (data: Step4Form) => {
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
    { title: 'Verify your email', subtitle: 'Enter the 6-digit code we sent you' },
    { title: 'Tell us about yourself', subtitle: 'Help us personalize your experience' },
    { title: 'Create your organization', subtitle: 'Set up your workspace' },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>

        {/* Floating shapes */}
        <div className="absolute top-20 left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-primary-300/20 rounded-full blur-3xl" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-glow">
              <Sparkles className="w-8 h-8" />
            </div>
            <span className="text-4xl font-bold font-heading">TaskFlow AI</span>
          </div>

          <h1 className="text-5xl font-bold font-heading mb-6 leading-tight">
            Manage projects
            <br />
            with <span className="text-primary-200">AI-powered</span>
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
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[var(--bg-primary)]">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-glow">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-bold font-heading gradient-text">
              TaskFlow AI
            </span>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center justify-between mb-6">
            <span className="text-sm font-medium text-[var(--text-secondary)]">
              Step {currentStep + 1} of 4
            </span>
            <StepIndicator currentStep={currentStep} totalSteps={4} />
          </div>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold font-heading text-[var(--text-primary)] mb-2">
              {stepTitles[currentStep].title}
            </h2>
            <p className="text-[var(--text-secondary)]">
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
                    className="absolute right-3 top-[38px] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                  <PasswordRequirements password={password || ''} />
                </div>

                {/* Terms and Privacy Policy Acceptance */}
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="acceptTerms"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-[var(--border-default)] text-primary-500 focus:ring-primary-500"
                  />
                  <label htmlFor="acceptTerms" className="text-sm text-[var(--text-secondary)]">
                    I agree to the{' '}
                    <a
                      href="https://www.taskflowai.biz/legal/terms"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-500 hover:text-primary-600 underline"
                    >
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a
                      href="https://www.taskflowai.biz/legal/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-500 hover:text-primary-600 underline"
                    >
                      Privacy Policy
                    </a>
                  </label>
                </div>

                <Button type="submit" className="w-full" size="lg" isLoading={isLoading} disabled={!acceptedTerms}>
                  Continue
                  <ChevronRight className="w-5 h-5 ml-1" />
                </Button>
              </form>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[var(--border-default)]" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-[var(--bg-primary)] text-[var(--text-muted)]">
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

              <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
                Already have an account?{' '}
                <Link
                  href="/login"
                  className="text-primary-500 hover:text-primary-600 font-medium"
                >
                  Sign in
                </Link>
              </p>
            </>
          )}

          {/* Step 2: Email Verification */}
          {currentStep === 1 && (
            <div className="space-y-6">
              {/* Email display */}
              <div className="bg-[var(--bg-tertiary)] rounded-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-100 [data-theme='dark']:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-primary-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-[var(--text-muted)]">Code sent to</p>
                  <p className="font-medium text-[var(--text-primary)] truncate">{pendingEmail}</p>
                </div>
              </div>

              {/* Code Input */}
              <div className="py-4">
                <CodeInput
                  value={verificationCode}
                  onChange={handleCodeChange}
                  onComplete={onVerifyCode}
                  error={codeError}
                  disabled={isLoading}
                  autoFocus
                />
              </div>

              {/* Timer */}
              <div className="flex items-center justify-center gap-2">
                {timeRemaining > 0 ? (
                  <>
                    <Clock className={`w-4 h-4 ${timeRemaining <= 120 ? 'text-warning-500' : 'text-[var(--text-muted)]'}`} />
                    <span className={`text-sm font-medium ${timeRemaining <= 120 ? 'text-warning-500' : 'text-[var(--text-secondary)]'}`}>
                      Code expires in {formatTime(timeRemaining)}
                    </span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-error-500" />
                    <span className="text-sm font-medium text-error-500">
                      Code expired
                    </span>
                  </>
                )}
              </div>

              {/* Verify Button */}
              <Button
                type="button"
                className="w-full"
                size="lg"
                isLoading={isLoading}
                disabled={verificationCode.length !== 6 || timeRemaining === 0}
                onClick={() => onVerifyCode(verificationCode)}
              >
                Verify Email
                <Check className="w-5 h-5 ml-1" />
              </Button>

              {/* Resend Code */}
              <div className="text-center">
                <p className="text-sm text-[var(--text-muted)] mb-2">
                  Didn&apos;t receive the code?
                </p>
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={resendCooldown > 0 || isResending}
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary-500 hover:text-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw className={`w-4 h-4 ${isResending ? 'animate-spin' : ''}`} />
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
                </button>
              </div>

              {/* Back to signup */}
              <Button
                type="button"
                variant="outline"
                className="w-full"
                size="lg"
                onClick={() => {
                  setCurrentStep(0);
                  setVerificationCode('');
                  setCodeError('');
                }}
              >
                <ChevronLeft className="w-5 h-5 mr-1" />
                Back to signup
              </Button>
            </div>
          )}

          {/* Step 3: Profile */}
          {currentStep === 2 && (
            <>
              <form onSubmit={step3Form.handleSubmit(onStep3Submit)} className="space-y-5">
                <Input
                  {...step3Form.register('phone')}
                  type="tel"
                  label="Phone number (optional)"
                  placeholder="+1 (555) 123-4567"
                  leftIcon={<Phone className="h-5 w-5" />}
                  autoComplete="tel"
                />

                <Input
                  {...step3Form.register('jobTitle')}
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
                    value={step3Form.watch('referralSource')}
                    onChange={(value) => step3Form.setValue('referralSource', value)}
                  />
                )}

                <div className="flex gap-3 pt-2">
                  <Button type="submit" className="flex-1" size="lg" isLoading={isLoading}>
                    Continue
                    <ChevronRight className="w-5 h-5 ml-1" />
                  </Button>
                </div>
              </form>

              <button
                type="button"
                onClick={onStep3Skip}
                className="w-full mt-4 text-sm text-primary-500 hover:text-primary-600 font-medium"
              >
                Skip this step
              </button>
            </>
          )}

          {/* Step 4: Organization */}
          {currentStep === 3 && (
            <form onSubmit={step4Form.handleSubmit(onStep4Submit)} className="space-y-5">
              <Input
                {...step4Form.register('name')}
                label="Organization name"
                placeholder="Acme Corporation"
                error={step4Form.formState.errors.name?.message}
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
                    value={step4Form.watch('industry')}
                    onChange={(value) => step4Form.setValue('industry', value)}
                  />

                  <Select
                    label="Team size (optional)"
                    placeholder="Select team size"
                    options={signupOptions.organizationSizes.map((size) => ({
                      value: size,
                      label: size,
                    }))}
                    value={step4Form.watch('size')}
                    onChange={(value) => step4Form.setValue('size', value)}
                    className="mb-2"
                  />
                </>
              )}

              {!signupOptions && (
                <>
                  <Input
                    {...step4Form.register('industry')}
                    label="Industry (optional)"
                    placeholder="Technology"
                    leftIcon={<Briefcase className="h-5 w-5" />}
                  />
                  <Input
                    {...step4Form.register('size')}
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
                  onClick={() => setCurrentStep(2)}
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
