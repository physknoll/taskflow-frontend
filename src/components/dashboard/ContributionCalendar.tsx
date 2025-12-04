'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '@/services/analytics.service';
import { IContributionDay } from '@/types';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';

interface ContributionCalendarProps {
  days?: number;
  className?: string;
}

// GitHub-style green colors
const levelColors = {
  0: 'bg-[#161b22] dark:bg-[#161b22]', // No activity
  1: 'bg-[#0e4429] dark:bg-[#0e4429]', // Low
  2: 'bg-[#006d32] dark:bg-[#006d32]', // Medium
  3: 'bg-[#26a641] dark:bg-[#26a641]', // High
  4: 'bg-[#39d353] dark:bg-[#39d353]', // Very high
};

const levelLabels = ['No activity', 'Low', 'Medium', 'High', 'Very high'];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function ContributionCalendar({ days = 365, className }: ContributionCalendarProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['contributions', days],
    queryFn: () => analyticsService.getContributions(days),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Organize calendar data into weeks
  const calendarWeeks = useMemo(() => {
    if (!data?.calendar) return [];

    const weeks: IContributionDay[][] = [];
    let currentWeek: IContributionDay[] = [];

    // Get the start date and fill in initial empty days
    const startDate = new Date(data.period.start);
    const startDay = startDate.getDay();
    
    // Fill in empty days before the start date
    for (let i = 0; i < startDay; i++) {
      currentWeek.push({
        date: '',
        activityCount: 0,
        ticketsCompleted: 0,
        tasksCompleted: 0,
        checkinsCompleted: 0,
        level: 0,
      });
    }

    data.calendar.forEach((day) => {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });

    // Push remaining days
    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }

    return weeks;
  }, [data]);

  // Calculate month labels
  const monthLabels = useMemo(() => {
    if (!data?.calendar || data.calendar.length === 0) return [];

    const labels: { month: string; weekIndex: number }[] = [];
    let currentMonth = -1;

    calendarWeeks.forEach((week, weekIndex) => {
      // Check the first valid day of the week
      const validDay = week.find(d => d.date);
      if (validDay) {
        const date = new Date(validDay.date);
        const month = date.getMonth();
        if (month !== currentMonth) {
          labels.push({ month: MONTHS[month], weekIndex });
          currentMonth = month;
        }
      }
    });

    return labels;
  }, [calendarWeeks, data?.calendar]);

  if (isLoading) {
    return (
      <div className={cn('space-y-3', className)}>
        <Skeleton variant="text" width={200} height={20} />
        <Skeleton variant="rounded" height={120} className="w-full" />
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header with stats */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-surface-600 dark:text-surface-400">
          {data.totals.totalActivities} contributions in the last {data.period.days} days
        </h3>
      </div>

      {/* Calendar Grid */}
      <div className="overflow-x-auto pb-2">
        <div className="inline-flex flex-col gap-1">
          {/* Month labels */}
          <div className="flex ml-8 mb-1">
            {monthLabels.map((label, idx) => (
              <div
                key={idx}
                className="text-[10px] text-surface-500 dark:text-surface-400"
                style={{
                  marginLeft: idx === 0 ? 0 : `${(label.weekIndex - (monthLabels[idx - 1]?.weekIndex || 0)) * 13 - 26}px`,
                }}
              >
                {label.month}
              </div>
            ))}
          </div>

          <div className="flex gap-[3px]">
            {/* Day labels */}
            <div className="flex flex-col gap-[3px] mr-1">
              {DAYS.map((day, i) => (
                <div
                  key={day}
                  className={cn(
                    'h-[10px] text-[10px] text-surface-500 dark:text-surface-400 flex items-center',
                    i % 2 === 0 ? 'invisible' : ''
                  )}
                >
                  {day.slice(0, 3)}
                </div>
              ))}
            </div>

            {/* Contribution squares */}
            {calendarWeeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-[3px]">
                {week.map((day, dayIndex) => (
                  <div
                    key={`${weekIndex}-${dayIndex}`}
                    className={cn(
                      'w-[10px] h-[10px] rounded-sm transition-all',
                      day.date ? levelColors[day.level] : 'bg-transparent',
                      day.date && 'hover:ring-1 hover:ring-surface-400 cursor-pointer'
                    )}
                    title={
                      day.date
                        ? `${day.activityCount} activities on ${new Date(day.date).toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })}\n${day.ticketsCompleted} tickets, ${day.tasksCompleted} tasks`
                        : ''
                    }
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between text-xs">
        <div className="text-surface-500 dark:text-surface-400">
          {data.totals.daysActive} days active
        </div>
        <div className="flex items-center gap-1">
          <span className="text-surface-500 dark:text-surface-400 mr-1">Less</span>
          {[0, 1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className={cn(
                'w-[10px] h-[10px] rounded-sm',
                levelColors[level as 0 | 1 | 2 | 3 | 4]
              )}
              title={levelLabels[level]}
            />
          ))}
          <span className="text-surface-500 dark:text-surface-400 ml-1">More</span>
        </div>
      </div>
    </div>
  );
}

