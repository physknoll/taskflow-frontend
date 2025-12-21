'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Progress } from '@/components/ui/Progress';
import { Badge } from '@/components/ui/Badge';
import { SUGGESTED_KB_CATEGORIES } from '@/services/clients.service';
import { useKBUpload, FileUploadItem } from '@/hooks/useKBUpload';
import { useKBCategories } from '@/hooks/useClients';
import { cn } from '@/lib/utils';
import {
  Upload,
  FolderOpen,
  X,
  File,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  Search,
  Trash2,
  Clock,
  Wifi,
  WifiOff,
} from 'lucide-react';
import toast from 'react-hot-toast';

// Allowed file extensions
const ALLOWED_EXTENSIONS = ['.txt', '.md', '.html', '.json', '.pdf'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

interface LocalFileItem {
  file: File;
  id: string;
}

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  onUploadComplete: () => void;
}

export function BulkUploadModal({
  isOpen,
  onClose,
  clientId,
  onUploadComplete,
}: BulkUploadModalProps) {
  const [localFiles, setLocalFiles] = useState<LocalFileItem[]>([]);
  const [category, setCategory] = useState('general');
  const [isDragging, setIsDragging] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  // Fetch dynamic categories from backend
  const { data: backendCategories = [] } = useKBCategories(clientId);

  // Use the WebSocket-based upload hook
  const {
    progress,
    isUploading,
    files: uploadedFiles,
    stats: uploadStats,
    uploadFiles,
    cancelUpload,
    reset,
    isSocketConnected,
  } = useKBUpload(clientId, {
    onComplete: onUploadComplete,
  });

  // Filter files by extension
  const filterValidFiles = useCallback((fileList: FileList | File[]): File[] => {
    const validFiles: File[] = [];
    const filesArray = Array.from(fileList);

    for (const file of filesArray) {
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} exceeds 10MB limit`);
        continue;
      }
      validFiles.push(file);
    }

    return validFiles;
  }, []);

  // Add files to the local list
  const addFiles = useCallback(
    (newFiles: File[]) => {
      const validFiles = filterValidFiles(newFiles);
      const newFileItems: LocalFileItem[] = validFiles.map((file) => ({
        file,
        id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
      }));

      setLocalFiles((prev) => [...prev, ...newFileItems]);

      if (validFiles.length > 0) {
        toast.success(`Added ${validFiles.length} file${validFiles.length > 1 ? 's' : ''}`);
      }
    },
    [filterValidFiles]
  );

  // Handle file input change
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files));
    }
    e.target.value = '';
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const items = e.dataTransfer.items;
    const filePromises: Promise<File[]>[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.kind === 'file') {
        const entry = item.webkitGetAsEntry?.();
        if (entry) {
          filePromises.push(traverseFileTree(entry));
        } else {
          const file = item.getAsFile();
          if (file) {
            filePromises.push(Promise.resolve([file]));
          }
        }
      }
    }

    Promise.all(filePromises).then((results) => {
      const allFiles = results.flat();
      addFiles(allFiles);
    });
  };

  // Traverse file tree for folder drops
  const traverseFileTree = (entry: FileSystemEntry): Promise<File[]> => {
    return new Promise((resolve) => {
      if (entry.isFile) {
        (entry as FileSystemFileEntry).file((file) => {
          resolve([file]);
        });
      } else if (entry.isDirectory) {
        const dirReader = (entry as FileSystemDirectoryEntry).createReader();
        const files: File[] = [];

        const readEntries = () => {
          dirReader.readEntries(async (entries) => {
            if (entries.length === 0) {
              resolve(files);
            } else {
              for (const ent of entries) {
                const subFiles = await traverseFileTree(ent);
                files.push(...subFiles);
              }
              readEntries();
            }
          });
        };

        readEntries();
      } else {
        resolve([]);
      }
    });
  };

  // Remove a file from the local list
  const removeFile = (fileId: string) => {
    setLocalFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  // Clear all local files
  const clearFiles = () => {
    setLocalFiles([]);
  };

  // Start upload
  const startUpload = async () => {
    if (localFiles.length === 0) {
      toast.error('No files to upload');
      return;
    }

    const filesToUpload = localFiles.map((f) => f.file);
    setLocalFiles([]); // Clear local files since they'll be tracked by the hook
    await uploadFiles(filesToUpload, category);
  };

  // Handle cancel
  const handleCancel = async () => {
    await cancelUpload();
  };

  // Get display files - either local (before upload) or from hook (during/after upload)
  const displayFiles: (FileUploadItem | LocalFileItem)[] = isUploading || uploadedFiles.length > 0 ? uploadedFiles : localFiles;

  // Filter files by search query
  const filteredFiles = displayFiles.filter((f) => {
    return f.file.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Calculate stats
  const localStats = {
    total: localFiles.length,
    pending: localFiles.length,
    totalSize: localFiles.reduce((acc, f) => acc + f.file.size, 0),
  };

  const stats = isUploading || uploadedFiles.length > 0 ? uploadStats : localStats;
  
  // Check if upload is truly complete (all files are either completed or failed)
  const isUploadComplete = uploadedFiles.length > 0 && 
    uploadedFiles.every((f) => f.status === 'completed' || f.status === 'failed');
  
  // Calculate overall progress - use 100% if complete, otherwise use progress percentage
  const overallProgress = isUploadComplete ? 100 : (progress?.percentage || 0);

  // Format file size
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Get status icon
  const getStatusIcon = (status: FileUploadItem['status'] | 'pending') => {
    switch (status) {
      case 'pending':
        return <File className="w-4 h-4 text-surface-400" />;
      case 'queued':
        return <Clock className="w-4 h-4 text-amber-500" />;
      case 'uploading':
        return <Loader2 className="w-4 h-4 text-primary-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <File className="w-4 h-4 text-surface-400" />;
    }
  };

  // Get status badge
  const getStatusBadge = (status: FileUploadItem['status'] | 'pending') => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="secondary" size="sm">
            Pending
          </Badge>
        );
      case 'queued':
        return (
          <Badge variant="secondary" size="sm" className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
            Queued
          </Badge>
        );
      case 'uploading':
        return (
          <Badge variant="primary" size="sm">
            Uploading
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant="success" size="sm">
            Completed
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="danger" size="sm">
            Failed
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" size="sm">
            Pending
          </Badge>
        );
    }
  };

  // Reset state when modal closes
  const handleClose = () => {
    if (isUploading) {
      if (!confirm('Upload in progress. Are you sure you want to close?')) {
        return;
      }
      handleCancel();
    }
    setLocalFiles([]);
    setSearchQuery('');
    setCategory('general');
    reset();
    onClose();
  };

  // Get file item data uniformly
  const getFileData = (item: LocalFileItem | FileUploadItem) => {
    if ('status' in item) {
      return {
        id: item.id,
        file: item.file,
        status: item.status,
        error: item.error,
      };
    }
    return {
      id: item.id,
      file: item.file,
      status: 'pending' as const,
      error: undefined,
    };
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Bulk Upload Files"
      description={`Upload multiple files to the knowledge base. Supported formats: ${ALLOWED_EXTENSIONS.join(', ')}`}
      size="xl"
      disableContentScroll
    >
      <div className="flex flex-col h-[70vh]">
        {/* Connection Status */}
        <div className={cn(
          "flex items-center gap-2 px-3 py-2 mb-4 rounded-lg text-xs",
          isSocketConnected 
            ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300" 
            : "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300"
        )}>
          {isSocketConnected ? (
            <>
              <Wifi className="w-3.5 h-3.5" />
              <span>Real-time updates enabled</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5" />
              <span>Connecting to real-time updates...</span>
              <Loader2 className="w-3 h-3 animate-spin ml-auto" />
            </>
          )}
        </div>

        {/* Drop Zone */}
        {!isUploading && uploadedFiles.length === 0 && (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              'relative border-2 border-dashed rounded-xl p-6 text-center transition-colors mb-4',
              isDragging
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                : 'border-surface-200 dark:border-surface-700 hover:border-surface-300 dark:hover:border-surface-600'
            )}
          >
            <Upload className="w-10 h-10 mx-auto mb-3 text-surface-400" />
            <p className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
              Drag and drop files or folders here
            </p>
            <p className="text-xs text-surface-400 mb-4">or use the buttons below to select</p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                <FileText className="w-4 h-4 mr-2" />
                Select Files
              </Button>
              <Button variant="outline" size="sm" onClick={() => folderInputRef.current?.click()}>
                <FolderOpen className="w-4 h-4 mr-2" />
                Select Folder
              </Button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={ALLOWED_EXTENSIONS.join(',')}
              onChange={handleFileSelect}
              className="hidden"
            />
            <input
              ref={folderInputRef}
              type="file"
              // @ts-ignore - webkitdirectory is not in types
              webkitdirectory=""
              directory=""
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        )}

        {/* Stats and Controls */}
        {displayFiles.length > 0 && (
          <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
            <div className="flex items-center gap-4 text-sm">
              <span className="text-surface-600 dark:text-surface-400">
                <strong>{stats.total}</strong> files
                {'totalSize' in stats && ` (${formatSize(stats.totalSize)})`}
              </span>
              {'pending' in stats && stats.pending > 0 && (
                <span className="text-surface-500">{stats.pending} pending</span>
              )}
              {'queued' in stats && stats.queued > 0 && (
                <span className="text-amber-500">{stats.queued} queued</span>
              )}
              {'uploading' in stats && stats.uploading > 0 && (
                <span className="text-primary-500">{stats.uploading} uploading</span>
              )}
              {'completed' in stats && stats.completed > 0 && (
                <span className="text-green-500">{stats.completed} completed</span>
              )}
              {'failed' in stats && stats.failed > 0 && (
                <span className="text-red-500">{stats.failed} failed</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                <input
                  type="text"
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-1.5 text-sm rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              {!isUploading && localFiles.length > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFiles}>
                  <Trash2 className="w-4 h-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Real-time Progress Indicator */}
        {(isUploading || isUploadComplete) && (
          <div className={cn(
            "mb-4 p-3 rounded-xl",
            isUploadComplete
              ? "bg-green-50 dark:bg-green-900/20"
              : isSocketConnected 
                ? "bg-primary-50 dark:bg-primary-900/20" 
                : "bg-amber-50 dark:bg-amber-900/20"
          )}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {isUploadComplete ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : isSocketConnected ? (
                  <Wifi className="w-4 h-4 text-primary-500 animate-pulse" />
                ) : (
                  <Wifi className="w-4 h-4 text-amber-500" />
                )}
                <span className="text-sm font-medium text-surface-700 dark:text-surface-300">
                  {isUploadComplete 
                    ? 'Upload Complete!' 
                    : isSocketConnected 
                      ? 'Real-time Progress' 
                      : 'Waiting for connection...'}
                </span>
                {!isSocketConnected && !isUploadComplete && (
                  <Badge variant="secondary" size="sm" className="bg-amber-100 text-amber-700">
                    Reconnecting
                  </Badge>
                )}
              </div>
              <span className="text-sm text-surface-500">
                {uploadStats.completed + uploadStats.failed} / {uploadStats.total} ({overallProgress}%)
              </span>
            </div>
            <Progress
              value={overallProgress}
              variant={isUploadComplete ? (uploadStats.failed > 0 ? 'warning' : 'success') : (progress?.failed || 0) > 0 ? 'warning' : 'default'}
              size="md"
            />
            {!isUploadComplete && progress?.currentFile && (
              <p className="text-xs text-surface-500 mt-2">
                {progress.currentFileStatus === 'completed' ? '✓' : progress.currentFileStatus === 'failed' ? '✗' : '→'}{' '}
                {progress.currentFile}
              </p>
            )}
            {isUploadComplete && uploadStats.failed > 0 && (
              <p className="text-xs text-amber-600 mt-2">
                {uploadStats.failed} file{uploadStats.failed !== 1 ? 's' : ''} failed to upload
              </p>
            )}
          </div>
        )}

        {/* File List */}
        <div className="flex-1 overflow-y-auto border border-surface-200 dark:border-surface-700 rounded-xl">
          {filteredFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-surface-400 py-12">
              <FolderOpen className="w-12 h-12 mb-3 opacity-50" />
              <p className="text-sm">
                {displayFiles.length === 0
                  ? 'No files selected. Drag and drop or use the buttons above.'
                  : 'No files match your search.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-surface-200 dark:divide-surface-700">
              {filteredFiles.map((item) => {
                const { id, file, status, error } = getFileData(item);
                return (
                  <div
                    key={id}
                    className={cn(
                      'flex items-center gap-3 p-3 transition-colors',
                      status === 'completed' && 'bg-green-50/50 dark:bg-green-900/10',
                      status === 'failed' && 'bg-red-50/50 dark:bg-red-900/10',
                      status !== 'completed' && status !== 'failed' && 'hover:bg-surface-50 dark:hover:bg-surface-800/50'
                    )}
                  >
                    {getStatusIcon(status)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-surface-900 dark:text-white truncate">
                          {file.name}
                        </p>
                        {getStatusBadge(status)}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-surface-400">{formatSize(file.size)}</span>
                        {error && <span className="text-xs text-red-500 truncate">{error}</span>}
                      </div>
                      {(status === 'uploading' || status === 'queued') && (
                        <Progress value={status === 'uploading' ? 50 : 0} variant="default" size="sm" animated className="mt-2" />
                      )}
                    </div>
                    {status === 'pending' && !isUploading && (
                      <button
                        onClick={() => removeFile(id)}
                        className="p-1.5 rounded-lg text-surface-400 hover:text-red-500 hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-4 mt-4 pt-4 border-t border-surface-200 dark:border-surface-700">
          <Select
            options={(() => {
              // Combine existing categories with suggested categories
              const existingOptions = backendCategories.map(cat => {
                const suggested = SUGGESTED_KB_CATEGORIES.find(s => s.id === cat);
                return {
                  value: cat,
                  label: suggested ? `${suggested.icon} ${suggested.label}` : `📁 ${cat}`,
                };
              });
              // Add suggested categories that don't exist yet
              const suggestedOptions = SUGGESTED_KB_CATEGORIES
                .filter(s => !backendCategories.includes(s.id))
                .map(s => ({ value: s.id, label: `${s.icon} ${s.label} (new)` }));
              return [...existingOptions, ...suggestedOptions];
            })()}
            value={category}
            onChange={setCategory}
            className="w-48"
            disabled={isUploading}
            openUpward
          />

          <div className="flex gap-3">
            {isUploadComplete ? (
              <Button onClick={handleClose}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Done
              </Button>
            ) : isUploading ? (
              <Button variant="destructive" onClick={handleCancel}>
                Cancel Upload
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button onClick={startUpload} disabled={localFiles.length === 0}>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload {localFiles.length} File{localFiles.length !== 1 ? 's' : ''}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}

