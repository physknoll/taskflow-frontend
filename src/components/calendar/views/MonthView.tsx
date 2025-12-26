'use client';

import { useMemo } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
} from 'date-fns';
import { useCalendarStore } from '@/stores/calendarStore';
import { UnifiedCalendarItem, CreateEventSlot } from '@/types/calendar';
import { cn } from '@/lib/utils';

interface MonthViewProps {
  items: UnifiedCalendarItem[];
  onSlotClick: (slot: CreateEventSlot) => void;
  onEventClick: (item: UnifiedCalendarItem) => void;
  onDateClick: (date: Date) => void;
  onEventDrop?: (item: UnifiedCalendarItem, newStart: Date, newEnd: Date) => void;
  isLoading?: boolean;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function MonthView({
  items,
  onSlotClick,
  onEventClick,
  onDateClick,
  isLoading,
}: MonthViewProps) {
  const { selectedDate, setViewType, setSelectedDate } = useCalendarStore();

  // Generate calendar grid days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(selectedDate);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [selectedDate]);

  // Group items by date
  const itemsByDate = useMemo(() => {
    const grouped: Record<string, UnifiedCalendarItem[]> = {};

    items.forEach((item) => {
      const dateKey = format(item.start, 'yyyy-MM-dd');
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(item);
    });

    return grouped;
  }, [items]);

  // Handle day click
  const handleDayClick = (date: Date, e: React.MouseEvent) => {
    // If clicking on empty space, create new event
    if ((e.target as HTMLElement).dataset.dayCell === 'true') {
      const start = new Date(date);
      start.setHours(9, 0, 0, 0);
      const end = new Date(date);
      end.setHours(10, 0, 0, 0);
      onSlotClick({ start, end, allDay: true });
    }
  };

  // Handle day double click (drill down to day view)
  const handleDayDoubleClick = (date: Date) => {
    setSelectedDate(date);
    setViewType('day');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b border-surface-200 dark:border-surface-700">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="py-3 text-center text-sm font-medium text-surface-600 dark:text-surface-400"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="flex-1 grid grid-cols-7 auto-rows-fr">
        {calendarDays.map((day) => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const dayItems = itemsByDate[dateKey] || [];
          const isCurrentMonth = isSameMonth(day, selectedDate);
          const isSelected = isSameDay(day, selectedDate);
          const isTodayDate = isToday(day);
          const maxDisplayed = 3;
          const hiddenCount = dayItems.length - maxDisplayed;

          return (
            <div
              key={dateKey}
              data-day-cell="true"
              onClick={(e) => handleDayClick(day, e)}
              onDoubleClick={() => handleDayDoubleClick(day)}
              className={cn(
                'border-r border-b border-surface-200 dark:border-surface-700 p-1 min-h-[100px] cursor-pointer transition-colors',
                !isCurrentMonth && 'bg-surface-50 dark:bg-surface-800/50',
                isSelected && 'bg-primary-50 dark:bg-primary-900/20',
                'hover:bg-surface-50 dark:hover:bg-surface-800'
              )}
            >
              {/* Day number */}
              <div className="flex items-center justify-between mb-1">
                <span
                  className={cn(
                    'inline-flex items-center justify-center w-7 h-7 text-sm rounded-full',
                    isTodayDate &&
                      'bg-primary-500 text-white font-semibold',
                    !isTodayDate && isCurrentMonth && 'text-surface-900 dark:text-white',
                    !isTodayDate && !isCurrentMonth && 'text-surface-400 dark:text-surface-500'
                  )}
                >
                  {format(day, 'd')}
                </span>
                {dayItems.length > 0 && (
                  <span className="text-xs text-surface-500">
                    {dayItems.length}
                  </span>
                )}
              </div>

              {/* Events */}
              <div className="space-y-1">
                {dayItems.slice(0, maxDisplayed).map((item) => (
                  <button
                    key={item.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick(item);
                    }}
                    className={cn(
                      'w-full text-left px-2 py-1 text-xs rounded truncate transition-opacity hover:opacity-80',
                      'text-white font-medium'
                    )}
                    style={{ backgroundColor: item.color }}
                    title={item.title}
                  >
                    {item.allDay ? (
                      item.title
                    ) : (
                      <>
                        <span className="opacity-75">
                          {format(item.start, 'h:mm a')}
                        </span>{' '}
                        {item.title}
                      </>
                    )}
                  </button>
                ))}
                {hiddenCount > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDayDoubleClick(day);
                    }}
                    className="w-full text-left px-2 py-1 text-xs text-surface-600 dark:text-surface-400 hover:text-primary-600 dark:hover:text-primary-400"
                  >
                    +{hiddenCount} more
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MonthView;

