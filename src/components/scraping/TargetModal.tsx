'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import {
  ScrapeTarget,
  ScrapingPlatform,
  ScrapingPriority,
  CreateScrapeTargetDto,
  UpdateScrapeTargetDto,
  LinkedInTargetSettings,
  RedditTargetSettings,
  WebsiteTargetSettings,
  DEFAULT_LINKEDIN_SETTINGS,
  DEFAULT_REDDIT_SETTINGS,
  DEFAULT_WEBSITE_SETTINGS,
  PLATFORM_LABELS,
} from '@/types/scraping';
import { Linkedin, Globe, Info } from 'lucide-react';

interface TargetModalProps {
  isOpen: boolean;
  onClose: () => void;
  target?: ScrapeTarget | null;
  onSubmit: (data: CreateScrapeTargetDto | UpdateScrapeTargetDto) => Promise<any>;
  isSubmitting?: boolean;
}

// Reddit icon component
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

export function TargetModal({
  isOpen,
  onClose,
  target,
  onSubmit,
  isSubmitting,
}: TargetModalProps) {
  const [platform, setPlatform] = useState<ScrapingPlatform>('linkedin');
  const [url, setUrl] = useState('');
  const [targetName, setTargetName] = useState('');
  const [priority, setPriority] = useState<ScrapingPriority>('normal');
  const [linkedInSettings, setLinkedInSettings] = useState<LinkedInTargetSettings>(DEFAULT_LINKEDIN_SETTINGS);
  const [redditSettings, setRedditSettings] = useState<RedditTargetSettings>(DEFAULT_REDDIT_SETTINGS);
  const [websiteSettings, setWebsiteSettings] = useState<WebsiteTargetSettings>(DEFAULT_WEBSITE_SETTINGS);

  const isEdit = !!target;

  useEffect(() => {
    if (target) {
      setPlatform(target.platform);
      setUrl(target.url);
      setTargetName(target.targetName);
      setPriority(target.priority);
      
      switch (target.platform) {
        case 'linkedin':
          setLinkedInSettings(target.settings as LinkedInTargetSettings);
          break;
        case 'reddit':
          setRedditSettings(target.settings as RedditTargetSettings);
          break;
        case 'website':
          setWebsiteSettings(target.settings as WebsiteTargetSettings);
          break;
      }
    } else {
      setPlatform('linkedin');
      setUrl('');
      setTargetName('');
      setPriority('normal');
      setLinkedInSettings(DEFAULT_LINKEDIN_SETTINGS);
      setRedditSettings(DEFAULT_REDDIT_SETTINGS);
      setWebsiteSettings(DEFAULT_WEBSITE_SETTINGS);
    }
  }, [target, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let settings;
    switch (platform) {
      case 'linkedin':
        settings = linkedInSettings;
        break;
      case 'reddit':
        settings = redditSettings;
        break;
      case 'website':
        settings = websiteSettings;
        break;
    }

    const data: CreateScrapeTargetDto = {
      platform,
      url,
      targetName,
      priority,
      settings,
    };

    await onSubmit(data);
    onClose();
  };

  const renderLinkedInSettings = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
            Max Posts
          </label>
          <input
            type="number"
            min={5}
            max={100}
            value={linkedInSettings.maxPosts}
            onChange={(e) =>
              setLinkedInSettings({
                ...linkedInSettings,
                maxPosts: parseInt(e.target.value) || 20,
              })
            }
            className="w-full px-4 py-2 rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
            Scraping Mode
          </label>
          <select
            value={linkedInSettings.scrapingMode || 'balanced'}
            onChange={(e) =>
              setLinkedInSettings({
                ...linkedInSettings,
                scrapingMode: e.target.value as 'conservative' | 'balanced' | 'aggressive',
              })
            }
            className="w-full px-4 py-2 rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800"
          >
            <option value="conservative">Conservative</option>
            <option value="balanced">Balanced</option>
            <option value="aggressive">Aggressive</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
          Activity Types
        </label>
        <div className="flex flex-wrap gap-3">
          {(['posts', 'comments', 'reposts', 'articles'] as const).map((type) => (
            <label key={type} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={linkedInSettings.activityTypes.includes(type)}
                onChange={(e) => {
                  const newTypes = e.target.checked
                    ? [...linkedInSettings.activityTypes, type]
                    : linkedInSettings.activityTypes.filter((t) => t !== type);
                  setLinkedInSettings({
                    ...linkedInSettings,
                    activityTypes: newTypes,
                  });
                }}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm capitalize">{type}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={linkedInSettings.enableComments || false}
            onChange={(e) =>
              setLinkedInSettings({
                ...linkedInSettings,
                enableComments: e.target.checked,
              })
            }
            className="w-4 h-4 rounded"
          />
          <span className="text-sm">Collect comments on posts</span>
        </label>
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={linkedInSettings.enableScreenshots || false}
            onChange={(e) =>
              setLinkedInSettings({
                ...linkedInSettings,
                enableScreenshots: e.target.checked,
              })
            }
            className="w-4 h-4 rounded"
          />
          <span className="text-sm">Take screenshots of posts</span>
        </label>
      </div>
    </div>
  );

  const renderRedditSettings = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
            Subreddit
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400">
              r/
            </span>
            <input
              type="text"
              value={redditSettings.subreddit}
              onChange={(e) =>
                setRedditSettings({
                  ...redditSettings,
                  subreddit: e.target.value.replace(/^r\//, ''),
                })
              }
              placeholder="programming"
              className="w-full pl-8 pr-4 py-2 rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
            Max Posts
          </label>
          <input
            type="number"
            min={5}
            max={100}
            value={redditSettings.maxPosts}
            onChange={(e) =>
              setRedditSettings({
                ...redditSettings,
                maxPosts: parseInt(e.target.value) || 25,
              })
            }
            className="w-full px-4 py-2 rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
            Sort By
          </label>
          <select
            value={redditSettings.sortBy}
            onChange={(e) =>
              setRedditSettings({
                ...redditSettings,
                sortBy: e.target.value as 'hot' | 'new' | 'top' | 'rising',
              })
            }
            className="w-full px-4 py-2 rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800"
          >
            <option value="hot">Hot</option>
            <option value="new">New</option>
            <option value="top">Top</option>
            <option value="rising">Rising</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
            Time Range
          </label>
          <select
            value={redditSettings.timeRange}
            onChange={(e) =>
              setRedditSettings({
                ...redditSettings,
                timeRange: e.target.value as any,
              })
            }
            className="w-full px-4 py-2 rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800"
          >
            <option value="hour">Past Hour</option>
            <option value="day">Past Day</option>
            <option value="week">Past Week</option>
            <option value="month">Past Month</option>
            <option value="year">Past Year</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      <div className="space-y-3">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={redditSettings.includeComments || false}
            onChange={(e) =>
              setRedditSettings({
                ...redditSettings,
                includeComments: e.target.checked,
              })
            }
            className="w-4 h-4 rounded"
          />
          <span className="text-sm">Include comments</span>
        </label>
        {redditSettings.includeComments && (
          <div className="ml-7">
            <label className="block text-sm text-surface-600 dark:text-surface-400 mb-1">
              Max comments per post
            </label>
            <input
              type="number"
              min={1}
              max={50}
              value={redditSettings.maxCommentsPerPost || 10}
              onChange={(e) =>
                setRedditSettings({
                  ...redditSettings,
                  maxCommentsPerPost: parseInt(e.target.value) || 10,
                })
              }
              className="w-32 px-3 py-1.5 rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 text-sm"
            />
          </div>
        )}
      </div>
    </div>
  );

  const renderWebsiteSettings = () => (
    <div className="space-y-4">
      <div className="flex items-start gap-2 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
        <Info className="h-4 w-4 text-primary-600 dark:text-primary-400 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-primary-700 dark:text-primary-300">
          CSS selectors help identify content on the page. Leave empty to use automatic detection.
        </p>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
            Article List Selector
          </label>
          <input
            type="text"
            value={websiteSettings.selectors.articleList || ''}
            onChange={(e) =>
              setWebsiteSettings({
                ...websiteSettings,
                selectors: {
                  ...websiteSettings.selectors,
                  articleList: e.target.value,
                },
              })
            }
            placeholder=".blog-posts article"
            className="w-full px-4 py-2 rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 font-mono text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
              Title Selector
            </label>
            <input
              type="text"
              value={websiteSettings.selectors.title || ''}
              onChange={(e) =>
                setWebsiteSettings({
                  ...websiteSettings,
                  selectors: {
                    ...websiteSettings.selectors,
                    title: e.target.value,
                  },
                })
              }
              placeholder="h2"
              className="w-full px-4 py-2 rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 font-mono text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
              Date Selector
            </label>
            <input
              type="text"
              value={websiteSettings.selectors.date || ''}
              onChange={(e) =>
                setWebsiteSettings({
                  ...websiteSettings,
                  selectors: {
                    ...websiteSettings.selectors,
                    date: e.target.value,
                  },
                })
              }
              placeholder=".post-date"
              className="w-full px-4 py-2 rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 font-mono text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
            Content Selector
          </label>
          <input
            type="text"
            value={websiteSettings.selectors.content || ''}
            onChange={(e) =>
              setWebsiteSettings({
                ...websiteSettings,
                selectors: {
                  ...websiteSettings.selectors,
                  content: e.target.value,
                },
              })
            }
            placeholder=".post-content"
            className="w-full px-4 py-2 rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 font-mono text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
            Scroll Depth
          </label>
          <input
            type="number"
            min={0}
            max={20}
            value={websiteSettings.scrollDepth || 3}
            onChange={(e) =>
              setWebsiteSettings({
                ...websiteSettings,
                scrollDepth: parseInt(e.target.value) || 3,
              })
            }
            className="w-full px-4 py-2 rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800"
          />
          <p className="mt-1 text-xs text-surface-500">Number of scroll actions</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
            Max Pages
          </label>
          <input
            type="number"
            min={1}
            max={50}
            value={websiteSettings.maxPages || 5}
            onChange={(e) =>
              setWebsiteSettings({
                ...websiteSettings,
                maxPages: parseInt(e.target.value) || 5,
              })
            }
            className="w-full px-4 py-2 rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800"
          />
        </div>
      </div>

      <div className="space-y-3">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={websiteSettings.followPagination || false}
            onChange={(e) =>
              setWebsiteSettings({
                ...websiteSettings,
                followPagination: e.target.checked,
              })
            }
            className="w-4 h-4 rounded"
          />
          <span className="text-sm">Follow pagination</span>
        </label>
        {websiteSettings.followPagination && (
          <div className="ml-7">
            <label className="block text-sm text-surface-600 dark:text-surface-400 mb-1">
              Pagination selector
            </label>
            <input
              type="text"
              value={websiteSettings.paginationSelector || ''}
              onChange={(e) =>
                setWebsiteSettings({
                  ...websiteSettings,
                  paginationSelector: e.target.value,
                })
              }
              placeholder="a.next-page"
              className="w-full px-3 py-1.5 rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 font-mono text-sm"
            />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Target' : 'Add Target'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Platform Selection (only for create) */}
        {!isEdit && (
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
              Platform
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['linkedin', 'reddit', 'website'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPlatform(p)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                    platform === p
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-surface-200 dark:border-surface-700 hover:border-surface-300'
                  }`}
                >
                  {p === 'linkedin' && <Linkedin className="h-6 w-6 text-[#0A66C2]" />}
                  {p === 'reddit' && <RedditIcon className="h-6 w-6 text-[#FF4500]" />}
                  {p === 'website' && <Globe className="h-6 w-6 text-surface-500" />}
                  <span className="text-sm font-medium">{PLATFORM_LABELS[p]}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
              URL *
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={
                platform === 'linkedin'
                  ? 'https://linkedin.com/in/username'
                  : platform === 'reddit'
                  ? 'https://reddit.com/r/subreddit'
                  : 'https://example.com/blog'
              }
              required
              className="w-full px-4 py-2 rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
              Target Name *
            </label>
            <input
              type="text"
              value={targetName}
              onChange={(e) => setTargetName(e.target.value)}
              placeholder="e.g., Competitor CEO"
              required
              className="w-full px-4 py-2 rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as ScrapingPriority)}
              className="w-full px-4 py-2 rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800"
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        {/* Platform-Specific Settings */}
        <div>
          <h4 className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-3">
            {PLATFORM_LABELS[platform]} Settings
          </h4>
          <div className="p-4 bg-surface-50 dark:bg-surface-800/50 rounded-lg">
            {platform === 'linkedin' && renderLinkedInSettings()}
            {platform === 'reddit' && renderRedditSettings()}
            {platform === 'website' && renderWebsiteSettings()}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {isEdit ? 'Update Target' : 'Add Target'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
