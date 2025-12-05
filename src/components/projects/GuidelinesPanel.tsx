'use client';

import { useState } from 'react';
import { useGuidelines } from '@/hooks/useGuidelines';
import { Guideline } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ConfirmModal } from '@/components/ui/Modal';
import {
  FileText,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  ChevronDown,
  ChevronRight,
  BookOpen,
} from 'lucide-react';

interface GuidelinesPanelProps {
  selectedGuidelineId: string | null;
  onSelectGuideline: (id: string | null) => void;
  onCreateNew: () => void;
  onEdit: (guideline: Guideline) => void;
}

export function GuidelinesPanel({
  selectedGuidelineId,
  onSelectGuideline,
  onCreateNew,
  onEdit,
}: GuidelinesPanelProps) {
  const { guidelines, isLoading, deleteGuideline, isDeleting } = useGuidelines({
    isActive: true,
  });

  const [deleteTarget, setDeleteTarget] = useState<Guideline | null>(null);
  const [expandedTypes, setExpandedTypes] = useState<Set<string>>(new Set());

  // Group guidelines by project type
  const groupedGuidelines = guidelines.reduce((acc, guideline) => {
    const type = guideline.projectType || 'other';
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(guideline);
    return acc;
  }, {} as Record<string, Guideline[]>);

  const toggleType = (type: string) => {
    setExpandedTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteGuideline(deleteTarget._id);
      if (selectedGuidelineId === deleteTarget._id) {
        onSelectGuideline(null);
      }
    } finally {
      setDeleteTarget(null);
    }
  };

  const formatProjectType = (type: string) => {
    return type
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-8 text-surface-500 dark:text-surface-400">
        <Loader2 className="w-6 h-6 animate-spin mb-2" />
        <p className="text-sm">Loading guidelines...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 pb-3 border-b border-surface-200 dark:border-surface-700 flex-shrink-0">
        <BookOpen className="w-4 h-4 text-primary-500" />
        <h3 className="text-sm font-semibold text-surface-900 dark:text-white">
          Guidelines
        </h3>
      </div>

      {/* Guidelines List - min-h-0 needed for flex overflow to work */}
      <div className="flex-1 min-h-0 overflow-y-auto py-3 -mx-1 px-1">
        {guidelines.length === 0 ? (
          <div className="text-center py-6 text-surface-500 dark:text-surface-400">
            <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No guidelines yet</p>
            <p className="text-xs mt-1">Create one to get started</p>
          </div>
        ) : (
          <div className="space-y-1">
            {/* Ungrouped flat list for simplicity - can be grouped if needed */}
            {guidelines.map((guideline) => (
              <div
                key={guideline._id}
                className={`group flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                  selectedGuidelineId === guideline._id
                    ? 'bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800'
                    : 'hover:bg-surface-50 dark:hover:bg-surface-700/50 border border-transparent'
                }`}
                onClick={() =>
                  onSelectGuideline(
                    selectedGuidelineId === guideline._id ? null : guideline._id
                  )
                }
              >
                {/* Checkbox */}
                <div
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    selectedGuidelineId === guideline._id
                      ? 'bg-primary-500 border-primary-500'
                      : 'border-surface-300 dark:border-surface-600'
                  }`}
                >
                  {selectedGuidelineId === guideline._id && (
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-surface-900 dark:text-white truncate">
                    {guideline.name}
                  </p>
                  <p className="text-xs text-surface-500 dark:text-surface-400">
                    {formatProjectType(guideline.projectType)}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(guideline);
                    }}
                    className="p-1 rounded hover:bg-surface-100 dark:hover:bg-surface-600 text-surface-500 hover:text-surface-700 dark:hover:text-surface-300"
                    title="Edit guideline"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteTarget(guideline);
                    }}
                    className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-surface-500 hover:text-red-600 dark:hover:text-red-400"
                    title="Delete guideline"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create New Button - Always visible at bottom */}
      <div className="pt-3 border-t border-surface-200 dark:border-surface-700 flex-shrink-0">
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-center"
          onClick={onCreateNew}
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Create New SOP
        </Button>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Guideline"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}

