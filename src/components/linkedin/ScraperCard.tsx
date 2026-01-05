'use client';

import { LinkedInScraper, LinkedInScrapingMode } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import {
  Monitor,
  Laptop,
  Apple,
  Chrome,
  MoreVertical,
  Trash2,
  Shield,
  Cookie,
  AlertTriangle,
  CheckCircle,
  Clock,
  Settings,
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { useState } from 'react';

interface ScraperCardProps {
  scraper: LinkedInScraper;
  onSettings?: () => void;
  onRevoke?: () => void;
  onDelete?: () => void;
}

const platformIcons: Record<string, typeof Monitor> = {
  darwin: Apple,
  win32: Monitor,
  linux: Laptop,
  chrome: Chrome,
  extension: Chrome,
  'chrome-extension': Chrome,
};

const scrapingModeLabels: Record<LinkedInScrapingMode, string> = {
  conservative: 'Conservative',
  balanced: 'Balanced',
  aggressive: 'Aggressive',
};

const scrapingModeColors: Record<LinkedInScrapingMode, 'success' | 'primary' | 'warning'> = {
  conservative: 'success',
  balanced: 'primary',
  aggressive: 'warning',
};

export function ScraperCard({
  scraper,
  onSettings,
  onRevoke,
  onDelete,
}: ScraperCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  // Get platform icon with fallback to Monitor for unknown platforms
  const PlatformIcon = (scraper.platform && platformIcons[scraper.platform]) || Monitor;
  const isOnline = scraper.isOnlineNow || scraper.status === 'online';
  const isRevoked = scraper.status === 'revoked';

  const getCookieStatus = () => {
    if (!scraper.cookiesValid) {
      return { icon: AlertTriangle, text: 'Cookies expired', color: 'text-error-500' };
    }
    if (scraper.cookiesExpireAt) {
      const expiresIn = new Date(scraper.cookiesExpireAt).getTime() - Date.now();
      const daysUntilExpiry = Math.ceil(expiresIn / (1000 * 60 * 60 * 24));
      if (daysUntilExpiry <= 3) {
        return { icon: AlertTriangle, text: `Expires in ${daysUntilExpiry}d`, color: 'text-warning-500' };
      }
      return { icon: CheckCircle, text: 'Valid', color: 'text-success-500' };
    }
    return { icon: Clock, text: 'Unknown', color: 'text-surface-400' };
  };

  const cookieStatus = getCookieStatus();
  const CookieStatusIcon = cookieStatus.icon;

  return (
    <Card className={cn('h-full', isRevoked && 'opacity-60')}>
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          <div
            className={cn(
              'p-3 rounded-lg',
              isOnline
                ? 'bg-success-50 dark:bg-success-900/20'
                : 'bg-surface-100 dark:bg-surface-700'
            )}
          >
            <PlatformIcon
              className={cn(
                'h-6 w-6',
                isOnline
                  ? 'text-success-600 dark:text-success-400'
                  : 'text-surface-400 dark:text-surface-500'
              )}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-surface-900 dark:text-white truncate">
                {scraper.name}
              </h3>
              <div
                className={cn(
                  'w-2 h-2 rounded-full',
                  isOnline ? 'bg-success-500' : 'bg-surface-400'
                )}
              />
            </div>
            <p className="text-sm text-surface-500 dark:text-surface-400">
              {scraper.platform} • v{scraper.agentVersion || '?'}
            </p>
            {scraper.linkedInAccountEmail && (
              <p className="text-xs text-surface-400 dark:text-surface-500 truncate">
                {scraper.linkedInAccountEmail}
              </p>
            )}
          </div>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
              disabled={isRevoked}
            >
              <MoreVertical className="h-4 w-4 text-surface-500" />
            </button>
            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-surface-800 rounded-lg shadow-lg border border-surface-200 dark:border-surface-700 z-20 py-1">
                  <button
                    onClick={() => {
                      onSettings?.();
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-surface-100 dark:hover:bg-surface-700 flex items-center gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </button>
                  <button
                    onClick={() => {
                      onRevoke?.();
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-warning-600 hover:bg-warning-50 dark:hover:bg-warning-900/20 flex items-center gap-2"
                  >
                    <Shield className="h-4 w-4" />
                    Revoke Access
                  </button>
                  <hr className="my-1 border-surface-200 dark:border-surface-700" />
                  <button
                    onClick={() => {
                      onDelete?.();
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-error-600 hover:bg-error-50 dark:hover:bg-error-900/20 flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Status Badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant={isOnline ? 'success' : 'secondary'} size="sm">
            {isOnline ? 'Online' : 'Offline'}
          </Badge>
          {scraper.settings?.scrapingMode && (
            <Badge variant={scrapingModeColors[scraper.settings.scrapingMode] || 'primary'} size="sm">
              {scrapingModeLabels[scraper.settings.scrapingMode] || scraper.settings.scrapingMode}
            </Badge>
          )}
          {isRevoked && (
            <Badge variant="danger" size="sm">
              Revoked
            </Badge>
          )}
        </div>

        {/* Cookie Status */}
        <div className="flex items-center gap-2 p-3 bg-surface-50 dark:bg-surface-700/50 rounded-lg mb-4">
          <Cookie className="h-4 w-4 text-surface-500" />
          <span className="text-sm text-surface-600 dark:text-surface-400">Cookies:</span>
          <div className={cn('flex items-center gap-1', cookieStatus.color)}>
            <CookieStatusIcon className="h-4 w-4" />
            <span className="text-sm font-medium">{cookieStatus.text}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 py-3 border-t border-surface-200 dark:border-surface-700">
          <div>
            <p className="text-2xl font-bold text-surface-900 dark:text-white">
              {scraper.totalScrapeCommands}
            </p>
            <p className="text-xs text-surface-500 dark:text-surface-400">Commands Run</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-surface-900 dark:text-white">
              {scraper.totalPostsScraped.toLocaleString()}
            </p>
            <p className="text-xs text-surface-500 dark:text-surface-400">Posts Scraped</p>
          </div>
        </div>

        {/* Last Activity */}
        <div className="pt-3 border-t border-surface-200 dark:border-surface-700 space-y-1">
          {scraper.lastHeartbeatAt && (
            <p className="text-xs text-surface-500 dark:text-surface-400">
              Last heartbeat:{' '}
              {formatDistanceToNow(new Date(scraper.lastHeartbeatAt), { addSuffix: true })}
            </p>
          )}
          <p className="text-xs text-surface-500 dark:text-surface-400">
            Registered: {format(new Date(scraper.registeredAt), 'MMM d, yyyy')}
          </p>
        </div>

        {/* Settings Summary */}
        {scraper.settings && (
          <div className="mt-3 pt-3 border-t border-surface-200 dark:border-surface-700">
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-2 py-1 bg-surface-100 dark:bg-surface-700 rounded">
                Max {scraper.settings.maxPostsPerScrape ?? 20} posts
              </span>
              {scraper.settings.enableCommentScraping && (
                <span className="px-2 py-1 bg-surface-100 dark:bg-surface-700 rounded">
                  Comments
                </span>
              )}
              {scraper.settings.enableScreenshots && (
                <span className="px-2 py-1 bg-surface-100 dark:bg-surface-700 rounded">
                  Screenshots
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
