'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, CheckCircle2, AlertCircle, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { focusQueueItem as getFocusQueueItemAnimation } from '@/lib/animations';
import type { IFocusQueueItem, TicketPriority } from '@/types/aipm';
import Link from 'next/link';

interface FocusQueueWidgetProps {
  items: IFocusQueueItem[];
  onTicketClick?: (ticketId: string) => void;
  isLoading?: boolean;
  className?: string;
}

const priorityColors: Record<TicketPriority, string> = {
  urgent: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400',
  high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-400',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400',
  low: 'bg-surface-100 text-surface-700 dark:bg-surface-700 dark:text-surface-300',
};

export function FocusQueueWidget({
  items,
  onTicketClick,
  isLoading,
  className,
}: FocusQueueWidgetProps) {
  return (
    <div
      className={cn(
        'flex-1 bg-white dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700 overflow-hidden flex flex-col',
        className
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-surface-100 dark:border-surface-700">
        <h3 className="font-semibold flex items-center gap-2 text-surface-900 dark:text-white">
          <Sparkles className="w-4 h-4 text-amber-500" />
          AI Suggested Focus
        </h3>
        <p className="text-xs text-surface-500 dark:text-surface-400 mt-1">
          Prioritized based on deadlines &amp; dependencies
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-2">
        {/* Loading state */}
        {isLoading && (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="animate-pulse p-3 rounded-lg bg-surface-50 dark:bg-surface-700/50"
              >
                <div className="h-4 bg-surface-200 dark:bg-surface-600 rounded w-3/4 mb-2" />
                <div className="h-3 bg-surface-200 dark:bg-surface-600 rounded w-1/2" />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && items.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-2" />
            <p className="font-medium text-surface-900 dark:text-white">
              All caught up!
            </p>
            <p className="text-sm text-surface-500 dark:text-surface-400">
              No urgent tasks right now
            </p>
          </div>
        )}

        {/* Items list */}
        {!isLoading && items.length > 0 && (
          <div className="space-y-2">
            {items.map((item, index) => (
              <FocusQueueItem
                key={item.ticketId}
                item={item}
                index={index}
                onClick={onTicketClick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface FocusQueueItemProps {
  item: IFocusQueueItem;
  index: number;
  onClick?: (ticketId: string) => void;
}

function FocusQueueItem({ item, index, onClick }: FocusQueueItemProps) {
  const animation = getFocusQueueItemAnimation(index);

  const content = (
    <motion.div
      variants={animation}
      initial="initial"
      animate="animate"
      className="w-full text-left p-3 rounded-lg hover:bg-surface-50 dark:hover:bg-surface-700/50 transition-colors group cursor-pointer"
      onClick={() => onClick?.(item.ticketId)}
    >
      <div className="flex items-start gap-3">
        {/* Priority number */}
        <span
          className={cn(
            'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
            index === 0
              ? 'bg-primary-600 text-white'
              : 'bg-surface-200 dark:bg-surface-700 text-surface-600 dark:text-surface-300'
          )}
        >
          {index + 1}
        </span>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Badges row */}
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span
              className={cn(
                'text-xs px-1.5 py-0.5 rounded font-medium',
                priorityColors[item.priority]
              )}
            >
              {item.priority}
            </span>
            {item.isOverdue && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Overdue
              </span>
            )}
          </div>

          {/* Title */}
          <h4 className="font-medium text-sm text-surface-900 dark:text-white truncate">
            {item.title}
          </h4>

          {/* Project/Client info */}
          <p className="text-xs text-surface-500 dark:text-surface-400 truncate">
            {item.client} • {item.project}
          </p>

          {/* AI reason */}
          <p className="text-xs text-primary-600 dark:text-primary-400 mt-1 italic line-clamp-2">
            &ldquo;{item.aiReason}&rdquo;
          </p>
        </div>

        {/* Chevron */}
        <ChevronRight className="w-4 h-4 text-surface-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
      </div>
    </motion.div>
  );

  // If onClick is provided, don't wrap in Link
  if (onClick) {
    return content;
  }

  // Otherwise, wrap in Link to ticket page
  return (
    <Link href={`/tickets/${item.ticketId}`}>
      {content}
    </Link>
  );
}

export default FocusQueueWidget;

