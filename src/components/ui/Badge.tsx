'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-surface-200 text-surface-700 dark:bg-surface-700 dark:text-surface-300',
        primary: 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300',
        secondary: 'bg-surface-100 text-surface-600 dark:bg-surface-800 dark:text-surface-400',
        success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
        warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
        danger: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
        info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
        outline: 'border border-surface-300 text-surface-700 dark:border-surface-600 dark:text-surface-300',
      },
      size: {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-xs px-2.5 py-1',
        lg: 'text-sm px-3 py-1',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
  dotColor?: string;
}

function Badge({ className, variant, size, dot, dotColor, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {dot && (
        <span
          className={cn('w-1.5 h-1.5 rounded-full mr-1.5', dotColor || 'bg-current')}
        />
      )}
      {children}
    </span>
  );
}

export { Badge, badgeVariants };

