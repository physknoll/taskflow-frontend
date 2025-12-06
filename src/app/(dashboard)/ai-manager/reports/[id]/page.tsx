'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAIPMReports } from '@/hooks/useAIPM';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { Modal } from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Input';
import { IAIPMReport, IIntervention, IEmployeeHighlight } from '@/types/aipm';
import { cn } from '@/lib/utils';
import {
  FileText,
  TrendingUp,
  AlertTriangle,
  Users,
  CheckCircle,
  ArrowLeft,
  Calendar,
  Clock,
  Target,
  Lightbulb,
  MessageSquare,
  Award,
  AlertCircle,
  BarChart3,
} from 'lucide-react';

export default function ReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getReport, resolveIntervention, isResolving } = useAIPMReports();
  const [report, setReport] = useState<IAIPMReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [resolveModal, setResolveModal] = useState<{ open: boolean; intervention: IIntervention | null }>({
    open: false,
    intervention: null,
  });
  const [resolution, setResolution] = useState('');

  const reportId = params.id as string;

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const data = await getReport(reportId);
        setReport(data);
      } catch (error) {
        console.error('Failed to fetch report:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReport();
  }, [reportId, getReport]);

  const handleResolve = async () => {
    if (!resolveModal.intervention || !resolution.trim()) return;

    await resolveIntervention(reportId, resolveModal.intervention.id, resolution);
    
    // Update local state
    setReport((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        interventions: prev.interventions.map((i) =>
          i.id === resolveModal.intervention?.id
            ? { ...i, resolved: true, resolution }
            : i
        ),
      };
    });

    setResolveModal({ open: false, intervention: null });
    setResolution('');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 mx-auto mb-4 text-surface-300" />
        <p className="text-surface-500">Report not found</p>
        <Button onClick={() => router.back()} variant="ghost" className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go back
        </Button>
      </div>
    );
  }

  const isDaily = report.type === 'daily_digest';
  const unresolvedInterventions = report.interventions.filter((i) => !i.resolved);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-surface-900 dark:text-white">
              {report.title}
            </h1>
            <Badge variant={isDaily ? 'primary' : 'secondary'}>
              {isDaily ? 'Daily Digest' : 'Weekly Retrospective'}
            </Badge>
          </div>
          <p className="text-surface-500 dark:text-surface-400 flex items-center gap-2 mt-1">
            <Calendar className="h-4 w-4" />
            {new Date(report.periodStart).toLocaleDateString()} - {new Date(report.periodEnd).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={CheckCircle}
          label="Completed"
          value={report.stats.ticketsCompleted}
          color="emerald"
        />
        <StatCard
          icon={AlertTriangle}
          label="Overdue"
          value={report.stats.ticketsOverdue}
          color={report.stats.ticketsOverdue > 0 ? 'red' : 'surface'}
        />
        <StatCard
          icon={Users}
          label="Check-ins"
          value={report.stats.checkInsCompleted}
          subvalue={`of ${report.stats.checkInsScheduled}`}
          color="primary"
        />
        <StatCard
          icon={BarChart3}
          label="Sentiment"
          value={`${Math.round(report.stats.averageSentiment * 100)}%`}
          color={report.stats.averageSentiment >= 0.6 ? 'emerald' : report.stats.averageSentiment >= 0.4 ? 'amber' : 'red'}
        />
      </div>

      {/* Executive Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary-500" />
            Executive Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-surface-700 dark:text-surface-300 whitespace-pre-line">
            {report.executiveSummary}
          </p>
        </CardContent>
      </Card>

      {/* Sections */}
      {report.sections.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {report.sections.map((section, idx) => (
            <Card key={idx}>
              <CardHeader>
                <CardTitle>{section.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-surface-600 dark:text-surface-400">
                  {section.content}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Interventions */}
      {report.interventions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Interventions Required
              {unresolvedInterventions.length > 0 && (
                <Badge variant="warning">{unresolvedInterventions.length} pending</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {report.interventions.map((intervention) => (
                <InterventionItem
                  key={intervention.id}
                  intervention={intervention}
                  onResolve={() => setResolveModal({ open: true, intervention })}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Employee Highlights */}
      {report.employeeHighlights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-accent-500" />
              Employee Highlights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {report.employeeHighlights.map((highlight, idx) => (
                <HighlightCard key={idx} highlight={highlight} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {report.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-amber-500" />
              AI Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {report.recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-xs font-medium text-amber-700 dark:text-amber-300 shrink-0">
                    {idx + 1}
                  </span>
                  <p className="text-surface-700 dark:text-surface-300">{rec}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Resolve Modal */}
      <Modal
        isOpen={resolveModal.open}
        onClose={() => setResolveModal({ open: false, intervention: null })}
        title="Resolve Intervention"
      >
        {resolveModal.intervention && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-surface-50 dark:bg-surface-900/50">
              <p className="font-medium text-surface-900 dark:text-white mb-1">
                {resolveModal.intervention.issue}
              </p>
              <p className="text-sm text-surface-500">
                {resolveModal.intervention.context}
              </p>
            </div>
            <Textarea
              label="Resolution Notes"
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              placeholder="Describe how this was resolved..."
              rows={4}
            />
            <div className="flex justify-end gap-3">
              <Button
                variant="ghost"
                onClick={() => setResolveModal({ open: false, intervention: null })}
              >
                Cancel
              </Button>
              <Button
                onClick={handleResolve}
                disabled={!resolution.trim() || isResolving}
              >
                {isResolving ? 'Resolving...' : 'Mark Resolved'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  subvalue,
  color,
}: {
  icon: typeof CheckCircle;
  label: string;
  value: string | number;
  subvalue?: string;
  color: 'emerald' | 'red' | 'amber' | 'primary' | 'surface';
}) {
  const colorClasses = {
    emerald: 'text-emerald-600 dark:text-emerald-400',
    red: 'text-red-600 dark:text-red-400',
    amber: 'text-amber-600 dark:text-amber-400',
    primary: 'text-primary-600 dark:text-primary-400',
    surface: 'text-surface-600 dark:text-surface-400',
  };

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={cn('h-5 w-5', colorClasses[color])} />
        <span className="text-sm text-surface-500">{label}</span>
      </div>
      <p className={cn('text-2xl font-bold', colorClasses[color])}>
        {value}
        {subvalue && (
          <span className="text-sm font-normal text-surface-400 ml-1">{subvalue}</span>
        )}
      </p>
    </Card>
  );
}

function InterventionItem({
  intervention,
  onResolve,
}: {
  intervention: IIntervention;
  onResolve: () => void;
}) {
  const priorityColors = {
    low: 'bg-surface-100 text-surface-600',
    medium: 'bg-amber-100 text-amber-700',
    high: 'bg-orange-100 text-orange-700',
    urgent: 'bg-red-100 text-red-700',
  };

  return (
    <div className={cn(
      'p-4 rounded-xl border',
      intervention.resolved
        ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
        : 'bg-surface-50 dark:bg-surface-900/50 border-surface-200 dark:border-surface-700'
    )}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-surface-900 dark:text-white">
              {intervention.userName}
            </span>
            <Badge className={priorityColors[intervention.priority]}>
              {intervention.priority}
            </Badge>
            <Badge variant="secondary">{intervention.type.replace('_', ' ')}</Badge>
          </div>
          <p className="text-surface-700 dark:text-surface-300 mb-1">
            {intervention.issue}
          </p>
          <p className="text-sm text-surface-500">{intervention.context}</p>
          {intervention.resolved && intervention.resolution && (
            <div className="mt-3 p-3 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
              <p className="text-sm text-emerald-800 dark:text-emerald-300">
                <strong>Resolution:</strong> {intervention.resolution}
              </p>
            </div>
          )}
        </div>
        {!intervention.resolved && (
          <Button variant="outline" size="sm" onClick={onResolve}>
            Resolve
          </Button>
        )}
        {intervention.resolved && (
          <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
        )}
      </div>
    </div>
  );
}

function HighlightCard({ highlight }: { highlight: IEmployeeHighlight }) {
  const typeConfig = {
    praise: { icon: Award, color: 'emerald', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    concern: { icon: AlertCircle, color: 'amber', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    blocker: { icon: AlertTriangle, color: 'red', bg: 'bg-red-50 dark:bg-red-900/20' },
    achievement: { icon: Target, color: 'primary', bg: 'bg-primary-50 dark:bg-primary-900/20' },
  };

  const config = typeConfig[highlight.type];
  const Icon = config.icon;

  return (
    <div className={cn('p-4 rounded-xl', config.bg)}>
      <div className="flex items-start gap-3">
        <Icon className={cn('h-5 w-5 mt-0.5', `text-${config.color}-600 dark:text-${config.color}-400`)} />
        <div>
          <p className="font-medium text-surface-900 dark:text-white">
            {highlight.userName}
          </p>
          <p className="text-sm font-medium text-surface-700 dark:text-surface-300 mt-1">
            {highlight.title}
          </p>
          <p className="text-sm text-surface-500 mt-1">{highlight.note}</p>
        </div>
      </div>
    </div>
  );
}

