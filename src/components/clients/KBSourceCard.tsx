'use client';

import { KnowledgeBaseSource, KB_SOURCE_TYPES } from '@/types/kb-sources';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Dropdown, DropdownItem, DropdownDivider } from '@/components/ui/Dropdown';
import { cn, formatDate } from '@/lib/utils';
import {
  Globe,
  RefreshCw,
  Edit2,
  Trash2,
  ExternalLink,
  MoreVertical,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Pause,
  Play,
  FileText,
  History,
  Link,
} from 'lucide-react';

interface KBSourceCardProps {
  source: KnowledgeBaseSource;
  canManage: boolean;
  onEdit: () => void;
  onSync: () => void;
  onViewUrls: () => void;
  onViewHistory: () => void;
  onToggleSync: () => void;
  onDelete: () => void;
}

export function KBSourceCard({
  source,
  canManage,
  onEdit,
  onSync,
  onViewUrls,
  onViewHistory,
  onToggleSync,
  onDelete,
}: KBSourceCardProps) {
  const sourceTypeInfo = KB_SOURCE_TYPES.find((t) => t.value === source.sourceType);

  // Status indicator color and icon
  const getStatusInfo = () => {
    if (!source.syncEnabled) {
      return {
        color: 'text-surface-400',
        bgColor: 'bg-surface-100 dark:bg-surface-700',
        icon: Pause,
        label: 'Disabled',
      };
    }

    switch (source.lastSyncStatus) {
      case 'success':
        return {
          color: 'text-green-500',
          bgColor: 'bg-green-100 dark:bg-green-900/30',
          icon: CheckCircle,
          label: 'Synced',
        };
      case 'partial':
        return {
          color: 'text-amber-500',
          bgColor: 'bg-amber-100 dark:bg-amber-900/30',
          icon: AlertTriangle,
          label: 'Partial',
        };
      case 'failed':
        return {
          color: 'text-red-500',
          bgColor: 'bg-red-100 dark:bg-red-900/30',
          icon: XCircle,
          label: 'Failed',
        };
      case 'never':
      default:
        return {
          color: 'text-surface-400',
          bgColor: 'bg-surface-100 dark:bg-surface-700',
          icon: Clock,
          label: 'Never synced',
        };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  // Calculate time until next sync
  const getNextSyncTime = () => {
    if (!source.syncEnabled || !source.lastSyncAt) return null;
    
    const lastSync = new Date(source.lastSyncAt);
    const nextSync = new Date(lastSync.getTime() + source.syncIntervalHours * 60 * 60 * 1000);
    const now = new Date();
    
    if (nextSync <= now) return 'Due now';
    
    const diffMs = nextSync.getTime() - now.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    
    if (diffHours > 0) {
      return `in ${diffHours}h ${diffMinutes % 60}m`;
    }
    return `in ${diffMinutes}m`;
  };

  // Time since last sync
  const getTimeSinceLastSync = () => {
    if (!source.lastSyncAt) return null;
    
    const lastSync = new Date(source.lastSyncAt);
    const now = new Date();
    const diffMs = now.getTime() - lastSync.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
      return `${diffDays}d ago`;
    }
    if (diffHours > 0) {
      return `${diffHours}h ago`;
    }
    if (diffMinutes > 0) {
      return `${diffMinutes}m ago`;
    }
    return 'Just now';
  };

  return (
    <div className="bg-white dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700 p-6">
      <div className="flex items-start gap-4">
        {/* Status Indicator */}
        <div
          className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center',
            statusInfo.bgColor
          )}
        >
          <StatusIcon className={cn('h-6 w-6', statusInfo.color)} />
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-surface-900 dark:text-white truncate">
              {source.name}
            </h4>
            <Badge variant="secondary" size="sm">
              {sourceTypeInfo?.label || source.sourceType}
            </Badge>
            {!source.syncEnabled && (
              <Badge variant="secondary" size="sm" className="bg-surface-200 dark:bg-surface-600">
                Paused
              </Badge>
            )}
          </div>

          {/* URL */}
          <a
            href={source.sitemapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-surface-500 hover:text-primary-600 flex items-center gap-1 truncate"
          >
            {source.sitemapUrl}
            <ExternalLink className="h-3 w-3 flex-shrink-0" />
          </a>

          {/* Stats */}
          <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-surface-500">
            {source.lastSyncAt && (
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Last sync: {getTimeSinceLastSync()}
              </span>
            )}
            
            <span className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              {source.syncedUrls} synced
              {source.failedUrls > 0 && (
                <span className="text-red-500">• {source.failedUrls} failed</span>
              )}
              {source.pendingUrls > 0 && (
                <span className="text-amber-500">• {source.pendingUrls} pending</span>
              )}
            </span>

            {source.syncEnabled && getNextSyncTime() && (
              <span className="flex items-center gap-1">
                <RefreshCw className="h-4 w-4" />
                Next sync: {getNextSyncTime()}
              </span>
            )}
          </div>

          {/* Error Message */}
          {source.lastSyncStatus === 'failed' && source.lastSyncError && (
            <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                {source.lastSyncError}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {canManage && (
            <Button
              variant="outline"
              size="sm"
              onClick={onSync}
              disabled={!source.syncEnabled}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {source.lastSyncStatus === 'failed' ? 'Retry' : 'Sync Now'}
            </Button>
          )}
          
          <Dropdown
            trigger={
              <button className="p-2 rounded-lg text-surface-500 hover:text-surface-700 hover:bg-surface-100 dark:hover:text-surface-300 dark:hover:bg-surface-700 transition-colors">
                <MoreVertical className="h-5 w-5" />
              </button>
            }
            align="right"
          >
            <DropdownItem icon={<Link className="h-4 w-4" />} onClick={onViewUrls}>
              View URLs
            </DropdownItem>
            <DropdownItem icon={<History className="h-4 w-4" />} onClick={onViewHistory}>
              View History
            </DropdownItem>
            {canManage && (
              <>
                <DropdownDivider />
                <DropdownItem icon={<Edit2 className="h-4 w-4" />} onClick={onEdit}>
                  Edit
                </DropdownItem>
                <DropdownItem
                  icon={source.syncEnabled ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  onClick={onToggleSync}
                >
                  {source.syncEnabled ? 'Disable Sync' : 'Enable Sync'}
                </DropdownItem>
                <DropdownDivider />
                <DropdownItem icon={<Trash2 className="h-4 w-4" />} onClick={onDelete} variant="danger">
                  Delete
                </DropdownItem>
              </>
            )}
          </Dropdown>
        </div>
      </div>
    </div>
  );
}
