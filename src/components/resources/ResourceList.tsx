'use client';

import { useState } from 'react';
import { IResource, ResourceCategory } from '@/types';
import { ResourceCard } from './ResourceCard';
import { ResourceEmbed, ResourceEmbedFullscreen } from './ResourceEmbed';
import { cn } from '@/lib/utils';
import {
  File,
  Link as LinkIcon,
  Video,
  Palette,
  Code,
  Cloud,
  FileText,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  Grid,
  List,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

interface ResourceListProps {
  resources: IResource[];
  onDelete?: (id: string) => void;
  onRefresh?: (id: string) => void;
  isDeleting?: boolean;
  isRefreshing?: boolean;
  emptyMessage?: string;
  groupBy?: 'none' | 'type' | 'category';
  defaultView?: 'grid' | 'list';
  showViewToggle?: boolean;
  compact?: boolean;
}

// Category icons and labels
const categoryConfig: Record<
  ResourceCategory,
  { icon: typeof File; label: string; color: string }
> = {
  video: {
    icon: Video,
    label: 'Videos',
    color: 'text-red-500',
  },
  design: {
    icon: Palette,
    label: 'Design',
    color: 'text-purple-500',
  },
  code: {
    icon: Code,
    label: 'Code',
    color: 'text-emerald-500',
  },
  cloud_storage: {
    icon: Cloud,
    label: 'Cloud Storage',
    color: 'text-blue-500',
  },
  docs: {
    icon: FileText,
    label: 'Documents',
    color: 'text-amber-500',
  },
  other: {
    icon: File,
    label: 'Other',
    color: 'text-surface-500',
  },
};

// Type icons
const typeIcons = {
  file: File,
  link: LinkIcon,
  git: Code,
  integration: Cloud,
};

export function ResourceList({
  resources,
  onDelete,
  onRefresh,
  isDeleting,
  isRefreshing,
  emptyMessage = 'No resources attached',
  groupBy = 'none',
  defaultView = 'grid',
  showViewToggle = true,
  compact = false,
}: ResourceListProps) {
  const [view, setView] = useState<'grid' | 'list'>(defaultView);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(['video', 'design', 'code', 'cloud_storage', 'docs', 'other', 'file', 'link', 'git', 'integration'])
  );
  const [previewResource, setPreviewResource] = useState<IResource | null>(null);

  const toggleGroup = (group: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(group)) {
        next.delete(group);
      } else {
        next.add(group);
      }
      return next;
    });
  };

  // Empty state
  if (resources.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <File className="w-10 h-10 text-surface-300 dark:text-surface-600 mb-3" />
        <p className="text-sm text-surface-500 dark:text-surface-400">
          {emptyMessage}
        </p>
      </div>
    );
  }

  // Group resources
  const groupResources = () => {
    if (groupBy === 'category') {
      const groups: Record<ResourceCategory, IResource[]> = {
        video: [],
        design: [],
        code: [],
        cloud_storage: [],
        docs: [],
        other: [],
      };
      resources.forEach((r) => {
        groups[r.provider.category].push(r);
      });
      return groups;
    }

    if (groupBy === 'type') {
      const groups: Record<string, IResource[]> = {
        file: [],
        link: [],
        git: [],
        integration: [],
      };
      resources.forEach((r) => {
        groups[r.resourceType].push(r);
      });
      return groups;
    }

    return null;
  };

  const groupedResources = groupResources();

  // Render a single resource
  const renderResource = (resource: IResource) => (
    <ResourceCard
      key={resource._id}
      resource={resource}
      onDelete={onDelete}
      onRefresh={onRefresh}
      onPreview={setPreviewResource}
      isDeleting={isDeleting}
      isRefreshing={isRefreshing}
      compact={compact || view === 'list'}
    />
  );

  // Render grouped resources
  const renderGroupedResources = () => {
    if (!groupedResources) return null;

    return Object.entries(groupedResources).map(([key, items]) => {
      if (items.length === 0) return null;

      const config =
        groupBy === 'category'
          ? categoryConfig[key as ResourceCategory]
          : {
              icon: typeIcons[key as keyof typeof typeIcons],
              label: key.charAt(0).toUpperCase() + key.slice(1) + 's',
              color: 'text-surface-500',
            };

      const Icon = config.icon;
      const isExpanded = expandedGroups.has(key);

      return (
        <div key={key} className="space-y-3">
          {/* Group header */}
          <button
            onClick={() => toggleGroup(key)}
            className="w-full flex items-center justify-between py-2 text-sm font-medium text-surface-700 dark:text-surface-300 hover:text-surface-900 dark:hover:text-white"
          >
            <div className="flex items-center gap-2">
              <Icon className={cn('w-4 h-4', config.color)} />
              <span>{config.label}</span>
              <Badge variant="secondary" size="sm">
                {items.length}
              </Badge>
            </div>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {/* Group content */}
          {isExpanded && (
            <div
              className={cn(
                view === 'grid' && !compact
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                  : 'space-y-1'
              )}
            >
              {items.map(renderResource)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="space-y-4">
      {/* View toggle */}
      {showViewToggle && !compact && groupBy === 'none' && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-surface-500 dark:text-surface-400">
            {resources.length} {resources.length === 1 ? 'resource' : 'resources'}
          </span>
          <div className="flex items-center gap-1 bg-surface-100 dark:bg-surface-800 p-1 rounded-lg">
            <button
              onClick={() => setView('grid')}
              className={cn(
                'p-1.5 rounded-md transition-colors',
                view === 'grid'
                  ? 'bg-white dark:bg-surface-700 shadow-sm'
                  : 'text-surface-400 hover:text-surface-600'
              )}
              title="Grid view"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView('list')}
              className={cn(
                'p-1.5 rounded-md transition-colors',
                view === 'list'
                  ? 'bg-white dark:bg-surface-700 shadow-sm'
                  : 'text-surface-400 hover:text-surface-600'
              )}
              title="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Resources */}
      {groupBy !== 'none' ? (
        <div className="space-y-6">{renderGroupedResources()}</div>
      ) : (
        <div
          className={cn(
            view === 'grid' && !compact
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
              : 'space-y-1'
          )}
        >
          {resources.map(renderResource)}
        </div>
      )}

      {/* Preview modal */}
      {previewResource && (
        <ResourceEmbedFullscreen
          resource={previewResource}
          onClose={() => setPreviewResource(null)}
        />
      )}
    </div>
  );
}

// Compact inline list for sidebars
export function ResourceListInline({
  resources,
  onDelete,
  maxItems = 5,
  showMore = true,
}: {
  resources: IResource[];
  onDelete?: (id: string) => void;
  maxItems?: number;
  showMore?: boolean;
}) {
  const [showAll, setShowAll] = useState(false);
  const displayResources = showAll ? resources : resources.slice(0, maxItems);
  const hasMore = resources.length > maxItems;

  if (resources.length === 0) {
    return (
      <p className="text-sm text-surface-400 py-2">No resources attached</p>
    );
  }

  return (
    <div className="space-y-1">
      {displayResources.map((resource) => (
        <ResourceCard
          key={resource._id}
          resource={resource}
          onDelete={onDelete}
          compact
        />
      ))}
      {hasMore && showMore && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full py-2 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
        >
          {showAll
            ? 'Show less'
            : `Show ${resources.length - maxItems} more`}
        </button>
      )}
    </div>
  );
}


