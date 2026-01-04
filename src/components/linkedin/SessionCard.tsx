'use client';

import { LinkedInSession } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import {
  User,
  Building2,
  Search,
  Hash,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Play,
  Timer,
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

interface SessionCardProps {
  session: LinkedInSession;
  onClick?: () => void;
  compact?: boolean;
}

const targetTypeIcons = {
  profile: User,
  company: Building2,
  search: Search,
  hashtag: Hash,
  post_detail: FileText,
};

const statusConfig: Record<
  string,
  { label: string; variant: 'success' | 'warning' | 'danger' | 'secondary' | 'primary'; icon: typeof CheckCircle }
> = {
  pending: { label: 'Pending', variant: 'secondary', icon: Clock },
  sent: { label: 'Sent', variant: 'primary', icon: Play },
  in_progress: { label: 'In Progress', variant: 'primary', icon: Timer },
  success: { label: 'Success', variant: 'success', icon: CheckCircle },
  partial: { label: 'Partial', variant: 'warning', icon: AlertTriangle },
  failed: { label: 'Failed', variant: 'danger', icon: XCircle },
  timeout: { label: 'Timeout', variant: 'danger', icon: Clock },
};

const triggerTypeLabels = {
  scheduled: 'Scheduled',
  manual: 'Manual',
  search: 'Search',
  retry: 'Retry',
};

export function SessionCard({ session, onClick, compact = false }: SessionCardProps) {
  const TargetIcon = targetTypeIcons[session.targetType];
  const statusInfo = statusConfig[session.status] || statusConfig.pending;
  const StatusIcon = statusInfo.icon;

  const getScraperName = () => {
    if (typeof session.scraperId === 'string') {
      return session.scraperName;
    }
    return session.scraperId.name;
  };

  const getTargetName = () => {
    if (session.targetId && typeof session.targetId !== 'string') {
      return session.targetId.displayName;
    }
    // Extract username from URL
    const match = session.targetUrl.match(/linkedin\.com\/(?:in|company)\/([^/]+)/);
    return match ? match[1] : session.targetUrl;
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <Card hover={!!onClick} className={cn('h-full', onClick && 'cursor-pointer')} onClick={onClick}>
      <CardContent className={cn('p-5', compact && 'p-4')}>
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <div className="p-2 rounded-lg bg-surface-100 dark:bg-surface-700">
            <TargetIcon className="h-5 w-5 text-surface-600 dark:text-surface-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-surface-900 dark:text-white truncate">
                {getTargetName()}
              </h4>
              <Badge variant={statusInfo.variant} size="sm" className="flex items-center gap-1">
                <StatusIcon className="h-3 w-3" />
                {statusInfo.label}
              </Badge>
            </div>
            <p className="text-xs text-surface-500 dark:text-surface-400">
              {session.targetType} • {getScraperName()}
            </p>
          </div>
        </div>

        {/* Results (if available) */}
        {session.results && (
          <div className="grid grid-cols-4 gap-2 py-3 border-t border-surface-200 dark:border-surface-700">
            <div className="text-center">
              <p className="text-lg font-bold text-surface-900 dark:text-white">
                {session.results.postsFound}
              </p>
              <p className="text-xs text-surface-500">Found</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-success-600 dark:text-success-400">
                {session.results.newPosts}
              </p>
              <p className="text-xs text-surface-500">New</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-primary-600 dark:text-primary-400">
                {session.results.updatedPosts}
              </p>
              <p className="text-xs text-surface-500">Updated</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-surface-600 dark:text-surface-400">
                {session.results.commentsCollected}
              </p>
              <p className="text-xs text-surface-500">Comments</p>
            </div>
          </div>
        )}

        {/* Error (if failed) */}
        {session.error && (
          <div className="py-3 border-t border-surface-200 dark:border-surface-700">
            <div className="flex items-start gap-2 p-3 bg-error-50 dark:bg-error-900/20 rounded-lg">
              <XCircle className="h-4 w-4 text-error-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-error-700 dark:text-error-400">
                  {session.error.code}
                </p>
                <p className="text-xs text-error-600 dark:text-error-400">
                  {session.error.message}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-surface-200 dark:border-surface-700">
          <div className="flex items-center gap-3 text-xs text-surface-500 dark:text-surface-400">
            <span className="px-2 py-0.5 bg-surface-100 dark:bg-surface-700 rounded">
              {triggerTypeLabels[session.triggerType]}
            </span>
            {session.durationMs && (
              <span>{formatDuration(session.durationMs)}</span>
            )}
          </div>
          <p className="text-xs text-surface-500 dark:text-surface-400">
            {session.completedAt
              ? formatDistanceToNow(new Date(session.completedAt), { addSuffix: true })
              : session.startedAt
              ? 'In progress...'
              : session.createdAt
              ? formatDistanceToNow(new Date(session.createdAt), { addSuffix: true })
              : ''}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
