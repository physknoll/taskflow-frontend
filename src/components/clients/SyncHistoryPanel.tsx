'use client';

import { useState } from 'react';
import { useSyncHistory } from '@/services/kb-sources.service';
import { KnowledgeBaseSource, SyncHistoryEntry } from '@/types/kb-sources';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { Avatar } from '@/components/ui/Avatar';
import { cn, formatDate } from '@/lib/utils';
import {
  History,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  User,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface SyncHistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  source: KnowledgeBaseSource;
}

export function SyncHistoryPanel({
  isOpen,
  onClose,
  clientId,
  source,
}: SyncHistoryPanelProps) {
  const [page, setPage] = useState(1);
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set());

  // Fetch history
  const { data: historyData, isLoading } = useSyncHistory(clientId, source._id, {
    page,
    limit: 20,
  });

  const history = historyData?.data || [];
  const pagination = historyData?.pagination;

  // Toggle expanded state for an entry
  const toggleExpanded = (entryId: string) => {
    setExpandedEntries((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(entryId)) {
        newSet.delete(entryId);
      } else {
        newSet.add(entryId);
      }
      return newSet;
    });
  };

  // Get status icon and color
  const getStatusInfo = (status: SyncHistoryEntry['status']) => {
    switch (status) {
      case 'success':
        return {
          icon: CheckCircle,
          color: 'text-green-500',
          bgColor: 'bg-green-100 dark:bg-green-900/30',
          label: 'Success',
        };
      case 'partial':
        return {
          icon: AlertTriangle,
          color: 'text-amber-500',
          bgColor: 'bg-amber-100 dark:bg-amber-900/30',
          label: 'Partial',
        };
      case 'failed':
        return {
          icon: XCircle,
          color: 'text-red-500',
          bgColor: 'bg-red-100 dark:bg-red-900/30',
          label: 'Failed',
        };
      default:
        return {
          icon: Clock,
          color: 'text-surface-400',
          bgColor: 'bg-surface-100 dark:bg-surface-700',
          label: 'Unknown',
        };
    }
  };

  // Format duration
  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${seconds}s`;
  };

  // Format relative time
  const formatRelativeTime = (dateStr: string): string => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 7) {
      return formatDate(dateStr);
    }
    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    }
    if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    }
    if (diffMinutes > 0) {
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    }
    return 'Just now';
  };

  // Truncate URL
  const truncateUrl = (url: string, maxLength = 50): string => {
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength - 3) + '...';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Sync History - ${source.name}`}
      size="xl"
      disableContentScroll
    >
      <div className="flex flex-col h-[70vh]">
        {/* Header Stats */}
        <div className="flex items-center gap-2 mb-4 text-sm text-surface-500">
          <History className="h-4 w-4" />
          <span>Activity feed for sync operations</span>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="p-4 border border-surface-200 dark:border-surface-700 rounded-xl"
                >
                  <div className="flex items-start gap-3">
                    <Skeleton variant="rounded" width={40} height={40} />
                    <div className="flex-1">
                      <Skeleton variant="text" width="40%" />
                      <Skeleton variant="text" width="60%" className="mt-2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-surface-400 py-12">
              <History className="h-12 w-12 mb-3 opacity-50" />
              <p className="text-sm">No sync history yet.</p>
              <p className="text-xs mt-1">
                Sync operations will appear here after they complete.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((entry) => {
                const statusInfo = getStatusInfo(entry.status);
                const StatusIcon = statusInfo.icon;
                const isExpanded = expandedEntries.has(entry._id);
                const hasFailedUrls =
                  entry.failedUrls && entry.failedUrls.length > 0;

                return (
                  <div
                    key={entry._id}
                    className="border border-surface-200 dark:border-surface-700 rounded-xl overflow-hidden"
                  >
                    {/* Main Entry */}
                    <div className="p-4">
                      <div className="flex items-start gap-4">
                        {/* Status Icon */}
                        <div
                          className={cn(
                            'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                            statusInfo.bgColor
                          )}
                        >
                          <StatusIcon className={cn('h-5 w-5', statusInfo.color)} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          {/* Header */}
                          <div className="flex items-center gap-2 mb-1">
                            <Badge
                              variant={
                                entry.syncType === 'manual' ? 'primary' : 'secondary'
                              }
                              size="sm"
                            >
                              {entry.syncType === 'manual' ? 'Manual' : 'Scheduled'}
                            </Badge>
                            <span className="text-sm text-surface-500">
                              {formatRelativeTime(entry.startedAt)}
                            </span>
                          </div>

                          {/* Triggered By (for manual syncs) */}
                          {entry.syncType === 'manual' && entry.triggeredBy && (
                            <div className="flex items-center gap-2 mb-2">
                              <Avatar
                                firstName={entry.triggeredBy.firstName}
                                lastName={entry.triggeredBy.lastName}
                                size="xs"
                              />
                              <span className="text-sm text-surface-700 dark:text-surface-300">
                                {entry.triggeredBy.firstName} {entry.triggeredBy.lastName}
                              </span>
                            </div>
                          )}

                          {/* Stats Summary */}
                          <div className="flex flex-wrap items-center gap-4 text-sm">
                            <span className="flex items-center gap-1 text-surface-500">
                              <Clock className="h-4 w-4" />
                              {formatDuration(entry.durationMs)}
                            </span>

                            {/* Discovery Stats */}
                            <span className="text-surface-500">
                              {entry.discoveryStats.newUrls > 0 && (
                                <span className="text-green-600">
                                  +{entry.discoveryStats.newUrls} new
                                </span>
                              )}
                              {entry.discoveryStats.updatedUrls > 0 && (
                                <span className="text-amber-600 ml-2">
                                  {entry.discoveryStats.updatedUrls} updated
                                </span>
                              )}
                              {entry.discoveryStats.deletedUrls > 0 && (
                                <span className="text-red-600 ml-2">
                                  -{entry.discoveryStats.deletedUrls} deleted
                                </span>
                              )}
                              {entry.discoveryStats.newUrls === 0 &&
                                entry.discoveryStats.updatedUrls === 0 &&
                                entry.discoveryStats.deletedUrls === 0 && (
                                  <span>No changes detected</span>
                                )}
                            </span>

                            {/* Sync Stats */}
                            <span className="text-surface-500">
                              {entry.syncStats.urlsSynced > 0 && (
                                <span className="text-green-600">
                                  {entry.syncStats.urlsSynced} synced
                                </span>
                              )}
                              {entry.syncStats.urlsFailed > 0 && (
                                <span className="text-red-600 ml-2">
                                  {entry.syncStats.urlsFailed} failed
                                </span>
                              )}
                            </span>
                          </div>

                          {/* Error Message */}
                          {entry.status === 'failed' && entry.errorMessage && (
                            <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                              <p className="text-sm text-red-600 dark:text-red-400">
                                {entry.errorMessage}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Expand/Collapse Button */}
                        {hasFailedUrls && (
                          <button
                            onClick={() => toggleExpanded(entry._id)}
                            className="p-2 rounded-lg text-surface-500 hover:text-surface-700 hover:bg-surface-100 dark:hover:text-surface-300 dark:hover:bg-surface-700 transition-colors"
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-5 w-5" />
                            ) : (
                              <ChevronDown className="h-5 w-5" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Expanded Failed URLs */}
                    {isExpanded && hasFailedUrls && (
                      <div className="border-t border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50 p-4">
                        <h4 className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-3 flex items-center gap-2">
                          <XCircle className="h-4 w-4 text-red-500" />
                          Failed URLs ({entry.failedUrls.length})
                        </h4>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {entry.failedUrls.map((failed, i) => (
                            <div
                              key={i}
                              className="p-2 bg-white dark:bg-surface-700 rounded-lg text-sm"
                            >
                              <a
                                href={failed.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-surface-900 dark:text-white hover:text-primary-600 flex items-center gap-1 truncate"
                              >
                                {truncateUrl(failed.url)}
                                <ExternalLink className="h-3 w-3 flex-shrink-0" />
                              </a>
                              <p className="text-red-600 dark:text-red-400 text-xs mt-1">
                                {failed.error}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-surface-200 dark:border-surface-700">
            <p className="text-sm text-surface-500">
              Page {pagination.page} of {pagination.pages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                disabled={page >= pagination.pages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

