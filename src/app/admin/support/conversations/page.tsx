'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Skeleton';
import { Avatar } from '@/components/ui/Avatar';
import { useAdminConversations } from '@/hooks/admin/useAdminSupport';
import { CONVERSATION_STATUS_COLORS, CONVERSATION_TYPES, CONVERSATION_CHANNELS } from '@/lib/admin-constants';
import { AdminConversationParams } from '@/types/admin';
import { 
  ArrowLeft,
  Search, 
  MessageSquare,
  ChevronLeft, 
  ChevronRight,
  ExternalLink,
  Filter,
  Clock,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

export default function ConversationsPage() {
  const router = useRouter();
  const [params, setParams] = useState<AdminConversationParams>({
    page: 1,
    limit: 20,
  });
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading, error } = useAdminConversations(params);

  const handleTypeFilter = (type: string) => {
    setParams((prev) => ({ ...prev, type: type === 'all' ? undefined : type, page: 1 }));
  };

  const handleStatusFilter = (status: string) => {
    setParams((prev) => ({ ...prev, status: status === 'all' ? undefined : status, page: 1 }));
  };

  const getStatusColor = (status: string) => {
    return CONVERSATION_STATUS_COLORS[status as keyof typeof CONVERSATION_STATUS_COLORS] || 'bg-surface-100 text-surface-600';
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link 
        href="/admin/support"
        className="inline-flex items-center gap-2 text-surface-500 hover:text-surface-700 dark:hover:text-surface-300"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Support
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">
            AI Conversations
          </h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1">
            Browse all AI conversations across the platform
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card padding="md">
        <div className="space-y-4">
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              leftIcon={<Filter className="h-4 w-4" />}
            >
              Filters
            </Button>
          </div>

          {showFilters && (
            <div className="flex flex-wrap gap-4 pt-4 border-t border-surface-200 dark:border-surface-700">
              <div className="w-48">
                <label className="block text-xs font-medium text-surface-500 mb-1">Type</label>
                <Select
                  value={params.type || 'all'}
                  onChange={(e) => handleTypeFilter(e.target.value)}
                >
                  <option value="all">All Types</option>
                  {CONVERSATION_TYPES.map((type) => (
                    <option key={type.id} value={type.id}>{type.label}</option>
                  ))}
                </Select>
              </div>
              <div className="w-40">
                <label className="block text-xs font-medium text-surface-500 mb-1">Status</label>
                <Select
                  value={params.status || 'all'}
                  onChange={(e) => handleStatusFilter(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="abandoned">Abandoned</option>
                  <option value="escalated">Escalated</option>
                </Select>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Conversations List */}
      <Card padding="none">
        <div className="divide-y divide-surface-200 dark:divide-surface-700">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-4">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-64" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              </div>
            ))
          ) : error ? (
            <div className="p-12 text-center text-surface-500">
              Failed to load conversations. Please try again.
            </div>
          ) : data?.data.length === 0 ? (
            <div className="p-12 text-center text-surface-500">
              No conversations found.
            </div>
          ) : (
            data?.data.map((conversation) => (
              <div 
                key={conversation._id}
                className="p-4 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors cursor-pointer"
                onClick={() => router.push(`/admin/support/conversations/${conversation._id}`)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <Avatar
                      firstName={conversation.user?.firstName}
                      lastName={conversation.user?.lastName}
                      src={conversation.user?.avatar}
                      size="md"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-surface-900 dark:text-white">
                          {conversation.user?.firstName} {conversation.user?.lastName}
                        </span>
                        {conversation.organization && (
                          <span className="text-sm text-surface-500">
                            @ {conversation.organization.name}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-surface-500 mt-1">
                        {conversation.title || CONVERSATION_TYPES.find(t => t.id === conversation.type)?.label || conversation.type}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <Badge className={getStatusColor(conversation.status)} size="sm">
                          {conversation.status}
                        </Badge>
                        <span className="text-xs text-surface-400 flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          {conversation.messageCount} messages
                        </span>
                        <span className="text-xs text-surface-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDistanceToNow(new Date(conversation.lastMessageAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/admin/support/conversations/${conversation._id}`);
                    }}
                    rightIcon={<ExternalLink className="w-4 h-4" />}
                  >
                    View
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {data && data.pagination.pages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-surface-200 dark:border-surface-700">
            <p className="text-sm text-surface-500">
              Showing {((data.pagination.page - 1) * data.pagination.limit) + 1} to{' '}
              {Math.min(data.pagination.page * data.pagination.limit, data.pagination.total)} of{' '}
              {data.pagination.total} conversations
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={data.pagination.page === 1}
                onClick={() => setParams((prev) => ({ ...prev, page: (prev.page || 1) - 1 }))}
                leftIcon={<ChevronLeft className="w-4 h-4" />}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={data.pagination.page === data.pagination.pages}
                onClick={() => setParams((prev) => ({ ...prev, page: (prev.page || 1) + 1 }))}
                rightIcon={<ChevronRight className="w-4 h-4" />}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
