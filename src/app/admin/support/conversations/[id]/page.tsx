'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAdminConversation } from '@/hooks/admin/useAdminSupport';
import { CONVERSATION_STATUS_COLORS, CONVERSATION_TYPES } from '@/lib/admin-constants';
import { 
  ArrowLeft,
  MessageSquare,
  User,
  Building2,
  Clock,
  Bot,
} from 'lucide-react';
import { format } from 'date-fns';
import { safeFormatDate, formatStatus } from '@/lib/utils';

export default function ConversationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const conversationId = params.id as string;

  const { data: conversation, isLoading, error } = useAdminConversation(conversationId);

  const getStatusColor = (status: string) => {
    return CONVERSATION_STATUS_COLORS[status as keyof typeof CONVERSATION_STATUS_COLORS] || 'bg-surface-100 text-surface-600';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardContent className="space-y-4">
            <Skeleton className="h-6 w-64" />
            <Skeleton className="h-4 w-48" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !conversation) {
    return (
      <div className="text-center py-12">
        <p className="text-surface-500">Conversation not found or failed to load.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/admin/support/conversations')}>
          Back to Conversations
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link 
        href="/admin/support/conversations"
        className="inline-flex items-center gap-2 text-surface-500 hover:text-surface-700 dark:hover:text-surface-300"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Conversations
      </Link>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">
            {conversation.title || CONVERSATION_TYPES.find(t => t.id === conversation.type)?.label || 'Conversation'}
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <Badge className={getStatusColor(conversation.status)}>
              {conversation.status}
            </Badge>
            <span className="text-surface-500">
              {CONVERSATION_TYPES.find(t => t.id === conversation.type)?.label || conversation.type}
            </span>
            <span className="text-surface-500">via {conversation.channel}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Messages */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Messages ({conversation.messages.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {conversation.messages.map((message) => (
                <div 
                  key={message._id}
                  className={`flex gap-3 ${message.role === 'assistant' ? 'flex-row' : 'flex-row-reverse'}`}
                >
                  <div className="flex-shrink-0">
                    {message.role === 'assistant' ? (
                      <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                        <Bot className="w-4 h-4 text-purple-600" />
                      </div>
                    ) : message.role === 'user' ? (
                      <Avatar
                        firstName={conversation.user?.firstName}
                        lastName={conversation.user?.lastName}
                        size="sm"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center">
                        <span className="text-xs text-surface-500">{message.role[0].toUpperCase()}</span>
                      </div>
                    )}
                  </div>
                  <div 
                    className={`flex-1 p-3 rounded-lg ${
                      message.role === 'assistant' 
                        ? 'bg-purple-50 dark:bg-purple-900/20' 
                        : message.role === 'user'
                        ? 'bg-surface-100 dark:bg-surface-800'
                        : 'bg-surface-50 dark:bg-surface-800/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-surface-500 capitalize">
                        {message.role}
                      </span>
                      <span className="text-xs text-surface-400">
                        {safeFormatDate(message.timestamp, (d) => format(d, 'h:mm a'))}
                      </span>
                    </div>
                    <p className="text-surface-900 dark:text-white whitespace-pre-wrap">
                      {message.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* User Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">User</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Avatar
                  firstName={conversation.user?.firstName}
                  lastName={conversation.user?.lastName}
                  src={conversation.user?.avatar}
                  size="lg"
                />
                <div>
                  <p className="font-medium text-surface-900 dark:text-white">
                    {conversation.user?.firstName} {conversation.user?.lastName}
                  </p>
                  <p className="text-sm text-surface-500">{conversation.user?.email}</p>
                </div>
              </div>
              {conversation.organization && (
                <Link
                  href={`/admin/organizations/${conversation.organization._id}`}
                  className="flex items-center gap-2 mt-4 p-3 rounded-lg bg-surface-50 dark:bg-surface-800 hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
                >
                  <Building2 className="w-4 h-4 text-surface-500" />
                  <span className="text-surface-900 dark:text-white">
                    {conversation.organization.name}
                  </span>
                </Link>
              )}
            </CardContent>
          </Card>

          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-surface-500">Started</span>
                <span className="text-sm text-surface-900 dark:text-white">
                  {safeFormatDate(conversation.startedAt, (d) => format(d, 'MMM d, yyyy h:mm a'))}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-surface-500">Last Message</span>
                <span className="text-sm text-surface-900 dark:text-white">
                  {safeFormatDate(conversation.lastMessageAt, (d) => format(d, 'MMM d, yyyy h:mm a'))}
                </span>
              </div>
              {conversation.completedAt && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-surface-500">Completed</span>
                  <span className="text-sm text-surface-900 dark:text-white">
                    {safeFormatDate(conversation.completedAt, (d) => format(d, 'MMM d, yyyy h:mm a'))}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm text-surface-500">Messages</span>
                <span className="text-sm text-surface-900 dark:text-white">
                  {conversation.messageCount}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-surface-500">Channel</span>
                <span className="text-sm text-surface-900 dark:text-white capitalize">
                  {formatStatus(conversation.channel)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Related Tickets */}
          {conversation.relatedTickets && conversation.relatedTickets.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Related Tickets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {conversation.relatedTickets.map((ticket) => (
                    <div 
                      key={ticket.ticketId}
                      className="flex items-center justify-between p-2 rounded-lg bg-surface-50 dark:bg-surface-800"
                    >
                      <span className="text-sm font-mono text-surface-900 dark:text-white">
                        {ticket.ticketNumber}
                      </span>
                      <Badge size="sm">{ticket.relationship}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
