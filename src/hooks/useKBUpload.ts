'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useSocket } from '@/components/providers/SocketProvider';
import { KBUploadStartedData, KBUploadProgressData, KBUploadCompleteData } from '@/lib/socket';
import { clientsService } from '@/services/clients.service';
import toast from 'react-hot-toast';

export interface UploadProgress {
  batchId: string;
  completed: number;
  failed: number;
  total: number;
  percentage: number;
  currentFile?: string;
  currentFileStatus?: 'completed' | 'failed';
  isComplete: boolean;
  errors: Array<{ filename: string; error: string }>;
}

export interface FileUploadItem {
  file: File;
  id: string;
  status: 'pending' | 'queued' | 'uploading' | 'completed' | 'failed';
  error?: string;
  batchId?: string;
}

interface UseKBUploadOptions {
  onComplete?: () => void;
}

const BATCH_SIZE = 100;

export function useKBUpload(clientId: string, options?: UseKBUploadOptions) {
  const { isConnected, subscribeToKBUpload } = useSocket();
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [files, setFiles] = useState<FileUploadItem[]>([]);
  const activeBatchIds = useRef<Set<string>>(new Set());
  const onCompleteRef = useRef(options?.onComplete);

  // Keep callback ref updated
  useEffect(() => {
    onCompleteRef.current = options?.onComplete;
  }, [options?.onComplete]);

  // Subscribe to KB upload events via the SocketProvider
  useEffect(() => {
    console.log('🔌 KB Upload Hook: Subscribing to events for client:', clientId);

    const unsubscribe = subscribeToKBUpload({
      onStarted: (data: KBUploadStartedData) => {
        console.log('📤 KB Upload Hook - Started:', data);
        
        // Only handle events for our client
        if (data.clientId !== clientId) {
          console.log('📤 KB Upload Hook: Ignoring event for different client', data.clientId, 'vs', clientId);
          return;
        }
        
        activeBatchIds.current.add(data.batchId);
        setIsUploading(true);
        setProgress({
          batchId: data.batchId,
          completed: 0,
          failed: 0,
          total: data.totalFiles,
          percentage: 0,
          isComplete: false,
          errors: [],
        });

        // Update file statuses for this batch
        setFiles((prev) =>
          prev.map((f) =>
            f.batchId === data.batchId ? { ...f, status: 'queued' } : f
          )
        );
      },

      onProgress: (data: KBUploadProgressData) => {
        console.log('📤 KB Upload Hook - Progress:', data);
        
        if (!activeBatchIds.current.has(data.batchId)) {
          // Check if we should track this batch (might have missed the started event)
          console.log('📤 KB Upload Hook: Received progress for batch we might have missed:', data.batchId);
        }

        // Always update progress if we have files uploading
        setProgress((prev) => {
          // If no previous progress, create one
          if (!prev) {
            return {
              batchId: data.batchId,
              completed: data.completed,
              failed: data.failed,
              total: data.total,
              percentage: Math.round(((data.completed + data.failed) / data.total) * 100),
              currentFile: data.filename,
              currentFileStatus: data.status,
              isComplete: false,
              errors: [],
            };
          }
          return {
            ...prev,
            completed: data.completed,
            failed: data.failed,
            total: data.total,
            percentage: Math.round(((data.completed + data.failed) / data.total) * 100),
            currentFile: data.filename,
            currentFileStatus: data.status,
            isComplete: false,
          };
        });

        // Update individual file status by matching filename
        setFiles((prev) =>
          prev.map((f) => {
            // Match by filename regardless of batch
            if (f.file.name === data.filename) {
              return {
                ...f,
                status: data.status,
                error: data.status === 'failed' ? 'Upload failed' : undefined,
              };
            }
            return f;
          })
        );
      },

      onComplete: (data: KBUploadCompleteData) => {
        console.log('📤 KB Upload Hook - Complete:', data);
        
        activeBatchIds.current.delete(data.batchId);
        
        // Check if all batches are complete
        const allBatchesComplete = activeBatchIds.current.size === 0;

        setProgress((prev) =>
          prev
            ? {
                ...prev,
                completed: data.completed,
                failed: data.failed,
                total: data.total,
                percentage: 100,
                isComplete: true,
                errors: data.errors,
              }
            : {
                batchId: data.batchId,
                completed: data.completed,
                failed: data.failed,
                total: data.total,
                percentage: 100,
                isComplete: true,
                errors: data.errors,
                currentFile: undefined,
                currentFileStatus: undefined,
              }
        );

        // Update file statuses - mark all as completed unless in error list
        setFiles((prev) =>
          prev.map((f) => {
            const error = data.errors.find(
              (e) => e.filename === f.file.name || f.file.name.includes(e.filename)
            );
            if (error) {
              return { ...f, status: 'failed', error: error.error };
            }
            // If not in errors and not already failed, mark as completed
            if (f.status !== 'failed' && f.status !== 'completed') {
              return { ...f, status: 'completed' };
            }
            return f;
          })
        );

        if (allBatchesComplete) {
          setIsUploading(false);

          // Show toast
          if (data.failed > 0) {
            toast.error(`Upload complete: ${data.completed} succeeded, ${data.failed} failed`);
          } else {
            toast.success(`All ${data.completed} files uploaded successfully!`);
          }

          // Trigger callback
          onCompleteRef.current?.();
        }
      },
    });

    return () => {
      console.log('🔌 KB Upload Hook: Unsubscribing from events');
      unsubscribe();
    };
  }, [clientId, subscribeToKBUpload]);

  // Upload files in batches
  const uploadFiles = useCallback(
    async (filesToUpload: File[], category: string) => {
      if (filesToUpload.length === 0) return;

      console.log('📤 KB Upload: Starting upload of', filesToUpload.length, 'files');
      setIsUploading(true);

      // Initialize file items
      const newFileItems: FileUploadItem[] = filesToUpload.map((file) => ({
        file,
        id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
        status: 'pending',
      }));
      setFiles(newFileItems);

      // Split into batches of 100
      const batches: File[][] = [];
      for (let i = 0; i < filesToUpload.length; i += BATCH_SIZE) {
        batches.push(filesToUpload.slice(i, i + BATCH_SIZE));
      }

      console.log('📤 KB Upload: Split into', batches.length, 'batches');

      // Upload each batch
      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        try {
          console.log('📤 KB Upload: Uploading batch', i + 1, 'of', batches.length);
          const result = await clientsService.uploadBatch(clientId, batch, category);
          console.log('📤 KB Upload: Batch uploaded, batchId:', result.batchId);

          // Associate batch ID with files and track it
          activeBatchIds.current.add(result.batchId);
          
          setFiles((prev) => {
            const batchFileNames = batch.map((f) => f.name);
            return prev.map((f) =>
              batchFileNames.includes(f.file.name) && !f.batchId
                ? { ...f, batchId: result.batchId, status: 'queued' }
                : f
            );
          });
        } catch (error: any) {
          console.error('📤 KB Upload: Batch upload failed:', error);
          // Mark batch files as failed
          const batchFileNames = batch.map((f) => f.name);
          setFiles((prev) =>
            prev.map((f) =>
              batchFileNames.includes(f.file.name)
                ? {
                    ...f,
                    status: 'failed',
                    error: error.response?.data?.message || 'Upload failed',
                  }
                : f
            )
          );
          toast.error(
            `Batch ${i + 1} upload failed: ${error.response?.data?.message || 'Unknown error'}`
          );
        }
      }
    },
    [clientId]
  );

  // Cancel upload
  const cancelUpload = useCallback(async () => {
    console.log('📤 KB Upload: Cancelling upload');
    const batchIdsArray = Array.from(activeBatchIds.current);
    for (const batchId of batchIdsArray) {
      try {
        await clientsService.cancelBatch(clientId, batchId);
      } catch (error) {
        console.error('Failed to cancel batch:', error);
      }
    }
    activeBatchIds.current.clear();
    setIsUploading(false);
    setFiles((prev) =>
      prev.map((f) =>
        f.status === 'queued' || f.status === 'uploading'
          ? { ...f, status: 'pending' }
          : f
      )
    );
    setProgress(null);
  }, [clientId]);

  // Reset state
  const reset = useCallback(() => {
    setFiles([]);
    setProgress(null);
    setIsUploading(false);
    activeBatchIds.current.clear();
  }, []);

  // Calculate stats
  const stats = {
    total: files.length,
    pending: files.filter((f) => f.status === 'pending').length,
    queued: files.filter((f) => f.status === 'queued').length,
    uploading: files.filter((f) => f.status === 'uploading').length,
    completed: files.filter((f) => f.status === 'completed').length,
    failed: files.filter((f) => f.status === 'failed').length,
  };

  return {
    progress,
    isUploading,
    files,
    setFiles,
    stats,
    uploadFiles,
    cancelUpload,
    reset,
    isSocketConnected: isConnected,
  };
}

