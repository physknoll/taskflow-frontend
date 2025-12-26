'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Guideline, UpdateGuidelineDto, ProjectType } from '@/types';
import { useGuidelines } from '@/hooks/useGuidelines';
import { PROJECT_TYPES } from '@/lib/constants';
import {
  Eye,
  Code,
  Save,
  X,
  Loader2,
  FileText,
  SplitSquareVertical,
} from 'lucide-react';

type ViewMode = 'edit' | 'preview' | 'split';

interface GuidelineEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  guideline: Guideline | null;
  onSaved?: () => void;
}

export function GuidelineEditorModal({
  isOpen,
  onClose,
  guideline,
  onSaved,
}: GuidelineEditorModalProps) {
  const { updateGuideline, isUpdating } = useGuidelines();

  const [name, setName] = useState('');
  const [projectType, setProjectType] = useState<ProjectType>('other');
  const [content, setContent] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('split');

  // Initialize form when guideline changes
  useEffect(() => {
    if (guideline) {
      setName(guideline.name);
      setProjectType(guideline.projectType);
      setContent(guideline.content);
    }
  }, [guideline]);

  const handleSave = async () => {
    if (!guideline || !name.trim()) return;

    try {
      await updateGuideline(guideline._id, {
        name: name.trim(),
        projectType,
        content,
      });
      onSaved?.();
      onClose();
    } catch {
      // Error handled in hook
    }
  };

  const handleClose = () => {
    setName('');
    setProjectType('other');
    setContent('');
    setViewMode('split');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit Guideline"
      size="full"
      className="!max-w-6xl"
    >
      <div className="flex flex-col h-[70vh]">
        {/* Top Bar - Name, Type, View Mode */}
        <div className="flex items-center gap-4 pb-4 border-b border-surface-200 dark:border-surface-700">
          <div className="flex-1">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Guideline name"
              className="text-lg font-medium"
            />
          </div>
          <div className="w-48">
            <Select
              options={PROJECT_TYPES.map((t) => ({
                value: t.id,
                label: `${t.icon} ${t.label}`,
              }))}
              value={projectType}
              onChange={(val) => setProjectType(val as ProjectType)}
            />
          </div>
          
          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 p-1 bg-surface-100 dark:bg-surface-700 rounded-lg">
            <button
              onClick={() => setViewMode('edit')}
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'edit'
                  ? 'bg-white dark:bg-surface-600 shadow-sm text-surface-900 dark:text-white'
                  : 'text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
              }`}
              title="Edit only"
            >
              <Code className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'split'
                  ? 'bg-white dark:bg-surface-600 shadow-sm text-surface-900 dark:text-white'
                  : 'text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
              }`}
              title="Split view"
            >
              <SplitSquareVertical className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'preview'
                  ? 'bg-white dark:bg-surface-600 shadow-sm text-surface-900 dark:text-white'
                  : 'text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
              }`}
              title="Preview only"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 flex gap-4 py-4 min-h-0">
          {/* Edit Panel */}
          {(viewMode === 'edit' || viewMode === 'split') && (
            <div
              className={`flex flex-col ${
                viewMode === 'split' ? 'w-1/2' : 'w-full'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Code className="w-4 h-4 text-surface-500" />
                <span className="text-xs font-medium text-surface-500 uppercase tracking-wider">
                  Markdown
                </span>
              </div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="flex-1 w-full p-4 rounded-lg border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-white font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Write your SOP content in markdown..."
              />
            </div>
          )}

          {/* Preview Panel */}
          {(viewMode === 'preview' || viewMode === 'split') && (
            <div
              className={`flex flex-col ${
                viewMode === 'split' ? 'w-1/2' : 'w-full'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-4 h-4 text-surface-500" />
                <span className="text-xs font-medium text-surface-500 uppercase tracking-wider">
                  Preview
                </span>
              </div>
              <div className="flex-1 p-4 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 overflow-y-auto">
                {content ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:text-surface-900 dark:prose-headings:text-white prose-p:text-surface-700 dark:prose-p:text-surface-300 prose-li:text-surface-700 dark:prose-li:text-surface-300">
                    <ReactMarkdown>{content}</ReactMarkdown>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-surface-400 dark:text-surface-500">
                    <FileText className="w-8 h-8 mb-2 opacity-50" />
                    <p className="text-sm">Preview will appear here</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-surface-200 dark:border-surface-700">
          <Button variant="outline" onClick={handleClose}>
            <X className="w-4 h-4 mr-1.5" />
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim()} isLoading={isUpdating}>
            {isUpdating ? (
              <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-1.5" />
            )}
            Save Changes
          </Button>
        </div>
      </div>
    </Modal>
  );
}





