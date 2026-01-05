'use client';

import { useState } from 'react';
import { LinkedInScraper, LinkedInProfile } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import {
  Monitor,
  Laptop,
  Apple,
  Chrome,
  CheckCircle,
  Star,
  Zap,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ScraperSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (scraperId: string | undefined) => void;
  scrapers: LinkedInScraper[];
  profile?: LinkedInProfile | null;
  isLoading?: boolean;
}

const platformIcons: Record<string, typeof Monitor> = {
  darwin: Apple,
  win32: Monitor,
  linux: Laptop,
  chrome: Chrome,
  extension: Chrome,
  'chrome-extension': Chrome,
};

export function ScraperSelectModal({
  isOpen,
  onClose,
  onSelect,
  scrapers,
  profile,
  isLoading,
}: ScraperSelectModalProps) {
  const [selectedScraperId, setSelectedScraperId] = useState<string | undefined>(
    profile?.preferredScraperId || undefined
  );

  const onlineScrapers = scrapers.filter((s) => s.isOnlineNow);
  const offlineScrapers = scrapers.filter((s) => !s.isOnlineNow);

  const handleScrape = () => {
    onSelect(selectedScraperId);
    onClose();
  };

  const handleScrapeWithAny = () => {
    onSelect(undefined);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Select Scraper"
      size="md"
    >
      <div className="space-y-4">
        {profile && (
          <p className="text-sm text-surface-600 dark:text-surface-400">
            Choose which scraper to use for <strong>{profile.displayName}</strong>
          </p>
        )}

        {onlineScrapers.length === 0 ? (
          <div className="text-center py-8">
            <Monitor className="h-12 w-12 mx-auto mb-3 text-surface-400" />
            <p className="text-surface-600 dark:text-surface-400 mb-2">
              No scrapers are online
            </p>
            <p className="text-sm text-surface-500">
              Please start a desktop agent or Chrome extension to scrape this profile.
            </p>
          </div>
        ) : (
          <>
            {/* Online Scrapers */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-surface-500 uppercase tracking-wider">
                Online Scrapers ({onlineScrapers.length})
              </p>
              {onlineScrapers.map((scraper) => {
                const PlatformIcon = (scraper.platform && platformIcons[scraper.platform]) || Monitor;
                const isSelected = selectedScraperId === scraper._id;
                const isPreferred = profile?.preferredScraperId === scraper._id;

                return (
                  <button
                    key={scraper._id}
                    onClick={() => setSelectedScraperId(scraper._id)}
                    className={cn(
                      'w-full p-4 rounded-lg border-2 text-left transition-all',
                      isSelected
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-surface-200 dark:border-surface-700 hover:border-surface-300 dark:hover:border-surface-600'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'p-2 rounded-lg',
                          isSelected
                            ? 'bg-primary-100 dark:bg-primary-900/40'
                            : 'bg-surface-100 dark:bg-surface-700'
                        )}
                      >
                        <PlatformIcon
                          className={cn(
                            'h-5 w-5',
                            isSelected
                              ? 'text-primary-600 dark:text-primary-400'
                              : 'text-surface-500'
                          )}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-surface-900 dark:text-white truncate">
                            {scraper.name}
                          </span>
                          <div className="w-2 h-2 rounded-full bg-success-500" />
                          {isPreferred && (
                            <Badge variant="secondary" size="sm" className="flex items-center gap-1">
                              <Star className="h-3 w-3" />
                              Preferred
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-surface-500">
                          <span>{scraper.platform}</span>
                          {scraper.linkedInAccountEmail && (
                            <>
                              <span>•</span>
                              <span className="truncate">{scraper.linkedInAccountEmail}</span>
                            </>
                          )}
                        </div>
                      </div>
                      {isSelected && (
                        <CheckCircle className="h-5 w-5 text-primary-500 flex-shrink-0" />
                      )}
                    </div>
                    {scraper.lastHeartbeatAt && (
                      <p className="mt-2 text-xs text-surface-400">
                        Last active: {formatDistanceToNow(new Date(scraper.lastHeartbeatAt), { addSuffix: true })}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Offline Scrapers */}
            {offlineScrapers.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-surface-200 dark:border-surface-700">
                <p className="text-xs font-medium text-surface-400 uppercase tracking-wider">
                  Offline Scrapers ({offlineScrapers.length})
                </p>
                {offlineScrapers.map((scraper) => {
                  const PlatformIcon = (scraper.platform && platformIcons[scraper.platform]) || Monitor;
                  const isPreferred = profile?.preferredScraperId === scraper._id;

                  return (
                    <div
                      key={scraper._id}
                      className="w-full p-4 rounded-lg border border-surface-200 dark:border-surface-700 opacity-50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-surface-100 dark:bg-surface-700">
                          <PlatformIcon className="h-5 w-5 text-surface-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-surface-600 dark:text-surface-400 truncate">
                              {scraper.name}
                            </span>
                            <div className="w-2 h-2 rounded-full bg-surface-400" />
                            {isPreferred && (
                              <Badge variant="secondary" size="sm" className="flex items-center gap-1">
                                <Star className="h-3 w-3" />
                                Preferred
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-surface-400">
                            {scraper.lastHeartbeatAt
                              ? `Last seen: ${formatDistanceToNow(new Date(scraper.lastHeartbeatAt), { addSuffix: true })}`
                              : 'Never connected'}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Actions */}
        <div className="flex justify-between items-center gap-3 pt-4 border-t border-surface-200 dark:border-surface-700">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleScrapeWithAny}
            disabled={onlineScrapers.length === 0 || isLoading}
            className="flex items-center gap-1"
          >
            <Zap className="h-4 w-4" />
            Use Any Available
          </Button>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleScrape}
              disabled={!selectedScraperId || onlineScrapers.length === 0 || isLoading}
              isLoading={isLoading}
            >
              Scrape Now
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
