'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ActionCard } from './ActionCard';
import { messageEnter } from '@/lib/animations';
import type { IDashboardMessage, ISuggestedAction } from '@/types/aipm';

interface MessageBubbleProps {
  message: IDashboardMessage;
  onActionClick: (action: ISuggestedAction, accepted: boolean) => void;
  isExecuting?: boolean;
}

export function MessageBubble({ message, onActionClick, isExecuting }: MessageBubbleProps) {
  const isAI = message.role === 'aipm' || message.role === 'system';
  const timestamp = new Date(message.timestamp);
  
  const formattedTime = timestamp.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

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

        {/* Timestamp */}
        <span
          className={cn(
            'text-xs text-surface-400 dark:text-surface-500 block',
            !isAI && 'text-right'
          )}
        >
          {formattedTime}
        </span>
      </div>
    </motion.div>
  );
}

export default MessageBubble;

