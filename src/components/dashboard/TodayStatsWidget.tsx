'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, AlertCircle, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { staggerContainer, fadeInUp } from '@/lib/animations';
import type { ITodayStats } from '@/types/aipm';

interface TodayStatsWidgetProps {
  stats: ITodayStats | null;
  className?: string;
}

interface StatItem {
  label: string;
  value: number;
  icon: typeof CheckCircle2;
  color: string;
}

export function TodayStatsWidget({ stats, className }: TodayStatsWidgetProps) {
  // Loading state
  if (!stats) {
    return (
      <div
        className={cn(
          'bg-white dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700 p-4 animate-pulse',
          className
        )}
      >
        <div className="h-4 bg-surface-200 dark:bg-surface-700 rounded w-24 mb-3" />
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-16 bg-surface-100 dark:bg-surface-700 rounded-lg"
            />
          ))}
        </div>
      </div>
    );
  }

  const statItems: StatItem[] = [
    {
      label: 'Completed',
      value: stats.completed,
      icon: CheckCircle2,
      color: 'text-emerald-500',
    },
    {
      label: 'In Progress',
      value: stats.inProgress,
      icon: Clock,
      color: 'text-blue-500',
    },
    {
      label: 'Blocked',
      value: stats.blocked,
      icon: AlertCircle,
      color: 'text-red-500',
    },
    {
      label: 'Hours',
      value: stats.hoursLogged,
      icon: TrendingUp,
      color: 'text-purple-500',
    },
  ];

  return (
    <div
      className={cn(
        'bg-white dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700 p-4',
        className
      )}
    >
      <h3 className="font-semibold mb-3 text-sm text-surface-900 dark:text-white">
        Today&apos;s Progress
      </h3>
      
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-2 gap-3"
      >
        {statItems.map((stat) => (
          <motion.div
            key={stat.label}
            variants={fadeInUp}
            className="bg-surface-50 dark:bg-surface-700/50 rounded-lg p-3"
          >
            <div className="flex items-center gap-2 mb-1">
              <stat.icon className={cn('w-4 h-4', stat.color)} />
              <span className="text-xs text-surface-500 dark:text-surface-400">
                {stat.label}
              </span>
            </div>
            <span className="text-xl font-bold text-surface-900 dark:text-white">
              {stat.value}
            </span>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

export default TodayStatsWidget;

