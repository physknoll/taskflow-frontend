'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Send,
  Loader2,
  CheckCircle,
  Clock,
  AlertCircle,
  Lightbulb,
  X,
  ChevronLeft,
  Sparkles,
} from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import { useDailyUpdates } from '@/hooks/useDailyUpdates';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';
import type { IParsedUpdate } from '@/types';

type ModalStep = 'input' | 'review';

interface ParsedUpdateItemProps {
  update: IParsedUpdate;
  index: number;
  isSelected: boolean;
  onToggle: () => void;
}

const updateTypeColors: Record<string, { bg: string; text: string; label: string }> = {
  progress: {
    bg: 'bg-blue-50 dark:bg-blue-900/30',
    text: 'text-blue-700 dark:text-blue-400',
    label: 'Progress',
  },
  completed: {
    bg: 'bg-emerald-50 dark:bg-emerald-900/30',
    text: 'text-emerald-700 dark:text-emerald-400',
    label: 'Completed',
  },
  started: {
    bg: 'bg-purple-50 dark:bg-purple-900/30',
    text: 'text-purple-700 dark:text-purple-400',
    label: 'Started',
  },
  blocked: {
    bg: 'bg-red-50 dark:bg-red-900/30',
    text: 'text-red-700 dark:text-red-400',
    label: 'Blocked',
  },
};

function ParsedUpdateItem({ update, index, isSelected, onToggle }: ParsedUpdateItemProps) {
  const typeStyle = updateTypeColors[update.updateType] || updateTypeColors.progress;
  const confidencePercent = Math.round(update.confidence * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={cn(
        'border rounded-lg p-3 transition-all cursor-pointer',
        isSelected
          ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-900/20'
          : 'border-surface-200 dark:border-surface-700 hover:border-surface-300 dark:hover:border-surface-600'
      )}
      onClick={onToggle}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <div
          className={cn(
            'w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors',
            isSelected
              ? 'bg-primary-500 text-white'
              : 'border-2 border-surface-300 dark:border-surface-600'
          )}
        >
          {isSelected && <CheckCircle className="w-3.5 h-3.5" />}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header row */}
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-medium text-sm text-primary-600 dark:text-primary-400">
              {update.ticketNumber}
            </span>
            <span className="text-xs text-surface-500">-</span>
            <span className="text-sm text-surface-700 dark:text-surface-300 truncate">
              {update.ticketTitle}
            </span>
          </div>

          {/* Type badge */}
          <div className="flex items-center gap-2 mb-2">
            <span className={cn('text-xs px-1.5 py-0.5 rounded font-medium', typeStyle.bg, typeStyle.text)}>
              {typeStyle.label}
            </span>
            {update.timeSpent && (
              <span className="text-xs text-surface-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {Math.floor(update.timeSpent / 60)}h {update.timeSpent % 60}m
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-sm text-surface-600 dark:text-surface-400 italic">
            &ldquo;{update.description}&rdquo;
          </p>

          {/* Confidence indicator */}
          <div className="flex items-center gap-2 mt-2">
            <div className="flex-1 h-1 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full',
                  confidencePercent >= 80
                    ? 'bg-emerald-500'
                    : confidencePercent >= 60
                      ? 'bg-amber-500'
                      : 'bg-red-500'
                )}
                style={{ width: `${confidencePercent}%` }}
              />
            </div>
            <span className="text-[10px] text-surface-500">{confidencePercent}% confidence</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function DailyProgressModal() {
  const { modals, closeModal } = useUIStore();
  const isOpen = modals.dailyUpdate;

  const {
    parseResult,
    clearParseResult,
    parseProgress,
    acceptUpdates,
    rejectUpdates,
    isParsing,
    isAccepting,
    isRejecting,
    todayUpdate,
  } = useDailyUpdates();

  const [step, setStep] = useState<ModalStep>('input');
  const [inputValue, setInputValue] = useState('');
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setStep('input');
      setInputValue('');
      setSelectedIndices(new Set());
      clearParseResult();
    }
  }, [isOpen, clearParseResult]);

  // When parse result comes in, move to review step and select all by default
  useEffect(() => {
    if (parseResult && parseResult.parsedUpdates.length > 0) {
      setStep('review');
      // Select all updates by default
      setSelectedIndices(new Set(parseResult.parsedUpdates.map((_, i) => i)));
    }
  }, [parseResult]);

  const handleClose = useCallback(() => {
    closeModal('dailyUpdate');
    clearParseResult();
  }, [closeModal, clearParseResult]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleClose]);

  const handleSubmitInput = async () => {
    if (!inputValue.trim()) return;
    await parseProgress(inputValue.trim());
  };

  const handleToggleUpdate = (index: number) => {
    setSelectedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (parseResult) {
      setSelectedIndices(new Set(parseResult.parsedUpdates.map((_, i) => i)));
    }
  };

  const handleDeselectAll = () => {
    setSelectedIndices(new Set());
  };

  const handleAcceptSelected = async () => {
    if (!parseResult) return;
    const indices = Array.from(selectedIndices);
    if (indices.length === 0) return;
    await acceptUpdates(parseResult.dailyUpdateId, indices);
    handleClose();
  };

  const handleRejectAll = async () => {
    if (!parseResult) return;
    await rejectUpdates(parseResult.dailyUpdateId);
    handleClose();
  };

  const handleBack = () => {
    setStep('input');
  };

  if (!isOpen) return null;

  const isSubmitting = isAccepting || isRejecting;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl mx-4 bg-white dark:bg-surface-800 rounded-2xl shadow-2xl animate-scale-in overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-surface-200 dark:border-surface-700 bg-gradient-to-r from-primary-500 to-accent-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {step === 'review' && (
                <button
                  onClick={handleBack}
                  className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-white" />
                </button>
              )}
              <div className="p-2 rounded-lg bg-white/20">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">
                  {step === 'input' ? 'Log Your Progress' : 'Review Parsed Updates'}
                </h2>
                <p className="text-xs text-white/80">
                  {step === 'input'
                    ? 'Tell us what you worked on today'
                    : 'Select the updates to apply to your tickets'}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <AnimatePresence mode="wait">
            {step === 'input' && (
              <motion.div
                key="input"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {/* Hint about existing log */}
                {todayUpdate && (
                  <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <Sparkles className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      You&apos;ve already logged {todayUpdate.parsedUpdates.length} update
                      {todayUpdate.parsedUpdates.length !== 1 ? 's' : ''} today. New entries will be
                      appended.
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                    What did you work on today?
                  </label>
                  <Textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="I spent about 2 hours on PROJ-123 finishing the API integration. Also started looking at PROJ-456 for the dashboard updates..."
                    rows={5}
                    className="w-full resize-none"
                    autoFocus
                  />
                </div>

                {/* Tip */}
                <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                  <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    <span className="font-medium">Tip:</span> Mention ticket numbers (e.g., PROJ-123) and
                    the AI will automatically link your updates. Include time estimates for better
                    tracking.
                  </p>
                </div>
              </motion.div>
            )}

            {step === 'review' && parseResult && (
              <motion.div
                key="review"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                {/* AI response message */}
                {parseResult.aiResponse && (
                  <div className="flex items-start gap-3 p-3 bg-surface-50 dark:bg-surface-700/50 rounded-lg">
                    <div className="p-1.5 rounded-full bg-primary-100 dark:bg-primary-900/50">
                      <Sparkles className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <p className="text-sm text-surface-700 dark:text-surface-300">
                      {parseResult.aiResponse}
                    </p>
                  </div>
                )}

                {/* Clarification needed */}
                {parseResult.clarificationNeeded && parseResult.clarificationQuestion && (
                  <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                    <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      {parseResult.clarificationQuestion}
                    </p>
                  </div>
                )}

                {/* Select all / Deselect all */}
                {parseResult.parsedUpdates.length > 1 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSelectAll}
                      className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
                    >
                      Select all
                    </button>
                    <span className="text-surface-300 dark:text-surface-600">|</span>
                    <button
                      onClick={handleDeselectAll}
                      className="text-xs text-surface-500 hover:underline"
                    >
                      Deselect all
                    </button>
                  </div>
                )}

                {/* Parsed updates list */}
                <div className="space-y-3">
                  {parseResult.parsedUpdates.map((update, index) => (
                    <ParsedUpdateItem
                      key={index}
                      update={update}
                      index={index}
                      isSelected={selectedIndices.has(index)}
                      onToggle={() => handleToggleUpdate(index)}
                    />
                  ))}
                </div>

                {/* No updates parsed */}
                {parseResult.parsedUpdates.length === 0 && (
                  <div className="text-center py-8">
                    <AlertCircle className="w-12 h-12 text-surface-300 dark:text-surface-600 mx-auto mb-3" />
                    <p className="text-surface-600 dark:text-surface-400">
                      No ticket updates could be parsed from your input.
                    </p>
                    <Button variant="outline" onClick={handleBack} className="mt-4">
                      Try Again
                    </Button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-900/50">
          <div className="flex items-center justify-end gap-3">
            {step === 'input' ? (
              <>
                <Button variant="ghost" onClick={handleClose} disabled={isParsing}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitInput}
                  disabled={!inputValue.trim() || isParsing}
                  isLoading={isParsing}
                  leftIcon={!isParsing ? <Send className="w-4 h-4" /> : undefined}
                >
                  {isParsing ? 'Processing...' : 'Submit Progress'}
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={handleRejectAll} disabled={isSubmitting}>
                  Reject All
                </Button>
                <Button
                  onClick={handleAcceptSelected}
                  disabled={selectedIndices.size === 0 || isSubmitting}
                  isLoading={isAccepting}
                  leftIcon={!isAccepting ? <CheckCircle className="w-4 h-4" /> : undefined}
                >
                  {isAccepting
                    ? 'Applying...'
                    : `Accept Selected (${selectedIndices.size})`}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DailyProgressModal;
