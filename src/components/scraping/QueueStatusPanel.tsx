'use client';

import { useState } from 'react';
import {
  QueuedCommand,
  QueueStatus,
  PLATFORM_LABELS,
  PLATFORM_COLORS,
} from '@/types/scraping';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  Clock,
  RefreshCw,
  X,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Linkedin,
  Globe,
  ChevronDown,
  ChevronUp,
  Trash2,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface QueueStatusPanelProps {
  status?: QueueStatus;
  commands: QueuedCommand[];
  isLoading?: boolean;
  onRefresh?: () => void;
  onRetry?: (id: string) => Promise<any>;
  onCancel?: (id: string) => Promise<any>;
  onClearFailed?: () => Promise<any>;
  isRetrying?: boolean;
  isCancelling?: boolean;
  isClearing?: boolean;
}

// Reddit icon component
function RedditIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      className={className}
      style={style}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm6.066 13.29c.073.353.11.717.11 1.09 0 3.5-4.075 6.34-9.1 6.34s-9.1-2.84-9.1-6.34c0-.373.037-.737.11-1.09a1.79 1.79 0 01-.725-1.435c0-.99.804-1.79 1.795-1.79.46 0 .88.175 1.196.462 1.18-.762 2.77-1.24 4.523-1.305l.855-4.032c.024-.117.089-.219.183-.287a.453.453 0 01.324-.064l2.88.612a1.27 1.27 0 112.406.282l.001.003c0 .703-.57 1.273-1.274 1.273-.703 0-1.273-.57-1.273-1.273l-2.582-.55-.765 3.608c1.715.076 3.27.554 4.427 1.303a1.79 1.79 0 011.196-.462c.99 0 1.795.8 1.795 1.79 0 .61-.305 1.148-.766 1.472zM8.054 13.5c-.703 0-1.273.57-1.273 1.273s.57 1.273 1.273 1.273 1.273-.57 1.273-1.273-.57-1.273-1.273-1.273zm7.892 0c-.703 0-1.273.57-1.273 1.273s.57 1.273 1.273 1.273 1.273-.57 1.273-1.273-.57-1.273-1.273-1.273zm-6.59 4.16c-.13.13-.13.34 0 .47 1.136 1.136 3.152 1.225 4.394 0 .13-.13.13-.34 0-.47-.13-.13-.34-.13-.47 0-.9.9-2.51.9-3.41 0-.13-.13-.34-.13-.47 0z" />
    </svg>
  );
}

function getPlatformIcon(platform: string, className?: string) {
  switch (platform) {
    case 'linkedin':
      return <Linkedin className={className} style={{ color: PLATFORM_COLORS.linkedin }} />;
    case 'reddit':
      return <RedditIcon className={className} style={{ color: PLATFORM_COLORS.reddit }} />;
    default:
      return <Globe className={className} style={{ color: PLATFORM_COLORS.website }} />;
  }
}

function getStatusIcon(status: string, className?: string) {
  switch (status) {
    case 'pending':
      return <Clock className={`${className} text-warning-500`} />;
    case 'in_progress':
      return <Loader2 className={`${className} text-primary-500 animate-spin`} />;
    case 'failed':
      return <AlertTriangle className={`${className} text-error-500`} />;
    case 'completed':
      return <CheckCircle className={`${className} text-success-500`} />;
    default:
      return <Clock className={`${className} text-surface-400`} />;
  }
}

export function QueueStatusPanel({
  status,
  commands,
  isLoading,
  onRefresh,
  onRetry,
  onCancel,
  onClearFailed,
  isRetrying,
  isCancelling,
  isClearing,
}: QueueStatusPanelProps) {
  const [expanded, setExpanded] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const totalQueued = (status?.pending || 0) + (status?.inProgress || 0);
  const hasFailed = (status?.failed || 0) > 0;

  const handleRetry = async (id: string) => {
    setProcessingId(id);
    try {
      await onRetry?.(id);
    } finally {
      setProcessingId(null);
    }
  };

  const handleCancel = async (id: string) => {
    setProcessingId(id);
    try {
      await onCancel?.(id);
    } finally {
      setProcessingId(null);
    }
  };

  if (!status && !isLoading) {
    return null;
  }

  return (
    <Card>
      <CardContent className="p-0">
        {/* Header */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors"
        >
          <div className="flex items-center gap-4">
            <h3 className="font-semibold text-surface-900 dark:text-white flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary-500" />
              Command Queue
            </h3>
            {totalQueued > 0 && (
              <span className="px-2 py-0.5 text-xs font-medium bg-warning-100 dark:bg-warning-900/30 text-warning-700 dark:text-warning-300 rounded-full">
                {totalQueued} queued
              </span>
            )}
            {hasFailed && (
              <span className="px-2 py-0.5 text-xs font-medium bg-error-100 dark:bg-error-900/30 text-error-700 dark:text-error-300 rounded-full">
                {status?.failed} failed
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onRefresh?.();
              }}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            {expanded ? (
              <ChevronUp className="h-5 w-5 text-surface-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-surface-400" />
            )}
          </div>
        </button>

        {expanded && (
          <div className="border-t border-surface-100 dark:border-surface-700">
            {/* Stats */}
            {status && (
              <div className="px-6 py-4 grid grid-cols-4 gap-4 bg-surface-50 dark:bg-surface-800/30">
                <div className="text-center">
                  <p className="text-2xl font-bold text-warning-600 dark:text-warning-400">
                    {status.pending}
                  </p>
                  <p className="text-xs text-surface-500">Pending</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                    {status.inProgress}
                  </p>
                  <p className="text-xs text-surface-500">In Progress</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-error-600 dark:text-error-400">
                    {status.failed}
                  </p>
                  <p className="text-xs text-surface-500">Failed</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    {Object.entries(status.byPlatform || {}).map(([platform, count]) => (
                      <div
                        key={platform}
                        className="flex items-center gap-1 px-2 py-1 bg-white dark:bg-surface-800 rounded text-xs"
                        title={`${PLATFORM_LABELS[platform as keyof typeof PLATFORM_LABELS] || platform}: ${count}`}
                      >
                        {getPlatformIcon(platform, 'h-3 w-3')}
                        <span>{count}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-surface-500 mt-1">By Platform</p>
                </div>
              </div>
            )}

            {/* Command List */}
            {commands.length > 0 ? (
              <div className="max-h-64 overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-surface-50 dark:bg-surface-800 text-xs text-surface-500 sticky top-0">
                    <tr>
                      <th className="px-6 py-3 text-left font-medium">Target</th>
                      <th className="px-6 py-3 text-left font-medium">Schedule</th>
                      <th className="px-6 py-3 text-left font-medium">Status</th>
                      <th className="px-6 py-3 text-left font-medium">Retries</th>
                      <th className="px-6 py-3 text-left font-medium">Next Retry</th>
                      <th className="px-6 py-3 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-100 dark:divide-surface-700">
                    {commands.map((cmd) => (
                      <tr key={cmd._id} className="hover:bg-surface-50 dark:hover:bg-surface-800/30">
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-2">
                            {getPlatformIcon(cmd.platform, 'h-4 w-4')}
                            <div className="min-w-0">
                              <p className="font-medium text-surface-900 dark:text-white truncate">
                                {cmd.targetId?.targetName || 'Unknown'}
                              </p>
                              <p className="text-xs text-surface-500 truncate">
                                {cmd.targetId?.url}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-3 text-sm text-surface-600 dark:text-surface-400">
                          {cmd.scheduleId?.name || 'Unknown'}
                        </td>
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-1.5">
                            {getStatusIcon(cmd.status, 'h-4 w-4')}
                            <span className="text-sm capitalize">{cmd.status.replace('_', ' ')}</span>
                          </div>
                        </td>
                        <td className="px-6 py-3 text-sm text-surface-600 dark:text-surface-400">
                          {cmd.retryCount} / {cmd.maxRetries}
                        </td>
                        <td className="px-6 py-3 text-sm text-surface-600 dark:text-surface-400">
                          {cmd.nextRetryAt
                            ? formatDistanceToNow(new Date(cmd.nextRetryAt), { addSuffix: true })
                            : '-'}
                        </td>
                        <td className="px-6 py-3">
                          <div className="flex items-center justify-end gap-2">
                            {cmd.status === 'failed' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRetry(cmd._id)}
                                disabled={processingId === cmd._id}
                              >
                                <RefreshCw
                                  className={`h-4 w-4 ${
                                    processingId === cmd._id && isRetrying ? 'animate-spin' : ''
                                  }`}
                                />
                              </Button>
                            )}
                            {(cmd.status === 'pending' || cmd.status === 'failed') && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCancel(cmd._id)}
                                disabled={processingId === cmd._id}
                              >
                                <X className="h-4 w-4 text-error-500" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="px-6 py-8 text-center">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-success-500" />
                <p className="text-surface-600 dark:text-surface-400">
                  No commands in queue
                </p>
              </div>
            )}

            {/* Actions */}
            {hasFailed && onClearFailed && (
              <div className="px-6 py-3 border-t border-surface-100 dark:border-surface-700 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClearFailed}
                  disabled={isClearing}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear Failed Commands
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
