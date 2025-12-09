'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Mic,
  MicOff,
  Paperclip,
  Sparkles,
  ChevronDown,
  AlertCircle,
  Database,
  FileText,
} from 'lucide-react';
import { useAIPMSession } from '@/hooks/useAIPMSession';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { cn } from '@/lib/utils';
import type { ISuggestedAction, ContextMode } from '@/types/aipm';
import { scaleIn } from '@/lib/animations';

interface ProactiveChatInterfaceProps {
  showDailyUpdatePrompt?: boolean;
  className?: string;
}

const contextOptions: Array<{
  value: ContextMode;
  label: string;
  icon: typeof Sparkles;
  description: string;
}> = [
  {
    value: 'general',
    label: 'General Assistant',
    icon: Sparkles,
    description: 'General help and task management',
  },
  {
    value: 'client_kb',
    label: 'Client Knowledge Base',
    icon: Database,
    description: 'Search client documents and history',
  },
  {
    value: 'internal_docs',
    label: 'Internal Docs',
    icon: FileText,
    description: 'Search internal documentation',
  },
];

function getPlaceholder(contextMode: ContextMode, showDailyUpdatePrompt: boolean): string {
  if (showDailyUpdatePrompt) {
    return "Type 'Log 2hrs on Acme project', ask a question, or just say hi...";
  }
  switch (contextMode) {
    case 'client_kb':
      return 'Ask about client documents, brand guidelines, or project history...';
    case 'internal_docs':
      return 'Search internal documentation, processes, or team knowledge...';
    default:
      return 'Type a message or ask your AI assistant anything...';
  }
}

export function ProactiveChatInterface({
  showDailyUpdatePrompt = true,
  className,
}: ProactiveChatInterfaceProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);

  const {
    messages,
    isLoading,
    isAITyping,
    isSending,
    isExecuting,
    contextMode,
    isConnected,
    error,
    initData,
    initializeSession,
    sendMessage,
    executeAction,
    changeContextMode,
  } = useAIPMSession();

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAITyping]);

  // Auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  // Send message handler
  const handleSend = useCallback(async () => {
    if (!inputValue.trim() || isSending) return;

    const message = inputValue.trim();
    setInputValue('');
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }

    await sendMessage(message);
  }, [inputValue, isSending, sendMessage]);

  // Keyboard handler
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Action click handler
  const handleActionClick = async (action: ISuggestedAction, accepted: boolean) => {
    await executeAction(action.id, accepted);
  };

  // Context mode change handler
  const handleContextChange = (mode: ContextMode) => {
    changeContextMode(mode);
    setShowContextMenu(false);
  };

  const currentContext = contextOptions.find((o) => o.value === contextMode);

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Loading state */}
        {isLoading && messages.length === 0 && !error && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-surface-500 dark:text-surface-400">
                Preparing your briefing...
              </p>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-surface-900 dark:text-white font-medium mb-2">
                Unable to connect to AI assistant
              </p>
              <p className="text-surface-500 dark:text-surface-400 text-sm mb-4">
                {error instanceof Error ? error.message : 'Please try again later'}
              </p>
              <button
                onClick={() => initializeSession()}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Messages */}
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              onActionClick={handleActionClick}
              isExecuting={isExecuting}
              conversationId={initData?.sessionId}
            />
          ))}
        </AnimatePresence>

        {/* AI Typing Indicator */}
        {isAITyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="bg-surface-100 dark:bg-surface-700 rounded-2xl rounded-tl-sm px-4 py-3">
              <TypingIndicator />
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-surface-200 dark:border-surface-700 p-4 bg-white dark:bg-surface-800 relative z-10">
        {/* Context Switcher */}
        <div className="flex items-center gap-2 mb-3">
          <div className="relative">
            <button
              onClick={() => setShowContextMenu(!showContextMenu)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-100 dark:bg-surface-700 text-sm font-medium hover:bg-surface-200 dark:hover:bg-surface-600 transition-colors"
            >
              {currentContext && (
                <>
                  <currentContext.icon className="w-3.5 h-3.5 text-primary-500" />
                  <span className="text-surface-700 dark:text-surface-200">
                    {currentContext.label}
                  </span>
                </>
              )}
              <ChevronDown
                className={cn(
                  'w-3.5 h-3.5 text-surface-500 transition-transform',
                  showContextMenu && 'rotate-180'
                )}
              />
            </button>

            {/* Context Menu Dropdown */}
            <AnimatePresence>
              {showContextMenu && (
                <motion.div
                  variants={scaleIn}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="absolute bottom-full left-0 mb-2 bg-white dark:bg-surface-800 rounded-lg shadow-lg border border-surface-200 dark:border-surface-700 overflow-hidden z-10 min-w-[220px]"
                >
                  {contextOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleContextChange(option.value)}
                      className={cn(
                        'flex items-start gap-3 px-4 py-3 text-sm w-full hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors text-left',
                        contextMode === option.value &&
                          'bg-primary-50 dark:bg-primary-900/30'
                      )}
                    >
                      <option.icon
                        className={cn(
                          'w-4 h-4 mt-0.5 flex-shrink-0',
                          contextMode === option.value
                            ? 'text-primary-600 dark:text-primary-400'
                            : 'text-surface-500'
                        )}
                      />
                      <div>
                        <div
                          className={cn(
                            'font-medium',
                            contextMode === option.value
                              ? 'text-primary-700 dark:text-primary-300'
                              : 'text-surface-900 dark:text-white'
                          )}
                        >
                          {option.label}
                        </div>
                        <div className="text-xs text-surface-500 dark:text-surface-400">
                          {option.description}
                        </div>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Connection Status */}
          {!isConnected && (
            <span className="text-xs text-amber-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Reconnecting...
            </span>
          )}
        </div>

        {/* Input Box */}
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={getPlaceholder(contextMode, showDailyUpdatePrompt)}
              rows={1}
              className="w-full resize-none rounded-xl border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder:text-surface-400 dark:placeholder:text-surface-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading && messages.length === 0}
            />
            <button
              onClick={() => setIsRecording(!isRecording)}
              className={cn(
                'absolute right-3 bottom-3 p-1 rounded-full transition-colors',
                isRecording
                  ? 'text-red-500 bg-red-50 dark:bg-red-900/30'
                  : 'text-surface-400 hover:text-surface-600 dark:hover:text-surface-300'
              )}
              title={isRecording ? 'Stop recording' : 'Voice input'}
            >
              {isRecording ? (
                <MicOff className="w-4 h-4" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isSending}
            className={cn(
              'p-3 rounded-xl transition-all',
              inputValue.trim() && !isSending
                ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-lg hover:shadow-xl'
                : 'bg-surface-100 dark:bg-surface-700 text-surface-400 cursor-not-allowed'
            )}
          >
            {isSending ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProactiveChatInterface;

