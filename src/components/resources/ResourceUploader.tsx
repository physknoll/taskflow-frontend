'use client';

import { useState, useRef, useCallback } from 'react';
import { ResourcePurpose } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { cn, formatFileSize } from '@/lib/utils';
import {
  Upload,
  Link as LinkIcon,
  GitBranch,
  X,
  File,
  FileImage,
  FileVideo,
  FileText,
  Loader2,
  Plus,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface ResourceUploaderProps {
  clientId: string;
  onUploadFiles: (
    files: File[],
    metadata: { clientId: string; purpose?: ResourcePurpose }
  ) => Promise<void>;
  onAddLink: (data: {
    url: string;
    clientId: string;
    title?: string;
    purpose?: ResourcePurpose;
  }) => Promise<void>;
  onAddGit?: (data: {
    repoUrl: string;
    clientId: string;
    branch?: string;
    pullRequestUrl?: string;
    purpose?: ResourcePurpose;
  }) => Promise<void>;
  isUploading?: boolean;
  isAddingLink?: boolean;
  isAddingGit?: boolean;
  allowedTypes?: string[];
  maxFileSize?: number; // in bytes
  maxFiles?: number;
  showGitOption?: boolean;
  compact?: boolean;
}

type AddMode = 'file' | 'link' | 'git';

const purposeOptions = [
  { value: '', label: 'No purpose' },
  { value: 'deliverable', label: 'Deliverable' },
  { value: 'reference', label: 'Reference' },
  { value: 'source_file', label: 'Source File' },
  { value: 'review_submission', label: 'Review Submission' },
];

// Get icon based on file type
function getFileIcon(file: File) {
  if (file.type.startsWith('image/')) return FileImage;
  if (file.type.startsWith('video/')) return FileVideo;
  if (file.type.includes('pdf') || file.type.includes('document'))
    return FileText;
  return File;
}

export function ResourceUploader({
  clientId,
  onUploadFiles,
  onAddLink,
  onAddGit,
  isUploading = false,
  isAddingLink = false,
  isAddingGit = false,
  allowedTypes,
  maxFileSize = 50 * 1024 * 1024, // 50MB default
  maxFiles = 10,
  showGitOption = true,
  compact = false,
}: ResourceUploaderProps) {
  const [mode, setMode] = useState<AddMode>('file');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkTitle, setLinkTitle] = useState('');
  const [gitRepoUrl, setGitRepoUrl] = useState('');
  const [gitBranch, setGitBranch] = useState('');
  const [gitPrUrl, setGitPrUrl] = useState('');
  const [purpose, setPurpose] = useState<ResourcePurpose | ''>('');
  const [isDragging, setIsDragging] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validate files
  const validateFiles = useCallback(
    (files: File[]): { valid: File[]; errors: string[] } => {
      const valid: File[] = [];
      const errors: string[] = [];

      for (const file of files) {
        if (file.size > maxFileSize) {
          errors.push(
            `${file.name} exceeds maximum size of ${formatFileSize(maxFileSize)}`
          );
          continue;
        }

        if (
          allowedTypes &&
          !allowedTypes.some(
            (type) =>
              file.type.includes(type) || file.name.endsWith(`.${type}`)
          )
        ) {
          errors.push(`${file.name} is not an allowed file type`);
          continue;
        }

        valid.push(file);
      }

      if (valid.length + selectedFiles.length > maxFiles) {
        errors.push(`Maximum ${maxFiles} files allowed`);
        return {
          valid: valid.slice(0, maxFiles - selectedFiles.length),
          errors,
        };
      }

      return { valid, errors };
    },
    [allowedTypes, maxFileSize, maxFiles, selectedFiles.length]
  );

  // Handle file selection
  const handleFileSelect = useCallback(
    (files: FileList | null) => {
      if (!files) return;

      const { valid, errors: validationErrors } = validateFiles(
        Array.from(files)
      );
      setErrors(validationErrors);
      setSelectedFiles((prev) => [...prev, ...valid]);
    },
    [validateFiles]
  );

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFileSelect(e.dataTransfer.files);
    },
    [handleFileSelect]
  );

  // Remove selected file
  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle file upload
  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    try {
      await onUploadFiles(selectedFiles, {
        clientId,
        purpose: purpose || undefined,
      });
      setSelectedFiles([]);
      setPurpose('');
      setErrors([]);
    } catch (error) {
      // Error handled by parent
    }
  };

  // Handle link submission
  const handleAddLink = async () => {
    if (!linkUrl.trim()) return;

    try {
      await onAddLink({
        url: linkUrl.trim(),
        clientId,
        title: linkTitle.trim() || undefined,
        purpose: purpose || undefined,
      });
      setLinkUrl('');
      setLinkTitle('');
      setPurpose('');
    } catch (error) {
      // Error handled by parent
    }
  };

  // Handle git submission
  const handleAddGit = async () => {
    if (!gitRepoUrl.trim() || !onAddGit) return;

    try {
      await onAddGit({
        repoUrl: gitRepoUrl.trim(),
        clientId,
        branch: gitBranch.trim() || undefined,
        pullRequestUrl: gitPrUrl.trim() || undefined,
        purpose: purpose || undefined,
      });
      setGitRepoUrl('');
      setGitBranch('');
      setGitPrUrl('');
      setPurpose('');
    } catch (error) {
      // Error handled by parent
    }
  };

  const isLoading = isUploading || isAddingLink || isAddingGit;

  // Compact mode - just buttons
  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
        >
          <Upload className="w-4 h-4 mr-1.5" />
          Upload
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setMode('link');
            setShowOptions(true);
          }}
          disabled={isLoading}
        >
          <LinkIcon className="w-4 h-4 mr-1.5" />
          Add Link
        </Button>
        {showGitOption && onAddGit && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setMode('git');
              setShowOptions(true);
            }}
            disabled={isLoading}
          >
            <GitBranch className="w-4 h-4 mr-1.5" />
            Git
          </Button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          accept={allowedTypes?.join(',')}
          onChange={(e) => handleFileSelect(e.target.files)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Mode selector */}
      <div className="flex items-center gap-1 bg-surface-100 dark:bg-surface-800 p-1 rounded-lg w-fit">
        <button
          onClick={() => setMode('file')}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
            mode === 'file'
              ? 'bg-white dark:bg-surface-700 shadow-sm text-surface-900 dark:text-white'
              : 'text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
          )}
        >
          <Upload className="w-4 h-4" />
          Upload
        </button>
        <button
          onClick={() => setMode('link')}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
            mode === 'link'
              ? 'bg-white dark:bg-surface-700 shadow-sm text-surface-900 dark:text-white'
              : 'text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
          )}
        >
          <LinkIcon className="w-4 h-4" />
          Link
        </button>
        {showGitOption && onAddGit && (
          <button
            onClick={() => setMode('git')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
              mode === 'git'
                ? 'bg-white dark:bg-surface-700 shadow-sm text-surface-900 dark:text-white'
                : 'text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
            )}
          >
            <GitBranch className="w-4 h-4" />
            Git
          </button>
        )}
      </div>

      {/* File upload mode */}
      {mode === 'file' && (
        <div className="space-y-4">
          {/* Drop zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors',
              isDragging
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                : 'border-surface-200 dark:border-surface-700 hover:border-surface-300 dark:hover:border-surface-600'
            )}
          >
            <Upload className="w-10 h-10 mx-auto mb-3 text-surface-400" />
            <p className="text-sm font-medium text-surface-700 dark:text-surface-300">
              Drop files here or click to browse
            </p>
            <p className="text-xs text-surface-400 mt-1">
              Max {formatFileSize(maxFileSize)} per file, up to {maxFiles} files
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              accept={allowedTypes?.join(',')}
              onChange={(e) => handleFileSelect(e.target.files)}
            />
          </div>

          {/* Selected files */}
          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              {selectedFiles.map((file, index) => {
                const Icon = getFileIcon(file);
                return (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-surface-50 dark:bg-surface-800 rounded-lg"
                  >
                    <Icon className="w-5 h-5 text-surface-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-surface-900 dark:text-white truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-surface-400">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="p-1 hover:bg-surface-200 dark:hover:bg-surface-700 rounded-md text-surface-400 hover:text-surface-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Errors */}
          {errors.length > 0 && (
            <div className="space-y-1">
              {errors.map((error, i) => (
                <p key={i} className="text-sm text-red-500">
                  {error}
                </p>
              ))}
            </div>
          )}

          {/* Purpose selector and upload button */}
          {selectedFiles.length > 0 && (
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <Select
                  label="Purpose (optional)"
                  options={purposeOptions}
                  value={purpose}
                  onChange={(val) => setPurpose(val as ResourcePurpose | '')}
                />
              </div>
              <Button onClick={handleUpload} disabled={isUploading}>
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload {selectedFiles.length} file
                    {selectedFiles.length > 1 ? 's' : ''}
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Link mode */}
      {mode === 'link' && (
        <div className="space-y-4">
          <Input
            label="URL"
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://www.figma.com/file/..."
          />
          <Input
            label="Title (optional)"
            value={linkTitle}
            onChange={(e) => setLinkTitle(e.target.value)}
            placeholder="Homepage Design v2"
          />
          <Select
            label="Purpose (optional)"
            options={purposeOptions}
            value={purpose}
            onChange={(val) => setPurpose(val as ResourcePurpose | '')}
          />
          <Button
            onClick={handleAddLink}
            disabled={!linkUrl.trim() || isAddingLink}
          >
            {isAddingLink ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Add Link
              </>
            )}
          </Button>
        </div>
      )}

      {/* Git mode */}
      {mode === 'git' && onAddGit && (
        <div className="space-y-4">
          <Input
            label="Repository URL"
            type="url"
            value={gitRepoUrl}
            onChange={(e) => setGitRepoUrl(e.target.value)}
            placeholder="https://github.com/org/repo"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Branch (optional)"
              value={gitBranch}
              onChange={(e) => setGitBranch(e.target.value)}
              placeholder="feature/my-branch"
            />
            <Input
              label="PR URL (optional)"
              type="url"
              value={gitPrUrl}
              onChange={(e) => setGitPrUrl(e.target.value)}
              placeholder="https://github.com/org/repo/pull/123"
            />
          </div>
          <Select
            label="Purpose (optional)"
            options={purposeOptions}
            value={purpose}
            onChange={(val) => setPurpose(val as ResourcePurpose | '')}
          />
          <Button
            onClick={handleAddGit}
            disabled={!gitRepoUrl.trim() || isAddingGit}
          >
            {isAddingGit ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Add Git Resource
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

