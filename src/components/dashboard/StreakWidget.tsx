'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Trophy, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { streakFlame } from '@/lib/animations';
import type { IUserStreak } from '@/types/aipm';

interface StreakWidgetProps {
  streak: IUserStreak | null;
  className?: string;
  compact?: boolean;
}

type StreakLevel = 'legendary' | 'epic' | 'good' | 'starting';

const gradients: Record<StreakLevel, string> = {
  legendary: 'from-amber-500 via-orange-500 to-red-500',
  epic: 'from-primary-600 via-primary-500 to-amber-500',
  good: 'from-primary-500 to-primary-600',
  starting: 'from-primary-400 to-primary-500',
};

function getStreakLevel(streak: number): StreakLevel {
  if (streak >= 10) return 'legendary';
  if (streak >= 5) return 'epic';
  if (streak >= 3) return 'good';
  return 'starting';
}

export function StreakWidget({ streak, className, compact = true }: StreakWidgetProps) {
  // Loading state
  if (!streak) {
    return (
      <div
        className={cn(
          'bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl p-3 text-white animate-pulse',
          className
        )}
      >
        <div className="h-6 bg-white/20 rounded w-24 mb-1" />
        <div className="h-3 bg-white/20 rounded w-16" />
      </div>
    );
  }

  const streakLevel = getStreakLevel(streak.currentStreak);
  const progressPercent = Math.min((streak.currentStreak % 5) * 20, 100);
  const nextMilestone = Math.ceil(streak.currentStreak / 5) * 5 || 5;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'bg-gradient-to-br rounded-xl text-white shadow-lg relative overflow-hidden',
        gradients[streakLevel],
        compact ? 'p-3' : 'p-4',
        className
      )}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full bg-white/30 blur-xl" />
      </div>

      <div className="relative z-10">
        {/* Single row layout for compact mode */}
        <div className="flex items-center justify-between gap-3">
          {/* Streak info */}
          <div className="flex items-center gap-2 min-w-0">
            <motion.div animate={streakFlame} className="flex-shrink-0">
              <Flame className="w-5 h-5" />
            </motion.div>
            <span className="text-lg font-bold whitespace-nowrap">
              {streak.currentStreak} Day{streak.currentStreak !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1 opacity-90">
              <Trophy className="w-3.5 h-3.5" />
              <span>{streak.totalPoints?.toLocaleString()}</span>
            </div>
            {streak.percentile && (
              <span className="bg-white/20 px-1.5 py-0.5 rounded-full text-[10px] whitespace-nowrap">
                Top {streak.percentile}%
              </span>
            )}
          </div>
        </div>

        {/* Progress bar - compact */}
        {!compact && (
          <div className="mt-2">
            <div className="flex justify-between text-[10px] mb-0.5 opacity-80">
              <span>Next: {nextMilestone} days</span>
              <span>{streak.currentStreak}/{nextMilestone}</span>
            </div>
            <div className="h-1 bg-white/30 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full bg-white rounded-full"
              />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default StreakWidget;
