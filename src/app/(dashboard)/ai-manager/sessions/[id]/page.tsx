'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAIPMSessions } from '@/hooks/useAIPM';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { Avatar } from '@/components/ui/Avatar';
import { Modal } from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Input';
import { ICheckInSession, ISessionMessage } from '@/types/aipm';
import { cn } from '@/lib/utils';
import {
  ArrowLeft,
  Bot,
  User,
  Calendar,
  Clock,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
  AlertCircle,
  FileText,
  Send,
} from 'lucide-react';

export default function SessionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getSession, addFeedback, isAddingFeedback } = useAIPMSessions();
  const [session, setSession] = useState<ICheckInSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [feedbackModal, setFeedbackModal] = useState(false);
  const [feedback, setFeedback] = useState('');

  const sessionId = params.id as string;

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const data = await getSession(sessionId);
        setSession(data);
      } catch (error) {
        console.error('Failed to fetch session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSession();
  }, [sessionId, getSession]);

  const handleAddFeedback = async () => {
    if (!feedback.trim()) return;
    await addFeedback(sessionId, feedback);
    setFeedbackModal(false);
    setFeedback('');
    // Refresh session
    const updated = await getSession(sessionId);
    setSession(updated);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="h-12 w-12 mx-auto mb-4 text-surface-300" />
        <p className="text-surface-500">Session not found</p>
        <Button onClick={() => router.back()} variant="ghost" className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go back
        </Button>
      </div>
    );
  }

  const user = typeof session.userId === 'object' ? session.userId : null;
  const analysis = session.analysis;

  const sentimentConfig = {
    positive: { icon: TrendingUp, color: 'emerald', label: 'Positive' },
    neutral: { icon: Minus, color: 'surface', label: 'Neutral' },
    negative: { icon: TrendingDown, color: 'amber', label: 'Needs Attention' },
  };

  const sentiment = analysis?.sentimentLabel ? sentimentConfig[analysis.sentimentLabel] : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Avatar
            firstName={user?.firstName}
            lastName={user?.lastName}
            size="lg"
          />
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-surface-900 dark:text-white">
                {user ? `${user.firstName} ${user.lastName}` : 'Unknown User'}
              </h1>
              {analysis?.managerFlagged && (
                <Badge variant="warning" className="flex items-center gap-1">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Flagged
                </Badge>
              )}
              <Badge variant={session.status === 'completed' ? 'success' : 'secondary'}>
                {session.status}
              </Badge>
            </div>
            <p className="text-surface-500 dark:text-surface-400 flex items-center gap-4 mt-1">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(session.scheduledAt).toLocaleDateString()}
              </span>
              {session.completedAt && (
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {new Date(session.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </p>
          </div>
        </div>

        <Button onClick={() => setFeedbackModal(true)}>
          <Send className="h-4 w-4 mr-2" />
          Add Feedback
        </Button>
      </div>

      {/* Stats & Analysis */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={MessageSquare}
          label="Messages"
          value={session.messages.length}
          color="primary"
        />
        <StatCard
          icon={sentiment?.icon || Minus}
          label="Sentiment"
          value={`${Math.round((analysis?.sentimentScore || 0.5) * 100)}%`}
          color={sentiment?.color as any || 'surface'}
        />
        <StatCard
          icon={AlertCircle}
          label="Blockers"
          value={analysis?.detectedBlockers?.length || 0}
          color={analysis?.detectedBlockers?.length ? 'amber' : 'surface'}
        />
        <StatCard
          icon={Target}
          label="Tickets Discussed"
          value={analysis?.ticketUpdates?.length || 0}
          color="emerald"
        />
      </div>

      {/* Flag Reason */}
      {analysis?.managerFlagged && analysis.flagReason && (
        <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-800 dark:text-amber-300">
                  Flagged for Manager Review
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                  {analysis.flagReason}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Summary */}
      {analysis?.aiSummary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary-500" />
              AI Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-surface-700 dark:text-surface-300">
              {analysis.aiSummary}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Manager Feedback */}
      {session.contextSnapshot.managerFeedback && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-accent-500" />
              Manager Feedback
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-surface-700 dark:text-surface-300">
              {session.contextSnapshot.managerFeedback}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Transcript */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary-500" />
            Conversation Transcript
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {session.messages.map((message, index) => (
              <TranscriptMessage key={index} message={message} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detected Blockers */}
      {analysis?.detectedBlockers && analysis.detectedBlockers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Detected Blockers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analysis.detectedBlockers.map((blocker, idx) => (
                <div
                  key={idx}
                  className={cn(
                    'p-4 rounded-xl border',
                    blocker.severity === 'high'
                      ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                      : blocker.severity === 'medium'
                      ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                      : 'bg-surface-50 dark:bg-surface-900/50 border-surface-200 dark:border-surface-700'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <Badge
                      variant={
                        blocker.severity === 'high'
                          ? 'danger'
                          : blocker.severity === 'medium'
                          ? 'warning'
                          : 'secondary'
                      }
                    >
                      {blocker.severity}
                    </Badge>
                    <p className="text-surface-700 dark:text-surface-300">
                      {blocker.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Skip Reason */}
      {session.status === 'skipped' && session.skipReason && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-surface-500" />
              Skip Reason
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-surface-600 dark:text-surface-400">
              {session.skipReason}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Feedback Modal */}
      <Modal
        isOpen={feedbackModal}
        onClose={() => setFeedbackModal(false)}
        title="Add Manager Feedback"
      >
        <div className="space-y-4">
          <p className="text-surface-600 dark:text-surface-400">
            This feedback will be included in the employee&apos;s next check-in context.
          </p>
          <Textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Add notes, follow-up items, or guidance for the next check-in..."
            rows={4}
          />
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setFeedbackModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddFeedback}
              disabled={!feedback.trim() || isAddingFeedback}
            >
              {isAddingFeedback ? 'Saving...' : 'Save Feedback'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof MessageSquare;
  label: string;
  value: string | number;
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

function TranscriptMessage({ message }: { message: ISessionMessage }) {
  const isAI = message.role === 'aipm';

  return (
    <div className={cn('flex gap-3', !isAI && 'flex-row-reverse')}>
      {/* Avatar */}
      <div
        className={cn(
          'w-10 h-10 rounded-full flex items-center justify-center shrink-0',
          isAI
            ? 'bg-gradient-to-br from-primary-500 to-accent-500'
            : 'bg-surface-200 dark:bg-surface-700'
        )}
      >
        {isAI ? (
          <Bot className="h-5 w-5 text-white" />
        ) : (
          <User className="h-5 w-5 text-surface-600 dark:text-surface-400" />
        )}
      </div>

      {/* Message */}
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-3',
          isAI
            ? 'bg-surface-100 dark:bg-surface-700/50 text-surface-900 dark:text-surface-100'
            : 'bg-gradient-to-r from-primary-500 to-primary-600 text-white'
        )}
      >
        <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
        <p
          className={cn(
            'text-xs mt-2',
            isAI ? 'text-surface-400' : 'text-white/70'
          )}
        >
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  );
}

