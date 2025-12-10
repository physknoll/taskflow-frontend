'use client';

import { useDraggable } from '@dnd-kit/core';
import { IProject } from '@/types';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/utils';
import {
  Calendar,
  AlertTriangle,
} from 'lucide-react';

interface ProjectCardProps {
  project: IProject;
  onClick?: () => void;
  isDragging?: boolean;
}

export function ProjectCard({ project, onClick, isDragging = false }: ProjectCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging: isBeingDragged,
  } = useDraggable({
    id: project._id,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 1000,
      }
    : undefined;

  const priorityColors: Record<string, string> = {
    low: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    medium: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
    high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300',
    critical: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
  };

  const isOverdue =
    project.targetEndDate &&
    new Date(project.targetEndDate) < new Date() &&
    project.status !== 'completed';

  const handleClick = (e: React.MouseEvent) => {
    if (!isBeingDragged && onClick) {
      onClick();
    }
  };

  // Get client name safely
  const clientName = typeof project.client === 'string' 
    ? 'Client' 
    : project.client?.name || 'Client';

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={handleClick}
      className={cn(
        'bg-white dark:bg-surface-800 rounded-lg border border-surface-200 dark:border-surface-700 p-4 cursor-pointer transition-all touch-none',
        'hover:shadow-md hover:border-surface-300 dark:hover:border-surface-600',
        (isDragging || isBeingDragged) && 'opacity-50 shadow-lg rotate-2 ring-2 ring-primary-400',
        isOverdue && 'border-l-4 border-l-red-500'
      )}
    >
      {/* Header with color indicator */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: project.color }}
          />
          <span className="text-xs font-medium text-surface-500 dark:text-surface-400">
            {project.projectNumber}
          </span>
        </div>
        <span
          className={cn(
            'text-xs px-2 py-0.5 rounded-full font-medium',
            priorityColors[project.priority] || priorityColors.medium
          )}
        >
          {project.priority}
        </span>
      </div>

      {/* Title */}
      <h3 className="font-semibold text-surface-900 dark:text-white mb-2 line-clamp-2">
        {project.name}
      </h3>

      {/* Client */}
      <p className="text-sm text-surface-500 dark:text-surface-400 mb-3">
        {clientName}
      </p>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-surface-500 dark:text-surface-400">Progress</span>
          <span className="font-medium text-surface-700 dark:text-surface-300">
            {project.progress?.percentage || 0}%
          </span>
        </div>
        <div className="h-2 bg-surface-100 dark:bg-surface-700 rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all',
              project.progress?.percentage === 100
                ? 'bg-emerald-500'
                : (project.progress?.percentage || 0) > 50
                ? 'bg-primary-500'
                : 'bg-amber-500'
            )}
            style={{ width: `${project.progress?.percentage || 0}%` }}
          />
        </div>
        <p className="text-xs text-surface-500 dark:text-surface-400 mt-1">
          {project.progress?.completedTickets || 0} / {project.progress?.totalTickets || 0} tickets
        </p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-surface-100 dark:border-surface-700">
        {/* Due date */}
        {project.targetEndDate && (
          <div
            className={cn(
              'flex items-center gap-1 text-xs',
              isOverdue ? 'text-red-600 dark:text-red-400' : 'text-surface-500 dark:text-surface-400'
            )}
          >
            {isOverdue ? (
              <AlertTriangle className="w-3 h-3" />
            ) : (
              <Calendar className="w-3 h-3" />
            )}
            <span>{isOverdue ? 'Overdue' : formatDate(project.targetEndDate)}</span>
          </div>
        )}

        {/* Team avatars */}
        <div className="flex -space-x-2">
          {project.teamMembers?.filter(m => m != null).slice(0, 3).map((member, index) => {
            const memberId = typeof member === 'string' ? member : member._id;
            const memberName = typeof member === 'string' ? '' : `${member.firstName} ${member.lastName}`;
            const memberAvatar = typeof member === 'string' ? undefined : member.avatar;
            const memberInitial = typeof member === 'string' ? '?' : member.firstName?.[0];
            return (
              <div
                key={memberId || index}
                className="w-6 h-6 rounded-full bg-surface-200 dark:bg-surface-600 border-2 border-white dark:border-surface-800 flex items-center justify-center"
                title={memberName}
              >
                {memberAvatar ? (
                  <img
                    src={memberAvatar}
                    alt={memberName}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-xs font-medium text-surface-600 dark:text-surface-300">
                    {memberInitial}
                  </span>
                )}
              </div>
            );
          })}
          {project.teamMembers && project.teamMembers.length > 3 && (
            <div className="w-6 h-6 rounded-full bg-surface-100 dark:bg-surface-700 border-2 border-white dark:border-surface-800 flex items-center justify-center">
              <span className="text-xs text-surface-600 dark:text-surface-400">
                +{project.teamMembers.length - 3}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

