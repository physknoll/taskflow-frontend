'use client';

import { useState } from 'react';
import { useAIPMReports } from '@/hooks/useAIPM';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import {
  FileText,
  Calendar,
  TrendingUp,
  AlertTriangle,
  Users,
  ChevronRight,
  Plus,
  Loader2,
  BarChart3,
  CheckCircle,
  Clock,
} from 'lucide-react';

export default function ReportsPage() {
  const { user } = useAuthStore();
  const { reports, isLoading, generateReport, isGenerating } = useAIPMReports();
  const [filter, setFilter] = useState<'all' | 'daily_digest' | 'weekly_retrospective'>('all');

  const isOwner = user?.role === 'owner';

  const filteredReports = filter === 'all' 
    ? reports 
    : reports.filter(r => r.type === filter);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="AIPM Reports"
          description="View AI-generated team reports"
        />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="AIPM Reports"
        description="View AI-generated team reports and insights"
        action={
          isOwner && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => generateReport('daily_digest')}
                disabled={isGenerating}
              >
                {isGenerating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                Generate Daily
              </Button>
              <Button
                onClick={() => generateReport('weekly_retrospective')}
                disabled={isGenerating}
              >
                {isGenerating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                Generate Weekly
              </Button>
            </div>
          )
        }
      />

      {/* Filters */}
      <div className="flex gap-2">
        {(['all', 'daily_digest', 'weekly_retrospective'] as const).map((type) => (
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
            {type === 'all' ? 'All Reports' : type === 'daily_digest' ? 'Daily Digests' : 'Weekly Retrospectives'}
          </button>
        ))}
      </div>

      {/* Reports List */}
      {filteredReports.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-surface-300" />
            <p className="text-surface-500 dark:text-surface-400">No reports found</p>
            {isOwner && (
              <p className="text-sm text-surface-400 mt-2">
                Generate your first report to see team insights
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredReports.map((report) => (
            <ReportCard key={report._id} report={report} />
          ))}
        </div>
      )}
    </div>
  );
}

function ReportCard({ report }: { report: any }) {
  const isDaily = report.type === 'daily_digest';
  const unresolvedInterventions = report.interventions?.filter((i: any) => !i.resolved) || [];

  return (
    <Link href={`/ai-manager/reports/${report.reportId}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className={cn(
              'p-3 rounded-xl shrink-0',
              isDaily 
                ? 'bg-primary-100 dark:bg-primary-900/50' 
                : 'bg-accent-100 dark:bg-accent-900/50'
            )}>
              {isDaily ? (
                <FileText className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              ) : (
                <TrendingUp className="h-6 w-6 text-accent-600 dark:text-accent-400" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="font-semibold text-surface-900 dark:text-white truncate">
                  {report.title}
                </h3>
                <Badge variant={isDaily ? 'primary' : 'secondary'}>
                  {isDaily ? 'Daily' : 'Weekly'}
                </Badge>
              </div>

              <p className="text-sm text-surface-500 dark:text-surface-400 mb-3 line-clamp-2">
                {report.executiveSummary}
              </p>

              {/* Stats */}
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2 text-surface-600 dark:text-surface-400">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  <span>{report.stats.ticketsCompleted} completed</span>
                </div>
                <div className="flex items-center gap-2 text-surface-600 dark:text-surface-400">
                  <Users className="h-4 w-4 text-primary-500" />
                  <span>{report.stats.checkInsCompleted} check-ins</span>
                </div>
                {unresolvedInterventions.length > 0 && (
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                    <AlertTriangle className="h-4 w-4" />
                    <span>{unresolvedInterventions.length} interventions</span>
                  </div>
                )}
              </div>
            </div>

            {/* Date & Arrow */}
            <div className="flex items-center gap-4 shrink-0">
              <div className="text-right">
                <p className="text-sm font-medium text-surface-900 dark:text-white">
                  {new Date(report.generatedAt).toLocaleDateString()}
                </p>
                <p className="text-xs text-surface-500">
                  {new Date(report.generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-surface-400" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}


