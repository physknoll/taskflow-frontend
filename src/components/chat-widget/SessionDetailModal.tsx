'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  User,
  Bot,
  ChevronDown,
  ChevronUp,
  Clock,
  MapPin,
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  FileText,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';
import { WidgetSession, WidgetSessionMessage, WidgetRAGSource } from '@/types/chat-widget';
import { formatDate, cn } from '@/lib/utils';
import Link from 'next/link';

interface SessionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: WidgetSession | null;
}

/**
 * Modal showing full session details including messages, feedback, and RAG sources
 */
export function SessionDetailModal({
  isOpen,
  onClose,
  session,
}: SessionDetailModalProps) {
  if (!session) return null;

  const getDeviceIcon = (deviceType?: string) => {
    switch (deviceType) {
      case 'mobile':
        return <Smartphone className="h-4 w-4" />;
      case 'tablet':
        return <Tablet className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

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

  // Count feedback
  const positiveFeedbackCount = session.messages.filter(m => m.feedback?.rating === 'positive').length;
  const negativeFeedbackCount = session.messages.filter(m => m.feedback?.rating === 'negative').length;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Session Details" size="lg">
      <div className="space-y-6">
        {/* Session Info Header */}
        <div className="flex flex-wrap items-center gap-4 pb-4 border-b border-surface-200 dark:border-surface-700">
          <Badge className={getStatusColor(session.status)}>
            {session.status}
          </Badge>

          {/* Feedback badge */}
          {session.feedback?.overallRating && (
            <Badge 
              className={cn(
                session.feedback.overallRating === 'positive'
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              )}
            >
              {session.feedback.overallRating === 'positive' ? (
                <ThumbsUp className="h-3 w-3 mr-1" />
              ) : (
                <ThumbsDown className="h-3 w-3 mr-1" />
              )}
              {session.feedback.overallRating}
            </Badge>
          )}

          {/* Needs review badge */}
          {session.needsReview && !session.reviewedAt && (
            <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Needs Review
            </Badge>
          )}

          {/* Reviewed badge */}
          {session.reviewedAt && (
            <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
              <CheckCircle className="h-3 w-3 mr-1" />
              Reviewed
            </Badge>
          )}

          <div className="flex items-center gap-1 text-sm text-surface-500">
            <Clock className="h-4 w-4" />
            {formatDate(session.startedAt)}
          </div>

          {session.visitor.country && (
            <div className="flex items-center gap-1 text-sm text-surface-500">
              <MapPin className="h-4 w-4" />
              {session.visitor.city && `${session.visitor.city}, `}
              {session.visitor.country}
            </div>
          )}

          <div className="flex items-center gap-1 text-sm text-surface-500">
            {getDeviceIcon(session.visitor.deviceType)}
            {session.visitor.deviceType || 'desktop'}
          </div>

          <div className="flex items-center gap-1 text-sm text-surface-500">
            <Globe className="h-4 w-4" />
            {session.context.domain}
          </div>
        </div>

        {/* Linked Ticket Alert */}
        {session.reviewTicketId && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
                  Improvement Ticket Created
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  An AI review has generated a ticket for this session
                </p>
              </div>
            </div>
            <Link href={`/tickets/${session.reviewTicketId}`}>
              <Button variant="outline" size="sm">
                View Ticket
                <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </div>
        )}

        {/* Analytics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="bg-surface-50 dark:bg-surface-800 rounded-lg p-3">
            <p className="text-2xl font-bold text-surface-900 dark:text-white">
              {session.analytics.messageCount}
            </p>
            <p className="text-xs text-surface-500">Messages</p>
          </div>
          <div className="bg-surface-50 dark:bg-surface-800 rounded-lg p-3">
            <p className="text-2xl font-bold text-surface-900 dark:text-white">
              {session.analytics.avgResponseTimeMs
                ? `${Math.round(session.analytics.avgResponseTimeMs)}ms`
                : '-'}
            </p>
            <p className="text-xs text-surface-500">Avg Response</p>
          </div>
          <div className="bg-surface-50 dark:bg-surface-800 rounded-lg p-3">
            <div className="flex items-center justify-center gap-1">
              <ThumbsUp className="h-4 w-4 text-green-500" />
              <p className="text-2xl font-bold text-surface-900 dark:text-white">
                {positiveFeedbackCount}
              </p>
            </div>
            <p className="text-xs text-surface-500">Positive</p>
          </div>
          <div className="bg-surface-50 dark:bg-surface-800 rounded-lg p-3">
            <div className="flex items-center justify-center gap-1">
              <ThumbsDown className="h-4 w-4 text-red-500" />
              <p className="text-2xl font-bold text-surface-900 dark:text-white">
                {negativeFeedbackCount}
              </p>
            </div>
            <p className="text-xs text-surface-500">Negative</p>
          </div>
        </div>

        {/* Messages */}
        <div className="space-y-4 max-h-[400px] overflow-y-auto">
          <h4 className="font-medium text-surface-900 dark:text-white sticky top-0 bg-white dark:bg-surface-800 py-2">
            Conversation
          </h4>
          {session.messages.map((message: WidgetSessionMessage, index: number) => (
            <MessageItem key={index} message={message} />
          ))}
        </div>
      </div>
    </Modal>
  );
}

function MessageItem({ message }: { message: WidgetSessionMessage }) {
  const [showSources, setShowSources] = useState(false);
  const isUser = message.role === 'user';
  const hasSources = message.metadata?.ragSources && message.metadata.ragSources.length > 0;
  const hasNegativeFeedback = message.feedback?.rating === 'negative';
  const hasPositiveFeedback = message.feedback?.rating === 'positive';

  return (
    <div
      className={cn(
        'flex gap-3',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
          isUser
            ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400'
            : 'bg-surface-100 text-surface-600 dark:bg-surface-700 dark:text-surface-400'
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      {/* Message Content */}
      <div
        className={cn(
          'flex-1 max-w-[80%]',
          isUser ? 'text-right' : 'text-left'
        )}
      >
        <div
          className={cn(
            'inline-block rounded-lg px-4 py-2 text-sm relative',
            isUser
              ? 'bg-primary-500 text-white'
              : 'bg-surface-100 dark:bg-surface-700 text-surface-900 dark:text-white',
            // Highlight negative feedback messages
            hasNegativeFeedback && !isUser && 'ring-2 ring-red-400 dark:ring-red-500 bg-red-50 dark:bg-red-900/20'
          )}
        >
          {message.content}
          
          {/* Feedback indicator */}
          {(hasPositiveFeedback || hasNegativeFeedback) && !isUser && (
            <div
              className={cn(
                'absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center',
                hasPositiveFeedback 
                  ? 'bg-green-500' 
                  : 'bg-red-500'
              )}
            >
              {hasPositiveFeedback ? (
                <ThumbsUp className="h-3 w-3 text-white" />
              ) : (
                <ThumbsDown className="h-3 w-3 text-white" />
              )}
            </div>
          )}
        </div>

        {/* User feedback comment */}
        {message.feedback?.comment && (
          <div className={cn(
            'mt-2 p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700',
            isUser ? 'text-right' : 'text-left'
          )}>
            <div className="flex items-center gap-1 text-xs text-amber-700 dark:text-amber-300 mb-1">
              <MessageSquare className="h-3 w-3" />
              User Feedback
            </div>
            <p className="text-sm text-amber-900 dark:text-amber-100">
              &ldquo;{message.feedback.comment}&rdquo;
            </p>
          </div>
        )}

        {/* Metadata */}
        <div
          className={cn(
            'mt-1 text-xs text-surface-400 flex items-center gap-2',
            isUser ? 'justify-end' : 'justify-start'
          )}
        >
          <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
          {message.metadata?.latencyMs && (
            <span>({message.metadata.latencyMs}ms)</span>
          )}
          {message.metadata?.ragConfidence !== undefined && (
            <span>
              {Math.round(message.metadata.ragConfidence * 100)}% confidence
            </span>
          )}
        </div>

        {/* RAG Sources */}
        {hasSources && (
          <div className="mt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSources(!showSources)}
              className="text-xs"
            >
              <FileText className="h-3 w-3 mr-1" />
              {showSources ? 'Hide' : 'Show'} Sources (
              {message.metadata!.ragSources!.length})
              {showSources ? (
                <ChevronUp className="h-3 w-3 ml-1" />
              ) : (
                <ChevronDown className="h-3 w-3 ml-1" />
              )}
            </Button>

            {showSources && (
              <div className="mt-2 space-y-2">
                {message.metadata!.ragSources!.map((source: WidgetRAGSource, i: number) => (
                  <div
                    key={i}
                    className="bg-surface-50 dark:bg-surface-800 rounded-lg p-3 text-left"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm text-surface-900 dark:text-white">
                        {source.title}
                      </span>
                      <Badge variant="secondary" size="sm">
                        {source.category}
                      </Badge>
                    </div>
                    <p className="text-xs text-surface-500 line-clamp-2">
                      {source.excerpt}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
