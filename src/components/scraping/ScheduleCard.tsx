'use client';

import { ScrapeSchedule, PLATFORM_LABELS } from '@/types/scraping';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  Calendar,
  Clock,
  Play,
  Settings,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Target,
  MoreVertical,
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { useState } from 'react';

interface ScheduleCardProps {
  schedule: ScrapeSchedule;
  onEdit?: () => void;
  onDelete?: () => void;
  onTrigger?: () => void;
  onViewDetails?: () => void;
  isTriggering?: boolean;
}

export function ScheduleCard({
  schedule,
  onEdit,
  onDelete,
  onTrigger,
  onViewDetails,
  isTriggering,
}: ScheduleCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const getStatusIcon = () => {
    switch (schedule.lastRunStatus) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-success-500" />;
      case 'partial':
        return <AlertCircle className="h-4 w-4 text-warning-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-error-500" />;
      default:
        return <Clock className="h-4 w-4 text-surface-400" />;
    }
  };

  const getStatusText = () => {
    switch (schedule.lastRunStatus) {
      case 'success':
        return 'Last run successful';
      case 'partial':
        return 'Last run partial';
      case 'failed':
        return 'Last run failed';
      default:
        return 'Never run';
    }
  };

  return (
    <Card
      hover
      className="relative cursor-pointer"
      onClick={onViewDetails}
    >
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-surface-900 dark:text-white truncate">
                {schedule.name}
              </h3>
              {!schedule.enabled && (
                <span className="px-2 py-0.5 text-xs font-medium bg-surface-100 dark:bg-surface-700 text-surface-500 rounded">
                  Disabled
                </span>
              )}
            </div>
            {schedule.description && (
              <p className="text-sm text-surface-500 dark:text-surface-400 line-clamp-2">
                {schedule.description}
              </p>
            )}
          </div>
          <div className="relative ml-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
            >
              <MoreVertical className="h-4 w-4 text-surface-500" />
            </button>
            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                  }}
                />
                <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-surface-800 rounded-lg shadow-lg border border-surface-200 dark:border-surface-700 py-1 z-20">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                      onEdit?.();
                    }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-surface-50 dark:hover:bg-surface-700 flex items-center gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    Edit Schedule
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                      onTrigger?.();
                    }}
                    disabled={isTriggering}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-surface-50 dark:hover:bg-surface-700 flex items-center gap-2 disabled:opacity-50"
                  >
                    <Play className="h-4 w-4" />
                    Run Now
                  </button>
                  <hr className="my-1 border-surface-200 dark:border-surface-700" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                      onDelete?.();
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-error-600 hover:bg-error-50 dark:hover:bg-error-900/20 flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Schedule Info */}
        <div className="space-y-3">
          {/* Cron Expression */}
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-primary-500 flex-shrink-0" />
            <code className="px-2 py-0.5 bg-surface-100 dark:bg-surface-700 rounded text-xs font-mono">
              {schedule.cronExpression}
            </code>
            <span className="text-surface-500">({schedule.timezone})</span>
          </div>

          {/* Next Run */}
          {schedule.nextRunAt && schedule.enabled && (
            <div className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-400">
              <Clock className="h-4 w-4 flex-shrink-0" />
              <span>
                Next: {formatDistanceToNow(new Date(schedule.nextRunAt), { addSuffix: true })}
              </span>
            </div>
          )}

          {/* Target Count */}
          <div className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-400">
            <Target className="h-4 w-4 flex-shrink-0" />
            <span>{schedule.targetCount || 0} targets</span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-surface-100 dark:border-surface-700 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            {getStatusIcon()}
            <span className="text-surface-500">{getStatusText()}</span>
          </div>
          {schedule.lastRunAt && (
            <span className="text-xs text-surface-400">
              {formatDistanceToNow(new Date(schedule.lastRunAt), { addSuffix: true })}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
