'use client';

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Editor } from '@tiptap/react';
import { MarkdownEditor } from './MarkdownEditor';
import { EditorToolbar } from './EditorToolbar';
import { useDocumentEditor, SaveStatus } from '@/hooks/useDocumentEditor';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { cn, formatRelativeTime } from '@/lib/utils';
import {
  X,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  Clock,
  FileText,
} from 'lucide-react';

export interface MarkdownEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  documentId: string;
  /** Optional document title for display before loading */
  documentTitle?: string;
  /** Whether this is an SOP document */
  isSOP?: boolean;
}

function SaveStatusIndicator({ status, lastSavedAt }: { status: SaveStatus; lastSavedAt: Date | null }) {
  const statusConfig = {
    idle: {
      icon: null,
      text: '',
      className: '',
    },
    saving: {
      icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />,
      text: 'Saving...',
      className: 'text-surface-500',
    },
    saved: {
      icon: <CheckCircle className="h-3.5 w-3.5" />,
      text: lastSavedAt ? `Saved ${formatRelativeTime(lastSavedAt)}` : 'Saved',
      className: 'text-green-600 dark:text-green-400',
    },
    unsaved: {
      icon: <Clock className="h-3.5 w-3.5" />,
      text: 'Unsaved changes',
      className: 'text-amber-600 dark:text-amber-400',
    },
    error: {
      icon: <AlertCircle className="h-3.5 w-3.5" />,
      text: 'Save failed',
      className: 'text-red-600 dark:text-red-400',
    },
  };

  const config = statusConfig[status];
  
  if (!config.text) return null;

  return (
    <div className={cn('flex items-center gap-1.5 text-sm', config.className)}>
      {config.icon}
      <span>{config.text}</span>
    </div>
  );
}

export function MarkdownEditorModal({
  isOpen,
  onClose,
  clientId,
  documentId,
  documentTitle,
  isSOP = false,
}: MarkdownEditorModalProps) {
  const [editor, setEditor] = useState<Editor | null>(null);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isRawMode, setIsRawMode] = useState(false);

  // Ensure we only render portal on client
  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    document: documentData,
    title,
    content,
    isLoading,
    isSaving,
    saveStatus,
    hasUnsavedChanges,
    lastSavedAt,
    isInitialized,
    setTitle,
    setContent,
    save,
  } = useDocumentEditor({
    clientId,
    documentId,
    autoSave: true,
    autoSaveDelay: 2000,
    onSaveSuccess: () => {
      // Could show a toast here, but the indicator is enough
    },
  });

  // Callbacks defined before useEffect that uses them
  const handleClose = useCallback(() => {
    if (hasUnsavedChanges) {
      setShowCloseConfirm(true);
    } else {
      onClose();
    }
  }, [hasUnsavedChanges, onClose]);

  const handleConfirmClose = useCallback(() => {
    setShowCloseConfirm(false);
    onClose();
  }, [onClose]);

  const handleSaveAndClose = useCallback(async () => {
    await save();
    setShowCloseConfirm(false);
    onClose();
  }, [save, onClose]);

  const handleEditorReady = useCallback((editorInstance: Editor) => {
    setEditor(editorInstance);
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + S to save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        save();
      }
      // Escape to close (with confirmation if unsaved)
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, save, handleClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      const originalPaddingRight = document.body.style.paddingRight;
      
      // Get scrollbar width
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      
      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalPaddingRight;
      };
    }
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <>
      {/* Full Screen Modal */}
      <div 
        className="fixed top-0 left-0 right-0 bottom-0 z-[9999] flex flex-col bg-white dark:bg-surface-900"
        style={{ height: '100vh', width: '100vw' }}
      >
        {/* Header */}
        <header className="flex-shrink-0 flex items-center justify-between gap-4 px-6 py-4 border-b border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/50">
                <FileText className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              </div>
              {isSOP && (
                <Badge variant="secondary" size="sm">
                  SOP
                </Badge>
              )}
            </div>

            {isLoading ? (
              <div className="flex-1">
                <div className="h-8 bg-surface-200 dark:bg-surface-700 rounded animate-pulse w-64" />
              </div>
            ) : (
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Document title..."
                className="flex-1 max-w-xl text-lg font-semibold border-none bg-transparent focus:ring-0 px-0"
              />
            )}
          </div>

          <div className="flex items-center gap-4">
            <SaveStatusIndicator status={saveStatus} lastSavedAt={lastSavedAt} />
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={save}
                disabled={!hasUnsavedChanges || isSaving}
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save
              </Button>

              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleClose}
                title="Close (Esc)"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Editor Container - takes remaining height */}
        <div className="flex-1 min-h-0 overflow-hidden">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary-500 mx-auto mb-4" />
                <p className="text-surface-500">Loading document...</p>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col max-w-5xl mx-auto w-full px-6">
              {/* Toolbar */}
              <div className="flex-shrink-0 mt-4">
                <EditorToolbar 
                  editor={editor} 
                  className="rounded-t-lg" 
                  isRawMode={isRawMode}
                  onToggleRawMode={() => setIsRawMode(!isRawMode)}
                />
              </div>

              {/* Editor - scrollable area */}
              <div className="flex-1 min-h-0 overflow-y-auto mb-6">
                {isRawMode ? (
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Enter raw markdown..."
                    className="w-full h-full p-4 font-mono text-sm rounded-lg rounded-t-none border border-t-0 border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-white placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                    spellCheck={false}
                  />
                ) : (
                  <MarkdownEditor
                    initialContent={content}
                    onChange={setContent}
                    onEditorReady={handleEditorReady}
                    placeholder="Start writing your document..."
                    className="h-full"
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Close Confirmation Modal */}
      {showCloseConfirm && (
        <div className="fixed top-0 left-0 right-0 bottom-0 z-[10000] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowCloseConfirm(false)}
          />
          <div className="relative bg-white dark:bg-surface-800 rounded-xl shadow-xl p-6 max-w-md w-full mx-4 animate-scale-in">
            <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-2">
              Unsaved Changes
            </h3>
            <p className="text-surface-600 dark:text-surface-400 mb-6">
              You have unsaved changes. Would you like to save before closing?
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="ghost"
                onClick={() => setShowCloseConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="outline"
                onClick={handleConfirmClose}
              >
                Discard Changes
              </Button>
              <Button onClick={handleSaveAndClose} isLoading={isSaving}>
                Save & Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );

  // Use portal to render at document body level
  return createPortal(modalContent, document.body);
}
