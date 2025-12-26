'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]',
        primary: 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300',
        orange: 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300',
        secondary: 'bg-[var(--bg-secondary)] text-[var(--text-secondary)]',
        success: 'bg-success-100 text-success-700 dark:bg-success-900/50 dark:text-success-300',
        warning: 'bg-warning-100 text-warning-700 dark:bg-warning-900/50 dark:text-warning-300',
        danger: 'bg-error-100 text-error-700 dark:bg-error-900/50 dark:text-error-300',
        info: 'bg-info-100 text-info-700 dark:bg-info-900/50 dark:text-info-300',
        outline: 'border border-[var(--border-default)] text-[var(--text-secondary)]',
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
