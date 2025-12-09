'use client';

import React, { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Mic,
  MicOff,
  Sparkles,
  ChevronDown,
  AlertCircle,
  Database,
  Building2,
  Search,
} from 'lucide-react';
import { useAIPMSession } from '@/hooks/useAIPMSession';
import { useClients } from '@/hooks/useClients';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { ToolIndicator } from './ToolIndicator';
import { cn } from '@/lib/utils';
import type { ISuggestedAction, ChatMode } from '@/types/aipm';
import type { ResumeConversationResponse } from '@/types';
import { scaleIn } from '@/lib/animations';

interface ProactiveChatInterfaceProps {
  showDailyUpdatePrompt?: boolean;
  className?: string;
}

// Exposed methods for parent components via ref
export interface ProactiveChatInterfaceHandle {
  loadConversation: (result: ResumeConversationResponse) => void;
}

const chatModeOptions: Array<{
  value: ChatMode;
  label: string;
  icon: typeof Sparkles;
  description: string;
  requiresClientId: boolean;
}> = [
  {
    value: 'aipm',
    label: 'AI Project Manager',
    icon: Sparkles,
    description: 'Your smart assistant that knows your tasks and priorities',
    requiresClientId: false,
  },
  {
    value: 'client_kb',
    label: 'Client Knowledge Base',
    icon: Database,
    description: 'Search client documents and brand guidelines',
    requiresClientId: true,
  },
];

function getPlaceholder(chatMode: ChatMode, hasClientSelected: boolean): string {
  if (chatMode === 'client_kb') {
    if (!hasClientSelected) {
      return 'Select a client above to search their knowledge base...';
    }
    return 'Ask about client documents, brand guidelines, or project history...';
  }
  return 'Ask about your tasks, priorities, or get help with anything...';
}

export const ProactiveChatInterface = forwardRef<ProactiveChatInterfaceHandle, ProactiveChatInterfaceProps>(
  function ProactiveChatInterface({
    showDailyUpdatePrompt = true,
    className,
  }, ref) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [showClientMenu, setShowClientMenu] = useState(false);

  const {
    messages,
    isLoading,
    isAITyping,
    isSending,
    isExecuting,
    contextMode,
    selectedClientId,
    isConnected,
    error,
    initData,
    toolIndicator,
    initializeSession,
    sendMessage,
    executeAction,
    changeContextMode,
    selectClient,
    loadConversation,
  } = useAIPMSession();

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    loadConversation,
  }), [loadConversation]);

  // Fetch clients for the dropdown
  const { clients, isLoading: isLoadingClients } = useClients({ isActive: true });

  // Get selected client name
  const selectedClient = clients.find(c => c._id === selectedClientId);

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
    
    // For client_kb mode, require a client to be selected
    if (contextMode === 'client_kb' && !selectedClientId) {
      return;
    }

    const message = inputValue.trim();
    setInputValue('');
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }

    await sendMessage(message);
  }, [inputValue, isSending, sendMessage, contextMode, selectedClientId]);

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

  // Mode change handler
  const handleContextChange = (mode: ChatMode) => {
    changeContextMode(mode);
    setShowContextMenu(false);
  };

  // Client selection handler
  const handleClientSelect = (clientId: string) => {
    selectClient(clientId);
    setShowClientMenu(false);
  };

  const currentChatMode = chatModeOptions.find((o) => o.value === contextMode);
  
  // Determine if chat input should be disabled
  const isInputDisabled = 
    (contextMode === 'aipm' && isLoading && messages.length === 0) ||
    (contextMode === 'client_kb' && !selectedClientId);

  // Determine if we should show the loading spinner (only for AIPM mode)
  const showLoadingSpinner = contextMode === 'aipm' && isLoading && messages.length === 0 && !error;

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Loading state - ONLY for AIPM mode */}
        {showLoadingSpinner && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-surface-500 dark:text-surface-400">
                Preparing your briefing...
              </p>
            </div>
          </div>
        )}

        {/* Client KB welcome state - when no client selected */}
        {contextMode === 'client_kb' && !selectedClientId && messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mx-auto mb-4">
                <Database className="w-8 h-8 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-2">
                Client Knowledge Base
              </h3>
              <p className="text-surface-500 dark:text-surface-400 text-sm mb-4">
                Search through client documents, brand guidelines, and project history. 
                Select a client above to get started.
              </p>
              <button
                onClick={() => setShowClientMenu(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Building2 className="w-4 h-4" />
                Select a Client
              </button>
            </div>
          </div>
        )}

        {/* Client KB ready state - client selected but no messages */}
        {contextMode === 'client_kb' && selectedClientId && messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-2">
                Search {selectedClient?.name || 'Client'} Knowledge Base
              </h3>
              <p className="text-surface-500 dark:text-surface-400 text-sm">
                Ask questions about their brand guidelines, project history, processes, or any documents in their knowledge base.
              </p>
            </div>
          </div>
        )}

        {/* Error state - ONLY for AIPM mode */}
        {error && messages.length === 0 && contextMode === 'aipm' && (
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

        {/* AI Typing/Tool Usage Indicator */}
        {isAITyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col gap-2">
              {/* Show tool indicator if AI is using tools */}
              <AnimatePresence mode="wait">
                {(toolIndicator.isThinking || toolIndicator.currentTool || toolIndicator.recentTools.length > 0) && (
                  <ToolIndicator
                    isThinking={toolIndicator.isThinking}
                    currentTool={toolIndicator.currentTool}
                    recentTools={toolIndicator.recentTools}
                  />
                )}
              </AnimatePresence>
              
              {/* Standard typing indicator - only show when not using tools */}
              {!toolIndicator.isThinking && !toolIndicator.currentTool && (
                <div className="bg-surface-100 dark:bg-surface-700 rounded-2xl rounded-tl-sm px-4 py-3">
                  <TypingIndicator />
                </div>
              )}
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-surface-200 dark:border-surface-700 p-4 bg-white dark:bg-surface-800 relative z-10">
        {/* Mode & Client Switcher */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {/* Chat Mode Selector */}
          <div className="relative">
            <button
              onClick={() => setShowContextMenu(!showContextMenu)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-100 dark:bg-surface-700 text-sm font-medium hover:bg-surface-200 dark:hover:bg-surface-600 transition-colors"
            >
              {currentChatMode && (
                <>
                  <currentChatMode.icon className="w-3.5 h-3.5 text-primary-500" />
                  <span className="text-surface-700 dark:text-surface-200">
                    {currentChatMode.label}
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

            {/* Mode Menu Dropdown */}
            <AnimatePresence>
              {showContextMenu && (
                <motion.div
                  variants={scaleIn}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="absolute bottom-full left-0 mb-2 bg-white dark:bg-surface-800 rounded-lg shadow-lg border border-surface-200 dark:border-surface-700 overflow-hidden z-20 min-w-[220px]"
                >
                  {chatModeOptions.map((option) => (
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

          {/* Client Selector - Only show for client_kb mode */}
          {contextMode === 'client_kb' && (
            <div className="relative">
              <button
                onClick={() => setShowClientMenu(!showClientMenu)}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                  selectedClientId
                    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 hover:bg-primary-200 dark:hover:bg-primary-900/50'
                    : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900/50'
                )}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>
                  {selectedClient?.name || 'Select Client'}
                </span>
                <ChevronDown
                  className={cn(
                    'w-3.5 h-3.5 transition-transform',
                    showClientMenu && 'rotate-180'
                  )}
                />
              </button>

              {/* Client Menu Dropdown */}
              <AnimatePresence>
                {showClientMenu && (
                  <motion.div
                    variants={scaleIn}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="absolute bottom-full left-0 mb-2 bg-white dark:bg-surface-800 rounded-lg shadow-lg border border-surface-200 dark:border-surface-700 overflow-hidden z-20 min-w-[200px] max-h-[300px] overflow-y-auto"
                  >
                    {isLoadingClients ? (
                      <div className="px-4 py-3 text-sm text-surface-500">
                        Loading clients...
                      </div>
                    ) : clients.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-surface-500">
                        No clients found
                      </div>
                    ) : (
                      clients.map((client) => (
                        <button
                          key={client._id}
                          onClick={() => handleClientSelect(client._id)}
                          className={cn(
                            'flex items-center gap-3 px-4 py-2.5 text-sm w-full hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors text-left',
                            selectedClientId === client._id &&
                              'bg-primary-50 dark:bg-primary-900/30'
                          )}
                        >
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0 bg-primary-500"
                          >
                            {client.name.charAt(0).toUpperCase()}
                          </div>
                          <span
                            className={cn(
                              'font-medium truncate',
                              selectedClientId === client._id
                                ? 'text-primary-700 dark:text-primary-300'
                                : 'text-surface-900 dark:text-white'
                            )}
                          >
                            {client.name}
                          </span>
                        </button>
                      ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Connection Status */}
          {!isConnected && contextMode === 'aipm' && (
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
              placeholder={getPlaceholder(contextMode, !!selectedClientId)}
              rows={1}
              className="w-full resize-none rounded-xl border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder:text-surface-400 dark:placeholder:text-surface-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isInputDisabled}
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
            disabled={!inputValue.trim() || isSending || isInputDisabled}
            className={cn(
              'p-3 rounded-xl transition-all',
              inputValue.trim() && !isSending && !isInputDisabled
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
});

export default ProactiveChatInterface;
