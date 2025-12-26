'use client';

import { useMemo } from 'react';
import {
  format,
  isToday,
  isTomorrow,
  isYesterday,
  startOfDay,
  differenceInDays,
} from 'date-fns';
import { useCalendarStore } from '@/stores/calendarStore';
import { UnifiedCalendarItem, CreateEventSlot } from '@/types/calendar';
import { EVENT_TYPE_LABELS } from '../constants';
import { cn } from '@/lib/utils';
import {
  Clock,
  MapPin,
  Users,
  Calendar,
  Ticket,
  FolderKanban,
  Flag,
  ExternalLink,
} from 'lucide-react';

interface AgendaViewProps {
  items: UnifiedCalendarItem[];
  onSlotClick: (slot: CreateEventSlot) => void;
  onEventClick: (item: UnifiedCalendarItem) => void;
  onDateClick: (date: Date) => void;
  onEventDrop?: (item: UnifiedCalendarItem, newStart: Date, newEnd: Date) => void;
  isLoading?: boolean;
}

export function AgendaView({
  items,
  onEventClick,
  isLoading,
}: AgendaViewProps) {
  const { selectedDate } = useCalendarStore();

  // Group items by date
  const groupedItems = useMemo(() => {
    const groups: Record<string, UnifiedCalendarItem[]> = {};

    items.forEach((item) => {
      const dateKey = format(item.start, 'yyyy-MM-dd');
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(item);
    });

    // Sort groups by date and items within groups by time
    const sortedKeys = Object.keys(groups).sort();
    const sortedGroups: Record<string, UnifiedCalendarItem[]> = {};

    sortedKeys.forEach((key) => {
      sortedGroups[key] = groups[key].sort(
        (a, b) => a.start.getTime() - b.start.getTime()
      );
    });

    return sortedGroups;
  }, [items]);

  // Format date header
  const formatDateHeader = (dateKey: string) => {
    const date = new Date(dateKey + 'T00:00:00');
    const daysDiff = differenceInDays(startOfDay(date), startOfDay(new Date()));

    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    if (isYesterday(date)) return 'Yesterday';
    if (daysDiff > 0 && daysDiff < 7) return format(date, 'EEEE');

    return format(date, 'EEEE, MMMM d, yyyy');
  };

  // Get item type icon
  const getItemTypeIcon = (item: UnifiedCalendarItem) => {
    switch (item.type) {
      case 'ticket_deadline':
      case 'ticket_start':
        return <Ticket className="h-4 w-4" />;
      case 'project_start':
      case 'project_deadline':
        return <FolderKanban className="h-4 w-4" />;
      case 'milestone':
        return <Flag className="h-4 w-4" />;
      case 'event':
        return item.syncStatus === 'synced' ? (
          <ExternalLink className="h-4 w-4" />
        ) : (
          <Calendar className="h-4 w-4" />
        );
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  // Get item type label
  const getItemTypeLabel = (item: UnifiedCalendarItem) => {
    switch (item.type) {
      case 'ticket_deadline':
        return 'Ticket Due';
      case 'ticket_start':
        return 'Ticket Start';
      case 'project_start':
        return 'Project Start';
      case 'project_deadline':
        return 'Project Due';
      case 'milestone':
        return 'Milestone';
      case 'event':
        return item.eventType ? EVENT_TYPE_LABELS[item.eventType] : 'Event';
      default:
        return 'Event';
    }
  };

  if (Object.keys(groupedItems).length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12 text-surface-500 dark:text-surface-400">
        <Calendar className="h-16 w-16 mb-4 opacity-50" />
        <p className="text-lg font-medium">No upcoming items</p>
        <p className="text-sm mt-1">
          Events, deadlines, and milestones will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto p-4 space-y-6">
      {Object.entries(groupedItems).map(([dateKey, dateItems]) => {
        const date = new Date(dateKey + 'T00:00:00');
        const isTodayDate = isToday(date);

        return (
          <div key={dateKey}>
            {/* Date header */}
            <div
              className={cn(
                'sticky top-0 z-10 py-2 px-3 mb-3 rounded-lg font-semibold',
                isTodayDate
                  ? 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300'
                  : 'bg-surface-100 text-surface-700 dark:bg-surface-800 dark:text-surface-300'
              )}
            >
              <div className="flex items-center justify-between">
                <span>{formatDateHeader(dateKey)}</span>
                <span className="text-sm font-normal opacity-75">
                  {format(date, 'MMM d')}
                </span>
              </div>
            </div>

            {/* Items for this date */}
            <div className="space-y-3">
              {dateItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onEventClick(item)}
                  className="w-full text-left bg-white dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700 p-4 hover:shadow-md hover:border-surface-300 dark:hover:border-surface-600 transition-all"
                >
                  <div className="flex items-start gap-4">
                    {/* Color indicator */}
                    <div
                      className="w-1.5 h-full min-h-[60px] rounded-full flex-shrink-0"
                      style={{ backgroundColor: item.color }}
                    />

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Title row */}
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="font-semibold text-surface-900 dark:text-white truncate">
                          {item.title}
                        </h3>
                        <span
                          className="flex-shrink-0 text-xs px-2 py-1 rounded-full text-white"
                          style={{ backgroundColor: item.color }}
                        >
                          {getItemTypeLabel(item)}
                        </span>
                      </div>

                      {/* Time */}
                      <div className="flex items-center gap-2 mt-2 text-sm text-surface-600 dark:text-surface-400">
                        <Clock className="h-4 w-4" />
                        {item.allDay ? (
                          <span>All day</span>
                        ) : (
                          <span>
                            {format(item.start, 'h:mm a')}
                            {item.end && ` - ${format(item.end, 'h:mm a')}`}
                          </span>
                        )}
                      </div>

                      {/* Project/Ticket info */}
                      {item.projectName && (
                        <div className="flex items-center gap-2 mt-1 text-sm text-surface-500 dark:text-surface-400">
                          {getItemTypeIcon(item)}
                          <span className="truncate">{item.projectName}</span>
                          {item.ticketNumber && (
                            <span className="text-xs bg-surface-100 dark:bg-surface-700 px-2 py-0.5 rounded">
                              {item.ticketNumber}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Description preview */}
                      {item.description && (
                        <p className="mt-2 text-sm text-surface-500 dark:text-surface-400 line-clamp-2">
                          {item.description}
                        </p>
                      )}

                      {/* Assignees */}
                      {item.assignees && item.assignees.length > 0 && (
                        <div className="flex items-center gap-2 mt-3">
                          <Users className="h-4 w-4 text-surface-400" />
                          <div className="flex -space-x-2">
                            {item.assignees.slice(0, 4).map((assignee) => (
                              <div
                                key={assignee._id}
                                className="w-6 h-6 rounded-full bg-surface-200 dark:bg-surface-600 border-2 border-white dark:border-surface-800 flex items-center justify-center"
                                title={`${assignee.firstName} ${assignee.lastName}`}
                              >
                                <span className="text-xs font-medium text-surface-600 dark:text-surface-300">
                                  {assignee.firstName?.[0]}
                                </span>
                              </div>
                            ))}
                            {item.assignees.length > 4 && (
                              <div className="w-6 h-6 rounded-full bg-surface-100 dark:bg-surface-700 border-2 border-white dark:border-surface-800 flex items-center justify-center">
                                <span className="text-xs text-surface-500">
                                  +{item.assignees.length - 4}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Status badges */}
                      <div className="flex items-center gap-2 mt-3">
                        {item.priority && (
                          <span
                            className={cn(
                              'text-xs px-2 py-0.5 rounded-full capitalize',
                              item.priority === 'high'
                                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                : item.priority === 'medium'
                                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                                : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                            )}
                          >
                            {item.priority}
                          </span>
                        )}
                        {item.status && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-400 capitalize">
                            {item.status.replace('_', ' ')}
                          </span>
                        )}
                        {item.isCompleted && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                            Completed
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default AgendaView;

