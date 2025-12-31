'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sopsService } from '@/services/sops.service';
import { clientsService } from '@/services/clients.service';
import toast from 'react-hot-toast';
import { debounce } from '@/lib/utils';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'unsaved' | 'error';

export interface DocumentData {
  _id: string;
  title: string;
  content: string;
  contentType: 'markdown' | 'text' | 'html';
  category?: string;
  tags?: string[];
}

export interface UseDocumentEditorOptions {
  clientId: string;
  documentId: string;
  /** Whether to enable auto-save (default: true) */
  autoSave?: boolean;
  /** Auto-save delay in ms (default: 2000) */
  autoSaveDelay?: number;
  /** Callback when save completes */
  onSaveSuccess?: () => void;
  /** Callback when save fails */
  onSaveError?: (error: Error) => void;
}

export interface UseDocumentEditorReturn {
  // Data
  document: DocumentData | null;
  title: string;
  content: string;
  
  // Status
  isLoading: boolean;
  isSaving: boolean;
  saveStatus: SaveStatus;
  hasUnsavedChanges: boolean;
  lastSavedAt: Date | null;
  
  // Actions
  setTitle: (title: string) => void;
  setContent: (content: string) => void;
  save: () => Promise<void>;
  resetChanges: () => void;
}

/**
 * Hook for loading and saving Knowledge Base documents
 * Supports both SOPs and general KB documents
 */
export function useDocumentEditor({
  clientId,
  documentId,
  autoSave = true,
  autoSaveDelay = 2000,
  onSaveSuccess,
  onSaveError,
}: UseDocumentEditorOptions): UseDocumentEditorReturn {
  const queryClient = useQueryClient();
  
  // Local state for editing
  const [title, setTitleState] = useState('');
  const [content, setContentState] = useState('');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Track original values to detect changes
  const originalTitle = useRef('');
  const originalContent = useRef('');

  // Fetch document data
  const { data: document, isLoading } = useQuery({
    queryKey: ['document', clientId, documentId],
    queryFn: async () => {
      // Use SOP service which wraps KB endpoints
      const doc = await sopsService.getSOP(clientId, documentId);
      return doc as DocumentData;
    },
    enabled: !!clientId && !!documentId,
  });

  // Initialize local state when document loads
  useEffect(() => {
    if (document) {
      setTitleState(document.title);
      setContentState(document.content || '');
      originalTitle.current = document.title;
      originalContent.current = document.content || '';
      setHasUnsavedChanges(false);
      setSaveStatus('idle');
    }
  }, [document]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async ({ title, content }: { title: string; content: string }) => {
      return sopsService.updateSOP(clientId, documentId, {
        title,
        content,
      });
    },
    onSuccess: () => {
      setSaveStatus('saved');
      setLastSavedAt(new Date());
      setHasUnsavedChanges(false);
      originalTitle.current = title;
      originalContent.current = content;
      
      // Invalidate queries to refresh lists
      queryClient.invalidateQueries({ queryKey: ['sops', clientId] });
      queryClient.invalidateQueries({ queryKey: ['knowledge-base', clientId] });
      queryClient.invalidateQueries({ queryKey: ['document', clientId, documentId] });
      
      onSaveSuccess?.();
    },
    onError: (error: Error) => {
      setSaveStatus('error');
      toast.error('Failed to save document');
      onSaveError?.(error);
    },
  });

  // Debounced auto-save function
  const debouncedSave = useRef(
    debounce(async (titleToSave: string, contentToSave: string) => {
      if (!clientId || !documentId) return;
      
      setSaveStatus('saving');
      try {
        await saveMutation.mutateAsync({ title: titleToSave, content: contentToSave });
      } catch (error) {
        // Error handled in mutation
      }
    }, autoSaveDelay)
  ).current;

  // Set title with change tracking
  const setTitle = useCallback((newTitle: string) => {
    setTitleState(newTitle);
    const changed = newTitle !== originalTitle.current || content !== originalContent.current;
    setHasUnsavedChanges(changed);
    
    if (changed) {
      setSaveStatus('unsaved');
      if (autoSave) {
        debouncedSave(newTitle, content);
      }
    }
  }, [content, autoSave, debouncedSave]);

  // Set content with change tracking
  const setContent = useCallback((newContent: string) => {
    setContentState(newContent);
    const changed = title !== originalTitle.current || newContent !== originalContent.current;
    setHasUnsavedChanges(changed);
    
    if (changed) {
      setSaveStatus('unsaved');
      if (autoSave) {
        debouncedSave(title, newContent);
      }
    }
  }, [title, autoSave, debouncedSave]);

  // Manual save function
  const save = useCallback(async () => {
    if (!hasUnsavedChanges) return;
    
    setSaveStatus('saving');
    try {
      await saveMutation.mutateAsync({ title, content });
    } catch (error) {
      // Error handled in mutation
    }
  }, [title, content, hasUnsavedChanges, saveMutation]);

  // Reset changes to original values
  const resetChanges = useCallback(() => {
    setTitleState(originalTitle.current);
    setContentState(originalContent.current);
    setHasUnsavedChanges(false);
    setSaveStatus('idle');
  }, []);

  return {
    document: document || null,
    title,
    content,
    isLoading,
    isSaving: saveMutation.isPending,
    saveStatus,
    hasUnsavedChanges,
    lastSavedAt,
    setTitle,
    setContent,
    save,
    resetChanges,
  };
}
