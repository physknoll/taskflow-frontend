'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useSourceScrape } from '@/hooks/useScraping';
import type { 
  ExecutionScrapeSettings, 
  ScrapingMode, 
  SourceUpdatePayload,
  SourceType,
  SourceStatus,
  ScrapingPriority 
} from '@/types/scraping';
import { 
  Settings, 
  Camera, 
  MessageSquare, 
  Gauge, 
  Clock,
  Hash,
  Tag,
  FileText,
  Activity,
} from 'lucide-react';

// ============================================
// Types
// ============================================

export interface SourceForSettings {
  _id: string;
  name?: string;
  displayName?: string;
  targetName?: string;
  description?: string;
  tags?: string[];
  sourceType?: SourceType;
  profileType?: string;
  status?: SourceStatus;
  monitoringEnabled?: boolean;
  priority?: ScrapingPriority;
  scrapeSettings?: ExecutionScrapeSettings;
  scrapeSchedule?: {
    intervalMinutes?: number;
  };
}

interface SourceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  source: SourceForSettings | null;
  onSuccess?: () => void;
}

// ============================================
// Constants
// ============================================

const SCRAPING_MODES: { value: ScrapingMode; label: string; description: string }[] = [
  { value: 'conservative', label: 'Conservative', description: 'Slower, safer scraping with longer delays' },
  { value: 'balanced', label: 'Balanced', description: 'Default mode with moderate pacing' },
  { value: 'aggressive', label: 'Aggressive', description: 'Faster scraping, higher risk of detection' },
];

const SOURCE_TYPES: { value: SourceType; label: string }[] = [
  { value: 'own', label: 'Own' },
  { value: 'competitor', label: 'Competitor' },
  { value: 'industry', label: 'Industry' },
  { value: 'prospect', label: 'Prospect' },
  { value: 'research', label: 'Research' },
];

const INTERVAL_OPTIONS: { value: number; label: string }[] = [
  { value: 15, label: 'Every 15 minutes' },
  { value: 30, label: 'Every 30 minutes' },
  { value: 60, label: 'Every hour' },
  { value: 120, label: 'Every 2 hours' },
  { value: 360, label: 'Every 6 hours' },
  { value: 720, label: 'Every 12 hours' },
  { value: 1440, label: 'Daily' },
];

const PRIORITY_OPTIONS: { value: ScrapingPriority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' },
];

// ============================================
// Component
// ============================================

export function SourceSettingsModal({
  isOpen,
  onClose,
  source,
  onSuccess,
}: SourceSettingsModalProps) {
  const { updateSource, isUpdatingSource } = useSourceScrape();
  
  // Form state
  const [maxItems, setMaxItems] = useState(3);
  const [enableScreenshots, setEnableScreenshots] = useState(true);
  const [enableComments, setEnableComments] = useState(true);
  const [scrapingMode, setScrapingMode] = useState<ScrapingMode>('balanced');
  const [intervalMinutes, setIntervalMinutes] = useState(60);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [sourceType, setSourceType] = useState<SourceType>('competitor');
  const [priority, setPriority] = useState<ScrapingPriority>('normal');

  // Reset form when source changes
  useEffect(() => {
    if (source) {
      setMaxItems(source.scrapeSettings?.maxItems ?? 3);
      setEnableScreenshots(source.scrapeSettings?.enableScreenshots ?? true);
      setEnableComments(source.scrapeSettings?.enableComments ?? true);
      setScrapingMode(source.scrapeSettings?.scrapingMode ?? 'balanced');
      setIntervalMinutes(
        source.scrapeSettings?.intervalMinutes ?? 
        source.scrapeSchedule?.intervalMinutes ?? 
        60
      );
      setName(source.name || source.displayName || source.targetName || '');
      setDescription(source.description || '');
      setSourceType((source.sourceType || source.profileType || 'competitor') as SourceType);
      setPriority(source.priority || 'normal');
    }
  }, [source]);

  const handleSave = async () => {
    if (!source) return;

    const payload: SourceUpdatePayload = {
      name: name || undefined,
      description: description || undefined,
      sourceType,
      priority,
      scrapeSettings: {
        maxItems,
        enableScreenshots,
        enableComments,
        scrapingMode,
        intervalMinutes,
      },
    };

    await updateSource(source._id, payload);
    onSuccess?.();
    onClose();
  };

  const sourceName = source?.name || source?.displayName || source?.targetName || 'Source';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Settings: ${sourceName}`}
      size="md"
    >
      <div className="space-y-6">
        {/* Basic Info Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-surface-700 dark:text-surface-300 flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Basic Info
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Source name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-4 py-2 rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              placeholder="Optional description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1 flex items-center gap-1">
                <Tag className="h-3.5 w-3.5" />
                Source Type
              </label>
              <select
                value={sourceType}
                onChange={(e) => setSourceType(e.target.value as SourceType)}
                className="w-full px-4 py-2 rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {SOURCE_TYPES.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1 flex items-center gap-1">
                <Activity className="h-3.5 w-3.5" />
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as ScrapingPriority)}
                className="w-full px-4 py-2 rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {PRIORITY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-surface-200 dark:border-surface-700" />

        {/* Scrape Settings Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-surface-700 dark:text-surface-300 flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Scrape Settings
          </h3>

          {/* Max Items */}
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1 flex items-center gap-1">
              <Hash className="h-3.5 w-3.5" />
              Max Items per Scrape
            </label>
            <input
              type="number"
              min={1}
              max={50}
              value={maxItems}
              onChange={(e) => setMaxItems(Math.min(50, Math.max(1, Number(e.target.value))))}
              className="w-full px-4 py-2 rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <p className="mt-1 text-xs text-surface-500">
              How many posts to collect per scrape (1-50, default: 3)
            </p>
          </div>

          {/* Interval */}
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1 flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              Scrape Interval
            </label>
            <select
              value={intervalMinutes}
              onChange={(e) => setIntervalMinutes(Number(e.target.value))}
              className="w-full px-4 py-2 rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {INTERVAL_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-surface-500">
              How often to scrape when monitoring is enabled
            </p>
          </div>

          {/* Scraping Mode */}
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1 flex items-center gap-1">
              <Gauge className="h-3.5 w-3.5" />
              Scraping Mode
            </label>
            <select
              value={scrapingMode}
              onChange={(e) => setScrapingMode(e.target.value as ScrapingMode)}
              className="w-full px-4 py-2 rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {SCRAPING_MODES.map((mode) => (
                <option key={mode.value} value={mode.value}>
                  {mode.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-surface-500">
              {SCRAPING_MODES.find((m) => m.value === scrapingMode)?.description}
            </p>
          </div>

          {/* Toggle Options */}
          <div className="space-y-3">
            {/* Enable Screenshots */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  checked={enableScreenshots}
                  onChange={(e) => setEnableScreenshots(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-6 bg-surface-300 dark:bg-surface-600 rounded-full peer-checked:bg-primary-500 peer-focus:ring-2 peer-focus:ring-primary-300 transition-colors" />
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-4 transition-transform" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 text-sm font-medium text-surface-700 dark:text-surface-300">
                  <Camera className="h-4 w-4" />
                  Capture Screenshots
                </div>
                <p className="text-xs text-surface-500">
                  Take a screenshot of each post (default: enabled)
                </p>
              </div>
            </label>

            {/* Enable Comments */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  checked={enableComments}
                  onChange={(e) => setEnableComments(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-6 bg-surface-300 dark:bg-surface-600 rounded-full peer-checked:bg-primary-500 peer-focus:ring-2 peer-focus:ring-primary-300 transition-colors" />
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-4 transition-transform" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 text-sm font-medium text-surface-700 dark:text-surface-300">
                  <MessageSquare className="h-4 w-4" />
                  Collect Comments
                </div>
                <p className="text-xs text-surface-500">
                  Collect top comments on each post
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-surface-200 dark:border-surface-700">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} isLoading={isUpdatingSource}>
            Save Settings
          </Button>
        </div>
      </div>
    </Modal>
  );
}
