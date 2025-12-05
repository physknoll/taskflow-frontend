'use client';

import { useRouter } from 'next/navigation';
import { useDraggable } from '@dnd-kit/core';
import { ITicket, ITicketProject } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Avatar, AvatarGroup } from '@/components/ui/Avatar';
import { Progress } from '@/components/ui/Progress';
import { Calendar, CheckSquare, MessageCircle, Paperclip, FolderKanban } from 'lucide-react';
import { formatRelativeTime, getTypeIcon, getPriorityColor, calculateProgress, isOverdue, isDueSoon } from '@/lib/utils';
import { cn } from '@/lib/utils';

// Helper to check if project is populated (has project details vs just ID)
function isPopulatedProject(project: ITicket['project']): project is ITicketProject {
  return project !== null && typeof project === 'object' && 'name' in project;
}

interface TicketCardProps {
  ticket: ITicket;
  isDragging?: boolean;
}

export function TicketCard({ ticket, isDragging = false }: TicketCardProps) {
  const router = useRouter();
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging: isBeingDragged,
  } = useDraggable({ 
    id: ticket._id,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: 1000,
  } : undefined;

  const completedTasks = ticket.tasks.filter(t => t.status === 'completed').length;
  const totalTasks = ticket.tasks.length;
  const progress = calculateProgress(ticket.tasks);
  const overdue = isOverdue(ticket.dueDate);
  const dueSoon = isDueSoon(ticket.dueDate);

  const handleCardClick = (e: React.MouseEvent) => {
    // Only navigate if not dragging
    if (!isBeingDragged) {
      router.push(`/tickets/${ticket._id}`);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'ticket-card touch-none',
        (isDragging || isBeingDragged) && 'opacity-50 shadow-2xl ring-2 ring-primary-400 z-50'
      )}
      {...attributes}
      {...listeners}
    >
      <div onClick={handleCardClick} className="cursor-pointer">
        {/* Project Indicator */}
        {ticket.project && isPopulatedProject(ticket.project) && (
          <div className="flex items-center gap-1.5 mb-2 -mx-1 px-1 py-1 rounded-md bg-surface-50 dark:bg-surface-700/50">
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: ticket.project.color }}
            />
            <span className="text-xs font-medium text-surface-600 dark:text-surface-300 truncate">
              {ticket.project.name}
            </span>
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <span className="text-xs font-mono text-surface-500 dark:text-surface-400">
            {ticket.ticketNumber}
          </span>
          <Badge className={getPriorityColor(ticket.priority)} size="sm">
            {ticket.priority}
          </Badge>
        </div>

        {/* Title */}
        <h4 className="font-medium text-surface-900 dark:text-white mb-2 line-clamp-2">
          <span className="mr-1.5">{getTypeIcon(ticket.type)}</span>
          {ticket.title}
        </h4>

        {/* Tags */}
        {ticket.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {ticket.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-xs bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-400 px-2 py-0.5 rounded-md"
              >
                {tag}
              </span>
            ))}
            {ticket.tags.length > 3 && (
              <span className="text-xs text-surface-400 dark:text-surface-500">
                +{ticket.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Progress */}
        {totalTasks > 0 && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs text-surface-500 dark:text-surface-400 mb-1">
              <span className="flex items-center gap-1">
                <CheckSquare className="h-3 w-3" />
                {completedTasks}/{totalTasks} tasks
              </span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} size="sm" variant={progress === 100 ? 'success' : 'default'} />
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-surface-100 dark:border-surface-700">
          {/* Due date */}
          <div className="flex items-center gap-3">
            {ticket.dueDate && (
              <div
                className={cn(
                  'flex items-center gap-1 text-xs',
                  overdue
                    ? 'text-red-500 dark:text-red-400'
                    : dueSoon
                    ? 'text-amber-500 dark:text-amber-400'
                    : 'text-surface-500 dark:text-surface-400'
                )}
              >
                <Calendar className="h-3 w-3" />
                {formatRelativeTime(ticket.dueDate)}
              </div>
            )}
            
            {/* Comments count */}
            {ticket.comments.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-surface-400 dark:text-surface-500">
                <MessageCircle className="h-3 w-3" />
                {ticket.comments.length}
              </div>
            )}
            
            {/* Attachments count */}
            {ticket.attachments.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-surface-400 dark:text-surface-500">
                <Paperclip className="h-3 w-3" />
                {ticket.attachments.length}
              </div>
            )}
          </div>

          {/* Assignees */}
          {Array.isArray(ticket.assignedTo) && ticket.assignedTo.length > 0 && (
            <AvatarGroup
              avatars={ticket.assignedTo.map((user: any) => ({
                src: user.avatar,
                firstName: user.firstName,
                lastName: user.lastName,
              }))}
              max={3}
              size="xs"
            />
          )}
        </div>
      </div>
    </div>
  );
}
