'use client';

import { useState } from 'react';
import { useAIPMSessions, useFlaggedSessions } from '@/hooks/useAIPM';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { Avatar } from '@/components/ui/Avatar';
import { SessionStatus } from '@/types/aipm';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import {
  MessageSquare,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ChevronRight,
  Filter,
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';

type FilterType = 'all' | 'completed' | 'flagged' | 'skipped';

export default function SessionsPage() {
  const { sessions, isLoading } = useAIPMSessions({ limit: 50 });
  const { flaggedSessions, count: flaggedCount } = useFlaggedSessions();
  const [filter, setFilter] = useState<FilterType>('all');

  const getFilteredSessions = () => {
    switch (filter) {
      case 'completed':
        return sessions.filter((s) => s.status === 'completed');
      case 'flagged':
        return flaggedSessions;
      case 'skipped':
        return sessions.filter((s) => s.status === 'skipped');
      default:
        return sessions;
    }
  };

  const filteredSessions = getFilteredSessions();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Check-in Sessions"
          description="View all AI check-in conversations"
        />
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Check-in Sessions"
        description="View all AI check-in conversations and transcripts"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard
          label="Total Sessions"
          value={sessions.length}
          icon={MessageSquare}
          color="primary"
        />
        <StatsCard
          label="Completed"
          value={sessions.filter((s) => s.status === 'completed').length}
          icon={CheckCircle}
          color="emerald"
        />
        <StatsCard
          label="Flagged"
          value={flaggedCount}
          icon={AlertTriangle}
          color={flaggedCount > 0 ? 'amber' : 'surface'}
        />
        <StatsCard
          label="Skipped"
          value={sessions.filter((s) => s.status === 'skipped').length}
          icon={XCircle}
          color="surface"
        />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-surface-400" />
        {(['all', 'completed', 'flagged', 'skipped'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-medium transition-colors',
              filter === type
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300'
                : 'text-surface-600 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800'
            )}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
            {type === 'flagged' && flaggedCount > 0 && (
              <span className="ml-2 px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-xs">
                {flaggedCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Sessions List */}
      {filteredSessions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-surface-300" />
            <p className="text-surface-500 dark:text-surface-400">
              No {filter !== 'all' ? filter : ''} sessions found
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredSessions.map((session) => (
            <SessionCard key={session._id} session={session} />
          ))}
        </div>
      )}
    </div>
  );
}

function StatsCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: typeof MessageSquare;
  color: 'primary' | 'emerald' | 'amber' | 'surface';
}) {
  const colorClasses = {
    primary: 'bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400',
    emerald: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400',
    amber: 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400',
    surface: 'bg-surface-100 dark:bg-surface-800 text-surface-500 dark:text-surface-400',
  };

  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <div className={cn('p-2 rounded-lg', colorClasses[color])}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-bold text-surface-900 dark:text-white">{value}</p>
          <p className="text-sm text-surface-500">{label}</p>
        </div>
      </div>
    </Card>
  );
}

function SessionCard({ session }: { session: any }) {
  const user = typeof session.userId === 'object' ? session.userId : null;
  
  const statusConfig: Record<SessionStatus, { color: string; icon: typeof CheckCircle; label: string }> = {
    scheduled: { color: 'bg-surface-100 text-surface-600', icon: Calendar, label: 'Scheduled' },
    pending: { color: 'bg-amber-100 text-amber-700', icon: Clock, label: 'Pending' },
    in_progress: { color: 'bg-primary-100 text-primary-700', icon: Activity, label: 'In Progress' },
    completed: { color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle, label: 'Completed' },
    skipped: { color: 'bg-surface-100 text-surface-600', icon: XCircle, label: 'Skipped' },
    failed: { color: 'bg-red-100 text-red-700', icon: XCircle, label: 'Failed' },
  };

  const sentimentConfig = {
    positive: { icon: TrendingUp, color: 'text-emerald-500', label: 'Positive' },
    neutral: { icon: Minus, color: 'text-surface-400', label: 'Neutral' },
    negative: { icon: TrendingDown, color: 'text-amber-500', label: 'Needs Attention' },
  };

  const status = statusConfig[session.status];
  const StatusIcon = status.icon;
  const sentiment = session.analysis?.sentimentLabel ? sentimentConfig[session.analysis.sentimentLabel as keyof typeof sentimentConfig] : null;
  const SentimentIcon = sentiment?.icon;

  return (
    <Link href={`/ai-manager/sessions/${session.sessionId}`}>
      <Card className="hover:shadow-lg transition-all cursor-pointer group">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            {/* User Avatar */}
            <Avatar
              firstName={user?.firstName}
              lastName={user?.lastName}
              size="lg"
              className="shrink-0"
            />

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-surface-900 dark:text-white">
                  {user ? `${user.firstName} ${user.lastName}` : 'Unknown User'}
                </h3>
                {session.analysis?.managerFlagged && (
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                )}
              </div>

              <div className="flex items-center gap-4 text-sm text-surface-500">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(session.scheduledAt).toLocaleDateString()}
                </span>
                {session.completedAt && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {new Date(session.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-3.5 w-3.5" />
                  {session.messages?.length || 0} messages
                </span>
              </div>

              {/* Summary */}
              {session.analysis?.aiSummary && (
                <p className="text-sm text-surface-600 dark:text-surface-400 mt-2 line-clamp-1">
                  {session.analysis.aiSummary}
                </p>
              )}
            </div>

            {/* Status & Sentiment */}
            <div className="flex items-center gap-3 shrink-0">
              {sentiment && SentimentIcon && (
                <div className="flex items-center gap-1.5">
                  <SentimentIcon className={cn('h-4 w-4', sentiment.color)} />
                  <span className={cn('text-sm font-medium', sentiment.color)}>
                    {Math.round((session.analysis?.sentimentScore || 0.5) * 100)}%
                  </span>
                </div>
              )}
              <Badge className={status.color}>
                <StatusIcon className="h-3.5 w-3.5 mr-1" />
                {status.label}
              </Badge>
              <ChevronRight className="h-5 w-5 text-surface-400 group-hover:text-surface-600 transition-colors" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

