'use client';

import { useState } from 'react';
import {
  FileText,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  Clock,
  Package,
  RotateCw,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { useChatWidgetIssues } from '@/hooks/useChatWidget';
import { WidgetIssue, WidgetIssueType, WIDGET_ISSUE_TYPES, WidgetIssuesQuery } from '@/types/chat-widget';
import { formatDate, cn } from '@/lib/utils';
import Link from 'next/link';

interface WidgetIssuesTabProps {
  clientId: string;
}

const PAGE_SIZE = 20;

type StatusFilter = 'all' | 'open' | 'completed';

/**
 * Tab displaying improvement tickets created from chat widget session reviews
 */
export function WidgetIssuesTab({ clientId }: WidgetIssuesTabProps) {
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const query: WidgetIssuesQuery = {
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
    status: statusFilter,
  };

  const {
    data: issuesData,
    isLoading,
    isError,
    refetch,
  } = useChatWidgetIssues(clientId, query);

  const issues = issuesData?.tickets || [];
  const total = issuesData?.total || 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  // Count by status
  const openCount = issues.filter(i => i.status !== 'completed').length;
  const completedCount = issues.filter(i => i.status === 'completed').length;

  const handleFilterChange = (newFilter: StatusFilter) => {
    setStatusFilter(newFilter);
    setPage(0);
  };

  const getIssueTypeStyles = (type: WidgetIssueType) => {
    const config = WIDGET_ISSUE_TYPES[type];
    if (!config) return 'bg-surface-100 text-surface-700';

    switch (config.color) {
      case 'orange':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      case 'red':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'yellow':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'gray':
        return 'bg-surface-100 text-surface-700 dark:bg-surface-700 dark:text-surface-400';
      default:
        return 'bg-surface-100 text-surface-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <RotateCw className="h-4 w-4 text-blue-500" />;
      case 'in_review':
        return <Clock className="h-4 w-4 text-purple-500" />;
      case 'todo':
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
      default:
        return <Package className="h-4 w-4 text-surface-400" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'in_progress':
        return 'In Progress';
      case 'in_review':
        return 'In Review';
      case 'todo':
        return 'To Do';
      case 'backlog':
        return 'Backlog';
      default:
        return status;
    }
  };

  if (isError) {
    return (
      <Card className="p-8 text-center">
        <AlertCircle className="h-12 w-12 mx-auto mb-3 text-red-500" />
        <h3 className="font-semibold text-surface-900 dark:text-white mb-2">
          Failed to Load Issues
        </h3>
        <p className="text-surface-500 mb-4">
          There was an error loading the widget issues.
        </p>
        <Button onClick={() => refetch()}>Try Again</Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-surface-900 dark:text-white mb-1">
          Widget Issues
        </h2>
        <p className="text-surface-500">
          Improvement tickets generated from AI session reviews.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-surface-100 dark:bg-surface-800">
              <FileText className="h-5 w-5 text-surface-600 dark:text-surface-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-surface-900 dark:text-white">
                {total}
              </p>
              <p className="text-sm text-surface-500">Total Issues</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-surface-900 dark:text-white">
                {openCount}
              </p>
              <p className="text-sm text-surface-500">Open</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-surface-900 dark:text-white">
                {completedCount}
              </p>
              <p className="text-sm text-surface-500">Completed</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Issues List */}
      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-surface-200 dark:border-surface-700 flex items-center justify-between gap-4">
          <h3 className="font-semibold text-surface-900 dark:text-white">
            Issues
          </h3>

          {/* Filter Tabs */}
          <div className="flex gap-1 bg-surface-100 dark:bg-surface-800 p-1 rounded-lg">
            {(['all', 'open', 'completed'] as StatusFilter[]).map((f) => (
              <button
                key={f}
                onClick={() => handleFilterChange(f)}
                className={cn(
                  'px-3 py-1 text-xs font-medium rounded-md transition-colors',
                  statusFilter === f
                    ? 'bg-white dark:bg-surface-700 text-surface-900 dark:text-white shadow-sm'
                    : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white'
                )}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton variant="rounded" width={80} height={24} />
                <div className="flex-1">
                  <Skeleton variant="text" width="60%" />
                  <Skeleton variant="text" width="40%" className="mt-1" />
                </div>
              </div>
            ))}
          </div>
        ) : issues.length === 0 ? (
          <div className="p-8 text-center text-surface-400">
            <FileText className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p>
              {statusFilter === 'all'
                ? 'No issues yet. Issues are created when the AI reviews sessions with negative feedback.'
                : `No ${statusFilter} issues`}
            </p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-surface-200 dark:divide-surface-700">
              {issues.map((issue: WidgetIssue) => (
                <Link
                  key={issue._id}
                  href={`/tickets/${issue._id}`}
                  className="block p-4 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      {getStatusIcon(issue.status)}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs text-surface-400 font-mono">
                            #{issue.ticketNumber}
                          </span>
                          <p className="text-sm font-medium text-surface-900 dark:text-white truncate">
                            {issue.title}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge 
                            className={cn('flex-shrink-0', getIssueTypeStyles(issue.issueType))}
                            size="sm"
                          >
                            {WIDGET_ISSUE_TYPES[issue.issueType]?.label || issue.issueType}
                          </Badge>
                          <span className="text-xs text-surface-500">
                            {getStatusLabel(issue.status)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-surface-400">
                        {formatDate(issue.createdAt)}
                      </span>
                      <ExternalLink className="h-4 w-4 text-surface-400" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-surface-200 dark:border-surface-700 flex items-center justify-between">
                <span className="text-sm text-surface-500">
                  Page {page + 1} of {totalPages}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Issue Type Legend */}
      <Card className="p-4">
        <h4 className="font-medium text-surface-900 dark:text-white mb-3">
          Issue Types
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.entries(WIDGET_ISSUE_TYPES).map(([type, config]) => (
            <div key={type} className="flex items-start gap-2">
              <Badge 
                className={cn('flex-shrink-0', getIssueTypeStyles(type as WidgetIssueType))}
                size="sm"
              >
                {config.label}
              </Badge>
              <span className="text-xs text-surface-500">{config.description}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
