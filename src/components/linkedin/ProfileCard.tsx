'use client';

import { LinkedInProfile, LinkedInProfileType, LinkedInScraper, ScrapingPlatform, SourceStatus } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import {
  RefreshCw,
  MoreVertical,
  ExternalLink,
  Pause,
  Play,
  Trash2,
  Edit,
  AlertCircle,
  CheckCircle,
  Clock,
  ChevronDown,
  Monitor,
  Star,
  Globe,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';

interface ProfileCardProps {
  profile: LinkedInProfile;
  onEdit?: () => void;
  onScrape?: (scraperId?: string) => void;
  onScrapeWithSelection?: () => void;
  onDelete?: () => void;
  onToggleMonitoring?: () => void;
  isScraping?: boolean;
  showActions?: boolean;
  scrapers?: LinkedInScraper[];
}

const profileTypeLabels: Record<LinkedInProfileType, string> = {
  own: 'Own',
  competitor: 'Competitor',
  industry: 'Industry',
  prospect: 'Prospect',
};

const profileTypeColors: Record<LinkedInProfileType, 'primary' | 'warning' | 'secondary' | 'success'> = {
  own: 'primary',
  competitor: 'warning',
  industry: 'secondary',
  prospect: 'success',
};

// Platform display config
const platformLabels: Record<ScrapingPlatform, string> = {
  linkedin: 'LinkedIn',
  reddit: 'Reddit',
  youtube: 'YouTube',
  website: 'Website',
};

const platformColors: Record<ScrapingPlatform, string> = {
  linkedin: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  reddit: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  youtube: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  website: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
};

export function ProfileCard({
  profile,
  onEdit,
  onScrape,
  onScrapeWithSelection,
  onDelete,
  onToggleMonitoring,
  isScraping,
  showActions = true,
  scrapers = [],
}: ProfileCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showScrapeMenu, setShowScrapeMenu] = useState(false);

  const onlineScrapers = scrapers.filter((s) => s.isOnlineNow);
  const preferredScraper = scrapers.find((s) => s._id === profile.preferredScraperId);
  const hasMultipleScrapers = onlineScrapers.length > 1;

  // Get display name - check new API first (name), then legacy (displayName)
  const getDisplayName = () => profile.name || profile.displayName || 'Unknown';
  
  // Get headline - check new API first (metadata.headline), then legacy (headline)
  const getHeadline = () => profile.metadata?.headline || profile.headline;
  
  // Get avatar - check new API first (metadata.avatarUrl), then legacy (avatarUrl)
  const getAvatarUrl = () => profile.metadata?.avatarUrl || profile.avatarUrl;
  
  // Get username/platformId
  const getUsername = () => profile.platformId || profile.username;
  
  // Get last scraped at - check new API first (stats.lastScrapedAt), then legacy
  const getLastScrapedAt = () => profile.stats?.lastScrapedAt || profile.lastScrapedAt;
  
  // Get total items collected - check new API first (stats.totalItemsScraped), then legacy
  const getTotalItems = () => profile.stats?.totalItemsScraped ?? profile.totalPostsCollected ?? 0;
  
  // Get scrape interval - check new API first (scrapeSettings.frequency), then legacy
  const getInterval = () => {
    if (profile.scrapeSettings?.frequency) {
      // Parse frequency string like "60m" or "daily"
      const freq = profile.scrapeSettings.frequency;
      if (freq === 'daily') return '24h';
      if (freq === 'hourly') return '1h';
      return freq;
    }
    if (profile.scrapeSchedule?.intervalMinutes) {
      return `${profile.scrapeSchedule.intervalMinutes}m`;
    }
    return '-';
  };
  
  // Check if monitoring is enabled - check new API first (status), then legacy
  const isMonitoringEnabled = () => {
    if (profile.status) {
      return profile.status === 'active';
    }
    return profile.monitoringEnabled ?? true;
  };

  const getStatusIcon = () => {
    // Check new API status first
    if (profile.status) {
      switch (profile.status) {
        case 'active':
          return <CheckCircle className="h-4 w-4 text-success-500" />;
        case 'error':
          return <AlertCircle className="h-4 w-4 text-error-500" />;
        case 'paused':
          return <Pause className="h-4 w-4 text-warning-500" />;
        default:
          return <Clock className="h-4 w-4 text-surface-400" />;
      }
    }
    // Fall back to legacy lastScrapeStatus
    switch (profile.lastScrapeStatus) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-success-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-error-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-warning-500" />;
      default:
        return <Clock className="h-4 w-4 text-surface-400" />;
    }
  };

  const getClientName = () => {
    if (!profile.clientId) return null;
    if (typeof profile.clientId === 'string') return null;
    return profile.clientId.name;
  };

  // Get external URL label based on platform
  const getExternalLinkLabel = () => {
    if (profile.platform) {
      return `View on ${platformLabels[profile.platform]}`;
    }
    return 'View on LinkedIn';
  };

  const displayName = getDisplayName();
  const headline = getHeadline();
  const avatarUrl = getAvatarUrl();
  const username = getUsername();
  const lastScrapedAt = getLastScrapedAt();
  const monitoringEnabled = isMonitoringEnabled();

  return (
    <Card hover className="h-full">
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          <Avatar
            firstName={displayName}
            lastName=""
            src={avatarUrl}
            size="lg"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-surface-900 dark:text-white truncate">
                {displayName}
              </h3>
              {profile.profileType && (
                <Badge
                  variant={profileTypeColors[profile.profileType]}
                  size="sm"
                >
                  {profileTypeLabels[profile.profileType]}
                </Badge>
              )}
              {/* Show platform badge for multi-platform support */}
              {profile.platform && profile.platform !== 'linkedin' && (
                <span className={cn('text-xs px-2 py-0.5 rounded-full', platformColors[profile.platform])}>
                  {platformLabels[profile.platform]}
                </span>
              )}
            </div>
            {headline && (
              <p className="text-sm text-surface-500 dark:text-surface-400 truncate mt-1">
                {headline}
              </p>
            )}
            {username && (
              <p className="text-xs text-surface-400 dark:text-surface-500 mt-1">
                @{username}
              </p>
            )}
          </div>
          {showActions && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
              >
                <MoreVertical className="h-4 w-4 text-surface-500" />
              </button>
              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-surface-800 rounded-lg shadow-lg border border-surface-200 dark:border-surface-700 z-20 py-1">
                    <button
                      onClick={() => {
                        onEdit?.();
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-surface-100 dark:hover:bg-surface-700 flex items-center gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      Edit Source
                    </button>
                    <button
                      onClick={() => {
                        onToggleMonitoring?.();
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-surface-100 dark:hover:bg-surface-700 flex items-center gap-2"
                    >
                      {monitoringEnabled ? (
                        <>
                          <Pause className="h-4 w-4" />
                          Pause Monitoring
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4" />
                          Resume Monitoring
                        </>
                      )}
                    </button>
                    <a
                      href={profile.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full px-4 py-2 text-left text-sm hover:bg-surface-100 dark:hover:bg-surface-700 flex items-center gap-2"
                      onClick={() => setShowMenu(false)}
                    >
                      <ExternalLink className="h-4 w-4" />
                      {getExternalLinkLabel()}
                    </a>
                    <hr className="my-1 border-surface-200 dark:border-surface-700" />
                    <button
                      onClick={() => {
                        onDelete?.();
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-error-600 hover:bg-error-50 dark:hover:bg-error-900/20 flex items-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete Source
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 py-3 border-t border-surface-200 dark:border-surface-700">
          <div>
            <p className="text-2xl font-bold text-surface-900 dark:text-white">
              {getTotalItems()}
            </p>
            <p className="text-xs text-surface-500 dark:text-surface-400">Items Collected</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-surface-900 dark:text-white">
              {getInterval()}
            </p>
            <p className="text-xs text-surface-500 dark:text-surface-400">Interval</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-surface-200 dark:border-surface-700">
          <div className="flex items-center gap-2 text-sm text-surface-500 dark:text-surface-400">
            {getStatusIcon()}
            <span>
              {lastScrapedAt
                ? formatDistanceToNow(new Date(lastScrapedAt), { addSuffix: true })
                : 'Never scraped'}
            </span>
          </div>
          {showActions && (
            <div className="relative flex items-center">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onScrape?.()}
                disabled={isScraping || !monitoringEnabled}
                className={cn(
                  'flex items-center gap-1',
                  hasMultipleScrapers && 'rounded-r-none border-r-0'
                )}
              >
                <RefreshCw className={cn('h-3 w-3', isScraping && 'animate-spin')} />
                {isScraping ? 'Scraping...' : 'Scrape'}
              </Button>
              {hasMultipleScrapers && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowScrapeMenu(!showScrapeMenu)}
                    disabled={isScraping || !monitoringEnabled}
                    className="rounded-l-none px-1.5"
                  >
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                  {showScrapeMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowScrapeMenu(false)}
                      />
                      <div className="absolute right-0 top-full mt-1 w-56 bg-white dark:bg-surface-800 rounded-lg shadow-lg border border-surface-200 dark:border-surface-700 z-20 py-1">
                        <div className="px-3 py-2 border-b border-surface-200 dark:border-surface-700">
                          <p className="text-xs font-medium text-surface-500 uppercase">
                            Select Scraper
                          </p>
                        </div>
                        {onlineScrapers.map((scraper) => (
                          <button
                            key={scraper._id}
                            onClick={() => {
                              onScrape?.(scraper._id);
                              setShowScrapeMenu(false);
                            }}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-surface-100 dark:hover:bg-surface-700 flex items-center gap-2"
                          >
                            <Monitor className="h-4 w-4 text-surface-500" />
                            <span className="flex-1 truncate">{scraper.name}</span>
                            {scraper._id === profile.preferredScraperId && (
                              <Star className="h-3 w-3 text-warning-500" />
                            )}
                            <div className="w-2 h-2 rounded-full bg-success-500" />
                          </button>
                        ))}
                        {onScrapeWithSelection && (
                          <>
                            <hr className="my-1 border-surface-200 dark:border-surface-700" />
                            <button
                              onClick={() => {
                                onScrapeWithSelection();
                                setShowScrapeMenu(false);
                              }}
                              className="w-full px-3 py-2 text-left text-sm text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 flex items-center gap-2"
                            >
                              <Monitor className="h-4 w-4" />
                              More options...
                            </button>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Tags & Client */}
        {((profile.tags && profile.tags.length > 0) || getClientName()) && (
          <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-surface-200 dark:border-surface-700">
            {getClientName() && (
              <Badge variant="secondary" size="sm">
                {getClientName()}
              </Badge>
            )}
            {profile.tags?.map((tag) => (
              <Badge key={tag} variant="outline" size="sm">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Monitoring Status */}
        {!monitoringEnabled && (
          <div className="mt-3 p-2 bg-warning-50 dark:bg-warning-900/20 rounded-lg">
            <p className="text-xs text-warning-700 dark:text-warning-400 flex items-center gap-1">
              <Pause className="h-3 w-3" />
              Monitoring paused
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
