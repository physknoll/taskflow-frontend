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
            <p className="text-sm font-medium text-[var(--text-secondary)]">
              {title}
            </p>
            <p className="text-3xl font-bold text-[var(--text-primary)] mt-2">
              {value}
            </p>
            {subtitle && (
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                {subtitle}
              </p>
            )}
            {trend && trendValue && (
              <div className="flex items-center gap-1 mt-2">
                {trend === 'up' ? (
                  <ArrowUpRight className="w-4 h-4 text-success-500" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 text-error-500" />
                )}
                <span className={cn(
                  'text-sm font-medium',
                  trend === 'up' ? 'text-success-500' : 'text-error-500'
                )}>
                  {trendValue}
                </span>
              </div>
            )}
          </div>
          {Icon && (
            <div className="p-3 rounded-xl bg-primary-100 [data-theme='dark']:bg-primary-900/30">
              <Icon className="w-6 h-6 text-primary-600 [data-theme='dark']:text-primary-400" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
