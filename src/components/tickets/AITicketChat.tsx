'use client';

import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { useTicketAgent } from '@/hooks/useTicketAgent';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { CreatedTicketInfo } from '@/types';
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
  Tag,
  FileText,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';

interface AITicketChatProps {
  onTicketCreated: (ticket: CreatedTicketInfo) => void;
  onCancel: () => void;
  defaultProjectId?: string;
  /** SOP ID to attach to the session for enriched ticket creation */
  selectedSOPId?: string | null;
}

export function AITicketChat({ onTicketCreated, onCancel, defaultProjectId, selectedSOPId }: AITicketChatProps) {
  const {
    messages,
    draft,
    isLoading,
    isSending,
    showConfirmation,
    error,
    createdTicket,
    streamingText,
    startSession,
    sendMessage,
    resetSession,
  } = useTicketAgent();

  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Check if we have any user messages (conversation has started)
  const hasUserMessages = (messages || []).some((msg) => msg.role === 'user');

  // Watch for ticket creation
  useEffect(() => {
    if (createdTicket) {
      onTicketCreated(createdTicket);
    }
  }, [createdTicket, onTicketCreated]);

  // Start session on mount or when SOP changes
  useEffect(() => {
    startSession(defaultProjectId, selectedSOPId || undefined);
    return () => {
      resetSession();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultProjectId, selectedSOPId]);

  // Auto-scroll to latest message (only when in chat mode)
  useEffect(() => {
    if (hasUserMessages) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, streamingText, showConfirmation, hasUserMessages]);

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

  const handleConfirm = () => {
    sendMessage('Yes, create it');
  };

  const handleViewTicket = () => {
    if (createdTicket) {
      window.location.href = `/tickets/${createdTicket.id}`;
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
        <p className="text-sm text-red-600 dark:text-red-400 mb-2 text-center max-w-md">{error}</p>
        <p className="text-xs text-surface-400 dark:text-surface-500 mb-4">
          The ticket agent may not be configured yet.
        </p>
        <Button variant="outline" onClick={() => startSession(defaultProjectId)}>
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
            Create a Ticket with AI
          </h3>
          <p className="text-sm text-surface-500 dark:text-surface-400 text-center max-w-md mb-5">
            Describe what needs to be done and I&apos;ll create a detailed ticket with tasks from your SOPs.
          </p>

          {/* Suggestion chips */}
          <div className="flex flex-wrap justify-center gap-2 mb-5">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-100 dark:bg-surface-700 text-xs text-surface-600 dark:text-surface-400">
              <MessageSquare className="w-3 h-3" />
              What needs to be done
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-100 dark:bg-surface-700 text-xs text-surface-600 dark:text-surface-400">
              <Users className="w-3 h-3" />
              Who should do it
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-100 dark:bg-surface-700 text-xs text-surface-600 dark:text-surface-400">
              <Calendar className="w-3 h-3" />
              When it&apos;s due
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-100 dark:bg-surface-700 text-xs text-surface-600 dark:text-surface-400">
              <Tag className="w-3 h-3" />
              Priority level
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
                placeholder="e.g., Edit the product demo video for Acme Corp, assign to Alex, due Friday"
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

        {/* Streaming text */}
        {streamingText && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-primary-500 to-accent-500">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-surface-100 dark:bg-surface-700 text-surface-900 dark:text-white rounded-bl-md">
              <div className="text-sm prose prose-sm dark:prose-invert max-w-none prose-p:my-1">
                <ReactMarkdown>{streamingText}</ReactMarkdown>
              </div>
            </div>
          </div>
        )}

        {/* Typing Indicator */}
        {isSending && !streamingText && (
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

        {/* SOP Badges */}
        {draft.sops && draft.sops.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 py-2">
            <span className="text-xs font-medium text-surface-500 dark:text-surface-400">
              <FileText className="h-3 w-3 inline mr-1" />
              Using SOPs:
            </span>
            {draft.sops.map((sop) => (
              <Badge key={sop.id} variant="secondary" size="sm" className="bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
                {sop.name}
              </Badge>
            ))}
          </div>
        )}

        {/* Confirmation Card */}
        {showConfirmation && draft.title && !createdTicket && (
          <div className="py-2">
            <TicketConfirmationCard
              draft={draft}
              onConfirm={handleConfirm}
              isConfirming={isSending}
            />
          </div>
        )}

        {/* Success State */}
        {createdTicket && (
          <div className="p-4 border border-success-200 dark:border-success-800 rounded-xl bg-success-50 dark:bg-success-900/20">
            <div className="flex items-center gap-2 text-success-700 dark:text-success-300 mb-3">
              <CheckCircle className="h-5 w-5" />
              <span className="font-semibold">Ticket Created!</span>
            </div>
            
            <p className="text-sm text-surface-600 dark:text-surface-400 mb-3">
              <span className="font-mono font-medium">{createdTicket.ticketNumber}</span>: {createdTicket.title}
            </p>
            
            <div className="flex gap-2">
              <Button onClick={handleViewTicket} variant="default" size="sm">
                <ExternalLink className="h-4 w-4 mr-2" />
                View Ticket
              </Button>
              <Button onClick={onCancel} variant="outline" size="sm">
                Close
              </Button>
            </div>
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      {!createdTicket && (
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
                    ? "Ask me to make changes or type 'yes' to confirm..."
                    : 'Add more details or ask questions...'
                }
                disabled={isSending}
                className="pr-12"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <Sparkles className="w-4 h-4 text-surface-300 dark:text-surface-600" />
              </div>
            </div>
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isSending}
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
      )}
    </div>
  );
}

// Ticket Confirmation Card Component
interface TicketConfirmationCardProps {
  draft: any;
  onConfirm: () => void;
  isConfirming: boolean;
}

function TicketConfirmationCard({ draft, onConfirm, isConfirming }: TicketConfirmationCardProps) {
  return (
    <div className="border border-primary-200 dark:border-primary-800 rounded-xl bg-primary-50/50 dark:bg-primary-900/20 overflow-hidden">
      <div className="px-4 py-3 border-b border-primary-200 dark:border-primary-800 bg-primary-100/50 dark:bg-primary-900/30">
        <div className="flex items-center gap-2 text-primary-700 dark:text-primary-300">
          <Sparkles className="h-4 w-4" />
          <span className="font-semibold text-sm">Ticket Preview</span>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-surface-900 dark:text-white mb-2">{draft.title}</h3>
        
        {draft.description && (
          <p className="text-sm text-surface-600 dark:text-surface-400 mb-3 line-clamp-2">
            {draft.description}
          </p>
        )}
        
        <div className="flex flex-wrap gap-3 text-xs mb-4">
          {draft.type && (
            <span className="flex items-center gap-1 text-surface-600 dark:text-surface-400">
              <Tag className="h-3 w-3" />
              {draft.type}
            </span>
          )}
          {draft.priority && (
            <Badge size="sm" className={`priority-${draft.priority}`}>
              {draft.priority}
            </Badge>
          )}
          {draft.assigneeName && (
            <span className="flex items-center gap-1 text-surface-600 dark:text-surface-400">
              <User className="h-3 w-3" />
              {draft.assigneeName}
            </span>
          )}
          {draft.projectName && (
            <span className="flex items-center gap-1 text-surface-600 dark:text-surface-400">
              <FileText className="h-3 w-3" />
              {draft.projectName}
            </span>
          )}
          {draft.dueDate && (
            <span className="flex items-center gap-1 text-surface-600 dark:text-surface-400">
              <Calendar className="h-3 w-3" />
              {new Date(draft.dueDate).toLocaleDateString()}
            </span>
          )}
        </div>

        <Button onClick={onConfirm} disabled={isConfirming} className="w-full">
          {isConfirming ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <CheckCircle className="h-4 w-4 mr-2" />
          )}
          Create Ticket
        </Button>
      </div>
    </div>
  );
}
