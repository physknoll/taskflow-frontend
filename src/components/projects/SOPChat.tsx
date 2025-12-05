'use client';

import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { useSOPAgent } from '@/hooks/useSOPAgent';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Send,
  Loader2,
  Bot,
  User,
  Sparkles,
  AlertCircle,
  BookOpen,
  CheckCircle,
  FileText,
  ArrowLeft,
} from 'lucide-react';

interface SOPChatProps {
  onSOPCreated: (guidelineId: string, guidelineName: string) => void;
  onCancel: () => void;
}

export function SOPChat({ onSOPCreated, onCancel }: SOPChatProps) {
  const {
    messages,
    draft,
    generatedContent,
    isLoading,
    isSending,
    isConfirming,
    showConfirmation,
    canConfirm,
    error,
    phase,
    createdGuideline,
    startSession,
    sendMessage,
    confirmAndSave,
    resetSession,
  } = useSOPAgent();

  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Check if we have any user messages
  const hasUserMessages = messages.some((msg) => msg.role === 'user');

  // Watch for SOP creation
  useEffect(() => {
    if (createdGuideline) {
      onSOPCreated(createdGuideline.id, createdGuideline.name);
    }
  }, [createdGuideline, onSOPCreated]);

  // Start session on mount
  useEffect(() => {
    startSession();
    return () => {
      resetSession();
    };
  }, []);

  // Auto-scroll
  useEffect(() => {
    if (hasUserMessages) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, showConfirmation, hasUserMessages]);

  // Focus input
  useEffect(() => {
    if (!isSending && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSending, hasUserMessages]);

  const handleSend = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isSending) return;

    setInput('');
    await sendMessage(trimmedInput);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleConfirm = async () => {
    try {
      const result = await confirmAndSave();
      onSOPCreated(result.guideline.id, result.guideline.name);
    } catch {
      // Error handled in hook
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-surface-500 dark:text-surface-400">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-4">
          <BookOpen className="w-6 h-6 text-white animate-pulse" />
        </div>
        <p className="text-sm">Starting SOP assistant...</p>
      </div>
    );
  }

  // Error state
  if (error && messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-surface-500 dark:text-surface-400">
        <AlertCircle className="w-8 h-8 mb-4 text-red-500" />
        <p className="text-sm text-red-600 dark:text-red-400 mb-4">{error}</p>
        <Button variant="outline" onClick={() => startSession()}>
          Try Again
        </Button>
      </div>
    );
  }

  // Welcome state
  if (!hasUserMessages) {
    return (
      <div className="flex flex-col h-full">
        {/* Back button */}
        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 text-sm text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 mb-4 self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to project creation
        </button>

        <div className="flex-1 flex flex-col items-center justify-center px-6 py-4">
          {/* Icon */}
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/20">
            <BookOpen className="w-7 h-7 text-white" />
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-1.5">
            Create a New SOP
          </h3>
          <p className="text-sm text-surface-500 dark:text-surface-400 text-center max-w-md mb-5">
            Describe what kind of project workflow you want to document and I'll help create a reusable SOP.
          </p>

          {/* Suggestion chips */}
          <div className="flex flex-wrap justify-center gap-2 mb-5">
            <div className="px-3 py-1.5 rounded-full bg-surface-100 dark:bg-surface-700 text-xs text-surface-600 dark:text-surface-400">
              YouTube video production
            </div>
            <div className="px-3 py-1.5 rounded-full bg-surface-100 dark:bg-surface-700 text-xs text-surface-600 dark:text-surface-400">
              Marketing campaign
            </div>
            <div className="px-3 py-1.5 rounded-full bg-surface-100 dark:bg-surface-700 text-xs text-surface-600 dark:text-surface-400">
              Website redesign
            </div>
          </div>

          {/* Input */}
          <div className="w-full max-w-lg">
            <div className="relative">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g., I want to create an SOP for YouTube video production with scripting, filming, editing, and publishing steps."
                disabled={isSending}
                className="pr-12 h-11"
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isSending}
                size="icon-sm"
                className="absolute right-1.5 top-1/2 -translate-y-1/2"
              >
                {isSending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="mt-2 text-xs text-surface-400 dark:text-surface-500 text-center">
              Press Enter to send
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Chat state
  return (
    <div className="flex flex-col h-full">
      {/* Back button */}
      <button
        onClick={onCancel}
        className="flex items-center gap-1.5 text-sm text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 mb-2 self-start flex-shrink-0"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to project creation
      </button>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-1 py-2 space-y-4 min-h-0">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                msg.role === 'user'
                  ? 'bg-primary-100 dark:bg-primary-900/50'
                  : 'bg-gradient-to-br from-emerald-500 to-teal-500'
              }`}
            >
              {msg.role === 'user' ? (
                <User className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              ) : (
                <BookOpen className="w-4 h-4 text-white" />
              )}
            </div>

            {/* Message Bubble */}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-primary-600 text-white rounded-br-md'
                  : 'bg-surface-100 dark:bg-surface-700 text-surface-900 dark:text-white rounded-bl-md'
              }`}
            >
              {msg.role === 'user' ? (
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              ) : (
                <div className="text-sm prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isSending && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-500">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <div className="bg-surface-100 dark:bg-surface-700 rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1.5">
                <div
                  className="w-2 h-2 bg-surface-400 dark:bg-surface-500 rounded-full animate-bounce"
                  style={{ animationDelay: '0ms' }}
                />
                <div
                  className="w-2 h-2 bg-surface-400 dark:bg-surface-500 rounded-full animate-bounce"
                  style={{ animationDelay: '150ms' }}
                />
                <div
                  className="w-2 h-2 bg-surface-400 dark:bg-surface-500 rounded-full animate-bounce"
                  style={{ animationDelay: '300ms' }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Generated Content Preview */}
        {phase === 'reviewing' && generatedContent && (
          <div className="bg-surface-50 dark:bg-surface-800 rounded-xl p-4 border border-surface-200 dark:border-surface-700">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-surface-200 dark:border-surface-700">
              <FileText className="w-4 h-4 text-emerald-500" />
              <span className="text-sm font-medium text-surface-900 dark:text-white">
                Generated SOP Preview
              </span>
            </div>
            <div className="max-h-64 overflow-y-auto prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown>{generatedContent}</ReactMarkdown>
            </div>
          </div>
        )}

        {/* Confirmation Card */}
        {showConfirmation && (
          <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-surface-900 dark:text-white mb-1">
                  Ready to save?
                </h4>
                <p className="text-sm text-surface-600 dark:text-surface-400 mb-3">
                  The SOP looks good! Click confirm to save it as a reusable guideline.
                </p>
                {draft.name && (
                  <p className="text-sm text-surface-500 dark:text-surface-400 mb-3">
                    <span className="font-medium">Name:</span> {draft.name}
                  </p>
                )}
                <Button
                  onClick={handleConfirm}
                  isLoading={isConfirming}
                  disabled={!canConfirm}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {isConfirming ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  )}
                  Confirm & Save SOP
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 border-t border-surface-200 dark:border-surface-700 pt-4 bg-white dark:bg-surface-800">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                showConfirmation
                  ? "Ask me to make changes or confirm to save..."
                  : 'Add more details or ask questions...'
              }
              disabled={isSending || isConfirming}
              className="pr-12"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <Sparkles className="w-4 h-4 text-surface-300 dark:text-surface-600" />
            </div>
          </div>
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isSending || isConfirming}
            size="icon"
            className="flex-shrink-0"
          >
            {isSending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

