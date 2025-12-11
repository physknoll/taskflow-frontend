'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Sparkles, 
  ThumbsUp, 
  ThumbsDown, 
  Loader2,
  CheckCircle2,
  Search,
  PlusCircle,
  MessageSquare,
  Edit3,
  FileSearch,
  ListChecks,
  Trash2,
  Send,
  Clock,
  Zap,
  Brain,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ActionCard } from './ActionCard';
import { messageEnter } from '@/lib/animations';
import { useConversationActions } from '@/hooks/useConversations';
import type { IDashboardMessage, ISuggestedAction } from '@/types/aipm';
import type { MessageFeedbackRating } from '@/types';

// Tool name to display info mapping (same as ToolIndicator)
const TOOL_INFO: Record<string, { label: string; icon: typeof Search }> = {
  agent_thinking: { label: 'Analyzed', icon: Brain },
  create_ticket: { label: 'Created ticket', icon: PlusCircle },
  lookup_user_tickets: { label: 'Searched tickets', icon: Search },
  update_ticket_status: { label: 'Updated status', icon: Edit3 },
  add_ticket_comment: { label: 'Added comment', icon: MessageSquare },
  complete_task: { label: 'Completed task', icon: CheckCircle2 },
  get_ticket_details: { label: 'Retrieved details', icon: FileSearch },
  update_task_status: { label: 'Updated task', icon: ListChecks },
  add_task: { label: 'Added task', icon: PlusCircle },
  delete_task: { label: 'Removed task', icon: Trash2 },
  send_external_message: { label: 'Sent message', icon: Send },
  log_time: { label: 'Logged time', icon: Clock },
  default: { label: 'Processed', icon: Zap },
};

function getToolInfo(toolName: string) {
  return TOOL_INFO[toolName] || TOOL_INFO.default;
}

function formatToolLabel(toolName: string): string {
  const info = TOOL_INFO[toolName];
  if (info) return info.label;
  return toolName.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

interface MessageBubbleProps {
  message: IDashboardMessage;
  onActionClick: (action: ISuggestedAction, accepted: boolean) => void;
  isExecuting?: boolean;
  conversationId?: string | null;
}

export function MessageBubble({
  message,
  onActionClick,
  isExecuting,
  conversationId,
}: MessageBubbleProps) {
  const isAI = message.role === 'aipm' || message.role === 'system';
  const timestamp = new Date(message.timestamp);
  const { submitMessageFeedback, isSubmittingFeedback } = useConversationActions();
  
  // Track local feedback state (optimistic UI)
  const [localFeedback, setLocalFeedback] = useState<MessageFeedbackRating | null>(null);
  
  const formattedTime = timestamp.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleFeedback = async (rating: MessageFeedbackRating) => {
    if (!conversationId || !message.id || localFeedback) return;
    
    // Optimistic update
    setLocalFeedback(rating);
    
    try {
      await submitMessageFeedback(conversationId, message.id, rating);
    } catch {
      // Revert on error
      setLocalFeedback(null);
    }
  };

  const currentFeedback = localFeedback;

  return (
    <motion.div
      variants={messageEnter}
      initial="initial"
      animate="animate"
      exit="exit"
      className={cn('flex items-start gap-3', !isAI && 'flex-row-reverse')}
    >
      {/* Avatar */}
      <div
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
          isAI
            ? 'bg-gradient-to-br from-primary-500 to-accent-500'
            : 'bg-surface-200 dark:bg-surface-700'
        )}
      >
        {isAI ? (
          <Sparkles className="w-4 h-4 text-white" />
        ) : (
          <span className="text-xs font-medium text-surface-600 dark:text-surface-300">
            You
          </span>
        )}
      </div>

      {/* Message Content */}
      <div className={cn('max-w-[80%] space-y-2', !isAI && 'items-end')}>
        {/* Tools Used Indicator - shown above AI messages that used tools */}
        {isAI && message.metadata?.toolsUsed && message.metadata.toolsUsed.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {message.metadata.toolsUsed.map((tool, index) => {
              const toolInfo = getToolInfo(tool);
              const ToolIcon = toolInfo.icon;
              return (
                <div
                  key={`${tool}-${index}`}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                >
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{formatToolLabel(tool)}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Bubble */}
        <div
          className={cn(
            'rounded-2xl px-4 py-3',
            isAI
              ? 'bg-surface-100 dark:bg-surface-700 rounded-tl-sm'
              : 'bg-primary-600 text-white rounded-tr-sm'
          )}
        >
          {isAI ? (
            <div className="text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-headings:my-2 prose-strong:text-surface-900 dark:prose-strong:text-white">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content}
              </ReactMarkdown>
            </div>
          ) : (
            <p className="text-sm whitespace-pre-wrap leading-relaxed">
              {message.content}
            </p>
          )}
        </div>

        {/* Suggested Actions */}
        {isAI && message.metadata?.suggestedActions && message.metadata.suggestedActions.length > 0 && (
          <div className="space-y-2">
            {message.metadata.suggestedActions.map((action) => (
              <ActionCard
                key={action.id}
                action={action}
                onActionClick={onActionClick}
                isExecuting={isExecuting}
              />
            ))}
          </div>
        )}

        {/* Footer with timestamp and feedback */}
        <div className={cn(
          'flex items-center gap-3',
          !isAI && 'justify-end'
        )}>
          <span className="text-xs text-surface-400 dark:text-surface-500">
            {formattedTime}
          </span>
          
          {/* Feedback buttons - only show for AI messages */}
          {isAI && conversationId && (
            <div className="flex items-center gap-1">
              {isSubmittingFeedback ? (
                <Loader2 className="w-3 h-3 text-surface-400 animate-spin" />
              ) : (
                <>
                  <button
                    onClick={() => handleFeedback('positive')}
                    disabled={!!currentFeedback}
                    className={cn(
                      'p-1 rounded transition-colors',
                      currentFeedback === 'positive'
                        ? 'text-green-500 bg-green-50 dark:bg-green-900/30'
                        : 'text-surface-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/30',
                      currentFeedback && currentFeedback !== 'positive' && 'opacity-50 cursor-not-allowed'
                    )}
                    title="Helpful"
                  >
                    <ThumbsUp className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleFeedback('negative')}
                    disabled={!!currentFeedback}
                    className={cn(
                      'p-1 rounded transition-colors',
                      currentFeedback === 'negative'
                        ? 'text-red-500 bg-red-50 dark:bg-red-900/30'
                        : 'text-surface-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30',
                      currentFeedback && currentFeedback !== 'negative' && 'opacity-50 cursor-not-allowed'
                    )}
                    title="Not helpful"
                  >
                    <ThumbsDown className="w-3 h-3" />
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default MessageBubble;
