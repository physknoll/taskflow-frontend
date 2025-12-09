'use client';

import React from 'react';
import { StreakWidget } from './StreakWidget';
import { FocusQueueWidget } from './FocusQueueWidget';
import { TodayStatsWidget } from './TodayStatsWidget';
import { PendingReviewsWidget } from './PendingReviewsWidget';
import { ConversationHistory } from './ConversationHistory';
import { useAIPMDashboard } from '@/hooks/useAIPM';
import { cn } from '@/lib/utils';
import type { ResumeConversationResponse } from '@/types';

interface ContextRailProps {
  onTicketClick?: (ticketId: string) => void;
  onResumeConversation?: (result: ResumeConversationResponse) => void;
  className?: string;
}

export function ContextRail({ onTicketClick, onResumeConversation, className }: ContextRailProps) {
  const { streak, focusQueue, todayStats, isLoading } = useAIPMDashboard();

  // Handle conversation selection - call parent's resume handler instead of navigating
  const handleConversationSelect = (result: ResumeConversationResponse) => {
    if (onResumeConversation) {
      // Don't navigate - just call the resume handler to populate the chat
      onResumeConversation(result);
    }
    // If no handler provided, do nothing (don't navigate away from dashboard)
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
