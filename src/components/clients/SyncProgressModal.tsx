'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useTriggerSync, useSyncJobStatus } from '@/services/kb-sources.service';
import { KnowledgeBaseSource, SyncJobProgress, SyncJobResult } from '@/types/kb-sources';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { cn } from '@/lib/utils';
import {
  Loader2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Search,
  FileText,
  Trash2,
} from 'lucide-react';

interface SyncProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  source: KnowledgeBaseSource;
}

export function SyncProgressModal({
  isOpen,
  onClose,
  clientId,
  source,
}: SyncProgressModalProps) {
  const [jobId, setJobId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const hasStartedRef = useRef(false);

  const triggerSync = useTriggerSync(clientId, source._id);
  const { data: jobStatus, isLoading: isPolling } = useSyncJobStatus(clientId, jobId);

  const startSync = useCallback(async () => {
    try {
      setError(null);
      const result = await triggerSync.mutateAsync();
      setJobId(result.jobId);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to start sync');
    }
  }, [triggerSync]);

  // Start sync when modal opens
  useEffect(() => {
    if (isOpen && !hasStartedRef.current) {
      hasStartedRef.current = true;
      startSync();
    }
  }, [isOpen, startSync]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setJobId(null);
      setError(null);
      hasStartedRef.current = false;
    }
  }, [isOpen]);

  const handleRetry = () => {
    setJobId(null);
    setError(null);
    startSync();
  };

  const progress = jobStatus?.progress;
  const result = jobStatus?.result;
  const state = jobStatus?.state;

  const isComplete = state === 'completed';
  const isFailed = state === 'failed' || progress?.phase === 'failed';
  const isRunning = state === 'active' || state === 'waiting';

  // Calculate progress percentage
  const getProgressPercentage = (): number => {
    if (!progress) return 0;
    if (isComplete) return 100;
    if (isFailed) return 0;

    if (progress.phase === 'discovery') {
      return 10; // Discovery is roughly 10% of the process
    }

    if (progress.phase === 'syncing' && progress.urlsToProcess) {
      const syncProgress = (progress.urlsProcessed || 0) / progress.urlsToProcess;
      return 10 + syncProgress * 90; // Syncing is 90% of the process
    }

    return 0;
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

  // Truncate URL for display
  const truncateUrl = (url: string, maxLength = 50): string => {
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength - 3) + '...';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={isRunning ? () => {} : onClose}
      title={`Syncing ${source.name}`}
      size="md"
      showCloseButton={!isRunning}
    >
      <div className="space-y-6">
        {/* Error State */}
        {error && (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-2">
              Sync Failed to Start
            </h3>
            <p className="text-surface-500 mb-6">{error}</p>
            <div className="flex justify-center gap-3">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button onClick={handleRetry}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </div>
        )}

        {/* Starting State */}
        {!error && !jobStatus && (
          <div className="text-center py-8">
            <Loader2 className="h-12 w-12 text-primary-500 animate-spin mx-auto mb-4" />
            <p className="text-surface-500">Starting sync...</p>
          </div>
        )}

        {/* Progress State */}
        {jobStatus && !isComplete && !isFailed && (
          <>
            {/* Phase Indicator */}
            <div className="flex items-center gap-3 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl">
              <Loader2 className="h-5 w-5 text-primary-500 animate-spin" />
              <div>
                <p className="font-medium text-surface-900 dark:text-white">
                  {progress?.phase === 'discovery'
                    ? 'Discovering URLs from sitemap...'
                    : 'Syncing content...'}
                </p>
                <p className="text-sm text-surface-500">{progress?.message}</p>
              </div>
            </div>

            {/* Discovery Stats */}
            {progress?.phase === 'discovery' && progress.totalUrlsInSitemap && (
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-surface-900 dark:text-white">
                    {progress.totalUrlsInSitemap}
                  </p>
                  <p className="text-xs text-surface-500">Total URLs</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{progress.newUrls || 0}</p>
                  <p className="text-xs text-surface-500">New</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-600">{progress.updatedUrls || 0}</p>
                  <p className="text-xs text-surface-500">Updated</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-600">{progress.deletedUrls || 0}</p>
                  <p className="text-xs text-surface-500">Deleted</p>
                </div>
              </div>
            )}

            {/* Sync Progress */}
            {progress?.phase === 'syncing' && (
              <>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-surface-500">
                      {progress.urlsProcessed || 0} of {progress.urlsToProcess || 0} URLs
                    </span>
                    <span className="text-surface-900 dark:text-white font-medium">
                      {Math.round(getProgressPercentage())}%
                    </span>
                  </div>
                  <Progress value={getProgressPercentage()} />
                </div>

                {/* Current URL */}
                {progress.currentUrl && (
                  <div className="p-3 bg-surface-50 dark:bg-surface-800 rounded-lg">
                    <p className="text-xs text-surface-500 mb-1">Currently processing:</p>
                    <p className="text-sm text-surface-700 dark:text-surface-300 font-mono truncate">
                      {truncateUrl(progress.currentUrl, 60)}
                    </p>
                  </div>
                )}

                {/* Live Stats */}
                <div className="flex gap-6 text-sm">
                  <span className="flex items-center gap-1 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    {progress.urlsSynced || 0} synced
                  </span>
                  {(progress.urlsFailed || 0) > 0 && (
                    <span className="flex items-center gap-1 text-red-600">
                      <XCircle className="h-4 w-4" />
                      {progress.urlsFailed} failed
                    </span>
                  )}
                </div>
              </>
            )}
          </>
        )}

        {/* Failed State */}
        {isFailed && (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-2">
              Sync Failed
            </h3>
            <p className="text-surface-500 mb-6">
              {jobStatus?.failedReason || progress?.error || 'An error occurred during sync'}
            </p>
            <div className="flex justify-center gap-3">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button onClick={handleRetry}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </div>
        )}

        {/* Complete State */}
        {isComplete && result && (
          <>
            {/* Success Header */}
            <div className="text-center">
              <div
                className={cn(
                  'w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4',
                  result.success
                    ? 'bg-green-100 dark:bg-green-900/30'
                    : 'bg-amber-100 dark:bg-amber-900/30'
                )}
              >
                {result.success ? (
                  <CheckCircle className="h-8 w-8 text-green-500" />
                ) : (
                  <AlertTriangle className="h-8 w-8 text-amber-500" />
                )}
              </div>
              <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-1">
                {result.success ? 'Sync Complete' : 'Sync Completed with Issues'}
              </h3>
              <p className="text-sm text-surface-500">
                Duration: {formatDuration(result.durationMs)}
              </p>
            </div>

            {/* Discovery Summary */}
            <div className="p-4 bg-surface-50 dark:bg-surface-800 rounded-xl">
              <h4 className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-3 flex items-center gap-2">
                <Search className="h-4 w-4" />
                Discovery Summary
              </h4>
              <div className="grid grid-cols-5 gap-2 text-center text-sm">
                <div>
                  <p className="font-semibold text-surface-900 dark:text-white">
                    {result.discovery.totalUrlsInSitemap}
                  </p>
                  <p className="text-xs text-surface-500">Total</p>
                </div>
                <div>
                  <p className="font-semibold text-green-600">{result.discovery.newUrls}</p>
                  <p className="text-xs text-surface-500">New</p>
                </div>
                <div>
                  <p className="font-semibold text-amber-600">{result.discovery.updatedUrls}</p>
                  <p className="text-xs text-surface-500">Updated</p>
                </div>
                <div>
                  <p className="font-semibold text-red-600">{result.discovery.deletedUrls}</p>
                  <p className="text-xs text-surface-500">Deleted</p>
                </div>
                <div>
                  <p className="font-semibold text-surface-500">{result.discovery.unchangedUrls}</p>
                  <p className="text-xs text-surface-500">Unchanged</p>
                </div>
              </div>
            </div>

            {/* Sync Summary */}
            <div className="p-4 bg-surface-50 dark:bg-surface-800 rounded-xl">
              <h4 className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Sync Summary
              </h4>
              <div className="grid grid-cols-4 gap-2 text-center text-sm">
                <div>
                  <p className="font-semibold text-surface-900 dark:text-white">
                    {result.urlsProcessed}
                  </p>
                  <p className="text-xs text-surface-500">Processed</p>
                </div>
                <div>
                  <p className="font-semibold text-green-600">{result.urlsSynced}</p>
                  <p className="text-xs text-surface-500">Synced</p>
                </div>
                <div>
                  <p className="font-semibold text-red-600">{result.urlsFailed}</p>
                  <p className="text-xs text-surface-500">Failed</p>
                </div>
                <div>
                  <p className="font-semibold text-surface-500">{result.urlsDeleted}</p>
                  <p className="text-xs text-surface-500">Deleted</p>
                </div>
              </div>
            </div>

            {/* Failed URLs List */}
            {result.errors && result.errors.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-2 flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  Failed URLs ({result.errors.length})
                </h4>
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {result.errors.map((err, i) => (
                    <div
                      key={i}
                      className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg text-sm"
                    >
                      <a
                        href={err.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-surface-900 dark:text-white hover:text-primary-600 flex items-center gap-1 truncate"
                      >
                        {truncateUrl(err.url, 50)}
                        <ExternalLink className="h-3 w-3 flex-shrink-0" />
                      </a>
                      <p className="text-red-600 dark:text-red-400 text-xs mt-1">{err.error}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Close Button */}
            <div className="flex justify-end pt-4 border-t border-surface-200 dark:border-surface-700">
              <Button onClick={onClose}>Close</Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}



