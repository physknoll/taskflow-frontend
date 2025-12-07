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
}

type StreakLevel = 'legendary' | 'epic' | 'good' | 'starting';

const gradients: Record<StreakLevel, string> = {
  legendary: 'from-amber-500 via-orange-500 to-red-500',
  epic: 'from-purple-500 via-pink-500 to-rose-500',
  good: 'from-primary-500 to-accent-500',
  starting: 'from-blue-500 to-primary-600',
};

function getStreakLevel(streak: number): StreakLevel {
  if (streak >= 10) return 'legendary';
  if (streak >= 5) return 'epic';
  if (streak >= 3) return 'good';
  return 'starting';
}

export function StreakWidget({ streak, className }: StreakWidgetProps) {
  // Loading state
  if (!streak) {
    return (
      <div
        className={cn(
          'bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl p-4 text-white animate-pulse',
          className
        )}
      >
        <div className="h-8 bg-white/20 rounded w-32 mb-2" />
        <div className="h-4 bg-white/20 rounded w-24" />
      </div>
    );
  }

  const streakLevel = getStreakLevel(streak.currentStreak);
  const progressPercent = Math.min((streak.currentStreak % 5) * 20, 100);
  const nextMilestone = Math.ceil(streak.currentStreak / 5) * 5;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'bg-gradient-to-br rounded-xl p-4 text-white shadow-lg relative overflow-hidden',
        gradients[streakLevel],
        className
      )}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/30 blur-xl" />
        <div className="absolute -left-4 -bottom-4 w-20 h-20 rounded-full bg-white/20 blur-xl" />
      </div>

      <div className="relative z-10">
        {/* Header Row */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <motion.div animate={streakFlame}>
              <Flame className="w-6 h-6" />
            </motion.div>
            <span className="text-2xl font-bold">
              {streak.currentStreak} Day{streak.currentStreak !== 1 ? 's' : ''}
            </span>
          </div>
          
          {streak.percentile && (
            <span className="text-xs bg-white/20 px-2 py-1 rounded-full backdrop-blur-sm">
              Top {streak.percentile}%
            </span>
          )}
        </div>

        {/* Stats Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Trophy className="w-4 h-4 opacity-80" />
            <span className="text-sm font-medium">
              {streak.totalPoints?.toLocaleString()} pts
            </span>
          </div>
          <div className="flex items-center gap-1 text-sm opacity-80">
            <TrendingUp className="w-4 h-4" />
            <span>+{streak.weeklyPoints} this week</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3">
          <div className="flex justify-between text-xs mb-1 opacity-80">
            <span>Progress to {nextMilestone} day streak</span>
            <span>{streak.currentStreak}/{nextMilestone}</span>
          </div>
          <div className="h-1.5 bg-white/30 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-white rounded-full"
            />
          </div>
        </div>

        {/* Badges preview */}
        {streak.badges && streak.badges.length > 0 && (
          <div className="mt-3 flex items-center gap-1">
            {streak.badges.slice(0, 3).map((badge) => (
              <span
                key={badge.id}
                title={badge.name}
                className="text-lg"
              >
                {badge.icon}
              </span>
            ))}
            {streak.badges.length > 3 && (
              <span className="text-xs opacity-80">
                +{streak.badges.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default StreakWidget;

