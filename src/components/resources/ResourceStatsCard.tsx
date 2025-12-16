'use client';

import { IResourceStats } from '@/types';
import { cn } from '@/lib/utils';
import {
  File,
  Video,
  Palette,
  Code,
  Cloud,
  FileText,
  GitPullRequest,
  Package,
} from 'lucide-react';

interface ResourceStatsCardProps {
  stats: IResourceStats;
  className?: string;
}

// Category icons
const categoryIcons: Record<string, typeof File> = {
  video: Video,
  design: Palette,
  code: Code,
  cloud_storage: Cloud,
  docs: FileText,
  other: File,
};

// Category colors
const categoryColors: Record<string, string> = {
  video: 'text-red-500 bg-red-100 dark:bg-red-900/30',
  design: 'text-purple-500 bg-purple-100 dark:bg-purple-900/30',
  code: 'text-emerald-500 bg-emerald-100 dark:bg-emerald-900/30',
  cloud_storage: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30',
  docs: 'text-amber-500 bg-amber-100 dark:bg-amber-900/30',
  other: 'text-surface-500 bg-surface-100 dark:bg-surface-800',
};

export function ResourceStatsCard({ stats, className }: ResourceStatsCardProps) {
  const categories = Object.entries(stats.byCategory).filter(
    ([_, count]) => count > 0
  );

  return (
    <div
      className={cn(
        'bg-white dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700 p-4',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <File className="w-5 h-5 text-surface-400" />
          <span className="font-medium text-surface-900 dark:text-white">
            Resources
          </span>
        </div>
        <span className="text-2xl font-bold text-surface-900 dark:text-white">
          {stats.total}
        </span>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div className="space-y-2 mb-4">
          {categories.map(([category, count]) => {
            const Icon = categoryIcons[category] || File;
            const colorClass = categoryColors[category] || categoryColors.other;
            return (
              <div
                key={category}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      'w-6 h-6 rounded flex items-center justify-center',
                      colorClass
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-surface-600 dark:text-surface-400 capitalize">
                    {category.replace('_', ' ')}
                  </span>
                </div>
                <span className="font-medium text-surface-900 dark:text-white">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick stats */}
      <div className="flex items-center gap-4 pt-3 border-t border-surface-100 dark:border-surface-700">
        {stats.hasDeliverables && (
          <div className="flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400">
            <Package className="w-4 h-4" />
            <span>Has deliverables</span>
          </div>
        )}
        {stats.openPRs > 0 && (
          <div className="flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400">
            <GitPullRequest className="w-4 h-4" />
            <span>{stats.openPRs} open PR{stats.openPRs > 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* Providers */}
      {stats.providers.length > 0 && (
        <div className="mt-3 pt-3 border-t border-surface-100 dark:border-surface-700">
          <p className="text-xs text-surface-400 mb-2">Providers</p>
          <div className="flex flex-wrap gap-1">
            {stats.providers.map((provider) => (
              <span
                key={provider}
                className="px-2 py-0.5 text-xs bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-400 rounded capitalize"
              >
                {provider}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Compact inline stats
export function ResourceStatsInline({ stats }: { stats: IResourceStats }) {
  return (
    <div className="flex items-center gap-3 text-sm text-surface-500 dark:text-surface-400">
      <span className="font-medium text-surface-900 dark:text-white">
        {stats.total} resources
      </span>
      {stats.hasDeliverables && (
        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
          <Package className="w-3.5 h-3.5" />
          Deliverables
        </span>
      )}
      {stats.openPRs > 0 && (
        <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
          <GitPullRequest className="w-3.5 h-3.5" />
          {stats.openPRs} PR{stats.openPRs > 1 ? 's' : ''}
        </span>
      )}
    </div>
  );
}


