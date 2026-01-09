'use client';

import { LinkedInScraper, LinkedInScrapingMode, AgentType, ScrapingPlatform } from '@/types';
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
  Globe,
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { useState } from 'react';

interface ScraperCardProps {
  scraper: LinkedInScraper;
  /** @deprecated Scraper settings are now configured at the Source level */
  onSettings?: () => void;
  onRevoke?: () => void;
  onDelete?: () => void;
}

// Map agent types and platforms to icons
const agentTypeIcons: Record<string, typeof Monitor> = {
  chrome_extension: Chrome,
  electron_app: Monitor,
};

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

// Platform labels for display
const platformLabels: Record<ScrapingPlatform, string> = {
  linkedin: 'LinkedIn',
  reddit: 'Reddit',
  youtube: 'YouTube',
  website: 'Website',
};

export function ScraperCard({
  scraper,
  onSettings,
  onRevoke,
  onDelete,
}: ScraperCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  // Get platform icon - check agentType first (new API), then fall back to platform (legacy)
  const getIcon = () => {
    if (scraper.agentType && agentTypeIcons[scraper.agentType]) {
      return agentTypeIcons[scraper.agentType];
    }
    if (scraper.platform && platformIcons[scraper.platform]) {
      return platformIcons[scraper.platform];
    }
    return Monitor;
  };
  
  const PlatformIcon = getIcon();
  const isOnline = scraper.isOnlineNow || scraper.status === 'online';
  const isRevoked = scraper.status === 'revoked';

  // Get cookie status - check new API fields first, then legacy
  const getCookieStatus = () => {
    // New API structure: platformCredentials.linkedin.cookiesValid
    const linkedinCreds = scraper.platformCredentials?.linkedin;
    const cookiesValid = linkedinCreds?.cookiesValid ?? scraper.cookiesValid;
    
    if (cookiesValid === false) {
      return { icon: AlertTriangle, text: 'Cookies expired', color: 'text-error-500' };
    }
    if (cookiesValid === true) {
      if (scraper.cookiesExpireAt) {
        const expiresIn = new Date(scraper.cookiesExpireAt).getTime() - Date.now();
        const daysUntilExpiry = Math.ceil(expiresIn / (1000 * 60 * 60 * 24));
        if (daysUntilExpiry <= 3) {
          return { icon: AlertTriangle, text: `Expires in ${daysUntilExpiry}d`, color: 'text-warning-500' };
        }
      }
      return { icon: CheckCircle, text: 'Valid', color: 'text-success-500' };
    }
    return { icon: Clock, text: 'Unknown', color: 'text-surface-400' };
  };

  const cookieStatus = getCookieStatus();
  const CookieStatusIcon = cookieStatus.icon;

  // Get account email - check new API first, then legacy
  const getAccountEmail = () => {
    return scraper.platformCredentials?.linkedin?.accountEmail ?? scraper.linkedInAccountEmail;
  };

  // Get stats - check new API first, then legacy
  const getTotalCommands = () => scraper.stats?.totalCommands ?? scraper.totalScrapeCommands ?? 0;
  const getTotalItemsScraped = () => scraper.stats?.totalItemsScraped ?? scraper.totalPostsScraped ?? 0;

  // Get agent type display text
  const getAgentTypeDisplay = () => {
    if (scraper.agentType) {
      return scraper.agentType === 'chrome_extension' ? 'Chrome Extension' : 'Desktop App';
    }
    return scraper.platform || 'Unknown';
  };

  const accountEmail = getAccountEmail();

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
              {getAgentTypeDisplay()} • v{scraper.agentVersion || '?'}
            </p>
            {accountEmail && (
              <p className="text-xs text-surface-400 dark:text-surface-500 truncate">
                {accountEmail}
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
          {/* Show supported platforms if available */}
          {scraper.supportedPlatforms && scraper.supportedPlatforms.length > 1 && (
            <Badge variant="outline" size="sm" className="flex items-center gap-1">
              <Globe className="h-3 w-3" />
              {scraper.supportedPlatforms.length} platforms
            </Badge>
          )}
        </div>

        {/* Cookie Status - only show for LinkedIn scrapers */}
        {(scraper.platformCredentials?.linkedin || scraper.cookiesValid !== undefined) && (
          <div className="flex items-center gap-2 p-3 bg-surface-50 dark:bg-surface-700/50 rounded-lg mb-4">
            <Cookie className="h-4 w-4 text-surface-500" />
            <span className="text-sm text-surface-600 dark:text-surface-400">Cookies:</span>
            <div className={cn('flex items-center gap-1', cookieStatus.color)}>
              <CookieStatusIcon className="h-4 w-4" />
              <span className="text-sm font-medium">{cookieStatus.text}</span>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 py-3 border-t border-surface-200 dark:border-surface-700">
          <div>
            <p className="text-2xl font-bold text-surface-900 dark:text-white">
              {getTotalCommands()}
            </p>
            <p className="text-xs text-surface-500 dark:text-surface-400">Commands Run</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-surface-900 dark:text-white">
              {getTotalItemsScraped().toLocaleString()}
            </p>
            <p className="text-xs text-surface-500 dark:text-surface-400">Items Scraped</p>
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

        {/* 
          Settings Summary removed - scraper settings are now deprecated.
          Settings are configured at the Source level instead.
        */}

        {/* Current Platform indicator */}
        {scraper.currentPlatform && (
          <div className="mt-3 pt-3 border-t border-surface-200 dark:border-surface-700">
            <p className="text-xs text-surface-500 dark:text-surface-400">
              Currently scraping: <span className="font-medium">{platformLabels[scraper.currentPlatform] || scraper.currentPlatform}</span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
