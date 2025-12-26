'use client';

import { useMemo } from 'react';
import {
  format,
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

interface DayViewProps {
  items: UnifiedCalendarItem[];
  onSlotClick: (slot: CreateEventSlot) => void;
  onEventClick: (item: UnifiedCalendarItem) => void;
  onDateClick: (date: Date) => void;
  onEventDrop?: (item: UnifiedCalendarItem, newStart: Date, newEnd: Date) => void;
  isLoading?: boolean;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const HOUR_HEIGHT = 72; // pixels per hour (slightly larger for day view)

export function DayView({
  items,
  onSlotClick,
  onEventClick,
  isLoading,
}: DayViewProps) {
  const { selectedDate } = useCalendarStore();

  // Filter items for selected day
  const dayItems = useMemo(() => {
    return items.filter((item) => isSameDay(item.start, selectedDate));
  }, [items, selectedDate]);

  // Separate all-day items from timed items
  const { allDayItems, timedItems } = useMemo(() => {
    const allDay: UnifiedCalendarItem[] = [];
    const timed: UnifiedCalendarItem[] = [];

    dayItems.forEach((item) => {
      if (item.allDay) {
        allDay.push(item);
      } else {
        timed.push(item);
      }
    });

    return { allDayItems: allDay, timedItems: timed };
  }, [dayItems]);

  const isTodayDate = isToday(selectedDate);

  // Handle time slot click
  const handleSlotClick = (hour: number) => {
    const start = setMinutes(setHours(selectedDate, hour), 0);
    const end = addHours(start, 1);
    onSlotClick({ start, end, allDay: false });
  };

  // Calculate event position and height
  const getEventStyle = (item: UnifiedCalendarItem) => {
    const startHour = item.start.getHours() + item.start.getMinutes() / 60;
    const duration = differenceInMinutes(item.end, item.start) / 60;

    return {
      top: `${startHour * HOUR_HEIGHT}px`,
      height: `${Math.max(duration * HOUR_HEIGHT, 32)}px`,
    };
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-center py-4 border-b border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900">
        <div className="text-center">
          <div className="text-sm text-surface-500 dark:text-surface-400">
            {format(selectedDate, 'EEEE')}
          </div>
          <div
            className={cn(
              'text-3xl font-bold mt-1',
              isTodayDate
                ? 'text-primary-600 dark:text-primary-400'
                : 'text-surface-900 dark:text-white'
            )}
          >
            {format(selectedDate, 'd')}
          </div>
          <div className="text-sm text-surface-600 dark:text-surface-400 mt-1">
            {format(selectedDate, 'MMMM yyyy')}
          </div>
        </div>
      </div>

      {/* All-day events section */}
      {allDayItems.length > 0 && (
        <div className="flex border-b border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50">
          <div className="w-20 flex-shrink-0 py-3 text-xs text-surface-500 text-right pr-3">
            All day
          </div>
          <div className="flex-1 p-2 space-y-1">
            {allDayItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onEventClick(item)}
                className="w-full text-left px-3 py-2 rounded-lg text-white font-medium hover:opacity-80 transition-opacity"
                style={{ backgroundColor: item.color }}
              >
                <div className="font-medium">{item.title}</div>
                {item.description && (
                  <div className="text-xs opacity-75 mt-1 line-clamp-2">
                    {item.description}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Time grid */}
      <div className="flex-1 overflow-auto">
        <div className="flex min-h-full">
          {/* Time labels */}
          <div className="w-20 flex-shrink-0">
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="relative"
                style={{ height: HOUR_HEIGHT }}
              >
                <span className="absolute -top-2 right-3 text-xs text-surface-500 dark:text-surface-400">
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

          {/* Day column */}
          <div
            className={cn(
              'flex-1 relative border-l border-surface-200 dark:border-surface-700',
              isTodayDate && 'bg-primary-50/30 dark:bg-primary-900/10'
            )}
          >
            {/* Hour slots */}
            {HOURS.map((hour) => (
              <div
                key={hour}
                onClick={() => handleSlotClick(hour)}
                className="border-b border-surface-100 dark:border-surface-800 hover:bg-surface-100 dark:hover:bg-surface-800 cursor-pointer"
                style={{ height: HOUR_HEIGHT }}
              />
            ))}

            {/* Events */}
            {timedItems.map((item) => {
              const style = getEventStyle(item);
              return (
                <button
                  key={item.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEventClick(item);
                  }}
                  className="absolute left-2 right-2 px-3 py-2 rounded-lg text-white overflow-hidden hover:opacity-90 transition-opacity shadow-sm"
                  style={{
                    ...style,
                    backgroundColor: item.color,
                  }}
                >
                  <div className="font-medium truncate">{item.title}</div>
                  <div className="text-xs opacity-75 mt-0.5">
                    {format(item.start, 'h:mm a')} - {format(item.end, 'h:mm a')}
                  </div>
                  {item.description && (
                    <div className="text-xs opacity-60 mt-1 line-clamp-2">
                      {item.description}
                    </div>
                  )}
                </button>
              );
            })}

            {/* Current time indicator */}
            {isTodayDate && <CurrentTimeIndicator />}
          </div>
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
        <div className="w-3 h-3 rounded-full bg-red-500 -ml-1.5" />
        <div className="flex-1 h-0.5 bg-red-500" />
      </div>
    </div>
  );
}

export default DayView;

