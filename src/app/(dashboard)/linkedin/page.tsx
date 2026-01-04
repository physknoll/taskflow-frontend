'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  useLinkedInStats,
  useLinkedInTrendingPosts,
  useLinkedInActionablePosts,
  useLinkedInScrapers,
  useLinkedInSessions,
} from '@/hooks/useLinkedIn';
import { StatsCard, PostCard, SessionCard } from '@/components/linkedin';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  Users,
  FileText,
  Monitor,
  TrendingUp,
  Activity,
  ArrowRight,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
} from 'lucide-react';

export default function LinkedInDashboardPage() {
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useLinkedInStats();
  const { data: trendingPosts, isLoading: trendingLoading } = useLinkedInTrendingPosts(5);
  const { data: actionablePosts, isLoading: actionableLoading } = useLinkedInActionablePosts(5);
  const { scrapers, isLoading: scrapersLoading } = useLinkedInScrapers();
  const { sessions, isLoading: sessionsLoading } = useLinkedInSessions({ limit: 5 });

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetchStats();
    setRefreshing(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">
            LinkedIn Monitoring
          </h1>
          <p className="text-surface-500 dark:text-surface-400">
            Monitor profiles, track posts, and analyze engagement
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      {statsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} variant="rounded" height={140} />
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Profiles Monitored"
            value={stats.profiles.total}
            subtitle={`${stats.profiles.active} active`}
            icon={Users}
            variant="default"
          />
          <StatsCard
            title="Posts Collected"
            value={stats.posts.total.toLocaleString()}
            subtitle={`${stats.posts.last24Hours} in last 24h`}
            icon={FileText}
            variant="success"
          />
          <StatsCard
            title="Scrapers Online"
            value={`${stats.scrapers.online}/${stats.scrapers.total}`}
            subtitle={stats.scrapers.withValidCookies + ' with valid cookies'}
            icon={Monitor}
            variant={stats.scrapers.online > 0 ? 'success' : 'warning'}
          />
          <StatsCard
            title="Trending Posts"
            value={stats.posts.trending}
            subtitle={`${stats.posts.pendingAction} pending action`}
            icon={TrendingUp}
            variant={stats.posts.trending > 0 ? 'warning' : 'default'}
          />
        </div>
      ) : null}

      {/* Session Success Rate */}
      {stats && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-surface-900 dark:text-white">
                Scraping Activity (Last 24h)
              </h2>
              <Link href="/linkedin/sessions">
                <Button variant="ghost" size="sm">
                  View All <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
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
              <Link href="/linkedin/posts?isTrending=true">
                <Button variant="ghost" size="sm">
                  View All <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
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
              <Link href="/linkedin/posts?actionStatus=new">
                <Button variant="ghost" size="sm">
                  View All <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
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
            <Link href="/linkedin/sessions">
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
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

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/linkedin/scrapers">
          <Card hover className="h-full">
            <CardContent className="p-4 text-center">
              <Monitor className="h-8 w-8 mx-auto mb-2 text-primary-500" />
              <p className="font-medium text-surface-900 dark:text-white">Manage Scrapers</p>
              <p className="text-xs text-surface-500">
                {scrapersLoading ? '...' : `${scrapers.length} configured`}
              </p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/linkedin/profiles">
          <Card hover className="h-full">
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-primary-500" />
              <p className="font-medium text-surface-900 dark:text-white">Manage Profiles</p>
              <p className="text-xs text-surface-500">
                {statsLoading ? '...' : `${stats?.profiles.total || 0} profiles`}
              </p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/linkedin/posts">
          <Card hover className="h-full">
            <CardContent className="p-4 text-center">
              <FileText className="h-8 w-8 mx-auto mb-2 text-primary-500" />
              <p className="font-medium text-surface-900 dark:text-white">Browse Posts</p>
              <p className="text-xs text-surface-500">
                {statsLoading ? '...' : `${stats?.posts.total.toLocaleString() || 0} posts`}
              </p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/linkedin/sessions">
          <Card hover className="h-full">
            <CardContent className="p-4 text-center">
              <Activity className="h-8 w-8 mx-auto mb-2 text-primary-500" />
              <p className="font-medium text-surface-900 dark:text-white">Session History</p>
              <p className="text-xs text-surface-500">View all sessions</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
