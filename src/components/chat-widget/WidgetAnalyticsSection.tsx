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
} from '@/hooks/useChatWidget';
import { WidgetSession } from '@/types/chat-widget';
import { formatDate, cn } from '@/lib/utils';

interface WidgetAnalyticsSectionProps {
  clientId: string;
  isConfigured: boolean;
}

const PAGE_SIZE = 10;

/**
 * Analytics section showing overview stats, session list, and geo data
 */
export function WidgetAnalyticsSection({
  clientId,
  isConfigured,
}: WidgetAnalyticsSectionProps) {
  const [page, setPage] = useState(0);
  const [selectedSession, setSelectedSession] = useState<WidgetSession | null>(null);

  const {
    data: analytics,
    isLoading: analyticsLoading,
  } = useChatWidgetAnalytics(clientId, isConfigured);

  const {
    data: sessionsData,
    isLoading: sessionsLoading,
  } = useChatWidgetSessions(
    clientId,
    { limit: PAGE_SIZE, offset: page * PAGE_SIZE },
    isConfigured
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

  const sessions = sessionsData?.sessions || [];
  const totalSessions = sessionsData?.total || 0;
  const totalPages = Math.ceil(totalSessions / PAGE_SIZE);

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

      {/* Sessions and Geo in two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sessions List */}
        <Card className="lg:col-span-2 p-0 overflow-hidden">
          <div className="p-4 border-b border-surface-200 dark:border-surface-700">
            <h3 className="font-semibold text-surface-900 dark:text-white">
              Recent Sessions
            </h3>
          </div>

          {sessionsLoading ? (
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
              <p>No sessions yet</p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-surface-200 dark:divide-surface-700">
                {sessions.map((session: WidgetSession) => (
                  <div
                    key={session.sessionId}
                    className="p-4 hover:bg-surface-50 dark:hover:bg-surface-800/50 cursor-pointer transition-colors"
                    onClick={() => setSelectedSession(session)}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <Badge className={cn('flex-shrink-0', getStatusColor(session.status))}>
                          {session.status}
                        </Badge>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-surface-900 dark:text-white truncate">
                            {session.context.domain}
                          </p>
                          <p className="text-xs text-surface-500 truncate">
                            {session.visitor.country && `${session.visitor.country} • `}
                            {session.analytics.messageCount} messages
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
