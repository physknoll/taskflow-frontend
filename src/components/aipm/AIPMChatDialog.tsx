'use client';

import { useState, useRef, useEffect } from 'react';
import { useAIPMCheckIn } from '@/hooks/useAIPM';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/lib/utils';
import {
  Bot,
  User,
  Send,
  Loader2,
  X,
  Sparkles,
  Clock,
  AlertCircle,
  CheckCircle2,
  MessageSquare,
} from 'lucide-react';

export function AIPMChatDialog() {
  const {
    activeSession,
    isCheckInModalOpen,
    isSendingMessage,
    closeCheckIn,
    sendMessage,
    skipCheckIn,
  } = useAIPMCheckIn();

  const [input, setInput] = useState('');
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);
  const [skipReason, setSkipReason] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeSession?.messages]);

  // Focus input after AI responds
  useEffect(() => {
    if (!isSendingMessage && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSendingMessage]);

  // Handle escape key
  useEffect(() => {
    if (!isCheckInModalOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showSkipConfirm) {
          setShowSkipConfirm(false);
        } else {
          closeCheckIn();
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isCheckInModalOpen, showSkipConfirm, closeCheckIn]);

  if (!isCheckInModalOpen || !activeSession) return null;

  const handleSend = async () => {
    if (!input.trim() || isSendingMessage) return;
    const message = input.trim();
    setInput('');
    await sendMessage(message);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSkip = async () => {
    if (!skipReason.trim()) return;
    await skipCheckIn(skipReason);
    setShowSkipConfirm(false);
    setSkipReason('');
  };

  const isCompleted = activeSession.status === 'completed';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop with gradient */}
      <div
        className={cn(
          'absolute inset-0 backdrop-blur-md animate-fade-in',
          'bg-gradient-to-br from-primary-500/10 via-accent-500/5 to-surface-900/50'
        )}
        onClick={closeCheckIn}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-2xl animate-scale-in">
        {/* Glow effect */}
        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-primary-500/30 via-accent-500/20 to-primary-500/30 blur-xl opacity-50" />

        {/* Card */}
        <div className="relative bg-white dark:bg-surface-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
          {/* Header */}
          <div className="px-6 py-4 bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">AI Project Manager</h2>
                <div className="flex items-center gap-2 text-white/80 text-sm">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Daily Check-in</span>
                  {isCompleted && (
                    <span className="px-2 py-0.5 rounded-full bg-white/20 text-xs">
                      Completed
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={closeCheckIn}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X className="h-5 w-5 text-white" />
            </button>
          </div>

          {/* Context snapshot */}
          {activeSession.contextSnapshot && (
            <div className="px-6 py-3 border-b border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-900/50 shrink-0">
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary-500" />
                  <span className="text-surface-600 dark:text-surface-400">
                    {activeSession.contextSnapshot.assignedTicketCount} assigned
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-surface-600 dark:text-surface-400">
                    {activeSession.contextSnapshot.ticketsInProgress} in progress
                  </span>
                </div>
                {activeSession.contextSnapshot.overdueTicketCount > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="text-red-600 dark:text-red-400">
                      {activeSession.contextSnapshot.overdueTicketCount} overdue
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-6 space-y-4 min-h-[300px]"
          >
            {activeSession.messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  'flex gap-3',
                  message.role === 'user' && 'flex-row-reverse'
                )}
              >
                {message.role === 'aipm' ? (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shrink-0 shadow-lg shadow-primary-500/25">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-surface-200 dark:bg-surface-700 flex items-center justify-center shrink-0">
                    <User className="h-5 w-5 text-surface-600 dark:text-surface-400" />
                  </div>
                )}

                <div
                  className={cn(
                    'rounded-2xl px-4 py-3 max-w-[80%]',
                    message.role === 'aipm'
                      ? 'bg-surface-100 dark:bg-surface-700/50 text-surface-900 dark:text-surface-100'
                      : 'bg-gradient-to-r from-primary-500 to-primary-600 text-white'
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">
                    {message.content}
                  </p>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isSendingMessage && (
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shrink-0 shadow-lg shadow-primary-500/25">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div className="rounded-2xl px-4 py-3 bg-surface-100 dark:bg-surface-700/50">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-surface-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-surface-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-surface-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input area */}
          {!isCompleted && (
            <div className="px-6 py-4 border-t border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-900/50 shrink-0">
              {showSkipConfirm ? (
                <div className="space-y-3">
                  <p className="text-sm text-surface-600 dark:text-surface-400">
                    Please provide a reason for skipping this check-in:
                  </p>
                  <textarea
                    value={skipReason}
                    onChange={(e) => setSkipReason(e.target.value)}
                    placeholder="e.g., In meetings all day, will update tomorrow..."
                    className="w-full px-4 py-3 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
                    rows={2}
                    autoFocus
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowSkipConfirm(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSkip}
                      disabled={!skipReason.trim()}
                    >
                      Skip Check-in
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-end gap-3">
                  <div className="flex-1 relative">
                    <textarea
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Type your response..."
                      disabled={isSendingMessage}
                      className={cn(
                        'w-full px-4 py-3 rounded-xl border border-surface-200 dark:border-surface-700',
                        'bg-white dark:bg-surface-800 text-surface-900 dark:text-white',
                        'resize-none focus:outline-none focus:ring-2 focus:ring-primary-500',
                        'placeholder:text-surface-400 dark:placeholder:text-surface-500',
                        'min-h-[52px] max-h-[120px]'
                      )}
                      rows={1}
                    />
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowSkipConfirm(true)}
                      className="text-surface-500 hover:text-surface-700 dark:hover:text-surface-300"
                    >
                      Skip
                    </Button>
                    <Button
                      onClick={handleSend}
                      disabled={!input.trim() || isSendingMessage}
                      className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700"
                    >
                      {isSendingMessage ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Completed state */}
          {isCompleted && activeSession.analysis && (
            <div className="px-6 py-4 border-t border-surface-200 dark:border-surface-700 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/50">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-emerald-800 dark:text-emerald-300">
                    Check-in Complete
                  </p>
                  <p className="text-sm text-emerald-600 dark:text-emerald-400">
                    {activeSession.analysis.aiSummary}
                  </p>
                </div>
                <Button onClick={closeCheckIn}>
                  Done
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Result modal shown after check-in completion
export function AIPMCheckInResultModal() {
  const { checkInResult, showResultModal, hideResult } = useAIPMCheckIn();

  useEffect(() => {
    if (!showResultModal) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') hideResult();
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showResultModal, hideResult]);

  if (!showResultModal || !checkInResult) return null;

  const sentimentColors = {
    positive: 'from-emerald-500 to-teal-500',
    neutral: 'from-primary-500 to-accent-500',
    negative: 'from-amber-500 to-orange-500',
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={hideResult}
      />

      <div className="relative w-full max-w-lg bg-white dark:bg-surface-800 rounded-2xl shadow-2xl animate-scale-in overflow-hidden">
        {/* Header */}
        <div className={cn(
          'px-8 py-6 bg-gradient-to-r',
          sentimentColors[checkInResult.sentiment]
        )}>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
              <CheckCircle2 className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Check-in Complete!</h2>
              <p className="text-white/80 text-sm mt-1">
                Your progress has been recorded
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-6">
          {/* Summary */}
          <div className="p-4 bg-surface-50 dark:bg-surface-900/50 rounded-xl">
            <div className="flex items-start gap-3">
              <MessageSquare className="h-5 w-5 text-surface-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-surface-900 dark:text-white mb-1">
                  Summary
                </p>
                <p className="text-sm text-surface-600 dark:text-surface-400">
                  {checkInResult.summary}
                </p>
              </div>
            </div>
          </div>
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




