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
    router.push(routeTo);
  };

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {/* Streak Widget - Compact */}
      <StreakWidget streak={streak} compact />

      {/* Today's Stats - Compact inline */}
      <TodayStatsWidget stats={todayStats} compact />

      {/* Conversation History - Collapsible, starts collapsed */}
      <ConversationHistory
        onSelectConversation={handleConversationSelect}
        defaultExpanded={false}
      />

      {/* Focus Queue - Main content */}
      <FocusQueueWidget
        items={focusQueue}
        onTicketClick={onTicketClick}
        isLoading={isLoading}
        className="flex-1 min-h-0"
      />

      {/* Pending Reviews - Collapsible */}
      <PendingReviewsWidget />
    </div>
  );
}

export default ContextRail;
