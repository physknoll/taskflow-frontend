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
  useDroppable,
  rectIntersection,
} from '@dnd-kit/core';
import { ITicket } from '@/types';
import { TicketCard } from './TicketCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils';
import { TICKET_STATUSES } from '@/lib/constants';

interface TicketBoardProps {
  tickets: ITicket[];
  isLoading: boolean;
  onStatusChange: (ticketId: string, newStatus: string) => void;
}

interface DroppableColumnProps {
  id: string;
  label: string;
  color: string;
  tickets: ITicket[];
}

function DroppableColumn({ id, label, color, tickets }: DroppableColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  });

  return (
    <div className="kanban-column">
      {/* Column Header */}
      <div className={cn('kanban-column-header', color)}>
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">{label}</h3>
          <span className="bg-white dark:bg-surface-700 rounded-full px-2 py-0.5 text-xs font-medium text-surface-600 dark:text-surface-300">
            {tickets.length}
          </span>
        </div>
      </div>

      {/* Column Body - Droppable Area */}
      <div
        ref={setNodeRef}
        className={cn(
          'kanban-column-body min-h-[200px] transition-all duration-200',
          isOver && 'ring-2 ring-primary-500 ring-inset bg-primary-50/50 dark:bg-primary-900/20'
        )}
      >
        {tickets.length === 0 ? (
          <div className={cn(
            'flex items-center justify-center h-32 text-surface-400 dark:text-surface-500 text-sm border-2 border-dashed rounded-lg transition-colors',
            isOver 
              ? 'border-primary-400 text-primary-500 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30' 
              : 'border-surface-200 dark:border-surface-700'
          )}>
            {isOver ? 'Drop here to move' : 'No tickets'}
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.map((ticket) => (
              <TicketCard key={ticket._id} ticket={ticket} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function TicketBoard({ tickets, isLoading, onStatusChange }: TicketBoardProps) {
  const [activeTicket, setActiveTicket] = useState<ITicket | null>(null);

  // Use both Mouse and Touch sensors for better cross-device support
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 10, // 10px movement required to start drag
    },
  });
  
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 200, // 200ms hold required for touch
      tolerance: 5,
    },
  });

  const sensors = useSensors(mouseSensor, touchSensor);

  const handleDragStart = (event: DragStartEvent) => {
    console.log('🎯 Drag started:', event.active.id);
    const ticket = tickets.find((t) => t._id === event.active.id);
    if (ticket) {
      setActiveTicket(ticket);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    console.log('🎯 Drag ended:', { activeId: active.id, overId: over?.id });
    setActiveTicket(null);

    if (!over) {
      console.log('❌ No drop target');
      return;
    }

    const ticketId = active.id as string;
    const overId = over.id as string;

    // Check if we're dropping over a column
    const targetColumn = TICKET_STATUSES.find((s) => s.id === overId);
    
    if (targetColumn) {
      // Dropped on a column - update status
      const ticket = tickets.find((t) => t._id === ticketId);
      if (ticket && ticket.status !== targetColumn.id) {
        console.log(`✅ Updating ticket ${ticketId} from ${ticket.status} to ${targetColumn.id}`);
        onStatusChange(ticketId, targetColumn.id);
      } else {
        console.log('ℹ️ Same status, no update needed');
      }
    } else {
      console.log('⚠️ Dropped on non-column target:', overId);
    }
  };

  const handleDragCancel = () => {
    console.log('🚫 Drag cancelled');
    setActiveTicket(null);
  };

  const getTicketsByStatus = (status: string) => {
    return tickets.filter((t) => t.status === status);
  };

  if (isLoading) {
    return <BoardSkeleton />;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={rectIntersection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
        {TICKET_STATUSES.map((column) => {
          const columnTickets = getTicketsByStatus(column.id);

          return (
            <DroppableColumn
              key={column.id}
              id={column.id}
              label={column.label}
              color={column.color}
              tickets={columnTickets}
            />
          );
        })}
      </div>

      {/* Drag Overlay */}
      <DragOverlay dropAnimation={{
        duration: 200,
        easing: 'ease',
      }}>
        {activeTicket && (
          <div className="rotate-2 scale-105 opacity-90">
            <TicketCard ticket={activeTicket} isDragging />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}

function BoardSkeleton() {
  return (
    <div className="flex gap-6">
      {TICKET_STATUSES.map((column) => (
        <div key={column.id} className="kanban-column">
          <div className={cn('kanban-column-header', column.color)}>
            <Skeleton variant="text" width={100} height={20} />
          </div>
          <div className="kanban-column-body">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 bg-white dark:bg-surface-800 rounded-lg animate-pulse">
                <Skeleton variant="text" width="50%" className="mb-2" />
                <Skeleton variant="text" width="80%" className="mb-2" />
                <Skeleton variant="text" width="60%" className="mb-4" />
                <div className="flex justify-between">
                  <Skeleton variant="rounded" width={60} height={20} />
                  <Skeleton variant="circular" width={24} height={24} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
