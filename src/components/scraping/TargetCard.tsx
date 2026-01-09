'use client';

import { ScrapeTarget, PLATFORM_LABELS, PLATFORM_COLORS } from '@/types/scraping';
import { Card, CardContent } from '@/components/ui/Card';
import {
  Linkedin,
  Globe,
  MessageCircle,
  MoreVertical,
  Settings,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';

interface TargetCardProps {
  target: ScrapeTarget;
  onEdit?: () => void;
  onDelete?: () => void;
  compact?: boolean;
}

// Reddit icon component (lucide doesn't have it)
function RedditIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      className={className}
      style={style}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm6.066 13.29c.073.353.11.717.11 1.09 0 3.5-4.075 6.34-9.1 6.34s-9.1-2.84-9.1-6.34c0-.373.037-.737.11-1.09a1.79 1.79 0 01-.725-1.435c0-.99.804-1.79 1.795-1.79.46 0 .88.175 1.196.462 1.18-.762 2.77-1.24 4.523-1.305l.855-4.032c.024-.117.089-.219.183-.287a.453.453 0 01.324-.064l2.88.612a1.27 1.27 0 112.406.282l.001.003c0 .703-.57 1.273-1.274 1.273-.703 0-1.273-.57-1.273-1.273l-2.582-.55-.765 3.608c1.715.076 3.27.554 4.427 1.303a1.79 1.79 0 011.196-.462c.99 0 1.795.8 1.795 1.79 0 .61-.305 1.148-.766 1.472zM8.054 13.5c-.703 0-1.273.57-1.273 1.273s.57 1.273 1.273 1.273 1.273-.57 1.273-1.273-.57-1.273-1.273-1.273zm7.892 0c-.703 0-1.273.57-1.273 1.273s.57 1.273 1.273 1.273 1.273-.57 1.273-1.273-.57-1.273-1.273-1.273zm-6.59 4.16c-.13.13-.13.34 0 .47 1.136 1.136 3.152 1.225 4.394 0 .13-.13.13-.34 0-.47-.13-.13-.34-.13-.47 0-.9.9-2.51.9-3.41 0-.13-.13-.34-.13-.47 0z" />
    </svg>
  );
}

export function TargetCard({ target, onEdit, onDelete, compact }: TargetCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const getPlatformIcon = () => {
    switch (target.platform) {
      case 'linkedin':
        return <Linkedin className="h-5 w-5" style={{ color: PLATFORM_COLORS.linkedin }} />;
      case 'reddit':
        return <RedditIcon className="h-5 w-5" style={{ color: PLATFORM_COLORS.reddit }} />;
      case 'website':
        return <Globe className="h-5 w-5" style={{ color: PLATFORM_COLORS.website }} />;
    }
  };

  const getSettingsPreview = () => {
    switch (target.platform) {
      case 'linkedin': {
        const settings = target.settings as any;
        return `${settings.maxPosts || 20} posts, ${settings.scrapingMode || 'balanced'} mode`;
      }
      case 'reddit': {
        const settings = target.settings as any;
        return `r/${settings.subreddit}, ${settings.sortBy}, ${settings.maxPosts} posts`;
      }
      case 'website': {
        const settings = target.settings as any;
        return `${settings.maxPages || 5} pages, ${settings.scrollDepth || 3} scroll depth`;
      }
    }
  };

  const getPriorityColor = () => {
    switch (target.priority) {
      case 'high':
        return 'bg-error-100 text-error-700 dark:bg-error-900/30 dark:text-error-300';
      case 'low':
        return 'bg-surface-100 text-surface-600 dark:bg-surface-700 dark:text-surface-400';
      default:
        return 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300';
    }
  };

  const getStatusIndicator = () => {
    if (target.consecutiveFailures > 2) {
      return <XCircle className="h-4 w-4 text-error-500" />;
    }
    if (target.consecutiveFailures > 0) {
      return <AlertCircle className="h-4 w-4 text-warning-500" />;
    }
    if (target.lastScrapedAt) {
      return <CheckCircle className="h-4 w-4 text-success-500" />;
    }
    return null;
  };

  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3 bg-surface-50 dark:bg-surface-800 rounded-lg">
        {getPlatformIcon()}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-surface-900 dark:text-white truncate">
            {target.targetName}
          </p>
          <p className="text-xs text-surface-500 truncate">{target.url}</p>
        </div>
        {getStatusIndicator()}
      </div>
    );
  }

  return (
    <Card className="relative">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${PLATFORM_COLORS[target.platform]}15` }}
            >
              {getPlatformIcon()}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-surface-900 dark:text-white truncate">
                  {target.targetName}
                </h4>
                {!target.enabled && (
                  <span className="px-1.5 py-0.5 text-xs bg-surface-100 dark:bg-surface-700 text-surface-500 rounded">
                    Disabled
                  </span>
                )}
              </div>
              <p className="text-xs text-surface-500">
                {PLATFORM_LABELS[target.platform]}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 text-xs font-medium rounded ${getPriorityColor()}`}>
              {target.priority}
            </span>
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
              >
                <MoreVertical className="h-4 w-4 text-surface-500" />
              </button>
              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-surface-800 rounded-lg shadow-lg border border-surface-200 dark:border-surface-700 py-1 z-20">
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onEdit?.();
                      }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-surface-50 dark:hover:bg-surface-700 flex items-center gap-2"
                    >
                      <Settings className="h-4 w-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onDelete?.();
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-error-600 hover:bg-error-50 dark:hover:bg-error-900/20 flex items-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* URL */}
        <a
          href={target.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1 text-sm text-primary-600 dark:text-primary-400 hover:underline mb-3 truncate"
        >
          <span className="truncate">{target.url}</span>
          <ExternalLink className="h-3 w-3 flex-shrink-0" />
        </a>

        {/* Settings Preview */}
        <p className="text-xs text-surface-500 mb-3">{getSettingsPreview()}</p>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-surface-500 pt-3 border-t border-surface-100 dark:border-surface-700">
          <div className="flex items-center gap-1">
            {getStatusIndicator()}
            <span>
              {target.lastScrapedAt
                ? `Last: ${formatDistanceToNow(new Date(target.lastScrapedAt), { addSuffix: true })}`
                : 'Never scraped'}
            </span>
          </div>
          <span>{target.totalScrapes} scrapes</span>
        </div>
      </CardContent>
    </Card>
  );
}
