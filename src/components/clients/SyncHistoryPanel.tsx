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
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Globe,
  FileText,
  Trash2,
} from 'lucide-react';

interface SyncHistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  source: KnowledgeBaseSource;
}

// Timeline Entry Sub-component
interface TimelineEntryProps {
  entry: SyncHistoryEntry;
  isExpanded: boolean;
  onToggle: () => void;
  isLast: boolean;
}

function TimelineEntry({ entry, isExpanded, onToggle, isLast }: TimelineEntryProps) {
  // Get status info for color coding
  const getStatusInfo = (status: SyncHistoryEntry['status']) => {
    switch (status) {
      case 'success':
        return {
          dotColor: 'bg-green-500',
          dotRing: 'ring-green-200 dark:ring-green-900/50',
          label: 'Success',
          icon: CheckCircle,
          textColor: 'text-green-600 dark:text-green-400',
        };
      case 'partial':
        return {
          dotColor: 'bg-amber-500',
          dotRing: 'ring-amber-200 dark:ring-amber-900/50',
          label: 'Partial',
          icon: AlertTriangle,
          textColor: 'text-amber-600 dark:text-amber-400',
        };
      case 'failed':
        return {
          dotColor: 'bg-red-500',
          dotRing: 'ring-red-200 dark:ring-red-900/50',
          label: 'Failed',
          icon: XCircle,
          textColor: 'text-red-600 dark:text-red-400',
        };
      default:
        return {
          dotColor: 'bg-surface-400',
          dotRing: 'ring-surface-200 dark:ring-surface-700',
          label: 'Unknown',
          icon: Clock,
          textColor: 'text-surface-500',
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

  // Format time from ISO string
  const formatTime = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Format full date/time
  const formatDateTime = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Truncate URL
  const truncateUrl = (url: string, maxLength = 60): string => {
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength - 3) + '...';
  };

  // Build summary text
  const getSummaryText = (): string => {
    const parts: string[] = [];
    
    if (entry.discoveryStats.newUrls > 0) {
      parts.push(`+${entry.discoveryStats.newUrls} new`);
    }
    if (entry.discoveryStats.updatedUrls > 0) {
      parts.push(`${entry.discoveryStats.updatedUrls} updated`);
    }
    if (entry.discoveryStats.deletedUrls > 0) {
      parts.push(`${entry.discoveryStats.deletedUrls} deleted`);
    }
    
    if (parts.length === 0) {
      if (entry.status === 'failed' && entry.errorMessage) {
        return entry.errorMessage;
      }
      return 'No changes detected';
    }
    
    return parts.join(', ');
  };

  const statusInfo = getStatusInfo(entry.status);
  const StatusIcon = statusInfo.icon;
  const hasFailedUrls = entry.failedUrls && entry.failedUrls.length > 0;

  return (
    <div className="relative pl-8">
      {/* Vertical connector line */}
      {!isLast && (
        <div className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-surface-200 dark:bg-surface-700" />
      )}

      {/* Timeline dot - clickable */}
      <button
        onClick={onToggle}
        className={cn(
          'absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center',
          'ring-4 transition-all duration-200 cursor-pointer',
          'hover:scale-110 hover:ring-opacity-70',
          statusInfo.dotColor,
          statusInfo.dotRing
        )}
        aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
      >
        <StatusIcon className="h-3.5 w-3.5 text-white" />
      </button>

      {/* Entry content */}
      <div className="pb-6">
        {/* Header row with date and badges */}
        <div 
          className="flex items-center gap-3 cursor-pointer group"
          onClick={onToggle}
        >
          <span className="font-medium text-surface-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            {formatDateTime(entry.startedAt)}
          </span>
          <Badge
            variant={entry.syncType === 'manual' ? 'primary' : 'secondary'}
            size="sm"
          >
            {entry.syncType === 'manual' ? 'Manual' : 'Scheduled'}
          </Badge>
          <Badge
            variant="secondary"
            size="sm"
            className={cn(
              statusInfo.textColor,
              entry.status === 'success' && 'bg-green-100 dark:bg-green-900/30',
              entry.status === 'partial' && 'bg-amber-100 dark:bg-amber-900/30',
              entry.status === 'failed' && 'bg-red-100 dark:bg-red-900/30'
            )}
          >
            {statusInfo.label}
          </Badge>
        </div>

        {/* Triggered by (for manual syncs) */}
        {entry.syncType === 'manual' && entry.triggeredBy && (
          <div className="flex items-center gap-2 mt-1.5 text-sm text-surface-600 dark:text-surface-400">
            <span>by</span>
            <Avatar
              firstName={entry.triggeredBy.firstName}
              lastName={entry.triggeredBy.lastName}
              size="xs"
            />
            <span>
              {entry.triggeredBy.firstName} {entry.triggeredBy.lastName}
            </span>
          </div>
        )}

        {/* Summary text */}
        <p className="text-sm text-surface-600 dark:text-surface-400 mt-1">
          {getSummaryText()}
        </p>

        {/* Expanded details with animation */}
        <div
          className={cn(
            'overflow-hidden transition-all duration-300 ease-in-out',
            isExpanded ? 'max-h-[800px] opacity-100 mt-4' : 'max-h-0 opacity-0'
          )}
        >
          <div className="bg-surface-50 dark:bg-surface-800/50 rounded-xl p-4 border border-surface-200 dark:border-surface-700">
            {/* Timing Section */}
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                Timing
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-surface-500">Started:</span>{' '}
                  <span className="text-surface-900 dark:text-white">
                    {formatTime(entry.startedAt)}
                  </span>
                </div>
                <div>
                  <span className="text-surface-500">Completed:</span>{' '}
                  <span className="text-surface-900 dark:text-white">
                    {formatTime(entry.completedAt)}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-surface-500">Duration:</span>{' '}
                  <span className="text-surface-900 dark:text-white font-medium">
                    {formatDuration(entry.durationMs)}
                  </span>
                </div>
              </div>
            </div>

            {/* Discovery Section */}
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5" />
                Discovery
              </h4>
              <div className="text-sm space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-surface-500">Total URLs in sitemap:</span>
                  <span className="text-surface-900 dark:text-white font-medium">
                    {entry.discoveryStats.totalUrlsInSitemap.toLocaleString()}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  {entry.discoveryStats.newUrls > 0 && (
                    <span className="text-green-600 dark:text-green-400">
                      +{entry.discoveryStats.newUrls} new
                    </span>
                  )}
                  {entry.discoveryStats.updatedUrls > 0 && (
                    <span className="text-amber-600 dark:text-amber-400">
                      {entry.discoveryStats.updatedUrls} updated
                    </span>
                  )}
                  {entry.discoveryStats.deletedUrls > 0 && (
                    <span className="text-red-600 dark:text-red-400">
                      {entry.discoveryStats.deletedUrls} deleted
                    </span>
                  )}
                  {entry.discoveryStats.unchangedUrls > 0 && (
                    <span className="text-surface-500">
                      {entry.discoveryStats.unchangedUrls} unchanged
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Sync Results Section */}
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" />
                Sync Results
              </h4>
              <div className="text-sm">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-surface-900 dark:text-white">
                    {entry.syncStats.urlsProcessed} processed
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-surface-400" />
                  {entry.syncStats.urlsSynced > 0 && (
                    <span className="text-green-600 dark:text-green-400">
                      {entry.syncStats.urlsSynced} synced
                    </span>
                  )}
                  {entry.syncStats.urlsFailed > 0 && (
                    <span className="text-red-600 dark:text-red-400">
                      {entry.syncStats.urlsFailed} failed
                    </span>
                  )}
                  {entry.syncStats.urlsDeleted > 0 && (
                    <span className="flex items-center gap-1 text-surface-500">
                      <Trash2 className="h-3 w-3" />
                      {entry.syncStats.urlsDeleted} removed
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Error Message (for failed syncs) */}
            {entry.status === 'failed' && entry.errorMessage && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <div className="flex items-start gap-2">
                  <XCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700 dark:text-red-300">
                    {entry.errorMessage}
                  </p>
                </div>
              </div>
            )}

            {/* Failed URLs Section */}
            {hasFailedUrls && (
              <div>
                <h4 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <XCircle className="h-3.5 w-3.5 text-red-500" />
                  Failed URLs ({entry.failedUrls.length})
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {entry.failedUrls.map((failed, i) => (
                    <div
                      key={i}
                      className="p-2.5 bg-white dark:bg-surface-700 rounded-lg text-sm border border-surface-200 dark:border-surface-600"
                    >
                      <a
                        href={failed.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-surface-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 flex items-center gap-1 truncate transition-colors"
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
        </div>
      </div>
    </div>
  );
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
        <div className="flex items-center gap-2 mb-6 text-sm text-surface-500">
          <History className="h-4 w-4" />
          <span>Activity feed for sync operations</span>
        </div>

        {/* Timeline Container */}
        <div className="flex-1 overflow-y-auto pr-2">
          {isLoading ? (
            // Loading skeleton with timeline style
            <div className="space-y-6 pl-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="relative">
                  <div className="absolute -left-8 top-1">
                    <Skeleton variant="circular" width={24} height={24} />
                  </div>
                  <Skeleton variant="text" width="60%" />
                  <Skeleton variant="text" width="40%" className="mt-1" />
                </div>
              ))}
            </div>
          ) : history.length === 0 ? (
            // Empty state
            <div className="flex flex-col items-center justify-center h-full text-surface-400 py-12">
              <History className="h-12 w-12 mb-3 opacity-50" />
              <p className="text-sm font-medium">No sync history yet</p>
              <p className="text-xs mt-1 text-center max-w-xs">
                Sync operations will appear here after they complete.
                Only syncs with changes are recorded.
              </p>
            </div>
          ) : (
            // Timeline entries
            <div className="relative">
              {history.map((entry, index) => (
                <TimelineEntry
                  key={entry._id}
                  entry={entry}
                  isExpanded={expandedEntries.has(entry._id)}
                  onToggle={() => toggleExpanded(entry._id)}
                  isLast={index === history.length - 1}
                />
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-surface-200 dark:border-surface-700">
            <p className="text-sm text-surface-500">
              Page {pagination.page} of {pagination.pages}
              <span className="text-surface-400 ml-2">
                ({pagination.total} total entries)
              </span>
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
