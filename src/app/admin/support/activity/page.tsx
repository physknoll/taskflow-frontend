'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Skeleton';
import { Avatar } from '@/components/ui/Avatar';
import { useAdminActivity } from '@/hooks/admin/useAdminSupport';
import { AdminActivityParams } from '@/types/admin';
import { 
  ArrowLeft,
  ChevronLeft, 
  ChevronRight,
  Filter,
  Clock,
  User,
  Ticket,
  FolderKanban,
  Building2,
  MessageSquare,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { safeFormatDate } from '@/lib/utils';

const ACTION_ICONS: Record<string, React.ElementType> = {
  user: User,
  ticket: Ticket,
  project: FolderKanban,
  organization: Building2,
  conversation: MessageSquare,
};

export default function ActivityLogsPage() {
  const [params, setParams] = useState<AdminActivityParams>({
    page: 1,
    limit: 50,
  });
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading, error } = useAdminActivity(params);

  const handleEntityTypeFilter = (type: string) => {
    setParams((prev) => ({ ...prev, entityType: type === 'all' ? undefined : type, page: 1 }));
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
            Activity Logs
          </h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1">
            User activity across the platform
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
                <Select
                  label="Entity Type"
                  value={params.entityType || 'all'}
                  onChange={(value) => handleEntityTypeFilter(value)}
                  options={[
                    { value: 'all', label: 'All Types' },
                    { value: 'ticket', label: 'Tickets' },
                    { value: 'project', label: 'Projects' },
                    { value: 'user', label: 'Users' },
                    { value: 'organization', label: 'Organizations' },
                    { value: 'conversation', label: 'Conversations' },
                  ]}
                />
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Activity Timeline */}
      <Card padding="none">
        <div className="divide-y divide-surface-200 dark:divide-surface-700">
          {isLoading ? (
            Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="p-4">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-64" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              </div>
            ))
          ) : error ? (
            <div className="p-12 text-center text-surface-500">
              Failed to load activity logs. Please try again.
            </div>
          ) : data?.data.length === 0 ? (
            <div className="p-12 text-center text-surface-500">
              No activity logs found.
            </div>
          ) : (
            data?.data.map((log) => {
              const Icon = ACTION_ICONS[log.entityType] || Clock;
              return (
                <div key={log._id} className="p-4 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
                  <div className="flex items-start gap-4">
                    <Avatar
                      firstName={log.user?.firstName}
                      lastName={log.user?.lastName}
                      src={log.user?.avatar}
                      size="md"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-surface-900 dark:text-white">
                          {log.user?.firstName} {log.user?.lastName}
                        </span>
                        <span className="text-surface-600 dark:text-surface-400">
                          {log.action.replace(/_/g, ' ')}
                        </span>
                        <Badge size="sm" className="capitalize">
                          <Icon className="w-3 h-3 mr-1" />
                          {log.entityType}
                        </Badge>
                      </div>
                      {log.organization && (
                        <p className="text-sm text-surface-500 mt-1">
                          in {log.organization.name}
                        </p>
                      )}
                      <p className="text-xs text-surface-400 mt-2 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {safeFormatDate(log.timestamp, (d) => formatDistanceToNow(d, { addSuffix: true }), 'Unknown')}
                        <span className="mx-1">·</span>
                        {safeFormatDate(log.timestamp, (d) => format(d, 'MMM d, yyyy h:mm a'))}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {data && data.pagination.pages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-surface-200 dark:border-surface-700">
            <p className="text-sm text-surface-500">
              Showing {((data.pagination.page - 1) * data.pagination.limit) + 1} to{' '}
              {Math.min(data.pagination.page * data.pagination.limit, data.pagination.total)} of{' '}
              {data.pagination.total} logs
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



