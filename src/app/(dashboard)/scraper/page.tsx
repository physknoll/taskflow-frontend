'use client';

import { useState } from 'react';
import {
  useLinkedInStats,
  useLinkedInScrapers,
} from '@/hooks/useLinkedIn';
import { useScrapingEvents } from '@/hooks/useScrapingEvents';
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
  Wifi,
  WifiOff,
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
  
  // Connect to SSE for real-time updates - auto-invalidates queries on events
  const { isConnected: sseConnected, lastEvent } = useScrapingEvents();
  
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetchStats();
    setRefreshing(false);
  };

  const onlineScrapers = scrapers.filter((s) => s.isOnlineNow).length;

  // Helper to get stats values - handles both new API and legacy structure
  const getSourcesTotal = () => {
    if (stats?.overview?.totalSources !== undefined) {
      return stats.overview.totalSources;
    }
    return stats?.profiles?.total ?? 0;
  };

  const getSourcesActive = () => {
    if (stats?.byPlatform) {
      // Sum sources across all platforms
      return Object.values(stats.byPlatform).reduce((sum, p) => sum + (p.sources || 0), 0);
    }
    return stats?.profiles?.active ?? 0;
  };

  const getItemsTotal = () => {
    if (stats?.overview?.totalItems !== undefined) {
      return stats.overview.totalItems;
    }
    return stats?.posts?.total ?? 0;
  };

  const getItemsLast24h = () => {
    if (stats?.recentActivity?.itemsLast24h !== undefined) {
      return stats.recentActivity.itemsLast24h;
    }
    return stats?.posts?.last24Hours ?? 0;
  };

  const getTrendingCount = () => {
    return stats?.posts?.trending ?? 0;
  };

  const getPendingActionCount = () => {
    return stats?.posts?.pendingAction ?? 0;
  };

  const getValidCookiesCount = () => {
    return scrapers.filter(s => 
      s.cookiesValid || 
      s.platformCredentials?.linkedin?.cookiesValid
    ).length;
  };

  const tabs: Tab[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'scrapers', label: 'Scrapers', icon: Monitor, count: scrapers.length },
    { id: 'profiles', label: 'Sources', icon: Users, count: getSourcesTotal() },
    { id: 'posts', label: 'Items', icon: FileText, count: getItemsTotal() },
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
              Monitor sources, track items, and analyze engagement across platforms
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* SSE Connection Status */}
          <div 
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
              sseConnected 
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                : 'bg-surface-100 text-surface-500 dark:bg-surface-800 dark:text-surface-400'
            )}
            title={sseConnected ? 'Real-time updates active' : 'Connecting to real-time updates...'}
          >
            {sseConnected ? (
              <>
                <Wifi className="h-3.5 w-3.5" />
                <span>Live</span>
              </>
            ) : (
              <>
                <WifiOff className="h-3.5 w-3.5" />
                <span>Connecting...</span>
              </>
            )}
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
            title="Sources Monitored"
            value={getSourcesTotal()}
            subtitle={`${getSourcesActive()} active`}
            icon={Users}
            variant="default"
          />
          <StatsCard
            title="Items Collected"
            value={getItemsTotal().toLocaleString()}
            subtitle={`${getItemsLast24h()} in last 24h`}
            icon={FileText}
            variant="success"
          />
          <StatsCard
            title="Scrapers Online"
            value={`${onlineScrapers}/${scrapers.length}`}
            subtitle={scrapersLoading ? '...' : `${getValidCookiesCount()} with valid cookies`}
            icon={Monitor}
            variant={onlineScrapers > 0 ? 'success' : 'warning'}
          />
          <StatsCard
            title="Trending Items"
            value={getTrendingCount()}
            subtitle={`${getPendingActionCount()} pending action`}
            icon={TrendingUp}
            variant={getTrendingCount() > 0 ? 'warning' : 'default'}
          />
        </div>
      ) : null}

      {/* Platform Breakdown - Show if byPlatform data is available */}
      {stats?.byPlatform && Object.keys(stats.byPlatform).length > 1 && (
        <div className="bg-white dark:bg-surface-800 rounded-lg border border-surface-200 dark:border-surface-700 p-4">
          <h3 className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-3">
            Platform Breakdown
          </h3>
          <div className="flex flex-wrap gap-4">
            {Object.entries(stats.byPlatform).map(([platform, platformStats]) => (
              <div
                key={platform}
                className="flex items-center gap-3 px-4 py-2 bg-surface-50 dark:bg-surface-700 rounded-lg"
              >
                <span className="text-sm font-medium capitalize text-surface-700 dark:text-surface-300">
                  {platform}
                </span>
                <div className="flex gap-3 text-xs text-surface-500">
                  <span>{platformStats.sources} sources</span>
                  <span>{platformStats.items} items</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
