'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { StreakWidget } from './StreakWidget';
import { FocusQueueWidget } from './FocusQueueWidget';
import { TodayStatsWidget } from './TodayStatsWidget';
import { PendingReviewsWidget } from './PendingReviewsWidget';
import { ConversationHistory } from './ConversationHistory';
import { useAIPMDashboard } from '@/hooks/useAIPM';
import { cn } from '@/lib/utils';
import type { Conversation } from '@/types';

interface ContextRailProps {
  onTicketClick?: (ticketId: string) => void;
  className?: string;
}

export function ContextRail({ onTicketClick, className }: ContextRailProps) {
  const router = useRouter();
  const { streak, focusQueue, todayStats, isLoading } = useAIPMDashboard();

  const handleConversationSelect = (conversation: Conversation, routeTo: string) => {
    // Navigate to the appropriate route based on conversation type
    router.push(routeTo);
  };

  return (
    <div className={cn('flex flex-col gap-4 h-full', className)}>
      {/* Streak Widget - Fixed at top */}
      <StreakWidget streak={streak} />

      {/* Conversation History - New collapsible section */}
      <ConversationHistory
        onSelectConversation={handleConversationSelect}
        defaultExpanded={true}
      />

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
