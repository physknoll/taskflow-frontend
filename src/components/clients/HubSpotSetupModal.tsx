'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import {
  Settings,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  CheckCircle,
  XCircle,
  Loader2,
  AlertTriangle,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface HubSpotSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify?: () => Promise<{ success: boolean; error?: string }>;
  articleUrl?: string;
}

const HUBSPOT_CODE_SNIPPET = `<meta name="article:modified_time" content="{{ content.updated|datetimeformat('%Y-%m-%dT%H:%M:%S%z') }}">`;

type VerificationStatus = 'idle' | 'verifying' | 'success' | 'failed';

export function HubSpotSetupModal({
  isOpen,
  onClose,
  onVerify,
  articleUrl,
}: HubSpotSetupModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [copied, setCopied] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('idle');
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const totalSteps = 4;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(HUBSPOT_CODE_SNIPPET);
      setCopied(true);
      toast.success('Code copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy code');
    }
  };

  const handleVerify = async () => {
    if (!onVerify) {
      // Mock verification for testing
      setVerificationStatus('verifying');
      setTimeout(() => {
        setVerificationStatus('success');
      }, 1500);
      return;
    }

    setVerificationStatus('verifying');
    setVerificationError(null);

    try {
      const result = await onVerify();
      if (result.success) {
        setVerificationStatus('success');
      } else {
        setVerificationStatus('failed');
        setVerificationError(result.error || 'Verification failed');
      }
    } catch (error: any) {
      setVerificationStatus('failed');
      setVerificationError(error.message || 'An error occurred during verification');
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    setCurrentStep(1);
    setCopied(false);
    setVerificationStatus('idle');
    setVerificationError(null);
    setExpandedFaq(null);
    onClose();
  };

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const faqItems = [
    {
      question: 'Will this code affect how my Knowledge Base looks?',
      answer:
        'No. This code is invisible to your visitors—it only adds hidden metadata that our system reads.',
    },
    {
      question: 'Do I need to add this to every article?',
      answer:
        'No. Adding it once in the Template settings applies it automatically to all articles.',
    },
    {
      question: 'What if I have multiple Knowledge Bases?',
      answer:
        "You'll need to add this code to each Knowledge Base separately. Repeat these steps for each one.",
    },
    {
      question: "I don't see the Template tab. What should I do?",
      answer:
        "The Template tab is only available if you have a Service Hub Professional or Enterprise subscription. If you don't see it, contact your HubSpot admin.",
    },
    {
      question: 'Can I remove this code later?',
      answer:
        'Yes, you can remove it anytime by deleting the code from the settings and saving. This will stop our change tracking for that Knowledge Base.',
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Connect Your HubSpot Knowledge Base"
      description="To track when your Knowledge Base articles are updated, you'll need to add a small code snippet to your HubSpot settings. This takes about 2 minutes."
      size="lg"
    >
      <div className="space-y-6">
        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all',
                  step < currentStep
                    ? 'bg-green-500 text-white'
                    : step === currentStep
                    ? 'bg-primary-500 text-white ring-4 ring-primary-500/20'
                    : 'bg-surface-200 dark:bg-surface-700 text-surface-500'
                )}
              >
                {step < currentStep ? (
                  <Check className="h-4 w-4" />
                ) : (
                  step
                )}
              </div>
              {step < totalSteps && (
                <div
                  className={cn(
                    'w-12 h-1 mx-1 rounded-full transition-all',
                    step < currentStep
                      ? 'bg-green-500'
                      : 'bg-surface-200 dark:bg-surface-700'
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="min-h-[280px]">
          {/* Step 1: Open HubSpot Settings */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <span className="text-lg font-bold text-primary-600 dark:text-primary-400">1</span>
                </div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                  Open HubSpot Settings
                </h3>
              </div>

              <div className="bg-surface-50 dark:bg-surface-800/50 rounded-xl p-6 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#FF7A59] flex items-center justify-center flex-shrink-0">
                    <Settings className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-[var(--text-primary)] font-medium mb-2">
                      Log in to your HubSpot account
                    </p>
                    <p className="text-[var(--text-secondary)] text-sm">
                      Click the <strong>Settings icon</strong> (gear/cog) in the top navigation bar of your HubSpot dashboard.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                  <Settings className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                  <span className="text-sm text-primary-700 dark:text-primary-300">
                    Look for the gear icon in the top-right corner of your HubSpot dashboard
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Navigate to Knowledge Base Settings */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <span className="text-lg font-bold text-primary-600 dark:text-primary-400">2</span>
                </div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                  Navigate to Knowledge Base Settings
                </h3>
              </div>

              <div className="bg-surface-50 dark:bg-surface-800/50 rounded-xl p-6 space-y-4">
                <p className="text-[var(--text-secondary)] text-sm mb-4">
                  In the left sidebar, navigate through the following path:
                </p>

                {/* Navigation Path */}
                <div className="flex flex-wrap items-center gap-2 p-4 bg-white dark:bg-surface-700 rounded-lg border border-surface-200 dark:border-surface-600">
                  <span className="px-3 py-1.5 bg-surface-100 dark:bg-surface-600 rounded-lg text-sm font-medium text-[var(--text-primary)]">
                    Tools
                  </span>
                  <ChevronRight className="h-4 w-4 text-surface-400" />
                  <span className="px-3 py-1.5 bg-surface-100 dark:bg-surface-600 rounded-lg text-sm font-medium text-[var(--text-primary)]">
                    Content
                  </span>
                  <ChevronRight className="h-4 w-4 text-surface-400" />
                  <span className="px-3 py-1.5 bg-primary-100 dark:bg-primary-900/50 rounded-lg text-sm font-medium text-primary-700 dark:text-primary-300">
                    Knowledge Base
                  </span>
                </div>

                <div className="space-y-3 mt-4">
                  <p className="text-sm text-[var(--text-secondary)]">
                    <strong>1.</strong> Scroll down in the left sidebar under the <strong>Tools</strong> heading
                  </p>
                  <p className="text-sm text-[var(--text-secondary)]">
                    <strong>2.</strong> Expand <strong>Content</strong>
                  </p>
                  <p className="text-sm text-[var(--text-secondary)]">
                    <strong>3.</strong> Click on <strong>Knowledge Base</strong>
                  </p>
                  <p className="text-sm text-[var(--text-secondary)]">
                    <strong>4.</strong> Click the <strong>Template</strong> tab at the top
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Add the Tracking Code */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <span className="text-lg font-bold text-primary-600 dark:text-primary-400">3</span>
                </div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                  Add the Tracking Code
                </h3>
              </div>

              <div className="bg-surface-50 dark:bg-surface-800/50 rounded-xl p-6 space-y-4">
                <p className="text-[var(--text-secondary)] text-sm">
                  Scroll down to the <strong>Custom HTML</strong> section and find the field labeled{' '}
                  <strong>&quot;Knowledge base article page header HTML&quot;</strong>.
                </p>

                {/* Code Snippet Box */}
                <div className="relative">
                  <div className="bg-surface-900 dark:bg-black rounded-lg p-4 pr-12 overflow-x-auto">
                    <code className="text-sm text-green-400 font-mono whitespace-pre">
                      {HUBSPOT_CODE_SNIPPET}
                    </code>
                  </div>
                  <button
                    onClick={handleCopyCode}
                    className={cn(
                      'absolute top-2 right-2 p-2 rounded-lg transition-all',
                      copied
                        ? 'bg-green-500 text-white'
                        : 'bg-surface-700 hover:bg-surface-600 text-surface-300'
                    )}
                    title="Copy code"
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {/* Warning Callout */}
                <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                  <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                      Important
                    </p>
                    <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                      Make sure to paste this into the{' '}
                      <strong>&quot;Knowledge base article page header HTML&quot;</strong> field,{' '}
                      <strong>NOT</strong> the general &quot;Knowledge base pages header HTML&quot; field.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Save and Verify */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <span className="text-lg font-bold text-primary-600 dark:text-primary-400">4</span>
                </div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                  Save Your Changes
                </h3>
              </div>

              <div className="bg-surface-50 dark:bg-surface-800/50 rounded-xl p-6 space-y-4">
                <p className="text-[var(--text-secondary)] text-sm">
                  <strong>1.</strong> Click the <strong>Save</strong> button at the bottom left of the page
                </p>
                <p className="text-[var(--text-secondary)] text-sm">
                  <strong>2.</strong> Return here and click <strong>Verify Setup</strong> to confirm everything is working
                </p>

                {/* Verification Section */}
                <div className="mt-6 pt-4 border-t border-surface-200 dark:border-surface-700">
                  {verificationStatus === 'idle' && (
                    <Button onClick={handleVerify} className="w-full">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Verify Setup
                    </Button>
                  )}

                  {verificationStatus === 'verifying' && (
                    <div className="flex items-center justify-center gap-3 p-4 bg-surface-100 dark:bg-surface-700 rounded-lg">
                      <Loader2 className="h-5 w-5 text-primary-500 animate-spin" />
                      <span className="text-[var(--text-secondary)]">
                        Verifying your HubSpot setup...
                      </span>
                    </div>
                  )}

                  {verificationStatus === 'success' && (
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-6 w-6 text-green-500" />
                        <div>
                          <p className="font-semibold text-green-800 dark:text-green-300">
                            Setup Complete!
                          </p>
                          <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                            We&apos;ve verified that your HubSpot Knowledge Base is correctly configured.
                            We&apos;ll now automatically detect when your articles are updated.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {verificationStatus === 'failed' && (
                    <div className="space-y-3">
                      <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                        <div className="flex items-start gap-3">
                          <XCircle className="h-6 w-6 text-red-500 flex-shrink-0" />
                          <div>
                            <p className="font-semibold text-red-800 dark:text-red-300">
                              Setup Not Detected
                            </p>
                            <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                              {verificationError ||
                                "We couldn't find the tracking code on your Knowledge Base articles."}
                            </p>
                            <ul className="text-sm text-red-700 dark:text-red-400 mt-2 space-y-1 list-disc list-inside">
                              <li>
                                Pasted the code into the correct field (
                                <strong>&quot;Knowledge base article page header HTML&quot;</strong>)
                              </li>
                              <li>Clicked <strong>Save</strong> after adding the code</li>
                              <li>Waited a few minutes for HubSpot to update</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setVerificationStatus('idle');
                            setCurrentStep(3);
                          }}
                          className="flex-1"
                        >
                          View Instructions Again
                        </Button>
                        <Button
                          onClick={() => {
                            setVerificationStatus('idle');
                            handleVerify();
                          }}
                          className="flex-1"
                        >
                          Try Again
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-surface-200 dark:border-surface-700">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className={cn(currentStep === 1 && 'invisible')}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="flex gap-3">
            {currentStep < totalSteps && (
              <Button onClick={handleNext}>
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
            {currentStep === totalSteps && verificationStatus === 'success' && (
              <Button onClick={handleClose}>
                Done
                <Check className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="pt-4 border-t border-surface-200 dark:border-surface-700">
          <button
            onClick={() => setExpandedFaq(expandedFaq === -1 ? null : -1)}
            className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <HelpCircle className="h-4 w-4" />
            Frequently Asked Questions
            {expandedFaq === -1 ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>

          {expandedFaq === -1 && (
            <div className="mt-4 space-y-2 animate-fade-in">
              {faqItems.map((faq, index) => (
                <div
                  key={index}
                  className="border border-surface-200 dark:border-surface-700 rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full flex items-center justify-between p-3 text-left hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors"
                  >
                    <span className="text-sm font-medium text-[var(--text-primary)]">
                      {faq.question}
                    </span>
                    {expandedFaq === index ? (
                      <ChevronUp className="h-4 w-4 text-surface-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-surface-400 flex-shrink-0" />
                    )}
                  </button>
                  {expandedFaq === index && (
                    <div className="px-3 pb-3 text-sm text-[var(--text-secondary)] animate-fade-in">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}



