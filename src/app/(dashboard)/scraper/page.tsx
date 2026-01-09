'use client';

import { useState } from 'react';
import {
  useLinkedInStats,
  useLinkedInScrapers,
} from '@/hooks/useLinkedIn';
import { StatsCard } from '@/components/linkedin';
import {
  OverviewTab,
  ScrapersTab,
  ProfilesTab,
  PostsTab,
  SessionsTab,
  SchedulesTab,
} from '@/components/scraper';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils';
import {
  Users,
  FileText,
  Monitor,
  TrendingUp,
  RefreshCw,
  LayoutDashboard,
  CalendarClock,
  Activity,
  Scan,
} from 'lucide-react';

type TabId = 'overview' | 'scrapers' | 'profiles' | 'posts' | 'sessions' | 'schedules';

interface Tab {
  id: TabId;
  label: string;
  icon: typeof LayoutDashboard;
  count?: number;
}

export default function ScraperDashboardPage() {
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useLinkedInStats();
  const { scrapers, isLoading: scrapersLoading } = useLinkedInScrapers();
  
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetchStats();
    setRefreshing(false);
  };

  const onlineScrapers = scrapers.filter((s) => s.isOnlineNow).length;

  const tabs: Tab[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'scrapers', label: 'Scrapers', icon: Monitor, count: scrapers.length },
    { id: 'profiles', label: 'Profiles', icon: Users, count: stats?.profiles.total },
    { id: 'posts', label: 'Posts', icon: FileText, count: stats?.posts.total },
    { id: 'sessions', label: 'Sessions', icon: Activity },
    { id: 'schedules', label: 'Schedules', icon: CalendarClock },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg">
            <Scan className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-surface-900 dark:text-white">
              Scraper
            </h1>
            <p className="text-surface-500 dark:text-surface-400">
              Monitor profiles, track posts, and analyze engagement across platforms
            </p>
          </div>
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
            value={`${onlineScrapers}/${scrapers.length}`}
            subtitle={scrapersLoading ? '...' : `${scrapers.filter(s => s.cookiesValid).length} with valid cookies`}
            icon={Monitor}
            variant={onlineScrapers > 0 ? 'success' : 'warning'}
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

      {/* Tabs Navigation */}
      <div className="flex gap-1 bg-surface-100 dark:bg-surface-800 p-1 rounded-xl w-fit overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap',
              activeTab === tab.id
                ? 'bg-white dark:bg-surface-700 text-surface-900 dark:text-white shadow-sm'
                : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-surface-700/50'
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <Badge variant="secondary" size="sm">
                {tab.count > 999 ? `${Math.floor(tab.count / 1000)}k+` : tab.count}
              </Badge>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'overview' && <OverviewTab onNavigate={(tab) => setActiveTab(tab as TabId)} />}
        {activeTab === 'scrapers' && <ScrapersTab />}
        {activeTab === 'profiles' && <ProfilesTab />}
        {activeTab === 'posts' && <PostsTab />}
        {activeTab === 'sessions' && <SessionsTab />}
        {activeTab === 'schedules' && <SchedulesTab />}
      </div>
    </div>
  );
}
