'use client';

import React from 'react';
import { StreakWidget } from './StreakWidget';
import { FocusQueueWidget } from './FocusQueueWidget';
import { TodayStatsWidget } from './TodayStatsWidget';
import { PendingReviewsWidget } from './PendingReviewsWidget';
import { useAIPMDashboard } from '@/hooks/useAIPM';
import { cn } from '@/lib/utils';

interface ContextRailProps {
  onTicketClick?: (ticketId: string) => void;
  className?: string;
}

export function ContextRail({ onTicketClick, className }: ContextRailProps) {
  const { streak, focusQueue, todayStats, isLoading } = useAIPMDashboard();

  return (
    <div className={cn('flex flex-col gap-4 h-full', className)}>
      {/* Streak Widget - Fixed at top */}
      <StreakWidget streak={streak} />

      {/* Focus Queue Widget - Grows to fill space */}
      <FocusQueueWidget
        items={focusQueue}
        onTicketClick={onTicketClick}
        isLoading={isLoading}
        className="flex-1 min-h-0"
      />

      {/* Today's Stats Widget */}
      <TodayStatsWidget stats={todayStats} />

      {/* Pending Reviews Widget */}
      <PendingReviewsWidget />
    </div>
  );
}

export default ContextRail;

