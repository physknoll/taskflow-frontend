'use client';

import { LinkedInProfile, LinkedInProfileType } from '@/types';
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
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';

interface ProfileCardProps {
  profile: LinkedInProfile;
  onEdit?: () => void;
  onScrape?: () => void;
  onDelete?: () => void;
  onToggleMonitoring?: () => void;
  isScraping?: boolean;
  showActions?: boolean;
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

export function ProfileCard({
  profile,
  onEdit,
  onScrape,
  onDelete,
  onToggleMonitoring,
  isScraping,
  showActions = true,
}: ProfileCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const getStatusIcon = () => {
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

  return (
    <Card hover className="h-full">
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          <Avatar
            firstName={profile.displayName}
            lastName=""
            src={profile.avatarUrl}
            size="lg"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-surface-900 dark:text-white truncate">
                {profile.displayName}
              </h3>
              <Badge
                variant={profileTypeColors[profile.profileType]}
                size="sm"
              >
                {profileTypeLabels[profile.profileType]}
              </Badge>
            </div>
            {profile.headline && (
              <p className="text-sm text-surface-500 dark:text-surface-400 truncate mt-1">
                {profile.headline}
              </p>
            )}
            <p className="text-xs text-surface-400 dark:text-surface-500 mt-1">
              @{profile.username}
            </p>
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
                      Edit Profile
                    </button>
                    <button
                      onClick={() => {
                        onToggleMonitoring?.();
                        setShowMenu(false);
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
                      onClick={() => setShowMenu(false)}
                    >
                      <ExternalLink className="h-4 w-4" />
                      View on LinkedIn
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
                      Delete Profile
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
              {profile.totalPostsCollected}
            </p>
            <p className="text-xs text-surface-500 dark:text-surface-400">Posts Collected</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-surface-900 dark:text-white">
              {profile.scrapeSchedule.intervalMinutes}m
            </p>
            <p className="text-xs text-surface-500 dark:text-surface-400">Interval</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-surface-200 dark:border-surface-700">
          <div className="flex items-center gap-2 text-sm text-surface-500 dark:text-surface-400">
            {getStatusIcon()}
            <span>
              {profile.lastScrapedAt
                ? formatDistanceToNow(new Date(profile.lastScrapedAt), { addSuffix: true })
                : 'Never scraped'}
            </span>
          </div>
          {showActions && (
            <Button
              size="sm"
              variant="outline"
              onClick={onScrape}
              disabled={isScraping || !profile.monitoringEnabled}
              className="flex items-center gap-1"
            >
              <RefreshCw className={cn('h-3 w-3', isScraping && 'animate-spin')} />
              {isScraping ? 'Scraping...' : 'Scrape'}
            </Button>
          )}
        </div>

        {/* Tags & Client */}
        {(profile.tags.length > 0 || getClientName()) && (
          <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-surface-200 dark:border-surface-700">
            {getClientName() && (
              <Badge variant="secondary" size="sm">
                {getClientName()}
              </Badge>
            )}
            {profile.tags.map((tag) => (
              <Badge key={tag} variant="outline" size="sm">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Monitoring Status */}
        {!profile.monitoringEnabled && (
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
