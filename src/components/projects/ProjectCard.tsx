'use client';

import { useDraggable } from '@dnd-kit/core';
import { IProject } from '@/types';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/utils';
import {
  Calendar,
  AlertTriangle,
  Edit2,
} from 'lucide-react';

interface ProjectCardProps {
  project: IProject;
  onClick?: () => void;
  onEdit?: (project: IProject) => void;
  isDragging?: boolean;
}

export function ProjectCard({ project, onClick, onEdit, isDragging = false }: ProjectCardProps) {
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
    low: 'bg-surface-100 text-surface-600 [data-theme="dark"]:bg-surface-700 [data-theme="dark"]:text-surface-300',
    medium: 'bg-primary-100 text-primary-700 [data-theme="dark"]:bg-primary-900/50 [data-theme="dark"]:text-primary-300',
    high: 'bg-warning-100 text-warning-700 [data-theme="dark"]:bg-warning-900/50 [data-theme="dark"]:text-warning-300',
    critical: 'bg-error-100 text-error-700 [data-theme="dark"]:bg-error-900/50 [data-theme="dark"]:text-error-300',
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
        'group relative bg-[var(--bg-primary)] rounded-lg border border-[var(--border-default)] p-4 cursor-pointer transition-all touch-none',
        'hover:shadow-md hover:border-primary-500/30',
        (isDragging || isBeingDragged) && 'opacity-50 shadow-lg rotate-2 ring-2 ring-primary-400',
        isOverdue && 'border-l-4 border-l-error-500'
      )}
    >
      {/* Edit Button - appears on hover */}
      {onEdit && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(project);
          }}
          className="absolute top-2 right-2 p-1.5 rounded-md opacity-0 group-hover:opacity-100 bg-[var(--bg-primary)] shadow-sm border border-[var(--border-default)] text-[var(--text-muted)] hover:text-primary-500 transition-all z-10"
          title="Edit project"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Header with color indicator */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: project.color }}
          />
          <span className="text-xs font-medium text-[var(--text-muted)]">
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
      <h3 className="font-semibold text-[var(--text-primary)] mb-2 line-clamp-2">
        {project.name}
      </h3>

      {/* Client */}
      <p className="text-sm text-[var(--text-secondary)] mb-3">
        {clientName}
      </p>

      {/* Tags */}
      {project.tags && project.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {project.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-xs bg-[var(--bg-tertiary)] text-[var(--text-secondary)] px-2 py-0.5 rounded-md"
            >
              {tag}
            </span>
          ))}
          {project.tags.length > 3 && (
            <span className="text-xs text-[var(--text-muted)]">
              +{project.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-[var(--text-muted)]">Progress</span>
          <span className="font-medium text-[var(--text-primary)]">
            {project.progress?.percentage || 0}%
          </span>
        </div>
        <div className="h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all',
              project.progress?.percentage === 100
                ? 'bg-success-500'
                : (project.progress?.percentage || 0) > 50
                ? 'bg-gradient-to-r from-primary-400 to-primary-600'
                : 'bg-warning-500'
            )}
            style={{ width: `${project.progress?.percentage || 0}%` }}
          />
        </div>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          {project.progress?.completedTickets || 0} / {project.progress?.totalTickets || 0} tickets
        </p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-[var(--border-subtle)]">
        {/* Due date */}
        {project.targetEndDate && (
          <div
            className={cn(
              'flex items-center gap-1 text-xs',
              isOverdue ? 'text-error-500' : 'text-[var(--text-muted)]'
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
                className="w-6 h-6 rounded-full bg-[var(--bg-tertiary)] border-2 border-[var(--bg-primary)] flex items-center justify-center"
                title={memberName}
              >
                {memberAvatar ? (
                  <img
                    src={memberAvatar}
                    alt={memberName}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-xs font-medium text-[var(--text-secondary)]">
                    {memberInitial}
                  </span>
                )}
              </div>
            );
          })}
          {project.teamMembers && project.teamMembers.length > 3 && (
            <div className="w-6 h-6 rounded-full bg-[var(--bg-tertiary)] border-2 border-[var(--bg-primary)] flex items-center justify-center">
              <span className="text-xs text-[var(--text-muted)]">
                +{project.teamMembers.length - 3}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
