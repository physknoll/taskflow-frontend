'use client';

import { LinkedInSession, LinkedInSessionStatus } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SiteIcon } from './SiteIcon';
import {
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

interface SessionsTableProps {
  sessions: LinkedInSession[];
  onViewDetails?: (session: LinkedInSession) => void;
}

const statusConfig: Record<LinkedInSessionStatus, { icon: typeof CheckCircle; color: string; variant: 'success' | 'danger' | 'warning' | 'secondary' | 'default' }> = {
  success: { icon: CheckCircle, color: 'text-success-500', variant: 'success' },
  partial: { icon: Clock, color: 'text-warning-500', variant: 'warning' },
  failed: { icon: XCircle, color: 'text-error-500', variant: 'danger' },
  timeout: { icon: Clock, color: 'text-error-500', variant: 'danger' },
  in_progress: { icon: Loader2, color: 'text-primary-500', variant: 'default' },
  pending: { icon: Clock, color: 'text-surface-400', variant: 'secondary' },
  sent: { icon: Clock, color: 'text-primary-500', variant: 'default' },
};

export function SessionsTable({ sessions, onViewDetails }: SessionsTableProps) {
  return (
    <div className="bg-white dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">
                Target
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">
                Scraper
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">
                Status
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">
                Results
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">
                Duration
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">
                Time
              </th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-200 dark:divide-surface-700">
            {sessions.map((session) => {
              const config = statusConfig[session.status];
              const StatusIcon = config.icon;
              
              return (
                <tr
                  key={session._id}
                  className="hover:bg-surface-50 dark:hover:bg-surface-800/80 transition-colors cursor-pointer"
                  onClick={() => onViewDetails?.(session)}
                >
                  {/* Target */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <SiteIcon url={session.targetUrl} size="sm" />
                      <div className="min-w-0">
                        <p className="font-medium text-surface-900 dark:text-white truncate max-w-[200px]">
                          {session.targetUrl.replace(/https?:\/\/(www\.)?/, '').split('/')[0]}
                        </p>
                        <p className="text-xs text-surface-500 capitalize">
                          {session.targetType}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Scraper */}
                  <td className="px-4 py-3">
                    <span className="text-sm text-surface-700 dark:text-surface-300">
                      {session.scraperName || 'Unknown'}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <StatusIcon className={`h-4 w-4 ${config.color} ${session.status === 'in_progress' ? 'animate-spin' : ''}`} />
                      <Badge variant={config.variant} size="sm">
                        {session.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </td>

                  {/* Results */}
                  <td className="px-4 py-3">
                    {session.results ? (
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-success-600 dark:text-success-400">
                          +{session.results.newPosts} new
                        </span>
                        <span className="text-surface-400">•</span>
                        <span className="text-surface-500">
                          {session.results.postsFound} found
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-surface-400">—</span>
                    )}
                  </td>

                  {/* Duration */}
                  <td className="px-4 py-3">
                    <span className="text-sm text-surface-500">
                      {session.durationMs
                        ? `${(session.durationMs / 1000).toFixed(1)}s`
                        : '—'}
                    </span>
                  </td>

                  {/* Time */}
                  <td className="px-4 py-3">
                    <div className="text-sm">
                      <p className="text-surface-700 dark:text-surface-300">
                        {formatDistanceToNow(new Date(session.createdAt), { addSuffix: true })}
                      </p>
                      <p className="text-xs text-surface-500">
                        {format(new Date(session.createdAt), 'MMM d, h:mm a')}
                      </p>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewDetails?.(session);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
