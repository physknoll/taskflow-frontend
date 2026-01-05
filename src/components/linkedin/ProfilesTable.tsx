'use client';

import { useState, useMemo } from 'react';
import { LinkedInProfile, LinkedInProfileType, LinkedInScraper } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import {
  RefreshCw,
  ExternalLink,
  Pause,
  Play,
  Trash2,
  Edit,
  AlertCircle,
  CheckCircle,
  Clock,
  ChevronUp,
  ChevronDown,
  MoreHorizontal,
  Monitor,
  Star,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ProfilesTableProps {
  profiles: LinkedInProfile[];
  onEdit?: (profile: LinkedInProfile) => void;
  onScrape?: (profile: LinkedInProfile, scraperId?: string) => void;
  onScrapeWithSelection?: (profile: LinkedInProfile) => void;
  onDelete?: (profile: LinkedInProfile) => void;
  onToggleMonitoring?: (profile: LinkedInProfile) => void;
  scrapingProfileId?: string | null;
  showActions?: boolean;
  scrapers?: LinkedInScraper[];
}

type SortField = 'displayName' | 'profileType' | 'totalPostsCollected' | 'intervalMinutes' | 'lastScrapedAt' | 'priority' | 'monitoringEnabled';
type SortDirection = 'asc' | 'desc';

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

const priorityLabels: Record<string, string> = {
  low: 'Low',
  normal: 'Normal',
  high: 'High',
};

const priorityColors: Record<string, 'secondary' | 'primary' | 'danger'> = {
  low: 'secondary',
  normal: 'primary',
  high: 'danger',
};

export function ProfilesTable({
  profiles,
  onEdit,
  onScrape,
  onScrapeWithSelection,
  onDelete,
  onToggleMonitoring,
  scrapingProfileId,
  showActions = true,
  scrapers = [],
}: ProfilesTableProps) {
  const [sortField, setSortField] = useState<SortField>('displayName');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [scrapeMenuId, setScrapeMenuId] = useState<string | null>(null);

  const onlineScrapers = scrapers.filter((s) => s.isOnlineNow);
  const hasMultipleScrapers = onlineScrapers.length > 1;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedProfiles = useMemo(() => {
    return [...profiles].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'displayName':
          aValue = a.displayName.toLowerCase();
          bValue = b.displayName.toLowerCase();
          break;
        case 'profileType':
          aValue = a.profileType;
          bValue = b.profileType;
          break;
        case 'totalPostsCollected':
          aValue = a.totalPostsCollected;
          bValue = b.totalPostsCollected;
          break;
        case 'intervalMinutes':
          aValue = a.scrapeSchedule.intervalMinutes;
          bValue = b.scrapeSchedule.intervalMinutes;
          break;
        case 'lastScrapedAt':
          aValue = a.lastScrapedAt ? new Date(a.lastScrapedAt).getTime() : 0;
          bValue = b.lastScrapedAt ? new Date(b.lastScrapedAt).getTime() : 0;
          break;
        case 'priority':
          const priorityOrder = { high: 3, normal: 2, low: 1 };
          aValue = priorityOrder[a.priority] || 0;
          bValue = priorityOrder[b.priority] || 0;
          break;
        case 'monitoringEnabled':
          aValue = a.monitoringEnabled ? 1 : 0;
          bValue = b.monitoringEnabled ? 1 : 0;
          break;
        default:
          aValue = a.displayName;
          bValue = b.displayName;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [profiles, sortField, sortDirection]);

  const SortHeader = ({ field, label, className }: { field: SortField; label: string; className?: string }) => (
    <th
      className={cn(
        'px-4 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider cursor-pointer hover:bg-surface-100 dark:hover:bg-surface-700 select-none',
        className
      )}
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {label}
        <span className="flex flex-col">
          <ChevronUp
            className={cn(
              'h-3 w-3 -mb-1',
              sortField === field && sortDirection === 'asc'
                ? 'text-primary-500'
                : 'text-surface-300 dark:text-surface-600'
            )}
          />
          <ChevronDown
            className={cn(
              'h-3 w-3',
              sortField === field && sortDirection === 'desc'
                ? 'text-primary-500'
                : 'text-surface-300 dark:text-surface-600'
            )}
          />
        </span>
      </div>
    </th>
  );

  const getStatusIcon = (profile: LinkedInProfile) => {
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

  const getClientName = (profile: LinkedInProfile) => {
    if (!profile.clientId) return null;
    if (typeof profile.clientId === 'string') return null;
    return profile.clientId.name;
  };

  return (
    <div className="bg-white dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-surface-50 dark:bg-surface-800 border-b border-surface-200 dark:border-surface-700">
            <tr>
              <SortHeader field="displayName" label="Profile" className="min-w-[250px]" />
              <SortHeader field="profileType" label="Type" />
              <SortHeader field="priority" label="Priority" />
              <SortHeader field="totalPostsCollected" label="Posts" />
              <SortHeader field="intervalMinutes" label="Interval" />
              <SortHeader field="lastScrapedAt" label="Last Scraped" />
              <SortHeader field="monitoringEnabled" label="Status" />
              <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">
                Tags
              </th>
              {showActions && (
                <th className="px-4 py-3 text-right text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-200 dark:divide-surface-700">
            {sortedProfiles.map((profile) => (
              <tr
                key={profile._id}
                className="hover:bg-surface-50 dark:hover:bg-surface-700/50 transition-colors"
              >
                {/* Profile */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar
                      firstName={profile.displayName}
                      lastName=""
                      src={profile.avatarUrl}
                      size="sm"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-surface-900 dark:text-white truncate max-w-[180px]">
                          {profile.displayName}
                        </p>
                        <a
                          href={profile.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-surface-400 hover:text-primary-500 flex-shrink-0"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                      {profile.headline && (
                        <p className="text-xs text-surface-500 dark:text-surface-400 truncate max-w-[200px]">
                          {profile.headline}
                        </p>
                      )}
                    </div>
                  </div>
                </td>

                {/* Type */}
                <td className="px-4 py-3">
                  <Badge variant={profileTypeColors[profile.profileType]} size="sm">
                    {profileTypeLabels[profile.profileType]}
                  </Badge>
                </td>

                {/* Priority */}
                <td className="px-4 py-3">
                  <Badge variant={priorityColors[profile.priority] || 'secondary'} size="sm">
                    {priorityLabels[profile.priority] || profile.priority}
                  </Badge>
                </td>

                {/* Posts */}
                <td className="px-4 py-3">
                  <span className="text-sm font-medium text-surface-900 dark:text-white">
                    {profile.totalPostsCollected}
                  </span>
                </td>

                {/* Interval */}
                <td className="px-4 py-3">
                  <span className="text-sm text-surface-600 dark:text-surface-400">
                    {profile.scrapeSchedule.intervalMinutes >= 1440
                      ? `${Math.floor(profile.scrapeSchedule.intervalMinutes / 1440)}d`
                      : profile.scrapeSchedule.intervalMinutes >= 60
                      ? `${Math.floor(profile.scrapeSchedule.intervalMinutes / 60)}h`
                      : `${profile.scrapeSchedule.intervalMinutes}m`}
                  </span>
                </td>

                {/* Last Scraped */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(profile)}
                    <span className="text-sm text-surface-600 dark:text-surface-400">
                      {profile.lastScrapedAt
                        ? formatDistanceToNow(new Date(profile.lastScrapedAt), { addSuffix: true })
                        : 'Never'}
                    </span>
                  </div>
                </td>

                {/* Status */}
                <td className="px-4 py-3">
                  {profile.monitoringEnabled ? (
                    <Badge variant="success" size="sm">Active</Badge>
                  ) : (
                    <Badge variant="secondary" size="sm">Paused</Badge>
                  )}
                </td>

                {/* Tags */}
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1 max-w-[200px]">
                    {getClientName(profile) && (
                      <Badge variant="secondary" size="sm">
                        {getClientName(profile)}
                      </Badge>
                    )}
                    {profile.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" size="sm">
                        {tag}
                      </Badge>
                    ))}
                    {profile.tags.length > 3 && (
                      <span className="text-xs text-surface-400">+{profile.tags.length - 3}</span>
                    )}
                  </div>
                </td>

                {/* Actions */}
                {showActions && (
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {/* Scrape Button with optional dropdown */}
                      <div className="relative">
                        <div className="flex">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onScrape?.(profile)}
                            disabled={scrapingProfileId === profile._id || !profile.monitoringEnabled}
                            className={cn('p-1.5', hasMultipleScrapers && 'rounded-r-none')}
                          >
                            <RefreshCw
                              className={cn(
                                'h-4 w-4',
                                scrapingProfileId === profile._id && 'animate-spin'
                              )}
                            />
                          </Button>
                          {hasMultipleScrapers && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setScrapeMenuId(scrapeMenuId === profile._id ? null : profile._id)}
                              disabled={scrapingProfileId === profile._id || !profile.monitoringEnabled}
                              className="p-1 rounded-l-none border-l border-surface-200 dark:border-surface-600"
                            >
                              <ChevronDown className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                        {scrapeMenuId === profile._id && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setScrapeMenuId(null)}
                            />
                            <div className="absolute right-0 mt-1 w-56 bg-white dark:bg-surface-800 rounded-lg shadow-lg border border-surface-200 dark:border-surface-700 z-20 py-1">
                              <div className="px-3 py-2 border-b border-surface-200 dark:border-surface-700">
                                <p className="text-xs font-medium text-surface-500 uppercase">
                                  Select Scraper
                                </p>
                              </div>
                              {onlineScrapers.map((scraper) => (
                                <button
                                  key={scraper._id}
                                  onClick={() => {
                                    onScrape?.(profile, scraper._id);
                                    setScrapeMenuId(null);
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
                                      onScrapeWithSelection(profile);
                                      setScrapeMenuId(null);
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
                      </div>
                      <div className="relative">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setOpenMenuId(openMenuId === profile._id ? null : profile._id)}
                          className="p-1.5"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                        {openMenuId === profile._id && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setOpenMenuId(null)}
                            />
                            <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-surface-800 rounded-lg shadow-lg border border-surface-200 dark:border-surface-700 z-20 py-1">
                              <button
                                onClick={() => {
                                  onEdit?.(profile);
                                  setOpenMenuId(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-surface-100 dark:hover:bg-surface-700 flex items-center gap-2"
                              >
                                <Edit className="h-4 w-4" />
                                Edit Profile
                              </button>
                              <button
                                onClick={() => {
                                  onToggleMonitoring?.(profile);
                                  setOpenMenuId(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-surface-100 dark:hover:bg-surface-700 flex items-center gap-2"
                              >
                                {profile.monitoringEnabled ? (
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
                                onClick={() => setOpenMenuId(null)}
                              >
                                <ExternalLink className="h-4 w-4" />
                                View on LinkedIn
                              </a>
                              <hr className="my-1 border-surface-200 dark:border-surface-700" />
                              <button
                                onClick={() => {
                                  onDelete?.(profile);
                                  setOpenMenuId(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-error-600 hover:bg-error-50 dark:hover:bg-error-900/20 flex items-center gap-2"
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete Profile
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
