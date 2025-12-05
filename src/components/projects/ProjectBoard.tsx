'use client';

import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  rectIntersection,
} from '@dnd-kit/core';
import { IProject, ProjectBoardData } from '@/types';
import { ProjectCard } from './ProjectCard';
import { KanbanColumn } from '@/components/shared/KanbanColumn';
import { Skeleton } from '@/components/ui/Skeleton';
import { PROJECT_STATUSES } from '@/lib/constants';

interface ProjectBoardProps {
  board?: ProjectBoardData;
  isLoading: boolean;
  onStatusChange: (projectId: string, newStatus: string) => void;
  onProjectClick: (project: IProject) => void;
}

export function ProjectBoard({
  board,
  isLoading,
  onStatusChange,
  onProjectClick,
}: ProjectBoardProps) {
  const [activeProject, setActiveProject] = useState<IProject | null>(null);

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 10,
    },
  });

  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 200,
      tolerance: 5,
    },
  });

  const sensors = useSensors(mouseSensor, touchSensor);

  const handleDragStart = (event: DragStartEvent) => {
    const projectId = event.active.id as string;
    const project = board?.board
      .flatMap((col) => col.projects)
      .find((p) => p._id === projectId);
    
    if (project) {
      setActiveProject(project);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveProject(null);

    if (!over) return;

    const projectId = active.id as string;
    const overId = over.id as string;

    // Check if we're dropping over a column
    const columns = board?.columns || [];
    const targetColumn = columns.find((c) => c.key === overId);

    if (targetColumn) {
      const project = board?.board
        .flatMap((col) => col.projects)
        .find((p) => p._id === projectId);

      if (project && project.status !== targetColumn.key) {
        onStatusChange(projectId, targetColumn.key);
      }
    }
  };

  const handleDragCancel = () => {
    setActiveProject(null);
  };

  if (isLoading) {
    return <BoardSkeleton />;
  }

  // Always use PROJECT_STATUSES for project boards
  // The backend should eventually return project-specific columns  
  const columns = PROJECT_STATUSES.map((s) => ({
    _id: s.id,
    key: s.id,
    name: s.label,
    color: s.hexColor,
    scope: 'system' as const,
    order: PROJECT_STATUSES.indexOf(s),
    isDefault: s.id === 'planning',
    isFinal: s.id === 'completed',
    isHidden: false,
    createdBy: '',
    createdAt: '',
    updatedAt: '',
  }));

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={rectIntersection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex gap-6 h-full min-h-[500px] overflow-x-auto pb-4">
        {columns.map((column) => {
          // Get projects that match this status
          const projects = board?.board
            .flatMap((b) => b.projects)
            .filter((p) => p.status === column.key) || [];

          return (
            <KanbanColumn
              key={column.key}
              id={column.key}
              title={column.name}
              color={column.color}
              icon={column.icon}
              count={projects.length}
              wipLimit={column.wipLimit}
            >
              {projects.map((project) => (
                <ProjectCard
                  key={project._id}
                  project={project}
                  onClick={() => onProjectClick(project)}
                />
              ))}
            </KanbanColumn>
          );
        })}
      </div>

      {/* Drag Overlay */}
      <DragOverlay
        dropAnimation={{
          duration: 200,
          easing: 'ease',
        }}
      >
        {activeProject && (
          <div className="rotate-2 scale-105 opacity-90">
            <ProjectCard project={activeProject} isDragging />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}

function BoardSkeleton() {
  return (
    <div className="flex gap-6 overflow-x-auto pb-4">
      {PROJECT_STATUSES.map((status) => (
        <div key={status.id} className="w-80 flex-shrink-0">
          <div
            className="px-4 py-3 rounded-t-xl"
            style={{ backgroundColor: `${status.hexColor}15` }}
          >
            <Skeleton variant="text" width={100} height={20} />
          </div>
          <div className="p-3 bg-surface-50 dark:bg-surface-800/50 rounded-b-xl space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-4 bg-white dark:bg-surface-800 rounded-lg animate-pulse"
              >
                <div className="flex justify-between mb-3">
                  <Skeleton variant="text" width="30%" />
                  <Skeleton variant="rounded" width={60} height={20} />
                </div>
                <Skeleton variant="text" width="80%" className="mb-2" />
                <Skeleton variant="text" width="50%" className="mb-4" />
                <Skeleton variant="rounded" width="100%" height={8} className="mb-4" />
                <div className="flex justify-between pt-3 border-t">
                  <Skeleton variant="text" width={80} />
                  <div className="flex -space-x-2">
                    <Skeleton variant="circular" width={24} height={24} />
                    <Skeleton variant="circular" width={24} height={24} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

