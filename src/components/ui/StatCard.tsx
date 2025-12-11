'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from './Card';
import { Skeleton } from './Skeleton';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ElementType;
  trend?: 'up' | 'down';
  trendValue?: string;
  loading?: boolean;
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  loading,
  className,
}: StatCardProps) {
  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-8 w-16 mb-1" />
          <Skeleton className="h-3 w-32" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('relative overflow-hidden', className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-surface-500 dark:text-surface-400">
              {title}
            </p>
            <p className="text-3xl font-bold text-surface-900 dark:text-white mt-2">
              {value}
            </p>
            {subtitle && (
              <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">
                {subtitle}
              </p>
            )}
            {trend && trendValue && (
              <div className="flex items-center gap-1 mt-2">
                {trend === 'up' ? (
                  <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 text-red-500" />
                )}
                <span className={cn(
                  'text-sm font-medium',
                  trend === 'up' ? 'text-emerald-500' : 'text-red-500'
                )}>
                  {trendValue}
                </span>
              </div>
            )}
          </div>
          {Icon && (
            <div className="p-3 rounded-xl bg-surface-100 dark:bg-surface-800">
              <Icon className="w-6 h-6 text-surface-600 dark:text-surface-400" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
