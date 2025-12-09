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
  compact?: boolean;
}

interface StatItem {
  label: string;
  value: number;
  icon: typeof CheckCircle2;
  color: string;
  bgColor: string;
}

export function TodayStatsWidget({ stats, className, compact = false }: TodayStatsWidgetProps) {
  // Loading state
  if (!stats) {
    return (
      <div
        className={cn(
          'bg-white dark:bg-surface-800 rounded-lg border border-surface-200 dark:border-surface-700 animate-pulse',
          compact ? 'p-2' : 'p-4',
          className
        )}
      >
        {compact ? (
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-8 flex-1 bg-surface-100 dark:bg-surface-700 rounded" />
            ))}
          </div>
        ) : (
          <>
            <div className="h-4 bg-surface-200 dark:bg-surface-700 rounded w-24 mb-3" />
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 bg-surface-100 dark:bg-surface-700 rounded-lg" />
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  const statItems: StatItem[] = [
    {
      label: 'Completed',
      value: stats.completed,
      icon: CheckCircle2,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
    },
    {
      label: 'In Progress',
      value: stats.inProgress,
      icon: Clock,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      label: 'Blocked',
      value: stats.blocked,
      icon: AlertCircle,
      color: 'text-red-500',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
    },
    {
      label: 'Hours',
      value: stats.hoursLogged,
      icon: TrendingUp,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
  ];

  // Compact inline view
  if (compact) {
    return (
      <div
        className={cn(
          'bg-white dark:bg-surface-800 rounded-lg border border-surface-200 dark:border-surface-700 p-2',
          className
        )}
      >
        <div className="flex items-center justify-between gap-1">
          {statItems.map((stat) => (
            <div
              key={stat.label}
              className={cn('flex items-center gap-1.5 px-2 py-1 rounded-md flex-1 justify-center', stat.bgColor)}
              title={stat.label}
            >
              <stat.icon className={cn('w-3.5 h-3.5', stat.color)} />
              <span className="text-sm font-semibold text-surface-900 dark:text-white">
                {stat.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Full view
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
