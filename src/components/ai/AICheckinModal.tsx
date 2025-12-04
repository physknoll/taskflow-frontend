'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';
import { useAICheckinStore } from '@/stores/aiCheckinStore';
import { IAICheckinResponse } from '@/types';
import {
  Bot,
  Sun,
  Moon,
  Send,
  Loader2,
  CheckCircle,
  FileText,
  Clock,
  Sparkles,
} from 'lucide-react';

export function AICheckinModal() {
  const {
    currentCheckin,
    isModalOpen,
    isSubmitting,
    submitResponses,
    dismissCheckin,
  } = useAICheckinStore();

  const [responses, setResponses] = useState<Record<string, string>>({});

  const isBlocking = currentCheckin?.isBlocking ?? false;

  // Reset responses when modal opens with new check-in
  useEffect(() => {
    if (currentCheckin && isModalOpen) {
      const initialResponses: Record<string, string> = {};
      currentCheckin.questions?.forEach((q) => {
        initialResponses[q.id] = '';
      });
      setResponses(initialResponses);
    }
  }, [currentCheckin, isModalOpen]);

  // Prevent escape key if blocking - MUST be before early return
  useEffect(() => {
    if (!isModalOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isBlocking) {
        dismissCheckin();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen, isBlocking, dismissCheckin]);

  // Early return AFTER all hooks
  if (!isModalOpen || !currentCheckin) return null;

  const isMorning = currentCheckin.title?.toLowerCase().includes('morning') || 
                    currentCheckin.title?.includes('☀️');
  
  const questions = currentCheckin.questions || [];

  const handleResponseChange = (questionId: string, value: string) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleSubmit = async () => {
    const formattedResponses: IAICheckinResponse[] = Object.entries(responses)
      .filter(([_, answer]) => answer.trim() !== '')
      .map(([questionId, answer]) => ({
        questionId,
        answer: answer.trim(),
      }));

    // Validate required fields
    const requiredQuestions = questions.filter((q) => q.required);
    const missingRequired = requiredQuestions.filter(
      (q) => !responses[q.id]?.trim()
    );

    if (missingRequired.length > 0) {
      // TODO: Show validation error
      return;
    }

    await submitResponses(formattedResponses);
  };

  const canSubmit = questions
    .filter((q) => q.required)
    .every((q) => responses[q.id]?.trim());

  // Prevent closing on backdrop click if blocking
  const handleBackdropClick = () => {
    if (!isBlocking) {
      dismissCheckin();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop with gradient */}
      <div
        className={cn(
          'absolute inset-0 backdrop-blur-md animate-fade-in',
          isMorning 
            ? 'bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-rose-500/20' 
            : 'bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-blue-500/20'
        )}
        onClick={handleBackdropClick}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl mx-4 animate-scale-in">
        {/* Glow effect */}
        <div
          className={cn(
            'absolute -inset-1 rounded-3xl blur-xl opacity-50',
            isMorning
              ? 'bg-gradient-to-br from-amber-400 to-orange-500'
              : 'bg-gradient-to-br from-indigo-400 to-purple-500'
          )}
        />

        {/* Card */}
        <div className="relative bg-white dark:bg-surface-800 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header with gradient */}
          <div
            className={cn(
              'px-8 py-6',
              isMorning
                ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                : 'bg-gradient-to-r from-indigo-500 to-purple-500'
            )}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                {isMorning ? (
                  <Sun className="h-8 w-8 text-white" />
                ) : (
                  <Moon className="h-8 w-8 text-white" />
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {currentCheckin.title}
                </h2>
                <div className="flex items-center gap-2 mt-1 text-white/80">
                  <Bot className="h-4 w-4" />
                  <span className="text-sm">AI Project Manager</span>
                </div>
              </div>
            </div>
          </div>

          {/* Message */}
          <div className="px-8 py-6 border-b border-surface-200 dark:border-surface-700">
            <div className="flex gap-4">
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
                  isMorning
                    ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400'
                    : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400'
                )}
              >
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-surface-700 dark:text-surface-300 whitespace-pre-line leading-relaxed">
                  {currentCheckin.message}
                </p>
              </div>
            </div>
          </div>

          {/* Questions */}
          <div className="px-8 py-6 space-y-6 max-h-[40vh] overflow-y-auto">
            {questions.map((question, index) => (
              <div key={question.id} className="space-y-2">
                <label className="flex items-start gap-2">
                  <span
                    className={cn(
                      'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5',
                      isMorning
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400'
                        : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-400'
                    )}
                  >
                    {index + 1}
                  </span>
                  <span className="font-medium text-surface-900 dark:text-white">
                    {question.question}
                    {question.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </span>
                </label>
                <div className="ml-8">
                  <Textarea
                    value={responses[question.id] || ''}
                    onChange={(e) =>
                      handleResponseChange(question.id, e.target.value)
                    }
                    placeholder={question.placeholder}
                    rows={3}
                    className={cn(
                      'w-full resize-none transition-all',
                      responses[question.id]?.trim() &&
                        'border-emerald-300 dark:border-emerald-700'
                    )}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="px-8 py-6 bg-surface-50 dark:bg-surface-900/50 border-t border-surface-200 dark:border-surface-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-surface-500 dark:text-surface-400">
                <Clock className="h-4 w-4" />
                <span>Your responses help keep your team informed</span>
              </div>
              <div className="flex items-center gap-3">
                {!isBlocking && (
                  <Button
                    variant="ghost"
                    onClick={dismissCheckin}
                    disabled={isSubmitting}
                  >
                    Skip for now
                  </Button>
                )}
                <Button
                  onClick={handleSubmit}
                  disabled={!canSubmit || isSubmitting}
                  className={cn(
                    isMorning
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600'
                      : 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600'
                  )}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit Check-in
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Success result modal shown after AI processes the check-in
export function AICheckinResultModal() {
  const { processingResult, showResultModal, hideResult } = useAICheckinStore();

  // Handle escape key to close
  useEffect(() => {
    if (!showResultModal) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        hideResult();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showResultModal, hideResult]);

  // Early return AFTER all hooks
  if (!showResultModal || !processingResult) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={hideResult}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg mx-4 bg-white dark:bg-surface-800 rounded-2xl shadow-2xl animate-scale-in overflow-hidden">
        {/* Success header */}
        <div className="px-8 py-6 bg-gradient-to-r from-emerald-500 to-teal-500">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Check-in Complete!</h2>
              <p className="text-white/80 text-sm mt-1">
                AI has updated your tickets
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="px-8 py-6">
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-surface-50 dark:bg-surface-900/50 rounded-xl">
              <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                {processingResult.ticketsUpdated}
              </p>
              <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">
                Tickets Updated
              </p>
            </div>
            <div className="text-center p-4 bg-surface-50 dark:bg-surface-900/50 rounded-xl">
              <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                {processingResult.tasksCompleted}
              </p>
              <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">
                Tasks Completed
              </p>
            </div>
            <div className="text-center p-4 bg-surface-50 dark:bg-surface-900/50 rounded-xl">
              <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                {processingResult.notesAdded}
              </p>
              <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">
                Notes Added
              </p>
            </div>
          </div>

          {/* Summary */}
          <div className="p-4 bg-surface-50 dark:bg-surface-900/50 rounded-xl">
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-surface-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-surface-900 dark:text-white mb-1">
                  Summary
                </p>
                <p className="text-sm text-surface-600 dark:text-surface-400">
                  {processingResult.summary}
                </p>
              </div>
            </div>
          </div>

          {/* Details */}
          {processingResult.details && processingResult.details.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-sm font-medium text-surface-700 dark:text-surface-300">
                Actions taken:
              </p>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {processingResult.details.map((detail, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-surface-50 dark:bg-surface-900/50 rounded-lg"
                  >
                    <p className="font-medium text-sm text-surface-900 dark:text-white">
                      {detail.ticketNumber}
                    </p>
                    <ul className="mt-1 space-y-1">
                      {detail.actions.map((action, actionIdx) => (
                        <li
                          key={actionIdx}
                          className="text-xs text-surface-500 dark:text-surface-400 flex items-center gap-2"
                        >
                          <CheckCircle className="h-3 w-3 text-emerald-500" />
                          {action.type === 'complete_task' && (
                            <span>Completed: {action.taskTitle}</span>
                          )}
                          {action.type === 'add_note' && (
                            <span>Added note: {action.note}</span>
                          )}
                          {action.type === 'log_time' && (
                            <span>Logged {action.minutes} minutes</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t border-surface-200 dark:border-surface-700">
          <Button onClick={hideResult} className="w-full">
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}

