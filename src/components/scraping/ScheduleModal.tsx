'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { CronBuilder } from './CronBuilder';
import { ScrapeSettingsForm, DEFAULT_EXECUTION_SETTINGS } from './ScrapeSettingsForm';
import {
  ScrapeSchedule,
  ScrapeTarget,
  CreateScrapeScheduleDto,
  UpdateScrapeScheduleDto,
  DEFAULT_RETRY_SETTINGS,
  SourceScrapeOverride,
  ExecutionScrapeSettings,
} from '@/types/scraping';
import { Info, ChevronDown, ChevronUp, Settings } from 'lucide-react';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedule?: ScrapeSchedule | null;
  /** Targets for this schedule (for target override configuration) */
  targets?: ScrapeTarget[];
  onSubmit: (data: any) => Promise<any>;
  isSubmitting?: boolean;
}

const TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney',
];

export function ScheduleModal({
  isOpen,
  onClose,
  schedule,
  targets = [],
  onSubmit,
  isSubmitting,
}: ScheduleModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [cronExpression, setCronExpression] = useState('0 9 * * 1-5');
  const [timezone, setTimezone] = useState('America/New_York');
  const [enabled, setEnabled] = useState(true);
  const [showRetrySettings, setShowRetrySettings] = useState(false);
  const [retrySettings, setRetrySettings] = useState(DEFAULT_RETRY_SETTINGS);
  const [showTargetOverrides, setShowTargetOverrides] = useState(false);
  const [targetOverrides, setTargetOverrides] = useState<SourceScrapeOverride[]>([]);
  const [expandedTarget, setExpandedTarget] = useState<string | null>(null);

  useEffect(() => {
    if (schedule) {
      setName(schedule.name);
      setDescription(schedule.description || '');
      setCronExpression(schedule.cronExpression);
      setTimezone(schedule.timezone);
      setEnabled(schedule.enabled);
      setRetrySettings(schedule.retrySettings);
      setTargetOverrides(schedule.targetOverrides || []);
    } else {
      setName('');
      setDescription('');
      setCronExpression('0 9 * * 1-5');
      setTimezone('America/New_York');
      setEnabled(true);
      setRetrySettings(DEFAULT_RETRY_SETTINGS);
      setTargetOverrides([]);
    }
  }, [schedule, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = {
      name,
      description: description || undefined,
      cronExpression,
      timezone,
      enabled,
      retrySettings,
      targetOverrides: targetOverrides.length > 0 ? targetOverrides : undefined,
    };

    await onSubmit(data);
    onClose();
  };

  const getTargetOverride = (targetId: string): ExecutionScrapeSettings => {
    const existing = targetOverrides.find((o) => o.sourceId === targetId);
    return existing || DEFAULT_EXECUTION_SETTINGS;
  };

  const hasTargetOverride = (targetId: string): boolean => {
    return targetOverrides.some((o) => o.sourceId === targetId);
  };

  const toggleTargetOverride = (targetId: string, enabled: boolean) => {
    if (enabled) {
      if (!hasTargetOverride(targetId)) {
        setTargetOverrides([
          ...targetOverrides,
          { sourceId: targetId, ...DEFAULT_EXECUTION_SETTINGS },
        ]);
      }
    } else {
      setTargetOverrides(targetOverrides.filter((o) => o.sourceId !== targetId));
    }
  };

  const updateTargetOverride = (targetId: string, settings: ExecutionScrapeSettings) => {
    setTargetOverrides(
      targetOverrides.map((o) =>
        o.sourceId === targetId ? { ...o, ...settings } : o
      )
    );
  };

  const isEdit = !!schedule;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Schedule' : 'Create Schedule'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
            Schedule Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Daily Competitor Intelligence"
            required
            className="w-full px-4 py-2 rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What does this schedule do?"
            rows={2}
            className="w-full px-4 py-2 rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 resize-none"
          />
        </div>

        {/* Cron Expression */}
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
            Schedule Timing *
          </label>
          <CronBuilder
            value={cronExpression}
            onChange={setCronExpression}
            timezone={timezone}
          />
        </div>

        {/* Timezone */}
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
            Timezone
          </label>
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800"
          >
            {TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
        </div>

        {/* Enabled Toggle */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="enabled"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="w-4 h-4 rounded"
          />
          <label htmlFor="enabled" className="text-sm text-surface-700 dark:text-surface-300">
            Enable schedule immediately
          </label>
        </div>

        {/* Retry Settings (Collapsible) */}
        <div className="border border-surface-200 dark:border-surface-700 rounded-lg">
          <button
            type="button"
            onClick={() => setShowRetrySettings(!showRetrySettings)}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-surface-50 dark:hover:bg-surface-800 rounded-lg"
          >
            <span className="text-sm font-medium text-surface-700 dark:text-surface-300">
              Retry Settings
            </span>
            <span className="text-xs text-surface-500">
              {showRetrySettings ? 'Hide' : 'Show'}
            </span>
          </button>
          
          {showRetrySettings && (
            <div className="px-4 pb-4 space-y-4 border-t border-surface-200 dark:border-surface-700 pt-4">
              {/* Info Box */}
              <div className="flex items-start gap-2 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                <Info className="h-4 w-4 text-primary-600 dark:text-primary-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-primary-700 dark:text-primary-300">
                  Retry settings control what happens when a scraper is offline at the scheduled time.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                    Max Retries
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={20}
                    value={retrySettings.maxRetries}
                    onChange={(e) =>
                      setRetrySettings({
                        ...retrySettings,
                        maxRetries: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-2 rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                    Retry Delay (minutes)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={1440}
                    value={retrySettings.retryDelayMinutes}
                    onChange={(e) =>
                      setRetrySettings({
                        ...retrySettings,
                        retryDelayMinutes: parseInt(e.target.value) || 60,
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
                    checked={retrySettings.exponentialBackoff}
                    onChange={(e) =>
                      setRetrySettings({
                        ...retrySettings,
                        exponentialBackoff: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm">
                    Exponential backoff (increase delay with each retry)
                  </span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={retrySettings.retryOnReconnect}
                    onChange={(e) =>
                      setRetrySettings({
                        ...retrySettings,
                        retryOnReconnect: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm">
                    Retry immediately when scraper comes online
                  </span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Target Overrides (only show when editing with targets) */}
        {isEdit && targets.length > 0 && (
          <div className="border border-surface-200 dark:border-surface-700 rounded-lg">
            <button
              type="button"
              onClick={() => setShowTargetOverrides(!showTargetOverrides)}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-surface-50 dark:hover:bg-surface-800 rounded-lg"
            >
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-surface-500" />
                <span className="text-sm font-medium text-surface-700 dark:text-surface-300">
                  Per-Source Scrape Settings
                </span>
                {targetOverrides.length > 0 && (
                  <span className="px-2 py-0.5 text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full">
                    {targetOverrides.length} override{targetOverrides.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <span className="text-xs text-surface-500">
                {showTargetOverrides ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </span>
            </button>

            {showTargetOverrides && (
              <div className="px-4 pb-4 space-y-3 border-t border-surface-200 dark:border-surface-700 pt-4">
                {/* Info Box */}
                <div className="flex items-start gap-2 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                  <Info className="h-4 w-4 text-primary-600 dark:text-primary-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-primary-700 dark:text-primary-300">
                    Override default scrape settings for specific sources in this schedule.
                    Sources without overrides will use their own default settings.
                  </p>
                </div>

                {/* Target List */}
                <div className="space-y-2">
                  {targets.map((target) => (
                    <div
                      key={target._id}
                      className="border border-surface-200 dark:border-surface-700 rounded-lg"
                    >
                      <div className="flex items-center justify-between p-3">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={hasTargetOverride(target._id)}
                            onChange={(e) => toggleTargetOverride(target._id, e.target.checked)}
                            className="w-4 h-4 rounded"
                          />
                          <div>
                            <p className="text-sm font-medium text-surface-900 dark:text-white">
                              {target.targetName}
                            </p>
                            <p className="text-xs text-surface-500 truncate max-w-[200px]">
                              {target.url}
                            </p>
                          </div>
                        </div>
                        {hasTargetOverride(target._id) && (
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedTarget(
                                expandedTarget === target._id ? null : target._id
                              )
                            }
                            className="p-1 rounded hover:bg-surface-100 dark:hover:bg-surface-700"
                          >
                            {expandedTarget === target._id ? (
                              <ChevronUp className="h-4 w-4 text-surface-500" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-surface-500" />
                            )}
                          </button>
                        )}
                      </div>

                      {hasTargetOverride(target._id) && expandedTarget === target._id && (
                        <div className="px-3 pb-3 border-t border-surface-100 dark:border-surface-700 pt-3">
                          <ScrapeSettingsForm
                            settings={getTargetOverride(target._id)}
                            onChange={(settings) => updateTargetOverride(target._id, settings)}
                            compact
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {isEdit ? 'Update Schedule' : 'Create Schedule'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
