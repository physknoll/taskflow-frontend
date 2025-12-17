'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  actions?: React.ReactNode;
  icon?: LucideIcon;
  breadcrumb?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  action,
  actions,
  icon: Icon,
  breadcrumb,
  className,
  children,
}: PageHeaderProps) {
  return (
    <div className={cn('px-6 py-6 border-b border-[var(--border-default)] bg-[var(--bg-primary)]', className)}>
      {breadcrumb && <div className="mb-4">{breadcrumb}</div>}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="w-10 h-10 rounded-xl bg-primary-100 [data-theme='dark']:bg-primary-900/50 flex items-center justify-center">
              <Icon className="w-5 h-5 text-primary-600 [data-theme='dark']:text-primary-400" />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">{title}</h1>
            {description && (
              <p className="mt-1 text-[var(--text-secondary)]">{description}</p>
            )}
          </div>
        </div>
        {(action || actions) && <div className="flex items-center gap-3">{action || actions}</div>}
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
            <span className="text-[var(--text-muted)]">/</span>
          )}
          {item.href ? (
            <a
              href={item.href}
              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              {item.label}
            </a>
          ) : (
            <span className="text-[var(--text-primary)] font-medium">
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
