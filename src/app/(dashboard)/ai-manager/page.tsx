'use client';

import { useState } from 'react';
import { useAIPMConfig, useAIPMDashboard, useFlaggedSessions } from '@/hooks/useAIPM';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils';
import { hasPermission } from '@/lib/permissions';
import { useAuthStore } from '@/stores/authStore';
import Link from 'next/link';
import {
  Bot,
  Brain,
  Calendar,
  Clock,
  FileText,
  Settings2,
  Sparkles,
  Zap,
  Activity,
  Users,
  AlertTriangle,
  TrendingUp,
  MessageSquare,
  ChevronRight,
  Power,
  BarChart3,
} from 'lucide-react';

// Configuration panels (separate components)
import AIPMScheduleConfig from './components/AIPMScheduleConfig';
import AIPMPersonalityConfig from './components/AIPMPersonalityConfig';
import AIPMReportConfig from './components/AIPMReportConfig';
import AIPMSmartFeatures from './components/AIPMSmartFeatures';

type TabId = 'overview' | 'schedule' | 'personality' | 'reports' | 'features';

const tabs: Array<{ id: TabId; label: string; icon: typeof Bot; description: string }> = [
  { id: 'overview', label: 'Overview', icon: Activity, description: 'Dashboard and status' },
  { id: 'schedule', label: 'Schedule', icon: Calendar, description: 'Check-in timing' },
  { id: 'personality', label: 'Personality', icon: Brain, description: 'AI communication style' },
  { id: 'reports', label: 'Reports', icon: FileText, description: 'Automated reports' },
  { id: 'features', label: 'Smart Features', icon: Zap, description: 'Advanced automation' },
];

export default function AIManagerPage() {
  const { user } = useAuthStore();
  const { config, isLoading: isLoadingConfig, error: configError, updateConfig, isUpdating, refetch } = useAIPMConfig();
  const { nextCheckIn, flaggedCount, recentReports, recentSessions, isLoading: isDashboardLoading } = useAIPMDashboard();
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const isOwner = user?.role === 'owner';
  const isLoading = isLoadingConfig || isDashboardLoading;

  return (
    <div className="space-y-6">
      {/* Header with gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 via-primary-500 to-accent-500 p-8">
        <div className="absolute inset-0 bg-gradient-mesh opacity-30" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="p-4 rounded-2xl bg-white/20 backdrop-blur-sm shadow-xl">
              <Sparkles className="h-10 w-10 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">AI Project Manager</h1>
              <p className="text-white/80 text-lg">
                Automated check-ins, intelligent reports, and team insights
              </p>
            </div>
          </div>
          
          {isOwner && config && (
            <div className="flex items-center gap-3">
              <span className="text-white/80 text-sm">AIPM</span>
              <button
                onClick={() => updateConfig({ isActive: !config.isActive })}
                disabled={isUpdating}
                className={cn(
                  'relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-300',
                  config.isActive 
                    ? 'bg-white/30' 
                    : 'bg-white/10'
                )}
              >
                <span
                  className={cn(
                    'inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform duration-300',
                    config.isActive ? 'translate-x-7' : 'translate-x-1'
                  )}
                />
              </button>
              <span className={cn(
                'text-sm font-medium',
                config.isActive ? 'text-white' : 'text-white/60'
              )}>
                {config.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap',
              activeTab === tab.id
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300 shadow-sm'
                : 'text-surface-600 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800'
            )}
          >
            <tab.icon className={cn(
              'h-4 w-4',
              activeTab === tab.id ? 'text-primary-600 dark:text-primary-400' : ''
            )} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[500px]">
        {activeTab === 'overview' && (
          <OverviewTab
            config={config}
            nextCheckIn={nextCheckIn}
            flaggedCount={flaggedCount}
            recentReports={recentReports || []}
            recentSessions={recentSessions || []}
            isLoading={isLoading}
          />
        )}
        
        {activeTab === 'schedule' && (
          isLoading ? (
            <TabLoadingState />
          ) : configError ? (
            <TabErrorState error={configError} onRetry={refetch} />
          ) : !config ? (
            <TabNotConfiguredState />
          ) : (
            <AIPMScheduleConfig
              config={config}
              updateConfig={updateConfig}
              isUpdating={isUpdating}
              disabled={!isOwner}
            />
          )
        )}
        
        {activeTab === 'personality' && (
          isLoading ? (
            <TabLoadingState />
          ) : configError ? (
            <TabErrorState error={configError} onRetry={refetch} />
          ) : !config ? (
            <TabNotConfiguredState />
          ) : (
            <AIPMPersonalityConfig
              config={config}
              updateConfig={updateConfig}
              isUpdating={isUpdating}
              disabled={!isOwner}
            />
          )
        )}
        
        {activeTab === 'reports' && (
          isLoading ? (
            <TabLoadingState />
          ) : configError ? (
            <TabErrorState error={configError} onRetry={refetch} />
          ) : !config ? (
            <TabNotConfiguredState />
          ) : (
            <AIPMReportConfig
              config={config}
              updateConfig={updateConfig}
              isUpdating={isUpdating}
              disabled={!isOwner}
            />
          )
        )}
        
        {activeTab === 'features' && (
          isLoading ? (
            <TabLoadingState />
          ) : configError ? (
            <TabErrorState error={configError} onRetry={refetch} />
          ) : !config ? (
            <TabNotConfiguredState />
          ) : (
            <AIPMSmartFeatures
              config={config}
              updateConfig={updateConfig}
              isUpdating={isUpdating}
              disabled={!isOwner}
            />
          )
        )}
      </div>
    </div>
  );
}

// Loading State Component
function TabLoadingState() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Skeleton className="h-80" />
      <Skeleton className="h-80" />
    </div>
  );
}

// Error State Component
function TabErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <Card className="p-8">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
          <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
        </div>
        <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-2">
          Failed to load configuration
        </h3>
        <p className="text-surface-500 dark:text-surface-400 mb-4">
          {error || 'An error occurred while fetching the AIPM configuration.'}
        </p>
        <Button onClick={onRetry}>
          Try Again
        </Button>
      </div>
    </Card>
  );
}

// Not Configured State Component
function TabNotConfiguredState() {
  return (
    <Card className="p-8">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
          <Settings2 className="h-8 w-8 text-primary-600 dark:text-primary-400" />
        </div>
        <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-2">
          AIPM Not Configured
        </h3>
        <p className="text-surface-500 dark:text-surface-400 mb-4">
          The AI Project Manager hasn&apos;t been set up for your organization yet.
          Contact your administrator to enable AIPM.
        </p>
      </div>
    </Card>
  );
}

// Overview Tab Component
function OverviewTab({
  config,
  nextCheckIn,
  flaggedCount,
  recentReports,
  recentSessions,
  isLoading,
}: {
  config: any;
  nextCheckIn: any;
  flaggedCount: number;
  recentReports: any[];
  recentSessions: any[];
  isLoading?: boolean;
}) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <Skeleton className="h-64" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Status Cards */}
      <div className="lg:col-span-2 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard
            icon={Power}
            label="Status"
            value={config?.isActive ? 'Active' : 'Inactive'}
            color={config?.isActive ? 'emerald' : 'surface'}
          />
          <StatCard
            icon={Calendar}
            label="Next Check-in"
            value={nextCheckIn?.isToday ? 'Today' : nextCheckIn?.formattedTime?.split(' at ')[0] || 'Not scheduled'}
            subvalue={nextCheckIn?.isToday ? new Date(nextCheckIn.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined}
            color="primary"
          />
          <StatCard
            icon={AlertTriangle}
            label="Flagged"
            value={flaggedCount.toString()}
            color={flaggedCount > 0 ? 'amber' : 'surface'}
          />
          <StatCard
            icon={FileText}
            label="Reports"
            value={recentReports.length.toString()}
            subvalue="this week"
            color="accent"
          />
        </div>

        {/* Recent Sessions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary-500" />
              Recent Check-ins
            </CardTitle>
            <Link href="/ai-manager/sessions">
              <Button variant="ghost" size="sm">
                View all <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentSessions.length === 0 ? (
              <div className="text-center py-8 text-surface-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>No check-in sessions yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentSessions.slice(0, 5).map((session: any) => (
                  <SessionItem key={session._id} session={session} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Current Configuration */}
        <Card className="overflow-hidden">
          <div className="p-4 bg-gradient-to-br from-primary-500/10 to-accent-500/5">
            <h3 className="font-semibold text-surface-900 dark:text-white flex items-center gap-2">
              <Settings2 className="h-4 w-4 text-primary-500" />
              Current Configuration
            </h3>
          </div>
          <CardContent className="p-4 space-y-4">
            <ConfigItem
              label="Schedule"
              value={config?.checkinSchedule?.enabled 
                ? `${config.checkinSchedule.frequency} at ${config.checkinSchedule.time}`
                : 'Disabled'}
            />
            <ConfigItem
              label="Personality"
              value={config?.personalityMode?.replace('_', ' ') || 'Balanced'}
              capitalize
            />
            <ConfigItem
              label="Daily Digest"
              value={config?.reporting?.dailyDigest?.enabled ? 'Enabled' : 'Disabled'}
            />
            <ConfigItem
              label="Weekly Retro"
              value={config?.reporting?.weeklyRetrospective?.enabled ? 'Enabled' : 'Disabled'}
            />
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold text-surface-900 dark:text-white mb-4">Quick Links</h3>
            <div className="space-y-2">
              <Link href="/ai-manager/reports">
                <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors cursor-pointer">
                  <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/50">
                    <BarChart3 className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <p className="font-medium text-surface-900 dark:text-white">View Reports</p>
                    <p className="text-xs text-surface-500">Daily & weekly summaries</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-surface-400 ml-auto" />
                </div>
              </Link>
              <Link href="/ai-manager/sessions">
                <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors cursor-pointer">
                  <div className="p-2 rounded-lg bg-accent-100 dark:bg-accent-900/50">
                    <MessageSquare className="h-4 w-4 text-accent-600 dark:text-accent-400" />
                  </div>
                  <div>
                    <p className="font-medium text-surface-900 dark:text-white">Session History</p>
                    <p className="text-xs text-surface-500">View all transcripts</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-surface-400 ml-auto" />
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({
  icon: Icon,
  label,
  value,
  subvalue,
  color,
}: {
  icon: typeof Bot;
  label: string;
  value: string;
  subvalue?: string;
  color: 'primary' | 'accent' | 'emerald' | 'amber' | 'surface';
}) {
  const colorClasses = {
    primary: 'bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400',
    accent: 'bg-accent-100 dark:bg-accent-900/50 text-accent-600 dark:text-accent-400',
    emerald: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400',
    amber: 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400',
    surface: 'bg-surface-100 dark:bg-surface-800 text-surface-500 dark:text-surface-400',
  };

  return (
    <Card className="p-4">
      <div className="flex items-center gap-3 mb-2">
        <div className={cn('p-2 rounded-lg', colorClasses[color])}>
          <Icon className="h-4 w-4" />
        </div>
        <span className="text-sm text-surface-500 dark:text-surface-400">{label}</span>
      </div>
      <p className="text-xl font-bold text-surface-900 dark:text-white">{value}</p>
      {subvalue && (
        <p className="text-xs text-surface-500 dark:text-surface-400">{subvalue}</p>
      )}
    </Card>
  );
}

// Config Item Component
function ConfigItem({
  label,
  value,
  capitalize,
}: {
  label: string;
  value: string;
  capitalize?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-surface-500 dark:text-surface-400">{label}</span>
      <span className={cn(
        'text-sm font-medium text-surface-900 dark:text-white',
        capitalize && 'capitalize'
      )}>
        {value}
      </span>
    </div>
  );
}

// Session Item Component
function SessionItem({ session }: { session: any }) {
  const user = typeof session.userId === 'object' ? session.userId : null;
  const sentimentColors = {
    positive: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400',
    neutral: 'bg-surface-100 text-surface-600 dark:bg-surface-800 dark:text-surface-400',
    negative: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400',
  };

  return (
    <Link href={`/ai-manager/sessions/${session.sessionId}`}>
      <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors cursor-pointer">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-medium">
          {user ? `${user.firstName[0]}${user.lastName[0]}` : '??'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-surface-900 dark:text-white truncate">
            {user ? `${user.firstName} ${user.lastName}` : 'Unknown User'}
          </p>
          <p className="text-xs text-surface-500">
            {new Date(session.completedAt || session.scheduledAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {session.analysis?.managerFlagged && (
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          )}
          {session.analysis?.sentimentLabel && (
            <Badge className={sentimentColors[session.analysis.sentimentLabel as keyof typeof sentimentColors]}>
              {session.analysis.sentimentLabel}
            </Badge>
          )}
          <Badge variant={session.status === 'completed' ? 'success' : 'secondary'}>
            {session.status}
          </Badge>
        </div>
      </div>
    </Link>
  );
}

