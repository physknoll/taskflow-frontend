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
  Search,
} from 'lucide-react';
import { useConversationHistory } from '@/hooks/useConversations';
import { cn, formatRelativeTime } from '@/lib/utils';
import type { Conversation, ConversationType } from '@/types';

interface ConversationHistoryProps {
  onSelectConversation?: (conversation: Conversation, routeTo: string) => void;
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
  ticket_discussion: { icon: MessageSquare, label: 'Ticket', color: 'text-purple-500' },
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
        'w-full flex items-start gap-3 px-3 py-2.5 rounded-lg text-left transition-colors',
        'hover:bg-surface-100 dark:hover:bg-surface-700',
        'disabled:opacity-50 disabled:cursor-not-allowed'
      )}
    >
      <Icon className={cn('w-4 h-4 mt-0.5 flex-shrink-0', config.color)} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-surface-900 dark:text-white truncate">
          {conversation.title || `${config.label} conversation`}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={cn('text-xs', config.color)}>{config.label}</span>
          <span className="text-xs text-surface-400 dark:text-surface-500">
            {formatRelativeTime(new Date(conversation.lastMessageAt))}
          </span>
        </div>
      </div>
      {isLoading && (
        <Loader2 className="w-4 h-4 text-surface-400 animate-spin" />
      )}
    </button>
  );
}

export function ConversationHistory({
  onSelectConversation,
  className,
  defaultExpanded = true,
}: ConversationHistoryProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const { conversations, isLoading, error, handleResume, isResuming } = useConversationHistory({
    limit: 20,
  });

  const handleSelect = async (conversation: Conversation) => {
    setLoadingId(conversation.conversationId);
    try {
      const result = await handleResume(conversation);
      if (result && onSelectConversation) {
        onSelectConversation(conversation, result.routeTo);
      }
    } finally {
      setLoadingId(null);
    }
  };

  const filteredConversations = conversations.filter((conv) => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    return (
      (conv.title?.toLowerCase().includes(search)) ||
      typeConfig[conv.type]?.label.toLowerCase().includes(search)
    );
  });

  return (
    <div className={cn('bg-white dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700', className)}>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-primary-500" />
          <span className="text-sm font-medium text-surface-900 dark:text-white">
            Recent Conversations
          </span>
          {conversations.length > 0 && (
            <span className="text-xs bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-400 px-1.5 py-0.5 rounded">
              {conversations.length}
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-surface-400" />
        ) : (
          <ChevronRight className="w-4 h-4 text-surface-400" />
        )}
      </button>

      {/* Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3">
              {/* Search */}
              {conversations.length > 5 && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              )}

              {/* Loading state */}
              {isLoading && (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="w-5 h-5 text-surface-400 animate-spin" />
                </div>
              )}

              {/* Error state */}
              {error && !isLoading && (
                <div className="flex items-center gap-2 py-4 text-sm text-red-500">
                  <AlertCircle className="w-4 h-4" />
                  <span>Failed to load conversations</span>
                </div>
              )}

              {/* Empty state */}
              {!isLoading && !error && conversations.length === 0 && (
                <div className="text-center py-6">
                  <MessageSquare className="w-8 h-8 text-surface-300 dark:text-surface-600 mx-auto mb-2" />
                  <p className="text-sm text-surface-500 dark:text-surface-400">
                    No conversations yet
                  </p>
                </div>
              )}

              {/* Conversations list */}
              {!isLoading && !error && filteredConversations.length > 0 && (
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {filteredConversations.map((conversation) => (
                    <ConversationItem
                      key={conversation.conversationId}
                      conversation={conversation}
                      onSelect={() => handleSelect(conversation)}
                      isLoading={loadingId === conversation.conversationId || isResuming}
                    />
                  ))}
                </div>
              )}

              {/* No results */}
              {!isLoading && !error && searchQuery && filteredConversations.length === 0 && conversations.length > 0 && (
                <p className="text-center text-sm text-surface-500 dark:text-surface-400 py-4">
                  No conversations match &quot;{searchQuery}&quot;
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ConversationHistory;

