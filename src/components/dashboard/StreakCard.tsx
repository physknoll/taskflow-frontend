'use client';

import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '@/services/analytics.service';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Flame, Trophy, Calendar, Zap } from 'lucide-react';

interface StreakCardProps {
  className?: string;
}

// GitHub-style green colors for the week bars
const getActivityColor = (count: number, isToday: boolean) => {
  if (count === 0) return 'bg-[#161b22]';
  if (count <= 3) return 'bg-[#0e4429]';
  if (count <= 6) return 'bg-[#006d32]';
  if (count <= 10) return 'bg-[#26a641]';
  return 'bg-[#39d353]';
};

export function StreakCard({ className }: StreakCardProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['streaks'],
    queryFn: () => analyticsService.getStreaks(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Skeleton variant="circular" width={60} height={60} />
            <div className="flex-1">
              <Skeleton variant="text" width={100} />
              <Skeleton variant="text" width={150} className="mt-2" />
            </div>
          </div>
          <div className="mt-6">
            <Skeleton variant="rounded" height={40} className="w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <Card className={cn('overflow-hidden', className)}>
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-[#238636] to-[#2ea043] px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Flame className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-white">
                  {data.currentStreak}
                </span>
                <span className="text-white/80 text-sm">day streak</span>
              </div>
              {data.currentStreak > 0 && (
                <p className="text-white/70 text-xs mt-0.5">
                  {data.isActiveToday ? "You're on fire! 🔥" : "Keep it going today!"}
                </p>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-white/80 text-xs">
              <Trophy className="h-3 w-3" />
              Best: {data.longestStreak} days
            </div>
          </div>
        </div>
      </div>

      <CardContent className="p-6">
        {/* This Week Activity */}
        <div className="mb-6">
          <h4 className="text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider mb-3">
            This Week
          </h4>
          <div className="flex justify-between gap-1">
            {data.thisWeek.map((day, index) => (
              <div key={index} className="flex-1 text-center">
                <div
                  className={cn(
                    'h-8 rounded-md mb-1.5 transition-all relative',
                    getActivityColor(day.count, day.isToday),
                    day.isToday && 'ring-2 ring-[#39d353] ring-offset-2 ring-offset-white dark:ring-offset-surface-800'
                  )}
                  title={`${day.count} activities`}
                >
                  {day.count > 0 && (
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-medium text-white/90">
                      {day.count}
                    </span>
                  )}
                </div>
                <span
                  className={cn(
                    'text-[10px]',
                    day.isToday
                      ? 'text-[#39d353] font-semibold'
                      : 'text-surface-500 dark:text-surface-400'
                  )}
                >
                  {day.day}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-surface-50 dark:bg-surface-800/50 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Zap className="h-4 w-4 text-[#39d353]" />
            </div>
            <p className="text-xl font-bold text-surface-900 dark:text-white">
              {data.totalDaysActive}
            </p>
            <p className="text-[10px] text-surface-500 dark:text-surface-400 uppercase tracking-wider">
              Days Active
            </p>
          </div>
          <div className="text-center p-3 bg-surface-50 dark:bg-surface-800/50 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Calendar className="h-4 w-4 text-[#26a641]" />
            </div>
            <p className="text-xl font-bold text-surface-900 dark:text-white">
              {data.weeksActive}
            </p>
            <p className="text-[10px] text-surface-500 dark:text-surface-400 uppercase tracking-wider">
              Weeks Active
            </p>
          </div>
          <div className="text-center p-3 bg-surface-50 dark:bg-surface-800/50 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Trophy className="h-4 w-4 text-amber-500" />
            </div>
            <p className="text-xl font-bold text-surface-900 dark:text-white">
              {data.longestStreak}
            </p>
            <p className="text-[10px] text-surface-500 dark:text-surface-400 uppercase tracking-wider">
              Best Streak
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

