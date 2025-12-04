'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  breadcrumb?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  action,
  breadcrumb,
  className,
  children,
}: PageHeaderProps) {
  return (
    <div className={cn('mb-8', className)}>
      {breadcrumb && <div className="mb-4">{breadcrumb}</div>}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">{title}</h1>
          {description && (
            <p className="mt-1 text-surface-600 dark:text-surface-400">{description}</p>
          )}
        </div>
        {action && <div className="flex items-center gap-3">{action}</div>}
      </div>
      {children}
    </div>
  );
}

interface BreadcrumbProps {
  items: Array<{
    label: string;
    href?: string;
  }>;
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-2 text-sm">
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <span className="text-surface-400 dark:text-surface-600">/</span>
          )}
          {item.href ? (
            <a
              href={item.href}
              className="text-surface-600 hover:text-surface-900 dark:text-surface-400 dark:hover:text-white transition-colors"
            >
              {item.label}
            </a>
          ) : (
            <span className="text-surface-900 dark:text-white font-medium">
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

