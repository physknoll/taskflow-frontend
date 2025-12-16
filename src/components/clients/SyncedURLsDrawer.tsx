'use client';

import { useState } from 'react';
import { useSyncedUrls } from '@/services/kb-sources.service';
import { KnowledgeBaseSource, UrlSyncStatus, SyncedUrl } from '@/types/kb-sources';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn, formatDate } from '@/lib/utils';
import {
  ExternalLink,
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
  FileText,
  AlertTriangle,
  Search,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface SyncedURLsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  source: KnowledgeBaseSource;
}

const STATUS_FILTERS: { value: UrlSyncStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'synced', label: 'Synced' },
  { value: 'failed', label: 'Failed' },
  { value: 'pending', label: 'Pending' },
  { value: 'deleted', label: 'Deleted' },
];

export function SyncedURLsDrawer({
  isOpen,
  onClose,
  clientId,
  source,
}: SyncedURLsDrawerProps) {
  const [statusFilter, setStatusFilter] = useState<UrlSyncStatus | 'all'>('all');
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch URLs
  const { data: urlsData, isLoading } = useSyncedUrls(clientId, source._id, {
    page,
    limit: 20,
    status: statusFilter === 'all' ? undefined : statusFilter,
  });

  const urls = urlsData?.data || [];
  const pagination = urlsData?.pagination;

  // Get status icon and color
  const getStatusInfo = (status: UrlSyncStatus) => {
    switch (status) {
      case 'synced':
        return {
          icon: CheckCircle,
          color: 'text-green-500',
          bgColor: 'bg-green-100 dark:bg-green-900/30',
          label: 'Synced',
        };
      case 'failed':
        return {
          icon: XCircle,
          color: 'text-red-500',
          bgColor: 'bg-red-100 dark:bg-red-900/30',
          label: 'Failed',
        };
      case 'pending':
        return {
          icon: Clock,
          color: 'text-amber-500',
          bgColor: 'bg-amber-100 dark:bg-amber-900/30',
          label: 'Pending',
        };
      case 'deleted':
        return {
          icon: Trash2,
          color: 'text-surface-400',
          bgColor: 'bg-surface-100 dark:bg-surface-700',
          label: 'Deleted',
        };
      default:
        return {
          icon: FileText,
          color: 'text-surface-400',
          bgColor: 'bg-surface-100 dark:bg-surface-700',
          label: 'Unknown',
        };
    }
  };

  // Filter URLs by search query (client-side)
  const filteredUrls = searchQuery
    ? urls.filter(
        (url) =>
          url.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
          url.title?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : urls;

  // Format word count
  const formatWordCount = (count?: number) => {
    if (!count) return '';
    if (count < 1000) return `${count} words`;
    return `${(count / 1000).toFixed(1)}k words`;
  };

  // Truncate URL
  const truncateUrl = (url: string, maxLength = 60): string => {
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength - 3) + '...';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Synced URLs - ${source.name}`}
      size="xl"
      disableContentScroll
    >
      <div className="flex flex-col h-[70vh]">
        {/* Stats Summary */}
        <div className="flex items-center gap-6 mb-4 text-sm">
          <span className="text-surface-600 dark:text-surface-400">
            <strong className="text-surface-900 dark:text-white">{source.totalUrls}</strong> total
          </span>
          <span className="text-green-600">
            <strong>{source.syncedUrls}</strong> synced
          </span>
          {source.failedUrls > 0 && (
            <span className="text-red-600">
              <strong>{source.failedUrls}</strong> failed
            </span>
          )}
          {source.pendingUrls > 0 && (
            <span className="text-amber-600">
              <strong>{source.pendingUrls}</strong> pending
            </span>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-4">
          {/* Status Filter Tabs */}
          <div className="flex gap-1 bg-surface-100 dark:bg-surface-800 p-1 rounded-lg">
            {STATUS_FILTERS.map((filter) => (
              <button
                key={filter.value}
                onClick={() => {
                  setStatusFilter(filter.value);
                  setPage(1);
                }}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                  statusFilter === filter.value
                    ? 'bg-white dark:bg-surface-700 text-surface-900 dark:text-white shadow-sm'
                    : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white'
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search URLs..."
                className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-white placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        {/* URL List */}
        <div className="flex-1 overflow-y-auto border border-surface-200 dark:border-surface-700 rounded-xl">
          {isLoading ? (
            <div className="p-4 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-start gap-3">
                  <Skeleton variant="rounded" width={32} height={32} />
                  <div className="flex-1">
                    <Skeleton variant="text" width="70%" />
                    <Skeleton variant="text" width="40%" className="mt-1" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredUrls.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-surface-400 py-12">
              <FileText className="h-12 w-12 mb-3 opacity-50" />
              <p className="text-sm">
                {searchQuery
                  ? 'No URLs match your search.'
                  : statusFilter !== 'all'
                  ? `No ${statusFilter} URLs found.`
                  : 'No URLs have been synced yet.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-surface-200 dark:divide-surface-700">
              {filteredUrls.map((url) => {
                const statusInfo = getStatusInfo(url.status);
                const StatusIcon = statusInfo.icon;

                return (
                  <div
                    key={url._id}
                    className="p-4 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      {/* Status Icon */}
                      <div
                        className={cn(
                          'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                          statusInfo.bgColor
                        )}
                      >
                        <StatusIcon className={cn('h-4 w-4', statusInfo.color)} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Title */}
                        {url.title && (
                          <h4 className="font-medium text-surface-900 dark:text-white truncate mb-1">
                            {url.title}
                          </h4>
                        )}

                        {/* URL */}
                        <a
                          href={url.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-surface-500 hover:text-primary-600 flex items-center gap-1 truncate"
                        >
                          {truncateUrl(url.url)}
                          <ExternalLink className="h-3 w-3 flex-shrink-0" />
                        </a>

                        {/* Meta */}
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-surface-400">
                          <Badge
                            variant={
                              url.status === 'synced'
                                ? 'success'
                                : url.status === 'failed'
                                ? 'danger'
                                : 'secondary'
                            }
                            size="sm"
                          >
                            {statusInfo.label}
                          </Badge>

                          {url.lastSyncedAt && (
                            <span>Synced: {formatDate(url.lastSyncedAt)}</span>
                          )}

                          {url.wordCount && <span>{formatWordCount(url.wordCount)}</span>}

                          {url.syncAttempts && url.syncAttempts > 1 && (
                            <span className="text-amber-500">
                              {url.syncAttempts} attempts
                            </span>
                          )}
                        </div>

                        {/* Error Message */}
                        {url.status === 'failed' && url.lastSyncError && (
                          <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                            <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3 flex-shrink-0" />
                              {url.lastSyncError}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
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
              Page {pagination.page} of {pagination.pages} ({pagination.total} total)
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
