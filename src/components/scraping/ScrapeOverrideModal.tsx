'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { ScrapeSettingsForm, DEFAULT_EXECUTION_SETTINGS } from './ScrapeSettingsForm';
import { ExecutionScrapeSettings } from '@/types/scraping';
import { Settings, Play, Info } from 'lucide-react';

interface ScrapeOverrideModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Source or schedule name for display */
  targetName: string;
  /** Default settings from the source (if any) */
  defaultSettings?: ExecutionScrapeSettings;
  /** Callback when user confirms scrape */
  onConfirm: (overrides?: ExecutionScrapeSettings) => Promise<void>;
  /** Loading state */
  isLoading?: boolean;
  /** Type of scrape: 'source' for single source, 'schedule' for schedule run */
  type?: 'source' | 'schedule';
}

export function ScrapeOverrideModal({
  isOpen,
  onClose,
  targetName,
  defaultSettings,
  onConfirm,
  isLoading,
  type = 'source',
}: ScrapeOverrideModalProps) {
  const [useOverrides, setUseOverrides] = useState(false);
  const [settings, setSettings] = useState<ExecutionScrapeSettings>(
    defaultSettings || DEFAULT_EXECUTION_SETTINGS
  );

  const handleConfirm = async () => {
    try {
      await onConfirm(useOverrides ? settings : undefined);
      onClose();
    } catch {
      // Error handled by caller
    }
  };

  const handleClose = () => {
    setUseOverrides(false);
    setSettings(defaultSettings || DEFAULT_EXECUTION_SETTINGS);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={type === 'schedule' ? 'Run Schedule' : 'Scrape Now'}
      size="md"
    >
      <div className="space-y-5">
        {/* Target Info */}
        <div className="flex items-center gap-3 p-3 bg-surface-50 dark:bg-surface-800 rounded-lg">
          <Play className="h-5 w-5 text-primary-500" />
          <div>
            <p className="text-sm font-medium text-surface-900 dark:text-white">
              {targetName}
            </p>
            <p className="text-xs text-surface-500">
              {type === 'schedule'
                ? 'This will run all targets in the schedule'
                : 'This will trigger an immediate scrape'}
            </p>
          </div>
        </div>

        {/* Override Toggle */}
        <div className="border border-surface-200 dark:border-surface-700 rounded-lg">
          <label className="flex items-center gap-3 p-4 cursor-pointer">
            <input
              type="checkbox"
              checked={useOverrides}
              onChange={(e) => setUseOverrides(e.target.checked)}
              className="w-4 h-4 rounded border-surface-300"
            />
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-surface-500" />
              <div>
                <span className="block text-sm font-medium text-surface-700 dark:text-surface-300">
                  Override {type === 'schedule' ? 'Global' : 'Default'} Settings
                </span>
                <span className="block text-xs text-surface-500">
                  Use custom settings for this {type === 'schedule' ? 'run' : 'scrape'} only
                </span>
              </div>
            </div>
          </label>

          {useOverrides && (
            <div className="px-4 pb-4 border-t border-surface-200 dark:border-surface-700 pt-4">
              <ScrapeSettingsForm
                settings={settings}
                onChange={setSettings}
                compact
              />
            </div>
          )}
        </div>

        {/* Info about defaults */}
        {!useOverrides && defaultSettings && (
          <div className="flex items-start gap-2 p-3 bg-surface-50 dark:bg-surface-800/50 rounded-lg">
            <Info className="h-4 w-4 text-surface-400 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-surface-500">
              <p className="font-medium mb-1">Current default settings:</p>
              <ul className="space-y-0.5">
                <li>Max items: {defaultSettings.maxItems ?? 20}</li>
                <li>Mode: {defaultSettings.scrapingMode ?? 'balanced'}</li>
                <li>Comments: {defaultSettings.enableComments ? 'Enabled' : 'Disabled'}</li>
                <li>Screenshots: {defaultSettings.enableScreenshots ? 'Enabled' : 'Disabled'}</li>
              </ul>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-surface-200 dark:border-surface-700">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} isLoading={isLoading}>
            <Play className="h-4 w-4 mr-2" />
            {type === 'schedule' ? 'Run Schedule' : 'Start Scrape'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
