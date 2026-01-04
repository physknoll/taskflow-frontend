'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { LinkedInConnectionCode } from '@/types';
import { cn } from '@/lib/utils';
import {
  Copy,
  Check,
  Monitor,
  Apple,
  Download,
  RefreshCw,
  Clock,
} from 'lucide-react';

interface ConnectionCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerateCode: () => Promise<LinkedInConnectionCode>;
  isGenerating?: boolean;
}

export function ConnectionCodeModal({
  isOpen,
  onClose,
  onGenerateCode,
  isGenerating,
}: ConnectionCodeModalProps) {
  const [code, setCode] = useState<LinkedInConnectionCode | null>(null);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  // Generate code when modal opens
  useEffect(() => {
    if (isOpen && !code) {
      handleGenerateCode();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Countdown timer
  useEffect(() => {
    if (!code?.expiresAt) return;

    const updateTimer = () => {
      const remaining = Math.max(0, new Date(code.expiresAt).getTime() - Date.now());
      setTimeLeft(Math.floor(remaining / 1000));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [code?.expiresAt]);

  const handleGenerateCode = async () => {
    try {
      const newCode = await onGenerateCode();
      setCode(newCode);
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleCopy = async () => {
    if (!code) return;
    await navigator.clipboard.writeText(code.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTimeLeft = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleClose = () => {
    setCode(null);
    setCopied(false);
    onClose();
  };

  // Detect platform for download
  const platform =
    typeof navigator !== 'undefined'
      ? navigator.platform.toLowerCase().includes('mac')
        ? 'mac'
        : navigator.platform.toLowerCase().includes('win')
        ? 'windows'
        : 'linux'
      : 'mac';

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Connect Desktop Agent" size="lg">
      <div className="space-y-6">
        {/* Step 1: Connection Code */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-semibold">
              1
            </div>
            <h3 className="text-lg font-semibold text-surface-900 dark:text-white">
              Connection Code
            </h3>
          </div>

          {isGenerating ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin text-primary-500" />
            </div>
          ) : code ? (
            <div className="space-y-4">
              {/* Code Display */}
              <div className="relative">
                <div className="bg-surface-100 dark:bg-surface-700 rounded-xl p-6 text-center">
                  <p className="text-3xl font-mono font-bold tracking-widest text-surface-900 dark:text-white">
                    {code.code}
                  </p>
                </div>
                <button
                  onClick={handleCopy}
                  className={cn(
                    'absolute top-4 right-4 p-2 rounded-lg transition-colors',
                    copied
                      ? 'bg-success-100 text-success-600 dark:bg-success-900/30 dark:text-success-400'
                      : 'bg-white dark:bg-surface-600 text-surface-600 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-500'
                  )}
                >
                  {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                </button>
              </div>

              {/* Timer */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-surface-500 dark:text-surface-400">
                  <Clock className="h-4 w-4" />
                  <span>
                    {timeLeft > 0 ? (
                      <>Expires in {formatTimeLeft(timeLeft)}</>
                    ) : (
                      <span className="text-error-500">Expired</span>
                    )}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleGenerateCode}
                  disabled={isGenerating}
                >
                  <RefreshCw className={cn('h-4 w-4 mr-1', isGenerating && 'animate-spin')} />
                  New Code
                </Button>
              </div>
            </div>
          ) : (
            <Button onClick={handleGenerateCode} disabled={isGenerating}>
              Generate Connection Code
            </Button>
          )}
        </div>

        {/* Step 2: Download Agent */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-semibold">
              2
            </div>
            <h3 className="text-lg font-semibold text-surface-900 dark:text-white">
              Download Desktop Agent
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <a
              href="#"
              className={cn(
                'flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-colors',
                platform === 'mac'
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-surface-200 dark:border-surface-700 hover:border-surface-300 dark:hover:border-surface-600'
              )}
            >
              <Apple className="h-5 w-5" />
              <span className="font-medium">macOS</span>
              {platform === 'mac' && (
                <Download className="h-4 w-4 ml-1 text-primary-500" />
              )}
            </a>
            <a
              href="#"
              className={cn(
                'flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-colors',
                platform === 'windows'
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-surface-200 dark:border-surface-700 hover:border-surface-300 dark:hover:border-surface-600'
              )}
            >
              <Monitor className="h-5 w-5" />
              <span className="font-medium">Windows</span>
              {platform === 'windows' && (
                <Download className="h-4 w-4 ml-1 text-primary-500" />
              )}
            </a>
            <a
              href="#"
              className={cn(
                'flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-colors',
                platform === 'linux'
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-surface-200 dark:border-surface-700 hover:border-surface-300 dark:hover:border-surface-600'
              )}
            >
              <Monitor className="h-5 w-5" />
              <span className="font-medium">Linux</span>
              {platform === 'linux' && (
                <Download className="h-4 w-4 ml-1 text-primary-500" />
              )}
            </a>
          </div>
        </div>

        {/* Step 3: Instructions */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-semibold">
              3
            </div>
            <h3 className="text-lg font-semibold text-surface-900 dark:text-white">
              Connect
            </h3>
          </div>

          <div className="bg-surface-50 dark:bg-surface-700/50 rounded-lg p-4">
            <ol className="list-decimal list-inside space-y-2 text-sm text-surface-600 dark:text-surface-400">
              <li>Install and open the LinkedIn Monitor desktop app</li>
              <li>Click &quot;Connect to Organization&quot;</li>
              <li>Enter the connection code shown above</li>
              <li>Sign in to your LinkedIn account in the app</li>
              <li>The agent will appear here once connected</li>
            </ol>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end pt-4 border-t border-surface-200 dark:border-surface-700">
          <Button variant="outline" onClick={handleClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
