'use client';

import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { useProjectAgent } from '@/hooks/useProjectAgent';
import { ProjectConfirmationCard } from './ProjectConfirmationCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { IProject, ITicket } from '@/types';
import {
  Send,
  Loader2,
  Bot,
  User,
  Sparkles,
  AlertCircle,
  MessageSquare,
  Users,
  Calendar,
  Target,
} from 'lucide-react';

interface AIProjectChatProps {
  onProjectCreated: (project: IProject, tickets: ITicket[]) => void;
  onCancel: () => void;
  selectedGuidelineId?: string | null;
}

export function AIProjectChat({ onProjectCreated, onCancel, selectedGuidelineId }: AIProjectChatProps) {
  const {
    messages,
    draft,
    validationErrors,
    isLoading,
    isSending,
    isConfirming,
    showConfirmation,
    canConfirm,
    error,
    createdProject,
    createdTickets,
    startSession,
    sendMessage,
    confirmAndCreate,
    resetSession,
  } = useProjectAgent();

  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Check if we have any user messages (conversation has started)
  const hasUserMessages = (messages || []).some((msg) => msg.role === 'user');

  // Watch for project creation (can happen via chat message like "confirm")
  useEffect(() => {
    if (createdProject) {
      // Project was created - close the modal
      onProjectCreated(createdProject as any, createdTickets as any);
    }
  }, [createdProject, createdTickets, onProjectCreated]);

  // Start session on mount or when guideline changes
  useEffect(() => {
    startSession(selectedGuidelineId || undefined);
    return () => {
      resetSession();
    };
  }, [selectedGuidelineId]);

  // Auto-scroll to latest message (only when in chat mode)
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
      const result = await confirmAndCreate();
      onProjectCreated(result.project, result.tickets);
    } catch {
      // Error handled in hook
    }
  };

  // Loading state while starting session
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] text-surface-500 dark:text-surface-400">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center mb-4">
          <Bot className="w-6 h-6 text-white animate-pulse" />
        </div>
        <p className="text-sm">Starting AI assistant...</p>
      </div>
    );
  }

  // Error state
  if (error && (messages || []).length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] text-surface-500 dark:text-surface-400">
        <AlertCircle className="w-8 h-8 mb-4 text-red-500" />
        <p className="text-sm text-red-600 dark:text-red-400 mb-4">{error}</p>
        <Button variant="outline" onClick={() => startSession()}>
          Try Again
        </Button>
      </div>
    );
  }

  // WELCOME STATE - No user messages yet
  if (!hasUserMessages) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-4">
          {/* Icon */}
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center mb-4 shadow-lg shadow-primary-500/20">
            <Bot className="w-7 h-7 text-white" />
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-1.5">
            Create a Project with AI
          </h3>
          <p className="text-sm text-surface-500 dark:text-surface-400 text-center max-w-md mb-5">
            Describe your project in natural language and I will help you set it up with all the details and tickets.
          </p>

          {/* Suggestion chips */}
          <div className="flex flex-wrap justify-center gap-2 mb-5">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-100 dark:bg-surface-700 text-xs text-surface-600 dark:text-surface-400">
              <MessageSquare className="w-3 h-3" />
              What it is about
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-100 dark:bg-surface-700 text-xs text-surface-600 dark:text-surface-400">
              <Target className="w-3 h-3" />
              Tasks to complete
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-100 dark:bg-surface-700 text-xs text-surface-600 dark:text-surface-400">
              <Users className="w-3 h-3" />
              Who should work on it
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-100 dark:bg-surface-700 text-xs text-surface-600 dark:text-surface-400">
              <Calendar className="w-3 h-3" />
              Any deadlines
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
                placeholder="e.g., Create a marketing campaign for Acme Corp with landing pages, ads, and emails. Sarah leads, due in 3 weeks."
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

  // CHAT STATE - User has sent at least one message
  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {(messages || []).map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                msg.role === 'user'
                  ? 'bg-primary-100 dark:bg-primary-900/50'
                  : 'bg-gradient-to-br from-primary-500 to-accent-500'
              }`}
            >
              {msg.role === 'user' ? (
                <User className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              ) : (
                <Bot className="w-4 h-4 text-white" />
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
            <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-primary-500 to-accent-500">
              <Bot className="w-4 h-4 text-white" />
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

        {/* Confirmation Card */}
        {showConfirmation && draft && (
          <div className="py-2">
            <ProjectConfirmationCard
              draft={draft}
              validationErrors={validationErrors}
              onConfirm={handleConfirm}
              isConfirming={isConfirming}
              canConfirm={canConfirm}
            />
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 border-t border-surface-200 dark:border-surface-700 p-4 bg-white dark:bg-surface-800">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                showConfirmation
                  ? "Ask me to make changes or type 'create' to confirm..."
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
