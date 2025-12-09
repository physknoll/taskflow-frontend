'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ThumbsUp, ThumbsDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ActionCard } from './ActionCard';
import { messageEnter } from '@/lib/animations';
import { useConversationActions } from '@/hooks/useConversations';
import type { IDashboardMessage, ISuggestedAction } from '@/types/aipm';
import type { MessageFeedbackRating } from '@/types';

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
        {/* Bubble */}
        <div
          className={cn(
            'rounded-2xl px-4 py-3',
            isAI
              ? 'bg-surface-100 dark:bg-surface-700 rounded-tl-sm'
              : 'bg-primary-600 text-white rounded-tr-sm'
          )}
        >
          <p className="text-sm whitespace-pre-wrap leading-relaxed">
            {message.content}
          </p>
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
