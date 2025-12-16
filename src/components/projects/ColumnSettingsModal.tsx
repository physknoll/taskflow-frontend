'use client';

import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useWorkflowColumns } from '@/hooks/useProjects';
import { IWorkflowColumn, WorkflowScope } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { GripVertical, Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface ColumnSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  scope: WorkflowScope;
  scopeId?: string;
}

function SortableColumnItem({
  column,
  onEdit,
  onDelete,
}: {
  column: IWorkflowColumn;
  onEdit: (column: IWorkflowColumn) => void;
  onDelete: (column: IWorkflowColumn) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab hover:bg-surface-100 dark:hover:bg-surface-700 p-1 rounded"
      >
        <GripVertical className="w-4 h-4 text-surface-400" />
      </button>

      <div
        className="w-4 h-4 rounded"
        style={{ backgroundColor: column.color }}
      />

      <span className="flex-1 font-medium text-surface-900 dark:text-white">
        {column.name}
      </span>

      <div className="flex items-center gap-2">
        {column.isDefault && (
          <span className="text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded">
            Default
          </span>
        )}
        {column.isFinal && (
          <span className="text-xs bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded">
            Final
          </span>
        )}

        {column.scope !== 'system' && (
          <>
            <button
              onClick={() => onEdit(column)}
              className="p-1 hover:bg-surface-100 dark:hover:bg-surface-700 rounded"
            >
              <Edit2 className="w-4 h-4 text-surface-500" />
            </button>
            <button
              onClick={() => onDelete(column)}
              className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export function ColumnSettingsModal({
  isOpen,
  onClose,
  scope,
  scopeId,
}: ColumnSettingsModalProps) {
  const {
    columns,
    isLoading,
    createColumn,
    updateColumn,
    reorderColumns,
    deleteColumn,
    isCreating,
  } = useWorkflowColumns(scope, scopeId);

  const [editingColumn, setEditingColumn] = useState<IWorkflowColumn | null>(
    null
  );
  const [newColumn, setNewColumn] = useState({ name: '', color: '#6B7280' });
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = columns.findIndex((c) => c._id === active.id);
      const newIndex = columns.findIndex((c) => c._id === over.id);

      const reordered = arrayMove(columns, oldIndex, newIndex);
      const updates = reordered.map((col, index) => ({
        id: col._id,
        order: index,
      }));

      reorderColumns(updates);
    }
  };

  const handleCreateColumn = async () => {
    if (!newColumn.name.trim()) return;

    try {
      await createColumn({
        scope: scope as 'client' | 'project',
        scopeId: scopeId!,
        name: newColumn.name,
        color: newColumn.color,
      });
      setIsAddingNew(false);
      setNewColumn({ name: '', color: '#6B7280' });
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleUpdateColumn = async () => {
    if (!editingColumn || !editName.trim()) return;

    try {
      await updateColumn(editingColumn._id, {
        name: editName,
        color: editColor,
      });
      setEditingColumn(null);
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleDelete = (column: IWorkflowColumn) => {
    const otherColumns = columns.filter((c) => c._id !== column._id);
    if (otherColumns.length === 0) {
      toast.error('Cannot delete the last column');
      return;
    }

    const moveToColumn =
      otherColumns.find((c) => c.isDefault) || otherColumns[0];

    if (
      confirm(
        `Delete "${column.name}"? Items will be moved to "${moveToColumn.name}".`
      )
    ) {
      deleteColumn(column._id, moveToColumn._id);
    }
  };

  const startEditing = (column: IWorkflowColumn) => {
    setEditingColumn(column);
    setEditName(column.name);
    setEditColor(column.color);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Workflow Columns"
      size="lg"
    >
      <div className="space-y-4">
        <p className="text-sm text-surface-600 dark:text-surface-400">
          Customize the columns in your Kanban board. Drag to reorder.
        </p>

        {scope === 'system' && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              System columns cannot be edited. Create custom columns at the
              client or project level.
            </p>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600" />
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={columns.map((c) => c._id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {columns.map((column) =>
                  editingColumn?._id === column._id ? (
                    <div
                      key={column._id}
                      className="flex items-center gap-2 p-3 bg-white dark:bg-surface-800 border border-primary-300 dark:border-primary-700 rounded-lg"
                    >
                      <input
                        type="color"
                        value={editColor}
                        onChange={(e) => setEditColor(e.target.value)}
                        className="w-8 h-8 rounded cursor-pointer"
                      />
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1"
                        autoFocus
                      />
                      <Button size="sm" onClick={handleUpdateColumn}>
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingColumn(null)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <SortableColumnItem
                      key={column._id}
                      column={column}
                      onEdit={startEditing}
                      onDelete={handleDelete}
                    />
                  )
                )}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {/* Add new column */}
        {scope !== 'system' && scopeId && (
          <div className="border-t border-surface-200 dark:border-surface-700 pt-4">
            {isAddingNew ? (
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={newColumn.color}
                  onChange={(e) =>
                    setNewColumn({ ...newColumn, color: e.target.value })
                  }
                  className="w-8 h-8 rounded cursor-pointer"
                />
                <Input
                  placeholder="Column name"
                  value={newColumn.name}
                  onChange={(e) =>
                    setNewColumn({ ...newColumn, name: e.target.value })
                  }
                  className="flex-1"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleCreateColumn();
                    }
                  }}
                />
                <Button
                  size="sm"
                  onClick={handleCreateColumn}
                  disabled={!newColumn.name || isCreating}
                >
                  <Check className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setIsAddingNew(false);
                    setNewColumn({ name: '', color: '#6B7280' });
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={() => setIsAddingNew(true)}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Column
              </Button>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}



