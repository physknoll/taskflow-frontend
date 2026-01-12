'use client';

import { useState } from 'react';
import {
  MessageSquare,
  Users,
  Clock,
  Globe,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  Link as LinkIcon,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { SessionDetailModal } from './SessionDetailModal';
import {
  useChatWidgetAnalytics,
  useChatWidgetSessions,
  useChatWidgetGeoAnalytics,
  useChatWidgetNeedsReview,
} from '@/hooks/useChatWidget';
import { WidgetSession } from '@/types/chat-widget';
import { formatDate, cn } from '@/lib/utils';

interface WidgetAnalyticsSectionProps {
  clientId: string;
  isConfigured: boolean;
}

const PAGE_SIZE = 10;

type SessionFilter = 'all' | 'active' | 'completed' | 'needs-review';

/**
 * Analytics section showing overview stats, feedback stats, session list, and geo data
 */
export function WidgetAnalyticsSection({
  clientId,
  isConfigured,
}: WidgetAnalyticsSectionProps) {
  const [page, setPage] = useState(0);
  const [filter, setFilter] = useState<SessionFilter>('all');
  const [selectedSession, setSelectedSession] = useState<WidgetSession | null>(null);

  const {
    data: analytics,
    isLoading: analyticsLoading,
  } = useChatWidgetAnalytics(clientId, isConfigured);

  // Regular sessions query
  const {
    data: sessionsData,
    isLoading: sessionsLoading,
  } = useChatWidgetSessions(
    clientId,
    { 
      limit: PAGE_SIZE, 
      offset: page * PAGE_SIZE,
      status: filter !== 'all' && filter !== 'needs-review' ? filter : undefined,
    },
    isConfigured && filter !== 'needs-review'
  );

  // Needs review sessions query
  const {
    data: needsReviewData,
    isLoading: needsReviewLoading,
  } = useChatWidgetNeedsReview(
    clientId,
    { limit: PAGE_SIZE, offset: page * PAGE_SIZE },
    isConfigured && filter === 'needs-review'
  );

  const {
    data: geoData,
    isLoading: geoLoading,
  } = useChatWidgetGeoAnalytics(clientId, isConfigured);

  if (!isConfigured) {
    return (
      <Card className="p-8 text-center">
        <MessageSquare className="h-12 w-12 mx-auto mb-3 text-surface-300" />
        <h3 className="font-semibold text-surface-900 dark:text-white mb-2">
          No Analytics Available
        </h3>
        <p className="text-surface-500">
          Enable and save the widget configuration to start collecting analytics.
        </p>
      </Card>
    );
  }

  // Use appropriate data based on filter
  const currentSessionsData = filter === 'needs-review' ? needsReviewData : sessionsData;
  const currentLoading = filter === 'needs-review' ? needsReviewLoading : sessionsLoading;
  
  const sessions = currentSessionsData?.sessions || [];
  const totalSessions = currentSessionsData?.total || 0;
  const totalPages = Math.ceil(totalSessions / PAGE_SIZE);

  const feedback = analytics?.feedback;
  const needsReviewCount = feedback?.sessionsNeedingReview || 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'completed':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'abandoned':
        return 'bg-surface-100 text-surface-700 dark:bg-surface-700 dark:text-surface-400';
      default:
        return 'bg-surface-100 text-surface-700';
    }
  };

  const handleFilterChange = (newFilter: SessionFilter) => {
    setFilter(newFilter);
    setPage(0); // Reset to first page when filter changes
  };

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {analyticsLoading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="p-4">
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="text" width="40%" height={32} className="mt-2" />
              </Card>
            ))}
          </>
        ) : (
          <>
            <StatCard
              title="Total Sessions"
              value={analytics?.totalSessions || 0}
              icon={Users}
            />
            <StatCard
              title="Total Messages"
              value={analytics?.totalMessages || 0}
              icon={MessageSquare}
            />
            <StatCard
              title="Avg Response Time"
              value={
                analytics?.avgResponseTimeMs
                  ? `${Math.round(analytics.avgResponseTimeMs)}ms`
                  : '-'
              }
              icon={Clock}
            />
            <StatCard
              title="Last Activity"
              value={
                analytics?.lastSessionAt
                  ? formatDate(analytics.lastSessionAt)
                  : 'Never'
              }
              icon={Globe}
            />
          </>
        )}
      </div>

      {/* Feedback Stats */}
      {feedback && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <ThumbsUp className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-surface-900 dark:text-white">
                  {feedback.totalPositive}
                </p>
                <p className="text-sm text-surface-500">Positive Ratings</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                <ThumbsDown className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-surface-900 dark:text-white">
                  {feedback.totalNegative}
                </p>
                <p className="text-sm text-surface-500">Negative Ratings</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-surface-900 dark:text-white">
                  {feedback.sessionsNeedingReview}
                </p>
                <p className="text-sm text-surface-500">Needs Review</p>
              </div>
            </div>
            {feedback.sessionsNeedingReview > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 text-amber-600 hover:text-amber-700"
                onClick={() => handleFilterChange('needs-review')}
              >
                View Sessions
              </Button>
            )}
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <LinkIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-surface-900 dark:text-white">
                  {feedback.sessionsReviewed}
                </p>
                <p className="text-sm text-surface-500">Sessions Reviewed</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Sessions and Geo in two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sessions List */}
        <Card className="lg:col-span-2 p-0 overflow-hidden">
          <div className="p-4 border-b border-surface-200 dark:border-surface-700 flex items-center justify-between gap-4">
            <h3 className="font-semibold text-surface-900 dark:text-white">
              Sessions
            </h3>
            
            {/* Filter Tabs */}
            <div className="flex gap-1 bg-surface-100 dark:bg-surface-800 p-1 rounded-lg">
              {(['all', 'active', 'completed', 'needs-review'] as SessionFilter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => handleFilterChange(f)}
                  className={cn(
                    'px-3 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1',
                    filter === f
                      ? 'bg-white dark:bg-surface-700 text-surface-900 dark:text-white shadow-sm'
                      : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white'
                  )}
                >
                  {f === 'needs-review' ? 'Needs Review' : f.charAt(0).toUpperCase() + f.slice(1)}
                  {f === 'needs-review' && needsReviewCount > 0 && (
                    <Badge variant="primary" size="sm" className="ml-1">
                      {needsReviewCount}
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          </div>

          {currentLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton variant="rounded" width={60} height={24} />
                  <div className="flex-1">
                    <Skeleton variant="text" width="60%" />
                    <Skeleton variant="text" width="40%" className="mt-1" />
                  </div>
                </div>
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <div className="p-8 text-center text-surface-400">
              <Users className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p>
                {filter === 'needs-review' 
                  ? 'No sessions need review' 
                  : 'No sessions yet'}
              </p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-surface-200 dark:divide-surface-700">
                {sessions.map((session: WidgetSession) => (
                  <div
                    key={session.sessionId}
                    className={cn(
                      'p-4 hover:bg-surface-50 dark:hover:bg-surface-800/50 cursor-pointer transition-colors',
                      session.needsReview && 'border-l-4 border-l-amber-500'
                    )}
                    onClick={() => setSelectedSession(session)}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <Badge className={cn('flex-shrink-0', getStatusColor(session.status))}>
                          {session.status}
                        </Badge>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-surface-900 dark:text-white truncate">
                              {session.context.domain}
                            </p>
                            {/* Feedback indicators */}
                            {session.feedback?.overallRating === 'negative' && (
                              <ThumbsDown className="h-4 w-4 text-red-500 flex-shrink-0" />
                            )}
                            {session.feedback?.overallRating === 'positive' && (
                              <ThumbsUp className="h-4 w-4 text-green-500 flex-shrink-0" />
                            )}
                            {session.reviewTicketId && (
                              <Badge variant="secondary" size="sm">
                                Ticket Created
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-surface-500 truncate">
                            {session.visitor.country && `${session.visitor.country} • `}
                            {session.analytics.messageCount} messages
                            {session.needsReview && ' • Needs Review'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs text-surface-400">
                          {formatDate(session.startedAt)}
                        </span>
                        <ExternalLink className="h-4 w-4 text-surface-400" />
                      </div>
                    </div>
                  </div>
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

        {/* Geo Breakdown */}
        <Card className="p-0 overflow-hidden">
          <div className="p-4 border-b border-surface-200 dark:border-surface-700">
            <h3 className="font-semibold text-surface-900 dark:text-white">
              By Country
            </h3>
          </div>

          {geoLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton variant="text" width="40%" />
                  <Skeleton variant="text" width="20%" />
                </div>
              ))}
            </div>
          ) : !geoData || geoData.length === 0 ? (
            <div className="p-8 text-center text-surface-400">
              <Globe className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p>No geo data</p>
            </div>
          ) : (
            <div className="divide-y divide-surface-200 dark:divide-surface-700">
              {geoData.slice(0, 10).map((geo) => (
                <div
                  key={geo.country}
                  className="p-3 flex items-center justify-between"
                >
                  <span className="text-sm text-surface-700 dark:text-surface-300">
                    {geo.country}
                  </span>
                  <Badge variant="secondary">{geo.sessionCount}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Session Detail Modal */}
      <SessionDetailModal
        isOpen={!!selectedSession}
        onClose={() => setSelectedSession(null)}
        session={selectedSession}
      />
    </div>
  );
}
