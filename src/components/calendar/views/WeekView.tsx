'use client';

import { useMemo } from 'react';
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  eachHourOfInterval,
  startOfDay,
  endOfDay,
  isSameDay,
  isToday,
  setHours,
  setMinutes,
  differenceInMinutes,
  addHours,
} from 'date-fns';
import { useCalendarStore } from '@/stores/calendarStore';
import { UnifiedCalendarItem, CreateEventSlot } from '@/types/calendar';
import { cn } from '@/lib/utils';

interface WeekViewProps {
  items: UnifiedCalendarItem[];
  onSlotClick: (slot: CreateEventSlot) => void;
  onEventClick: (item: UnifiedCalendarItem) => void;
  onDateClick: (date: Date) => void;
  onEventDrop?: (item: UnifiedCalendarItem, newStart: Date, newEnd: Date) => void;
  isLoading?: boolean;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const HOUR_HEIGHT = 60; // pixels per hour

export function WeekView({
  items,
  onSlotClick,
  onEventClick,
  onDateClick,
  isLoading,
}: WeekViewProps) {
  const { selectedDate, setViewType, setSelectedDate } = useCalendarStore();

  // Generate week days
  const weekDays = useMemo(() => {
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
    const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 0 });
    return eachDayOfInterval({ start: weekStart, end: weekEnd });
  }, [selectedDate]);

  // Separate all-day items from timed items
  const { allDayItems, timedItems } = useMemo(() => {
    const allDay: UnifiedCalendarItem[] = [];
    const timed: UnifiedCalendarItem[] = [];

    items.forEach((item) => {
      if (item.allDay) {
        allDay.push(item);
      } else {
        timed.push(item);
      }
    });

    return { allDayItems: allDay, timedItems: timed };
  }, [items]);

  // Group timed items by day
  const timedItemsByDay = useMemo(() => {
    const grouped: Record<string, UnifiedCalendarItem[]> = {};

    timedItems.forEach((item) => {
      const dateKey = format(item.start, 'yyyy-MM-dd');
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(item);
    });

    return grouped;
  }, [timedItems]);

  // Handle time slot click
  const handleSlotClick = (day: Date, hour: number) => {
    const start = setMinutes(setHours(day, hour), 0);
    const end = addHours(start, 1);
    onSlotClick({ start, end, allDay: false });
  };

  // Calculate event position and height
  const getEventStyle = (item: UnifiedCalendarItem) => {
    const startHour = item.start.getHours() + item.start.getMinutes() / 60;
    const duration = differenceInMinutes(item.end, item.start) / 60;
    
    return {
      top: `${startHour * HOUR_HEIGHT}px`,
      height: `${Math.max(duration * HOUR_HEIGHT, 24)}px`,
    };
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header with day names */}
      <div className="flex border-b border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 sticky top-0 z-10">
        {/* Time gutter */}
        <div className="w-16 flex-shrink-0" />
        
        {/* Day headers */}
        {weekDays.map((day) => {
          const isTodayDate = isToday(day);
          return (
            <div
              key={format(day, 'yyyy-MM-dd')}
              className="flex-1 text-center py-3 border-l border-surface-200 dark:border-surface-700"
            >
              <div className="text-xs text-surface-500 dark:text-surface-400">
                {format(day, 'EEE')}
              </div>
              <div
                className={cn(
                  'text-xl font-semibold mt-1',
                  isTodayDate
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-surface-900 dark:text-white'
                )}
              >
                {format(day, 'd')}
              </div>
            </div>
          );
        })}
      </div>

      {/* All-day events section */}
      {allDayItems.length > 0 && (
        <div className="flex border-b border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50">
          <div className="w-16 flex-shrink-0 py-2 text-xs text-surface-500 text-right pr-2">
            All day
          </div>
          {weekDays.map((day) => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const dayAllDayItems = allDayItems.filter((item) =>
              isSameDay(item.start, day)
            );
            
            return (
              <div
                key={dateKey}
                className="flex-1 border-l border-surface-200 dark:border-surface-700 p-1 min-h-[40px]"
              >
                {dayAllDayItems.slice(0, 2).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onEventClick(item)}
                    className="w-full text-left px-2 py-1 text-xs rounded truncate text-white font-medium mb-1 hover:opacity-80"
                    style={{ backgroundColor: item.color }}
                    title={item.title}
                  >
                    {item.title}
                  </button>
                ))}
                {dayAllDayItems.length > 2 && (
                  <span className="text-xs text-surface-500">
                    +{dayAllDayItems.length - 2} more
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Time grid */}
      <div className="flex-1 overflow-auto">
        <div className="flex min-h-full">
          {/* Time labels */}
          <div className="w-16 flex-shrink-0">
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="relative"
                style={{ height: HOUR_HEIGHT }}
              >
                <span className="absolute -top-2 right-2 text-xs text-surface-500 dark:text-surface-400">
                  {hour === 0
                    ? '12 AM'
                    : hour < 12
                    ? `${hour} AM`
                    : hour === 12
                    ? '12 PM'
                    : `${hour - 12} PM`}
                </span>
              </div>
            ))}
          </div>

          {/* Day columns */}
          {weekDays.map((day) => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const dayItems = timedItemsByDay[dateKey] || [];
            const isTodayDate = isToday(day);

            return (
              <div
                key={dateKey}
                className={cn(
                  'flex-1 relative border-l border-surface-200 dark:border-surface-700',
                  isTodayDate && 'bg-primary-50/30 dark:bg-primary-900/10'
                )}
              >
                {/* Hour slots */}
                {HOURS.map((hour) => (
                  <div
                    key={hour}
                    onClick={() => handleSlotClick(day, hour)}
                    className="border-b border-surface-100 dark:border-surface-800 hover:bg-surface-100 dark:hover:bg-surface-800 cursor-pointer"
                    style={{ height: HOUR_HEIGHT }}
                  />
                ))}

                {/* Events */}
                {dayItems.map((item) => {
                  const style = getEventStyle(item);
                  return (
                    <button
                      key={item.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(item);
                      }}
                      className="absolute left-1 right-1 px-2 py-1 rounded text-white text-xs overflow-hidden hover:opacity-90 transition-opacity"
                      style={{
                        ...style,
                        backgroundColor: item.color,
                      }}
                      title={item.title}
                    >
                      <div className="font-medium truncate">{item.title}</div>
                      <div className="opacity-75 text-[10px]">
                        {format(item.start, 'h:mm a')} -{' '}
                        {format(item.end, 'h:mm a')}
                      </div>
                    </button>
                  );
                })}

                {/* Current time indicator */}
                {isTodayDate && <CurrentTimeIndicator />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Current time indicator line
function CurrentTimeIndicator() {
  const now = new Date();
  const minutesSinceMidnight = now.getHours() * 60 + now.getMinutes();
  const top = (minutesSinceMidnight / 60) * HOUR_HEIGHT;

  return (
    <div
      className="absolute left-0 right-0 z-10 pointer-events-none"
      style={{ top }}
    >
      <div className="flex items-center">
        <div className="w-2 h-2 rounded-full bg-red-500" />
        <div className="flex-1 h-0.5 bg-red-500" />
      </div>
    </div>
  );
}

export default WeekView;

