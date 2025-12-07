'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Check,
  X,
  Clock,
  CheckCircle2,
  Play,
  Mail,
  HelpCircle,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ISuggestedAction, SuggestedActionType } from '@/types/aipm';
import { actionCardEnter } from '@/lib/animations';

interface ActionCardProps {
  action: ISuggestedAction;
  onActionClick: (action: ISuggestedAction, accepted: boolean) => void;
  isExecuting?: boolean;
}

const actionIcons: Record<SuggestedActionType, typeof Clock> = {
  start_task: Play,
  log_update: Clock,
  send_email: Mail,
  mark_complete: CheckCircle2,
  request_help: HelpCircle,
  schedule_meeting: Calendar,
};

const actionColors: Record<SuggestedActionType, string> = {
  start_task: 'bg-primary-100 text-primary-600 dark:bg-primary-900/50 dark:text-primary-400',
  log_update: 'bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400',
  send_email: 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400',
  mark_complete: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400',
  request_help: 'bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400',
  schedule_meeting: 'bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-400',
};

export function ActionCard({ action, onActionClick, isExecuting }: ActionCardProps) {
  const isPending = action.status === 'pending';
  const isExecuted = action.status === 'executed';
  const isDeclined = action.status === 'declined';

  const Icon = actionIcons[action.type] || Sparkles;

  return (
    <motion.div
      variants={actionCardEnter}
      initial="initial"
      animate="animate"
      className={cn(
        'border rounded-xl p-3 transition-all',
        isPending && 'border-primary-200 bg-primary-50 dark:bg-primary-900/20 dark:border-primary-800',
        isExecuted && 'border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-800',
        isDeclined && 'border-surface-200 bg-surface-50 dark:bg-surface-800/50 dark:border-surface-700 opacity-60'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className={cn(
            'p-2 rounded-lg flex-shrink-0',
            isPending && actionColors[action.type],
            isExecuted && 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400',
            isDeclined && 'bg-surface-200 text-surface-500 dark:bg-surface-700 dark:text-surface-400'
          )}
        >
          {isExecuted ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <Icon className="w-4 h-4" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className={cn(
            'font-medium text-sm',
            isDeclined && 'text-surface-500 line-through'
          )}>
            {action.label}
          </h4>
          
          {action.description && (
            <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">
              {action.description}
            </p>
          )}
          
          {action.ticketNumber && (
            <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-surface-200 dark:bg-surface-700 text-surface-600 dark:text-surface-300">
              {action.ticketNumber}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        {isPending && !isExecuting && (
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => onActionClick(action, true)}
              className="p-1.5 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors shadow-sm"
              title="Accept"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={() => onActionClick(action, false)}
              className="p-1.5 rounded-lg bg-surface-200 hover:bg-surface-300 dark:bg-surface-700 dark:hover:bg-surface-600 transition-colors"
              title="Decline"
            >
              <X className="w-4 h-4 text-surface-600 dark:text-surface-400" />
            </button>
          </div>
        )}

        {/* Loading State */}
        {isExecuting && isPending && (
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Status Badge */}
        {isExecuted && (
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex-shrink-0">
            Done!
          </span>
        )}
        
        {isDeclined && (
          <span className="text-xs text-surface-500 font-medium flex-shrink-0">
            Skipped
          </span>
        )}
      </div>
    </motion.div>
  );
}

export default ActionCard;

