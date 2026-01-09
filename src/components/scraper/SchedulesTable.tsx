'use client';

import { ScrapeSchedule } from '@/types/scraping';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  Play,
  Pencil,
  Trash2,
  Calendar,
  Target,
  Settings,
  MoreVertical,
} from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';

// Actions dropdown component for schedule row
function ScheduleActions({
  schedule,
  onEdit,
  onDelete,
  onTrigger,
  triggeringId,
  isTriggering,
}: {
  schedule: ScrapeSchedule;
  onEdit?: (schedule: ScrapeSchedule) => void;
  onDelete?: (schedule: ScrapeSchedule) => void;
  onTrigger?: (scheduleId: string, withSettings?: boolean) => void;
  triggeringId?: string | null;
  isTriggering?: boolean;
}) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="flex items-center justify-end gap-1">
      {onTrigger && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onTrigger(schedule._id)}
          disabled={triggeringId === schedule._id && isTriggering}
          title="Run Now"
        >
          <Play className={`h-4 w-4 ${triggeringId === schedule._id && isTriggering ? 'animate-pulse' : ''}`} />
        </Button>
      )}
      {onEdit && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(schedule)}
          title="Edit"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      )}
      
      {/* More actions dropdown */}
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowMenu(!showMenu)}
          title="More actions"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
        
        {showMenu && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowMenu(false)}
            />
            <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-surface-800 rounded-lg shadow-lg border border-surface-200 dark:border-surface-700 py-1 z-20">
              {onTrigger && (
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onTrigger(schedule._id, true);
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-surface-50 dark:hover:bg-surface-700 flex items-center gap-2"
                >
                  <Settings className="h-4 w-4" />
                  Run with Settings...
                </button>
              )}
              {onDelete && (
                <>
                  <hr className="my-1 border-surface-200 dark:border-surface-700" />
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onDelete(schedule);
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-error-600 hover:bg-error-50 dark:hover:bg-error-900/20 flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Schedule
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

interface SchedulesTableProps {
  schedules: ScrapeSchedule[];
  onEdit?: (schedule: ScrapeSchedule) => void;
  onDelete?: (schedule: ScrapeSchedule) => void;
  onTrigger?: (scheduleId: string, withSettings?: boolean) => void;
  triggeringId?: string | null;
  isTriggering?: boolean;
}


export function SchedulesTable({ 
  schedules, 
  onEdit, 
  onDelete, 
  onTrigger,
  triggeringId,
  isTriggering,
}: SchedulesTableProps) {
  return (
    <div className="bg-white dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">
                Schedule
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">
                Frequency
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">
                Targets
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">
                Status
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">
                Last Run
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">
                Next Run
              </th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-200 dark:divide-surface-700">
            {schedules.map((schedule) => {
              const targetCount = schedule.targetCount || 0;
              
              return (
                <tr
                  key={schedule._id}
                  className="hover:bg-surface-50 dark:hover:bg-surface-800/80 transition-colors"
                >
                  {/* Schedule Name */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-surface-900 dark:text-white">
                          {schedule.name}
                        </p>
                        {schedule.description && (
                          <p className="text-xs text-surface-500 truncate max-w-[200px]">
                            {schedule.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Frequency */}
                  <td className="px-4 py-3">
                    <code className="px-2 py-0.5 bg-surface-100 dark:bg-surface-700 rounded text-xs font-mono text-surface-700 dark:text-surface-300">
                      {schedule.cronExpression}
                    </code>
                  </td>

                  {/* Targets */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-sm text-surface-500">
                      <Target className="h-4 w-4" />
                      <span>{targetCount} target{targetCount !== 1 ? 's' : ''}</span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <Badge variant={schedule.enabled ? 'success' : 'secondary'} size="sm">
                      {schedule.enabled ? 'Active' : 'Paused'}
                    </Badge>
                  </td>

                  {/* Last Run */}
                  <td className="px-4 py-3">
                    <span className="text-sm text-surface-500">
                      {schedule.lastRunAt
                        ? format(new Date(schedule.lastRunAt), 'MMM d, h:mm a')
                        : 'Never'}
                    </span>
                  </td>

                  {/* Next Run */}
                  <td className="px-4 py-3">
                    <span className="text-sm text-surface-500">
                      {schedule.nextRunAt
                        ? format(new Date(schedule.nextRunAt), 'MMM d, h:mm a')
                        : '—'}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <ScheduleActions
                      schedule={schedule}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onTrigger={onTrigger}
                      triggeringId={triggeringId}
                      isTriggering={isTriggering}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
