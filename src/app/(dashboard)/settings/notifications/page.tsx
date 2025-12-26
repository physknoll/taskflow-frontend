'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useNotifications } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn, formatRelativeTime } from '@/lib/utils';
import {
  Bell,
  Check,
  CheckCheck,
  Ticket,
  MessageCircle,
  AlertTriangle,
  Bot,
  Trash2,
  ArrowLeft,
  Filter,
  X,
} from 'lucide-react';

const notificationIcons: Record<string, React.ElementType> = {
  ticket_assigned: Ticket,
  ticket_updated: Ticket,
  ticket_comment: MessageCircle,
  review_requested: Check,
  review_completed: CheckCheck,
  ai_checkin: Bot,
  ai_reminder: Bot,
  due_date_approaching: AlertTriangle,
  due_date_passed: AlertTriangle,
  default: Bell,
};

const notificationTypeLabels: Record<string, string> = {
  ticket_assigned: 'Ticket Assigned',
  ticket_updated: 'Ticket Updated',
  ticket_comment: 'Comment',
  review_requested: 'Review Requested',
  review_completed: 'Review Completed',
  ai_checkin: 'AI Check-in',
  ai_reminder: 'AI Reminder',
  due_date_approaching: 'Due Soon',
  due_date_passed: 'Overdue',
};

// Normalize URLs from backend that might not match frontend routes
const normalizeActionUrl = (url: string | undefined): string => {
  if (!url) return '#';
  if (url === '/dashboard') return '/';
  return url;
};

type FilterType = 'all' | 'unread' | 'read';

export default function NotificationsPage() {
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead, dismiss } = useNotifications();
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  const filteredNotifications = notifications.filter((notification) => {
    // Filter by read status
    if (filter === 'unread' && notification.isRead) return false;
    if (filter === 'read' && !notification.isRead) return false;
    
    // Filter by type
    if (selectedTypes.length > 0 && !selectedTypes.includes(notification.type)) return false;
    
    return true;
  });

  const uniqueTypes = Array.from(new Set(notifications.map((n) => n.type)));

  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const clearFilters = () => {
    setFilter('all');
    setSelectedTypes([]);
  };

  const hasActiveFilters = filter !== 'all' || selectedTypes.length > 0;

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <Skeleton variant="text" width={200} height={32} />
          <Skeleton variant="text" width={300} height={20} className="mt-2" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} variant="rounded" height={80} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link
              href="/settings"
              className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-muted)] transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Notifications</h1>
            {unreadCount > 0 && (
              <Badge variant="primary">{unreadCount} unread</Badge>
            )}
          </div>
          <p className="text-[var(--text-secondary)] ml-11">
            View and manage all your notifications
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={() => markAllAsRead()}>
            <CheckCheck className="h-4 w-4 mr-2" />
            Mark all as read
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-default)] p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-[var(--text-muted)]" />
            <span className="text-sm font-medium text-[var(--text-primary)]">Filters</span>
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-primary-500 hover:text-primary-600 flex items-center gap-1"
            >
              <X className="h-3 w-3" />
              Clear filters
            </button>
          )}
        </div>

        {/* Status filter */}
        <div className="flex flex-wrap gap-2 mb-4">
          {(['all', 'unread', 'read'] as FilterType[]).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                filter === status
                  ? 'bg-primary-500 text-white'
                  : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-primary)]'
              )}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Type filter */}
        {uniqueTypes.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {uniqueTypes.map((type) => (
              <button
                key={type}
                onClick={() => toggleType(type)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5',
                  selectedTypes.includes(type)
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300'
                    : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-primary)]'
                )}
              >
                {notificationTypeLabels[type] || type}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Notifications list */}
      {filteredNotifications.length === 0 ? (
        <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-default)] p-12 text-center">
          <Bell className="h-12 w-12 mx-auto mb-4 text-[var(--text-muted)] opacity-50" />
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
            {hasActiveFilters ? 'No matching notifications' : 'No notifications yet'}
          </h3>
          <p className="text-[var(--text-secondary)]">
            {hasActiveFilters
              ? 'Try adjusting your filters to see more notifications.'
              : "When you receive notifications, they'll appear here."}
          </p>
          {hasActiveFilters && (
            <Button variant="outline" onClick={clearFilters} className="mt-4">
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-default)] overflow-hidden divide-y divide-[var(--border-default)]">
          {filteredNotifications.map((notification) => {
            const Icon = notificationIcons[notification.type] || notificationIcons.default;
            return (
              <div
                key={notification._id}
                className={cn(
                  'flex items-start gap-4 p-4 transition-colors',
                  !notification.isRead && 'bg-primary-50 dark:bg-primary-950/30'
                )}
              >
                {/* Icon */}
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
                    notification.isRead
                      ? 'bg-[var(--bg-tertiary)] text-[var(--text-muted)]'
                      : 'bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400'
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p
                        className={cn(
                          'text-sm',
                          notification.isRead
                            ? 'text-[var(--text-secondary)]'
                            : 'text-[var(--text-primary)] font-medium'
                        )}
                      >
                        {notification.title}
                      </p>
                      <p className="text-sm text-[var(--text-muted)] mt-0.5">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-[var(--text-muted)]">
                          {formatRelativeTime(notification.createdAt)}
                        </span>
                        <Badge variant="default" size="sm">
                          {notificationTypeLabels[notification.type] || notification.type}
                        </Badge>
                      </div>
                    </div>

                    {/* Unread indicator */}
                    {!notification.isRead && (
                      <div className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0 mt-2" />
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-3">
                    {notification.actionUrl && (
                      <Link
                        href={normalizeActionUrl(notification.actionUrl)}
                        onClick={() => !notification.isRead && markAsRead(notification._id)}
                        className="text-sm text-primary-500 hover:text-primary-600 font-medium"
                      >
                        View details
                      </Link>
                    )}
                    {!notification.isRead && (
                      <button
                        onClick={() => markAsRead(notification._id)}
                        className="text-sm text-[var(--text-muted)] hover:text-[var(--text-secondary)] flex items-center gap-1"
                      >
                        <Check className="h-3 w-3" />
                        Mark as read
                      </button>
                    )}
                    <button
                      onClick={() => dismiss(notification._id)}
                      className="text-sm text-[var(--text-muted)] hover:text-error-500 flex items-center gap-1 ml-auto"
                    >
                      <Trash2 className="h-3 w-3" />
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Stats footer */}
      {notifications.length > 0 && (
        <div className="mt-4 text-center text-sm text-[var(--text-muted)]">
          Showing {filteredNotifications.length} of {notifications.length} notifications
        </div>
      )}
    </div>
  );
}

