'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  ChevronDown,
  ChevronRight,
  Calendar,
  Bot,
  FolderPlus,
  FileText,
  Clock,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useConversationHistory } from '@/hooks/useConversations';
import { cn, formatRelativeTime } from '@/lib/utils';
import type { Conversation, ConversationType, ResumeConversationResponse } from '@/types';

interface ConversationHistoryProps {
  onSelectConversation?: (result: ResumeConversationResponse) => void;
  className?: string;
  defaultExpanded?: boolean;
}

const typeConfig: Record<ConversationType, { icon: typeof MessageSquare; label: string; color: string }> = {
  daily_checkin: { icon: Calendar, label: 'Check-in', color: 'text-blue-500' },
  scheduled_checkin: { icon: Clock, label: 'Scheduled', color: 'text-blue-500' },
  dashboard_chat: { icon: MessageSquare, label: 'Chat', color: 'text-primary-500' },
  project_creation: { icon: FolderPlus, label: 'Project', color: 'text-emerald-500' },
  knowledge_base: { icon: FileText, label: 'Knowledge', color: 'text-amber-500' },
  sop_creation: { icon: FileText, label: 'SOP', color: 'text-teal-500' },
  blocker_resolution: { icon: AlertCircle, label: 'Blocker', color: 'text-red-500' },
  ticket_discussion: { icon: MessageSquare, label: 'Ticket', color: 'text-primary-500' },
  general: { icon: Bot, label: 'General', color: 'text-surface-500' },
};

function ConversationItem({
  conversation,
  onSelect,
  isLoading,
}: {
  conversation: Conversation;
  onSelect: () => void;
  isLoading: boolean;
}) {
  const config = typeConfig[conversation.type] || typeConfig.general;
  const Icon = config.icon;

  return (
    <button
      onClick={onSelect}
      disabled={isLoading}
      className={cn(
        'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left transition-colors',
        'hover:bg-surface-100 dark:hover:bg-surface-700',
        'disabled:opacity-50 disabled:cursor-not-allowed'
      )}
    >
      <Icon className={cn('w-3.5 h-3.5 flex-shrink-0', config.color)} />
      <span className="text-xs font-medium text-surface-700 dark:text-surface-300 truncate flex-1">
        {conversation.title || `${config.label} conversation`}
      </span>
      <span className="text-[10px] text-surface-400 dark:text-surface-500 flex-shrink-0">
        {formatRelativeTime(new Date(conversation.lastMessageAt))}
      </span>
      {isLoading && (
        <Loader2 className="w-3 h-3 text-surface-400 animate-spin flex-shrink-0" />
      )}
    </button>
  );
}

export function ConversationHistory({
  onSelectConversation,
  className,
  defaultExpanded = false, // Start collapsed by default
}: ConversationHistoryProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const { conversations, isLoading, error, handleResume, isResuming } = useConversationHistory({
    limit: 10,
  });

  const handleSelect = async (conversation: Conversation) => {
    setLoadingId(conversation.conversationId);
    try {
      const result = await handleResume(conversation);
      if (result && onSelectConversation) {
        // Pass the full result including messages and langGraphThreadId
        onSelectConversation(result);
      }
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className={cn('bg-white dark:bg-surface-800 rounded-lg border border-surface-200 dark:border-surface-700', className)}>
      {/* Header - Compact */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-3 py-2 text-left"
      >
        <div className="flex items-center gap-2">
          <MessageSquare className="w-3.5 h-3.5 text-primary-500" />
          <span className="text-xs font-medium text-surface-900 dark:text-white">
            Recent Conversations
          </span>
          {conversations.length > 0 && (
            <span className="text-[10px] bg-surface-100 dark:bg-surface-700 text-surface-500 px-1.5 py-0.5 rounded">
              {conversations.length}
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronDown className="w-3.5 h-3.5 text-surface-400" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 text-surface-400" />
        )}
      </button>

      {/* Content - Compact */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="px-2 pb-2">
              {/* Loading state */}
              {isLoading && (
                <div className="flex items-center justify-center py-3">
                  <Loader2 className="w-4 h-4 text-surface-400 animate-spin" />
                </div>
              )}

              {/* Error state */}
              {error && !isLoading && (
                <div className="flex items-center gap-1 py-2 text-xs text-red-500">
                  <AlertCircle className="w-3 h-3" />
                  <span>Failed to load</span>
                </div>
              )}

              {/* Empty state */}
              {!isLoading && !error && conversations.length === 0 && (
                <p className="text-xs text-surface-500 dark:text-surface-400 py-2 text-center">
                  No conversations yet
                </p>
              )}

              {/* Conversations list - Compact */}
              {!isLoading && !error && conversations.length > 0 && (
                <div className="space-y-0.5 max-h-40 overflow-y-auto">
                  {conversations.map((conversation) => (
                    <ConversationItem
                      key={conversation.conversationId}
                      conversation={conversation}
                      onSelect={() => handleSelect(conversation)}
                      isLoading={loadingId === conversation.conversationId || isResuming}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ConversationHistory;
