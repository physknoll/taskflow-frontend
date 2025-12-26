'use client';

import { useState } from 'react';
import { useNextCheckIn, useAIPMCheckIn } from '@/hooks/useAIPM';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import {
  Bot,
  Clock,
  MessageCircle,
  ChevronDown,
  Calendar,
  Sparkles,
  Zap,
} from 'lucide-react';

export function AIPMStatusBar() {
  const { nextCheckIn, isLoading: isLoadingNext } = useNextCheckIn();
  const { activeSession, openCheckIn, isCheckInModalOpen } = useAIPMCheckIn();
  const [isExpanded, setIsExpanded] = useState(false);

  // Don't show if loading
  if (isLoadingNext) return null;

  // Active check-in state
  const hasActiveSession = activeSession && activeSession.status === 'in_progress';

  if (hasActiveSession) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={openCheckIn}
        className={cn(
          'relative gap-2 px-3 py-2 rounded-xl transition-all duration-300',
          'bg-gradient-to-r from-emerald-500/10 to-teal-500/10',
          'border border-emerald-500/30',
          'text-emerald-600 dark:text-emerald-400',
          'hover:from-emerald-500/20 hover:to-teal-500/20',
          'hover:border-emerald-500/50'
        )}
      >
        {/* Pulse indicator */}
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
        </span>
        
        <Bot className="h-4 w-4" />
        <span className="font-medium text-sm">Check-in Active</span>
        <MessageCircle className="h-4 w-4" />
      </Button>
    );
  }

  // Scheduled check-in state
  if (nextCheckIn) {
    return (
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            'gap-2 px-3 py-2 rounded-xl transition-all duration-200',
            'text-surface-600 dark:text-surface-400',
            'hover:bg-surface-100 dark:hover:bg-surface-800',
            isExpanded && 'bg-surface-100 dark:bg-surface-800'
          )}
        >
          <Bot className="h-4 w-4 text-primary-500" />
          <span className="hidden sm:inline text-sm">
            {nextCheckIn.isToday ? (
              <>
                Check-in{' '}
                <span className="font-medium text-primary-600 dark:text-primary-400">
                  today at {new Date(nextCheckIn.scheduledAt).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </>
            ) : (
              <span className="text-surface-500">{nextCheckIn.formattedTime}</span>
            )}
          </span>
          <ChevronDown className={cn(
            'h-4 w-4 transition-transform duration-200',
            isExpanded && 'rotate-180'
          )} />
        </Button>

        {/* Dropdown panel */}
        {isExpanded && (
          <div 
            className={cn(
              'absolute right-0 top-full mt-2 w-80 z-50',
              'bg-white dark:bg-surface-800',
              'rounded-2xl shadow-2xl',
              'border border-surface-200 dark:border-surface-700',
              'animate-scale-in origin-top-right'
            )}
          >
            {/* Gradient header */}
            <div className="p-4 rounded-t-2xl bg-gradient-to-br from-primary-500/10 via-accent-500/5 to-transparent">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 shadow-lg shadow-primary-500/25">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-surface-900 dark:text-white">
                    AI Project Manager
                  </h4>
                  <p className="text-sm text-surface-500 dark:text-surface-400">
                    Next scheduled check-in
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-50 dark:bg-surface-900/50">
                <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/50">
                  <Calendar className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <p className="font-medium text-surface-900 dark:text-white">
                    {nextCheckIn.formattedTime}
                  </p>
                  <p className="text-xs text-surface-500">
                    {nextCheckIn.timezone}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-50 dark:bg-surface-900/50">
                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/50">
                  <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="font-medium text-surface-900 dark:text-white">
                    {nextCheckIn.hoursUntil < 1 
                      ? `${Math.round(nextCheckIn.hoursUntil * 60)} minutes` 
                      : `${nextCheckIn.hoursUntil.toFixed(1)} hours`}
                  </p>
                  <p className="text-xs text-surface-500">Until check-in</p>
                </div>
              </div>

              <p className="text-xs text-surface-500 dark:text-surface-400 text-center pt-2">
                The AI will reach out to discuss your assigned tickets
              </p>
            </div>
          </div>
        )}

        {/* Click outside to close */}
        {isExpanded && (
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsExpanded(false)}
          />
        )}
      </div>
    );
  }

  // No check-in scheduled
  return (
    <div className="flex items-center gap-2 px-3 py-2 text-surface-400 dark:text-surface-500">
      <Bot className="h-4 w-4" />
      <span className="text-sm hidden sm:inline">AIPM inactive</span>
    </div>
  );
}




