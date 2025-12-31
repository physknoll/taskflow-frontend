'use client';

import { useState } from 'react';
import { useSOPs } from '@/hooks/useSOPs';
import { SOP } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { ConfirmModal } from '@/components/ui/Modal';
import { MarkdownEditorModal } from '@/components/editor';
import {
  FileText,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  BookOpen,
  Search,
  X,
} from 'lucide-react';

interface SOPPanelProps {
  clientId: string | undefined;
  selectedSOPId: string | null;
  onSelectSOP: (id: string | null) => void;
  onCreateNew: () => void;
  onEdit?: (sop: SOP) => void;
  /** Show compact mode without edit/delete actions */
  compact?: boolean;
}

export function SOPPanel({
  clientId,
  selectedSOPId,
  onSelectSOP,
  onCreateNew,
  onEdit,
  compact = false,
}: SOPPanelProps) {
  const { sops, isLoading, deleteSOP, isDeleting } = useSOPs(clientId, {
    limit: 50,
  });

  const [deleteTarget, setDeleteTarget] = useState<SOP | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingSOPId, setEditingSOPId] = useState<string | null>(null);

  // Filter SOPs by search query
  const filteredSOPs = sops.filter((sop) =>
    sop.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sop.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteSOP(deleteTarget._id);
      if (selectedSOPId === deleteTarget._id) {
        onSelectSOP(null);
      }
    } finally {
      setDeleteTarget(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-8 text-surface-500 dark:text-surface-400">
        <Loader2 className="w-6 h-6 animate-spin mb-2" />
        <p className="text-sm">Loading SOPs...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 pb-3 border-b border-surface-200 dark:border-surface-700 flex-shrink-0">
        <BookOpen className="w-4 h-4 text-primary-500" />
        <h3 className="text-sm font-semibold text-surface-900 dark:text-white">
          SOPs
        </h3>
        {selectedSOPId && (
          <Badge variant="primary" size="sm" className="ml-auto">
            1 selected
          </Badge>
        )}
      </div>

      {/* Search */}
      {sops.length > 5 && (
        <div className="py-3 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-surface-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search SOPs..."
              className="pl-8 h-8 text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* SOPs List */}
      <div className="flex-1 min-h-0 overflow-y-auto py-3 -mx-1 px-1">
        {filteredSOPs.length === 0 ? (
          <div className="text-center py-6 text-surface-500 dark:text-surface-400">
            <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
            {searchQuery ? (
              <>
                <p className="text-sm">No SOPs found</p>
                <p className="text-xs mt-1">Try a different search term</p>
              </>
            ) : (
              <>
                <p className="text-sm">No SOPs yet</p>
                <p className="text-xs mt-1">Create one to get started</p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-1">
            {filteredSOPs.map((sop) => (
              <div
                key={sop._id}
                className={`group flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                  selectedSOPId === sop._id
                    ? 'bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800'
                    : 'hover:bg-surface-50 dark:hover:bg-surface-700/50 border border-transparent'
                }`}
                onClick={() =>
                  onSelectSOP(selectedSOPId === sop._id ? null : sop._id)
                }
              >
                {/* Checkbox */}
                <div
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    selectedSOPId === sop._id
                      ? 'bg-primary-500 border-primary-500'
                      : 'border-surface-300 dark:border-surface-600'
                  }`}
                >
                  {selectedSOPId === sop._id && (
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
                    {sop.title}
                  </p>
                  {sop.tags && sop.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {sop.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="text-xs text-surface-500 dark:text-surface-400"
                        >
                          #{tag}
                        </span>
                      ))}
                      {sop.tags.length > 2 && (
                        <span className="text-xs text-surface-400">
                          +{sop.tags.length - 2}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                {!compact && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Use internal editor if no external handler provided
                        if (onEdit) {
                          onEdit(sop);
                        } else {
                          setEditingSOPId(sop._id);
                        }
                      }}
                      className="p-1 rounded hover:bg-surface-100 dark:hover:bg-surface-600 text-surface-500 hover:text-surface-700 dark:hover:text-surface-300"
                      title="Edit SOP"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget(sop);
                      }}
                      className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-surface-500 hover:text-red-600 dark:hover:text-red-400"
                      title="Delete SOP"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create New Button */}
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
        title="Delete SOP"
        description={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        isLoading={isDeleting}
      />

      {/* Markdown Editor Modal */}
      {clientId && editingSOPId && (
        <MarkdownEditorModal
          isOpen={!!editingSOPId}
          onClose={() => setEditingSOPId(null)}
          clientId={clientId}
          documentId={editingSOPId}
          isSOP
        />
      )}
    </div>
  );
}
