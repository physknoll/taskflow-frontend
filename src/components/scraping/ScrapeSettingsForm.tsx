'use client';

import { ExecutionScrapeSettings, ScrapingMode } from '@/types/scraping';
import { Info, Gauge, MessageSquare, Camera, Zap } from 'lucide-react';

interface ScrapeSettingsFormProps {
  settings: ExecutionScrapeSettings;
  onChange: (settings: ExecutionScrapeSettings) => void;
  /** Show compact version for inline use */
  compact?: boolean;
  /** Optional title */
  title?: string;
  /** Show info box about settings */
  showInfo?: boolean;
}

const SCRAPING_MODE_OPTIONS: { value: ScrapingMode; label: string; description: string }[] = [
  {
    value: 'conservative',
    label: 'Conservative',
    description: 'Slower, safer - best for new accounts',
  },
  {
    value: 'balanced',
    label: 'Balanced',
    description: 'Recommended for most users',
  },
  {
    value: 'aggressive',
    label: 'Aggressive',
    description: 'Faster, higher risk of detection',
  },
];

export function ScrapeSettingsForm({
  settings,
  onChange,
  compact = false,
  title,
  showInfo = false,
}: ScrapeSettingsFormProps) {
  const handleChange = <K extends keyof ExecutionScrapeSettings>(
    key: K,
    value: ExecutionScrapeSettings[K]
  ) => {
    onChange({ ...settings, [key]: value });
  };

  if (compact) {
    return (
      <div className="space-y-4">
        {title && (
          <h4 className="text-sm font-medium text-surface-700 dark:text-surface-300">
            {title}
          </h4>
        )}
        <div className="grid grid-cols-2 gap-4">
          {/* Max Items */}
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
              Max Items
            </label>
            <input
              type="number"
              min={1}
              max={100}
              value={settings.maxItems ?? 20}
              onChange={(e) => handleChange('maxItems', parseInt(e.target.value) || 20)}
              className="w-full px-3 py-2 rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 text-sm"
            />
          </div>

          {/* Scraping Mode */}
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
              Mode
            </label>
            <select
              value={settings.scrapingMode ?? 'balanced'}
              onChange={(e) => handleChange('scrapingMode', e.target.value as ScrapingMode)}
              className="w-full px-3 py-2 rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 text-sm"
            >
              {SCRAPING_MODE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Toggles */}
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.enableComments ?? false}
              onChange={(e) => handleChange('enableComments', e.target.checked)}
              className="w-4 h-4 rounded border-surface-300"
            />
            <span className="text-sm text-surface-700 dark:text-surface-300">Comments</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.enableScreenshots ?? false}
              onChange={(e) => handleChange('enableScreenshots', e.target.checked)}
              className="w-4 h-4 rounded border-surface-300"
            />
            <span className="text-sm text-surface-700 dark:text-surface-300">Screenshots</span>
          </label>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {title && (
        <h4 className="text-sm font-semibold text-surface-900 dark:text-white">
          {title}
        </h4>
      )}

      {showInfo && (
        <div className="flex items-start gap-2 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
          <Info className="h-4 w-4 text-primary-600 dark:text-primary-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-primary-700 dark:text-primary-300">
            These settings control how the scraper collects data. They can be overridden per-execution.
          </p>
        </div>
      )}

      {/* Max Items */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
          <Gauge className="h-4 w-4" />
          Maximum Items per Scrape
        </label>
        <input
          type="number"
          min={1}
          max={100}
          value={settings.maxItems ?? 20}
          onChange={(e) => handleChange('maxItems', parseInt(e.target.value) || 20)}
          className="w-full px-4 py-2 rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800"
        />
        <p className="mt-1 text-xs text-surface-500">
          Maximum number of items to collect per scrape (1-100)
        </p>
      </div>

      {/* Scraping Mode */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
          <Zap className="h-4 w-4" />
          Scraping Mode
        </label>
        <div className="grid grid-cols-3 gap-3">
          {SCRAPING_MODE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleChange('scrapingMode', option.value)}
              className={`p-3 rounded-lg border-2 text-left transition-all ${
                settings.scrapingMode === option.value
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-surface-200 dark:border-surface-700 hover:border-surface-300'
              }`}
            >
              <span className="block text-sm font-medium text-surface-900 dark:text-white">
                {option.label}
              </span>
              <span className="block text-xs text-surface-500 mt-0.5">
                {option.description}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Feature Toggles */}
      <div className="space-y-3">
        <label className="flex items-center gap-3 p-3 rounded-lg border border-surface-200 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-800/50 cursor-pointer transition-colors">
          <input
            type="checkbox"
            checked={settings.enableComments ?? false}
            onChange={(e) => handleChange('enableComments', e.target.checked)}
            className="w-4 h-4 rounded border-surface-300"
          />
          <div className="flex items-center gap-2 flex-1">
            <MessageSquare className="h-4 w-4 text-surface-500" />
            <div>
              <span className="block text-sm font-medium text-surface-700 dark:text-surface-300">
                Collect Comments
              </span>
              <span className="block text-xs text-surface-500">
                Scrape comments on posts for deeper insights
              </span>
            </div>
          </div>
        </label>

        <label className="flex items-center gap-3 p-3 rounded-lg border border-surface-200 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-800/50 cursor-pointer transition-colors">
          <input
            type="checkbox"
            checked={settings.enableScreenshots ?? false}
            onChange={(e) => handleChange('enableScreenshots', e.target.checked)}
            className="w-4 h-4 rounded border-surface-300"
          />
          <div className="flex items-center gap-2 flex-1">
            <Camera className="h-4 w-4 text-surface-500" />
            <div>
              <span className="block text-sm font-medium text-surface-700 dark:text-surface-300">
                Capture Screenshots
              </span>
              <span className="block text-xs text-surface-500">
                Save visual snapshots of scraped content
              </span>
            </div>
          </div>
        </label>
      </div>
    </div>
  );
}

/**
 * Default settings for new sources
 */
export const DEFAULT_EXECUTION_SETTINGS: ExecutionScrapeSettings = {
  maxItems: 20,
  enableComments: true,
  enableScreenshots: false,
  scrapingMode: 'balanced',
};
