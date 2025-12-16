'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useDraggable } from '@dnd-kit/core';
import { ITicket, ITicketProject, IResource } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Avatar, AvatarGroup } from '@/components/ui/Avatar';
import { Progress } from '@/components/ui/Progress';
import {
  Calendar,
  CheckSquare,
  MessageCircle,
  Image as ImageIcon,
  Video,
  Link as LinkIcon,
  GitBranch,
  FileText,
  File,
} from 'lucide-react';
import { formatRelativeTime, getTypeIcon, getPriorityColor, calculateProgress, isOverdue, isDueSoon } from '@/lib/utils';
import { cn } from '@/lib/utils';

// Helper to count resources by type
function getResourceCounts(resources: IResource[] | undefined) {
  if (!resources || resources.length === 0) {
    return null;
  }

  const counts = {
    images: 0,
    videos: 0,
    links: 0,
    git: 0,
    files: 0,
  };

  resources.forEach((resource) => {
    if (resource.resourceType === 'git') {
      counts.git++;
    } else if (resource.resourceType === 'link') {
      // Check if it's a video link
      if (resource.provider.category === 'video') {
        counts.videos++;
      } else {
        counts.links++;
      }
    } else if (resource.resourceType === 'file' && resource.file) {
      if (resource.file.mimeType.startsWith('image/')) {
        counts.images++;
      } else if (resource.file.mimeType.startsWith('video/')) {
        counts.videos++;
      } else {
        counts.files++;
      }
    } else {
      counts.files++;
    }
  });

  return counts;
}

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

  const style = {
    ...(transform ? {
      transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      zIndex: 1000,
    } : {}),
    ...(ticket.color ? {
      borderColor: ticket.color,
      borderWidth: '2px',
    } : {}),
  };

  const completedTasks = ticket.tasks.filter(t => t.status === 'completed').length;
  const totalTasks = ticket.tasks.length;
  const progress = calculateProgress(ticket.tasks);
  const overdue = isOverdue(ticket.dueDate);
  const dueSoon = isDueSoon(ticket.dueDate);
  
  // Calculate resource counts by type
  const resourceCounts = useMemo(() => getResourceCounts(ticket.resources), [ticket.resources]);
  const hasResources = resourceCounts && (
    resourceCounts.images > 0 ||
    resourceCounts.videos > 0 ||
    resourceCounts.links > 0 ||
    resourceCounts.git > 0 ||
    resourceCounts.files > 0
  );
  // Fallback for legacy attachments
  const legacyAttachmentCount = !hasResources ? ticket.attachments?.length || 0 : 0;

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
          {/* Left side: Due date and comments */}
          <div className="flex items-center gap-2.5">
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
              <div className="flex items-center gap-0.5 text-xs text-surface-400 dark:text-surface-500">
                <MessageCircle className="h-3 w-3" />
                <span>{ticket.comments.length}</span>
              </div>
            )}
          </div>

          {/* Right side: Resources + Assignees */}
          <div className="flex items-center gap-2">
            {/* Resource indicators by type */}
            {hasResources && resourceCounts && (
              <div className="flex items-center gap-1.5">
                {/* Images */}
                {resourceCounts.images > 0 && (
                  <div className="flex items-center gap-0.5 text-xs text-pink-500 dark:text-pink-400" title={`${resourceCounts.images} image${resourceCounts.images > 1 ? 's' : ''}`}>
                    <ImageIcon className="h-3 w-3" />
                    <span className="text-[10px] font-medium">{resourceCounts.images}</span>
                  </div>
                )}
                
                {/* Videos */}
                {resourceCounts.videos > 0 && (
                  <div className="flex items-center gap-0.5 text-xs text-red-500 dark:text-red-400" title={`${resourceCounts.videos} video${resourceCounts.videos > 1 ? 's' : ''}`}>
                    <Video className="h-3 w-3" />
                    <span className="text-[10px] font-medium">{resourceCounts.videos}</span>
                  </div>
                )}
                
                {/* Links */}
                {resourceCounts.links > 0 && (
                  <div className="flex items-center gap-0.5 text-xs text-blue-500 dark:text-blue-400" title={`${resourceCounts.links} link${resourceCounts.links > 1 ? 's' : ''}`}>
                    <LinkIcon className="h-3 w-3" />
                    <span className="text-[10px] font-medium">{resourceCounts.links}</span>
                  </div>
                )}
                
                {/* Git */}
                {resourceCounts.git > 0 && (
                  <div className="flex items-center gap-0.5 text-xs text-emerald-500 dark:text-emerald-400" title={`${resourceCounts.git} git resource${resourceCounts.git > 1 ? 's' : ''}`}>
                    <GitBranch className="h-3 w-3" />
                    <span className="text-[10px] font-medium">{resourceCounts.git}</span>
                  </div>
                )}
                
                {/* Other files */}
                {resourceCounts.files > 0 && (
                  <div className="flex items-center gap-0.5 text-xs text-amber-500 dark:text-amber-400" title={`${resourceCounts.files} file${resourceCounts.files > 1 ? 's' : ''}`}>
                    <FileText className="h-3 w-3" />
                    <span className="text-[10px] font-medium">{resourceCounts.files}</span>
                  </div>
                )}
              </div>
            )}
            
            {/* Legacy attachment indicator (fallback) */}
            {legacyAttachmentCount > 0 && (
              <div className="flex items-center gap-0.5 text-xs text-surface-400 dark:text-surface-500" title={`${legacyAttachmentCount} attachment${legacyAttachmentCount > 1 ? 's' : ''}`}>
                <File className="h-3 w-3" />
                <span className="text-[10px] font-medium">{legacyAttachmentCount}</span>
              </div>
            )}

            {/* Assignees */}
            {Array.isArray(ticket.assignedTo) && ticket.assignedTo.filter(u => u != null).length > 0 && (
              <AvatarGroup
                avatars={ticket.assignedTo.filter(u => u != null).map((user: any) => ({
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
    </div>
  );
}
