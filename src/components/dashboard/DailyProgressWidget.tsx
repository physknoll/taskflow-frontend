'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  ChevronDown,
  ChevronRight,
  Plus,
  Clock,
  CheckCircle,
  Loader2,
  Calendar,
} from 'lucide-react';
import { useDailyUpdates, useDailyUpdatesHistory } from '@/hooks/useDailyUpdates';
import { cn, formatRelativeTime } from '@/lib/utils';
import { attentionPulse, urgentGlow } from '@/lib/animations';
import { Button } from '@/components/ui/Button';
import type { IDailyUpdate } from '@/types';

interface DailyProgressWidgetProps {
  onLogClick: () => void;
  className?: string;
}

function formatDate(date: Date | string): string {
  const d = new Date(date);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString()) {
    return 'Today';
  }
  if (d.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
}

function getUpdateSummary(update: IDailyUpdate): { acceptedCount: number; pendingCount: number } {
  const acceptedCount = update.parsedUpdates.filter(u => u.accepted).length;
  const pendingCount = update.parsedUpdates.filter(u => !u.accepted).length;
  return { acceptedCount, pendingCount };
}

function HistoryItem({ update }: { update: IDailyUpdate }) {
  const { acceptedCount, pendingCount } = getUpdateSummary(update);

  return (
    <div className="px-2 py-2 text-left">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-surface-600 dark:text-surface-400">
          {formatDate(update.date)}
        </span>
        <span className="text-[10px] text-surface-400 dark:text-surface-500">
          {formatRelativeTime(new Date(update.updatedAt))}
        </span>
      </div>
      <p className="text-xs text-surface-700 dark:text-surface-300 line-clamp-2">
        {update.rawInput}
      </p>
      <div className="flex items-center gap-2 mt-1">
        <span className="text-[10px] text-surface-500">
          {update.parsedUpdates.length} update{update.parsedUpdates.length !== 1 ? 's' : ''}
        </span>
        {acceptedCount > 0 && (
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
            <CheckCircle className="w-2.5 h-2.5" />
            {acceptedCount} accepted
          </span>
        )}
        {pendingCount > 0 && (
          <span className="text-[10px] text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
            <Clock className="w-2.5 h-2.5" />
            {pendingCount} pending
          </span>
        )}
      </div>
    </div>
  );
}

export function DailyProgressWidget({ onLogClick, className }: DailyProgressWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { todayUpdate, hasLoggedToday, isLoadingToday } = useDailyUpdates();
  const { updates: historyUpdates, isLoading: isLoadingHistory } = useDailyUpdatesHistory({
    limit: 7,
  });

  // Filter out today's update from history for expanded view
  const pastUpdates = historyUpdates.filter(u => {
    const updateDate = new Date(u.date).toDateString();
    const today = new Date().toDateString();
    return updateDate !== today;
  });

  const { acceptedCount, pendingCount } = todayUpdate
    ? getUpdateSummary(todayUpdate)
    : { acceptedCount: 0, pendingCount: 0 };

  return (
    <div
      className={cn(
        'bg-white dark:bg-surface-800 rounded-lg border border-surface-200 dark:border-surface-700',
        className
      )}
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-3 py-2 text-left"
      >
        <div className="flex items-center gap-2">
          <FileText className="w-3.5 h-3.5 text-primary-500" />
          <span className="text-xs font-medium text-surface-900 dark:text-white">
            Today&apos;s Progress
          </span>
        </div>
        {isExpanded ? (
          <ChevronDown className="w-3.5 h-3.5 text-surface-400" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 text-surface-400" />
        )}
      </button>

      {/* Content */}
      <div className="px-3 pb-3">
        {/* Loading state */}
        {isLoadingToday && (
          <div className="flex items-center justify-center py-3">
            <Loader2 className="w-4 h-4 text-surface-400 animate-spin" />
          </div>
        )}

        {/* Empty state - No log today */}
        {!isLoadingToday && !hasLoggedToday && (
          <div className="space-y-2">
            <p className="text-xs text-surface-500 dark:text-surface-400">
              No activity logged yet today.
            </p>
            {/* Animated button that jiggles when no log */}
            <motion.div
              animate={attentionPulse}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div animate={urgentGlow} className="rounded-lg">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    onLogClick();
                  }}
                  size="sm"
                  className="w-full bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600"
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                >
                  Log Activity
                </Button>
              </motion.div>
            </motion.div>
          </div>
        )}

        {/* Has log today - show preview */}
        {!isLoadingToday && hasLoggedToday && todayUpdate && (
          <div className="space-y-2">
            <p className="text-xs text-surface-700 dark:text-surface-300 line-clamp-2 italic">
              &ldquo;{todayUpdate.rawInput.slice(0, 100)}
              {todayUpdate.rawInput.length > 100 ? '...' : ''}&rdquo;
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[10px]">
                <span className="text-surface-500">
                  {todayUpdate.parsedUpdates.length} update
                  {todayUpdate.parsedUpdates.length !== 1 ? 's' : ''}
                </span>
                {acceptedCount > 0 && (
                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                    <CheckCircle className="w-2.5 h-2.5" />
                    {acceptedCount}
                  </span>
                )}
                {pendingCount > 0 && (
                  <span className="text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
                    <Clock className="w-2.5 h-2.5" />
                    {pendingCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-surface-400">
                {formatRelativeTime(new Date(todayUpdate.updatedAt))}
              </span>
            </div>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onLogClick();
              }}
              variant="outline"
              size="sm"
              className="w-full"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Add More
            </Button>
          </div>
        )}
      </div>

      {/* Expanded History View */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden border-t border-surface-100 dark:border-surface-700"
          >
            <div className="max-h-60 overflow-y-auto">
              {/* Loading history */}
              {isLoadingHistory && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-4 h-4 text-surface-400 animate-spin" />
                </div>
              )}

              {/* Today's entry (if exists) */}
              {!isLoadingHistory && todayUpdate && (
                <div className="border-b border-surface-100 dark:border-surface-700">
                  <HistoryItem update={todayUpdate} />
                </div>
              )}

              {/* Past entries */}
              {!isLoadingHistory && pastUpdates.length > 0 && (
                <div className="divide-y divide-surface-100 dark:divide-surface-700">
                  {pastUpdates.map((update) => (
                    <HistoryItem key={update._id} update={update} />
                  ))}
                </div>
              )}

              {/* No history */}
              {!isLoadingHistory && !todayUpdate && pastUpdates.length === 0 && (
                <div className="flex flex-col items-center justify-center py-4 text-center">
                  <Calendar className="w-8 h-8 text-surface-300 dark:text-surface-600 mb-2" />
                  <p className="text-xs text-surface-500 dark:text-surface-400">
                    No progress logs yet
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default DailyProgressWidget;

