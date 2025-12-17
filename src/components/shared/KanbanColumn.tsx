'use client';

import { useDroppable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';
import { AlertTriangle } from 'lucide-react';

interface KanbanColumnProps {
  id: string;
  title: string;
  color?: string;
  icon?: string;
  count: number;
  wipLimit?: number;
  children: React.ReactNode;
  className?: string;
}

export function KanbanColumn({
  id,
  title,
  color = '#6B7280',
  icon,
  count,
  wipLimit,
  children,
  className,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  });

  const isOverLimit = wipLimit ? count > wipLimit : false;

  return (
    <div className={cn('kanban-column flex-shrink-0 w-80 flex flex-col h-full', className)}>
      {/* Column Header */}
      <div
        className="kanban-column-header flex items-center justify-between px-4 py-3 rounded-t-xl"
        style={{ 
          backgroundColor: `${color}15`,
          borderTop: `3px solid ${color}`,
        }}
      >
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-[var(--text-primary)]">{title}</h3>
          <span 
            className={cn(
              'rounded-full px-2 py-0.5 text-xs font-medium',
              isOverLimit 
                ? 'bg-error-100 text-error-700 [data-theme="dark"]:bg-error-900/50 [data-theme="dark"]:text-error-300'
                : 'bg-[var(--bg-primary)] text-[var(--text-secondary)]'
            )}
          >
            {count}
            {wipLimit && `/${wipLimit}`}
          </span>
        </div>
        
        {isOverLimit && (
          <div className="flex items-center gap-1 text-error-500">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-xs font-medium">Over limit</span>
          </div>
        )}
      </div>

      {/* Column Body - Droppable Area */}
      <div
        ref={setNodeRef}
        className={cn(
          'kanban-column-body p-3 rounded-b-xl min-h-[200px] flex-1 overflow-y-auto transition-all duration-200',
          'bg-[var(--bg-secondary)]',
          isOver && 'ring-2 ring-primary-500 ring-inset bg-primary-50/50 [data-theme="dark"]:bg-primary-900/20'
        )}
      >
        {count === 0 ? (
          <div
            className={cn(
              'flex items-center justify-center h-32 text-[var(--text-muted)] text-sm border-2 border-dashed rounded-lg transition-colors',
              isOver
                ? 'border-primary-400 text-primary-500 bg-primary-50 [data-theme="dark"]:bg-primary-900/30'
                : 'border-[var(--border-default)]'
            )}
          >
            {isOver ? 'Drop here to move' : 'No items'}
          </div>
        ) : (
          <div className="space-y-3">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
