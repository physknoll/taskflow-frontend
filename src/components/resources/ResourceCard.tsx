'use client';

import { useState } from 'react';
import { IResource } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cn, formatFileSize, formatRelativeTime } from '@/lib/utils';
import {
  File,
  FileText,
  FileImage,
  FileVideo,
  FileArchive,
  FileCode,
  Link as LinkIcon,
  ExternalLink,
  Download,
  Trash2,
  RefreshCw,
  MoreHorizontal,
  Play,
  Maximize2,
} from 'lucide-react';
import { GitResourceBadge } from './GitResourceBadge';
import { ResourceEmbed } from './ResourceEmbed';

interface ResourceCardProps {
  resource: IResource;
  onDelete?: (id: string) => void;
  onRefresh?: (id: string) => void;
  onPreview?: (resource: IResource) => void;
  isDeleting?: boolean;
  isRefreshing?: boolean;
  compact?: boolean;
  showEmbed?: boolean;
}

// Get file type icon based on mime type
function getFileIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) return FileImage;
  if (mimeType.startsWith('video/')) return FileVideo;
  if (mimeType.startsWith('text/') || mimeType.includes('document'))
    return FileText;
  if (
    mimeType.includes('zip') ||
    mimeType.includes('tar') ||
    mimeType.includes('archive')
  )
    return FileArchive;
  if (
    mimeType.includes('javascript') ||
    mimeType.includes('json') ||
    mimeType.includes('xml') ||
    mimeType.includes('html') ||
    mimeType.includes('css')
  )
    return FileCode;
  return File;
}

// Purpose badge colors
const purposeColors: Record<string, string> = {
  deliverable: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  reference: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  source_file: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  review_submission: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
};

export function ResourceCard({
  resource,
  onDelete,
  onRefresh,
  onPreview,
  isDeleting,
  isRefreshing,
  compact = false,
  showEmbed = false,
}: ResourceCardProps) {
  const [showActions, setShowActions] = useState(false);
  const [showInlineEmbed, setShowInlineEmbed] = useState(showEmbed);

  const canEmbed =
    resource.resourceType === 'link' &&
    resource.link?.embedType === 'iframe' &&
    resource.link?.embedUrl;

  const handleExternalClick = () => {
    if (resource.resourceType === 'link' && resource.link?.url) {
      window.open(resource.link.url, '_blank', 'noopener,noreferrer');
    } else if (resource.resourceType === 'git' && resource.git?.repoUrl) {
      const url = resource.git.pullRequestUrl || resource.git.repoUrl;
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleDownload = () => {
    if (resource.resourceType === 'file') {
      // Trigger download via the API
      const downloadUrl = `/api/v1/resources/${resource._id}/download`;
      window.open(downloadUrl, '_blank');
    }
  };

  // Compact view for list displays
  if (compact) {
    return (
      <div
        className={cn(
          'group flex items-center gap-3 p-2 rounded-lg transition-colors',
          'hover:bg-surface-50 dark:hover:bg-surface-800'
        )}
      >
        {/* Provider favicon or file icon */}
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{
            backgroundColor: resource.provider.brandColor
              ? `${resource.provider.brandColor}15`
              : undefined,
          }}
        >
          {resource.provider.faviconUrl ? (
            <img
              src={resource.provider.faviconUrl}
              alt={resource.provider.name}
              className="w-5 h-5"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : resource.resourceType === 'file' && resource.file ? (
            (() => {
              const Icon = getFileIcon(resource.file.mimeType);
              return (
                <Icon className="w-4 h-4 text-surface-500 dark:text-surface-400" />
              );
            })()
          ) : (
            <LinkIcon className="w-4 h-4 text-surface-500 dark:text-surface-400" />
          )}
        </div>

        {/* Name and meta */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-surface-900 dark:text-white truncate">
            {resource.displayName}
          </p>
          <p className="text-xs text-surface-500 dark:text-surface-400">
            {resource.provider.name}
            {resource.file?.size && ` • ${formatFileSize(resource.file.size)}`}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {(resource.resourceType === 'link' ||
            resource.resourceType === 'git') && (
            <button
              onClick={handleExternalClick}
              className="p-1.5 rounded-md hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-400 hover:text-surface-600"
              title="Open in new tab"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          )}
          {resource.resourceType === 'file' && (
            <button
              onClick={handleDownload}
              className="p-1.5 rounded-md hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-400 hover:text-surface-600"
              title="Download"
            >
              <Download className="w-4 h-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(resource._id)}
              disabled={isDeleting}
              className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 text-surface-400 hover:text-red-500"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // Full card view
  return (
    <div
      className={cn(
        'group relative border border-surface-200 dark:border-surface-700 rounded-xl overflow-hidden',
        'bg-white dark:bg-surface-800 transition-shadow hover:shadow-md'
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Thumbnail / Preview area */}
      {resource.link?.thumbnailUrl && (
        <div className="relative aspect-video bg-surface-100 dark:bg-surface-900">
          <img
            src={resource.link.thumbnailUrl}
            alt={resource.displayName}
            className="w-full h-full object-cover"
          />
          {canEmbed && (
            <button
              onClick={() => setShowInlineEmbed(!showInlineEmbed)}
              className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                <Play className="w-6 h-6 text-surface-900 ml-0.5" />
              </div>
            </button>
          )}
        </div>
      )}

      {/* Inline embed */}
      {showInlineEmbed && canEmbed && (
        <div className="relative">
          <ResourceEmbed resource={resource} />
          <button
            onClick={() => setShowInlineEmbed(false)}
            className="absolute top-2 right-2 p-1.5 rounded-md bg-black/50 text-white hover:bg-black/70"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        {/* Header with provider info */}
        <div className="flex items-start gap-3">
          {/* Provider icon */}
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{
              backgroundColor: resource.provider.brandColor
                ? `${resource.provider.brandColor}15`
                : 'var(--surface-100)',
            }}
          >
            {resource.provider.faviconUrl ? (
              <img
                src={resource.provider.faviconUrl}
                alt={resource.provider.name}
                className="w-6 h-6"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : resource.resourceType === 'file' && resource.file ? (
              (() => {
                const Icon = getFileIcon(resource.file.mimeType);
                return (
                  <Icon className="w-5 h-5 text-surface-500 dark:text-surface-400" />
                );
              })()
            ) : (
              <LinkIcon className="w-5 h-5 text-surface-500 dark:text-surface-400" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-surface-900 dark:text-white truncate">
              {resource.displayName}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <span
                className="text-xs font-medium capitalize"
                style={{ color: resource.provider.brandColor }}
              >
                {resource.provider.name}
              </span>
              <span className="text-xs text-surface-400">•</span>
              <span className="text-xs text-surface-500 dark:text-surface-400 capitalize">
                {resource.provider.category.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Actions menu */}
          <div
            className={cn(
              'flex items-center gap-1 transition-opacity',
              showActions ? 'opacity-100' : 'opacity-0'
            )}
          >
            {canEmbed && (
              <button
                onClick={() => onPreview?.(resource)}
                className="p-1.5 rounded-md hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-400 hover:text-surface-600"
                title="Preview"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            )}
            {(resource.resourceType === 'link' ||
              resource.resourceType === 'git') && (
              <>
                <button
                  onClick={handleExternalClick}
                  className="p-1.5 rounded-md hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-400 hover:text-surface-600"
                  title="Open in new tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
                {onRefresh && (
                  <button
                    onClick={() => onRefresh(resource._id)}
                    disabled={isRefreshing}
                    className="p-1.5 rounded-md hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-400 hover:text-surface-600"
                    title="Refresh metadata"
                  >
                    <RefreshCw
                      className={cn('w-4 h-4', isRefreshing && 'animate-spin')}
                    />
                  </button>
                )}
              </>
            )}
            {resource.resourceType === 'file' && (
              <button
                onClick={handleDownload}
                className="p-1.5 rounded-md hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-400 hover:text-surface-600"
                title="Download"
              >
                <Download className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(resource._id)}
                disabled={isDeleting}
                className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 text-surface-400 hover:text-red-500"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Description */}
        {resource.description && (
          <p className="mt-3 text-sm text-surface-600 dark:text-surface-400 line-clamp-2">
            {resource.description}
          </p>
        )}

        {/* Link title and description */}
        {resource.link?.title && resource.link.title !== resource.displayName && (
          <p className="mt-3 text-sm text-surface-600 dark:text-surface-400 line-clamp-2">
            {resource.link.description || resource.link.title}
          </p>
        )}

        {/* Git resource details */}
        {resource.resourceType === 'git' && resource.git && (
          <div className="mt-3">
            <GitResourceBadge git={resource.git} provider={resource.provider} />
          </div>
        )}

        {/* File details */}
        {resource.resourceType === 'file' && resource.file && (
          <div className="mt-3 flex items-center gap-2 text-xs text-surface-500 dark:text-surface-400">
            <span>{resource.file.mimeType}</span>
            <span>•</span>
            <span>{formatFileSize(resource.file.size)}</span>
          </div>
        )}

        {/* Footer with purpose and timestamp */}
        <div className="mt-3 pt-3 border-t border-surface-100 dark:border-surface-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {resource.aiContext?.purpose && (
              <Badge
                size="sm"
                className={purposeColors[resource.aiContext.purpose] || ''}
              >
                {resource.aiContext.purpose.replace('_', ' ')}
              </Badge>
            )}
          </div>
          <span className="text-xs text-surface-400">
            {formatRelativeTime(resource.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
}




