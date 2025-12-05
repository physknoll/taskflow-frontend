'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  DndContext,
  DragOverlay,
  DragEndEvent,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  rectIntersection,
} from '@dnd-kit/core';
import { useProject } from '@/hooks/useProjects';
import { ITicket } from '@/types';
import { KanbanColumn } from '@/components/shared/KanbanColumn';
import { TicketCard } from '@/components/tickets/TicketCard';
import { ProjectHeader, ProjectSidebar, ColumnSettingsModal } from '@/components/projects';
import { CreateTicketModal } from '@/components/tickets/CreateTicketModal';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Plus, LayoutGrid, List, Filter, FolderKanban } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { TICKET_STATUSES } from '@/lib/constants';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const projectId = id as string;

  const { project, board, stats, isLoading, isBoardLoading } = useProject(projectId);

  const [activeTicket, setActiveTicket] = useState<ITicket | null>(null);
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const [isCreateTicketOpen, setIsCreateTicketOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isColumnSettingsOpen, setIsColumnSettingsOpen] = useState(false);

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
    const ticketId = event.active.id as string;
    const ticket = board?.board
      .flatMap((b) => b.tickets)
      .find((t) => t._id === ticketId);

    if (ticket) {
      setActiveTicket(ticket);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTicket(null);

    if (!over) return;

    const ticketId = active.id as string;
    const overId = over.id as string;

    // Check if we're dropping over a column
    const columns = board?.columns || [];
    const targetColumn = columns.find((c) => c.key === overId);

    if (targetColumn) {
      const currentTicket = board?.board
        .flatMap((b) => b.tickets)
        .find((t) => t._id === ticketId);

      if (currentTicket && currentTicket.status !== targetColumn.key) {
        // TODO: Call ticket status update
        console.log(`Updating ticket ${ticketId} to status ${targetColumn.key}`);
      }
    }
  };

  const handleDragCancel = () => {
    setActiveTicket(null);
  };

  if (isLoading || !project) {
    return <ProjectDetailSkeleton />;
  }

  // Get client ID safely
  const clientId = typeof project.client === 'string' 
    ? project.client 
    : project.client?._id;

  // Use columns from board or fall back to default ticket statuses
  const columns = board?.columns?.length
    ? board.columns
    : TICKET_STATUSES.map((s) => ({
        _id: s.id,
        key: s.id,
        name: s.label,
        color: s.id === 'completed' ? '#10B981' : s.id === 'in_review' ? '#8B5CF6' : s.id === 'in_progress' ? '#F59E0B' : '#6B7280',
        scope: 'system' as const,
        order: TICKET_STATUSES.indexOf(s),
        isDefault: s.id === 'backlog',
        isFinal: s.id === 'completed',
        isHidden: false,
        createdBy: '',
        createdAt: '',
        updatedAt: '',
      }));

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Project Header */}
      <ProjectHeader
        project={project}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onOpenSettings={() => setIsColumnSettingsOpen(true)}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold text-surface-900 dark:text-white">
                Tickets ({project.progress?.totalTickets || 0})
              </h2>
              <div className="flex items-center gap-1 bg-surface-100 dark:bg-surface-800 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('board')}
                  className={`p-1.5 rounded ${
                    viewMode === 'board'
                      ? 'bg-white dark:bg-surface-700 shadow-sm'
                      : 'text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded ${
                    viewMode === 'list'
                      ? 'bg-white dark:bg-surface-700 shadow-sm'
                      : 'text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button onClick={() => setIsCreateTicketOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Ticket
              </Button>
            </div>
          </div>

          {/* Kanban Board */}
          {viewMode === 'board' && (
            <DndContext
              sensors={sensors}
              collisionDetection={rectIntersection}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragCancel={handleDragCancel}
            >
              <div className="flex-1 overflow-x-auto p-6">
                <div className="flex gap-6 h-full">
                  {columns.map((column) => {
                    const columnData = board?.board.find(
                      (b) => b.column.key === column.key
                    );
                    const tickets = columnData?.tickets || [];

                    return (
                      <KanbanColumn
                        key={column.key}
                        id={column.key}
                        title={column.name}
                        color={column.color}
                        icon={column.icon}
                        count={tickets.length}
                        wipLimit={column.wipLimit}
                      >
                        {tickets.map((ticket) => (
                          <TicketCard
                            key={ticket._id}
                            ticket={ticket}
                          />
                        ))}
                      </KanbanColumn>
                    );
                  })}
                </div>
              </div>

              <DragOverlay
                dropAnimation={{
                  duration: 200,
                  easing: 'ease',
                }}
              >
                {activeTicket && (
                  <div className="rotate-2 scale-105 opacity-90">
                    <TicketCard ticket={activeTicket} isDragging />
                  </div>
                )}
              </DragOverlay>
            </DndContext>
          )}

          {/* List View */}
          {viewMode === 'list' && board && (
            <div className="flex-1 overflow-y-auto p-6">
              <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-surface-50 dark:bg-surface-800 sticky top-0">
                    <tr>
                      <th className="text-left px-6 py-3 text-xs font-medium text-surface-500 dark:text-surface-400 uppercase">
                        Ticket
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-surface-500 dark:text-surface-400 uppercase">
                        Status
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-surface-500 dark:text-surface-400 uppercase">
                        Priority
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-surface-500 dark:text-surface-400 uppercase">
                        Assignee
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-surface-500 dark:text-surface-400 uppercase">
                        Due Date
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-surface-500 dark:text-surface-400 uppercase">
                        Progress
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
                    {board.board.flatMap((b) => b.tickets).map((ticket) => (
                      <tr
                        key={ticket._id}
                        onClick={() => router.push(`/tickets/${ticket._id}`)}
                        className="hover:bg-surface-50 dark:hover:bg-surface-800 cursor-pointer"
                      >
                        <td className="px-6 py-4">
                          <div>
                            <span className="text-xs text-surface-500 dark:text-surface-400 mr-2">
                              {ticket.ticketNumber}
                            </span>
                            <span className="font-medium text-surface-900 dark:text-white">
                              {ticket.title}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 text-xs rounded-full bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 capitalize">
                            {ticket.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              ticket.priority === 'urgent'
                                ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'
                                : ticket.priority === 'high'
                                ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300'
                                : 'bg-surface-100 text-surface-700 dark:bg-surface-800 dark:text-surface-300'
                            }`}
                          >
                            {ticket.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex -space-x-1">
                            {(ticket.assignedTo as any[])
                              .slice(0, 2)
                              .map((user) => (
                                <div
                                  key={user._id}
                                  className="w-6 h-6 rounded-full bg-surface-200 dark:bg-surface-600 flex items-center justify-center text-xs"
                                  title={`${user.firstName} ${user.lastName}`}
                                >
                                  {user.firstName[0]}
                                </div>
                              ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-surface-500 dark:text-surface-400">
                          {ticket.dueDate ? formatDate(ticket.dueDate) : '-'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-surface-100 dark:bg-surface-700 rounded-full">
                              <div
                                className="h-full bg-emerald-500 rounded-full"
                                style={{
                                  width: `${
                                    ticket.tasks?.length
                                      ? (ticket.tasks.filter(
                                          (t) => t.status === 'completed'
                                        ).length /
                                          ticket.tasks.length) *
                                        100
                                      : 0
                                  }%`,
                                }}
                              />
                            </div>
                            <span className="text-xs text-surface-500 dark:text-surface-400">
                              {ticket.tasks?.filter((t) => t.status === 'completed')
                                .length || 0}
                              /{ticket.tasks?.length || 0}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {board.board.flatMap((b) => b.tickets).length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-surface-500 dark:text-surface-400">
                    <FolderKanban className="w-12 h-12 mb-4 opacity-50" />
                    <p className="text-lg font-medium">No tickets yet</p>
                    <p className="text-sm">Add a ticket to get started</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Project Sidebar */}
        {isSidebarOpen && (
          <ProjectSidebar
            project={project}
            stats={stats}
            onClose={() => setIsSidebarOpen(false)}
          />
        )}
      </div>

      {/* Create Ticket Modal */}
      <CreateTicketModal
        isOpen={isCreateTicketOpen}
        onClose={() => setIsCreateTicketOpen(false)}
        defaultClientId={clientId}
      />

      {/* Column Settings Modal */}
      <ColumnSettingsModal
        isOpen={isColumnSettingsOpen}
        onClose={() => setIsColumnSettingsOpen(false)}
        scope="project"
        scopeId={projectId}
      />
    </div>
  );
}

function ProjectDetailSkeleton() {
  return (
    <div className="h-screen flex flex-col">
      {/* Header Skeleton */}
      <div className="bg-white dark:bg-surface-900 border-b border-surface-200 dark:border-surface-800 px-6 py-4">
        <div className="flex items-center gap-4">
          <Skeleton variant="circular" width={40} height={40} />
          <div>
            <Skeleton variant="text" width={200} height={24} />
            <Skeleton variant="text" width={100} height={16} className="mt-1" />
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 p-6">
          <div className="flex gap-6 overflow-x-auto">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-80 flex-shrink-0">
                <Skeleton variant="rounded" width="100%" height={48} className="mb-3" />
                <div className="space-y-3">
                  {[1, 2, 3].map((j) => (
                    <Skeleton key={j} variant="rounded" width="100%" height={160} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="w-80 border-l border-surface-200 dark:border-surface-800 p-4">
          <Skeleton variant="text" width="60%" height={24} className="mb-4" />
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} variant="rounded" width="100%" height={60} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

