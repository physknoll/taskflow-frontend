'use client';

import {
  useLinkedInStats,
  useLinkedInTrendingPosts,
  useLinkedInActionablePosts,
  useLinkedInSessions,
} from '@/hooks/useLinkedIn';
import { PostCard, SessionCard } from '@/components/linkedin';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  TrendingUp,
  Activity,
  ArrowRight,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
} from 'lucide-react';

interface OverviewTabProps {
  onNavigate: (tab: string) => void;
}

export function OverviewTab({ onNavigate }: OverviewTabProps) {
  const { data: stats, isLoading: statsLoading } = useLinkedInStats();
  const { data: trendingPosts, isLoading: trendingLoading } = useLinkedInTrendingPosts(5);
  const { data: actionablePosts, isLoading: actionableLoading } = useLinkedInActionablePosts(5);
  const { sessions, isLoading: sessionsLoading } = useLinkedInSessions({ limit: 5 });

  return (
    <div className="space-y-6">
      {/* Session Success Rate */}
      {stats && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-surface-900 dark:text-white">
                Scraping Activity (Last 24h)
              </h2>
              <Button variant="ghost" size="sm" onClick={() => onNavigate('sessions')}>
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Activity className="h-5 w-5 text-primary-500" />
                </div>
                <p className="text-3xl font-bold text-surface-900 dark:text-white">
                  {stats.sessions.last24Hours}
                </p>
                <p className="text-sm text-surface-500">Total Sessions</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-success-500" />
                </div>
                <p className="text-3xl font-bold text-success-600 dark:text-success-400">
                  {stats.sessions.successful}
                </p>
                <p className="text-sm text-surface-500">Successful</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <XCircle className="h-5 w-5 text-error-500" />
                </div>
                <p className="text-3xl font-bold text-error-600 dark:text-error-400">
                  {stats.sessions.failed}
                </p>
                <p className="text-sm text-surface-500">Failed</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-primary-500" />
                </div>
                <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                  {stats.sessions.successRate}%
                </p>
                <p className="text-sm text-surface-500">Success Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trending Posts */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-surface-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-warning-500" />
                Trending Posts
              </h2>
              <Button variant="ghost" size="sm" onClick={() => onNavigate('posts')}>
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            {trendingLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} variant="rounded" height={100} />
                ))}
              </div>
            ) : trendingPosts && trendingPosts.length > 0 ? (
              <div className="space-y-4">
                {trendingPosts.slice(0, 3).map((post) => (
                  <PostCard key={post._id} post={post} compact />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-surface-500 dark:text-surface-400">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No trending posts right now</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actionable Posts */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-surface-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-primary-500" />
                Needs Action
              </h2>
              <Button variant="ghost" size="sm" onClick={() => onNavigate('posts')}>
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            {actionableLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} variant="rounded" height={100} />
                ))}
              </div>
            ) : actionablePosts && actionablePosts.length > 0 ? (
              <div className="space-y-4">
                {actionablePosts.slice(0, 3).map((post) => (
                  <PostCard key={post._id} post={post} compact />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-surface-500 dark:text-surface-400">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>All caught up!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Sessions */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-surface-900 dark:text-white">
              Recent Scrape Sessions
            </h2>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('sessions')}>
              View All <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          {sessionsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} variant="rounded" height={80} />
              ))}
            </div>
          ) : sessions && sessions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sessions.slice(0, 6).map((session) => (
                <SessionCard key={session._id} session={session} compact />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-surface-500 dark:text-surface-400">
              <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No scrape sessions yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
