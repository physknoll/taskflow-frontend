'use client';

import { useState, useEffect } from 'react';
import { CRON_PRESETS } from '@/types/scraping';
import { Clock, ChevronDown, AlertCircle, CheckCircle } from 'lucide-react';

interface CronBuilderProps {
  value: string;
  onChange: (value: string) => void;
  timezone?: string;
}

// Simple cron validation
function isValidCron(expression: string): boolean {
  const parts = expression.trim().split(/\s+/);
  if (parts.length !== 5) return false;
  
  // Basic validation for each part
  const patterns = [
    /^(\*|([0-9]|[1-5][0-9])(,([0-9]|[1-5][0-9]))*|(\*\/[0-9]+))$/, // minute
    /^(\*|([0-9]|1[0-9]|2[0-3])(,([0-9]|1[0-9]|2[0-3]))*|(\*\/[0-9]+))$/, // hour
    /^(\*|([1-9]|[12][0-9]|3[01])(,([1-9]|[12][0-9]|3[01]))*|(\*\/[0-9]+))$/, // day
    /^(\*|([1-9]|1[0-2])(,([1-9]|1[0-2]))*|(\*\/[0-9]+))$/, // month
    /^(\*|[0-6](,[0-6])*|[0-6]-[0-6]|(\*\/[0-9]+))$/, // weekday
  ];
  
  return parts.every((part, index) => patterns[index].test(part));
}

// Get human-readable description of cron expression
function describeCron(expression: string): string {
  // Check presets first
  const preset = CRON_PRESETS.find((p) => p.expression === expression);
  if (preset) return preset.description;
  
  const parts = expression.trim().split(/\s+/);
  if (parts.length !== 5) return 'Invalid expression';
  
  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;
  
  let description = '';
  
  // Time
  if (minute !== '*' && hour !== '*') {
    const mins = minute.padStart(2, '0');
    const hrs = hour.includes(',') ? hour : hour.padStart(2, '0');
    description = `At ${hrs}:${mins}`;
  } else if (hour.startsWith('*/')) {
    description = `Every ${hour.slice(2)} hours`;
  } else if (minute.startsWith('*/')) {
    description = `Every ${minute.slice(2)} minutes`;
  } else {
    description = 'At specified times';
  }
  
  // Day of week
  if (dayOfWeek !== '*') {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    if (dayOfWeek === '1-5') {
      description += ' on weekdays';
    } else if (dayOfWeek === '0,6') {
      description += ' on weekends';
    } else if (/^[0-6]$/.test(dayOfWeek)) {
      description += ` on ${days[parseInt(dayOfWeek)]}`;
    }
  }
  
  // Day of month
  if (dayOfMonth !== '*') {
    if (dayOfMonth === '1') {
      description += ' on the 1st';
    } else {
      description += ` on day ${dayOfMonth}`;
    }
  }
  
  return description;
}

// Calculate next run time (simple approximation)
function getNextRunPreview(expression: string): Date | null {
  if (!isValidCron(expression)) return null;
  
  // For simplicity, just return a placeholder for now
  // In production, you'd use a library like cron-parser
  const now = new Date();
  now.setSeconds(0);
  now.setMilliseconds(0);
  
  // Add 1 hour as a simple estimate
  now.setHours(now.getHours() + 1);
  return now;
}

export function CronBuilder({ value, onChange, timezone = 'UTC' }: CronBuilderProps) {
  const [showPresets, setShowPresets] = useState(false);
  const [customInput, setCustomInput] = useState(value);
  const [isCustom, setIsCustom] = useState(!CRON_PRESETS.some((p) => p.expression === value));

  useEffect(() => {
    setCustomInput(value);
    setIsCustom(!CRON_PRESETS.some((p) => p.expression === value));
  }, [value]);

  const isValid = isValidCron(value);
  const description = describeCron(value);
  const activePreset = CRON_PRESETS.find((p) => p.expression === value);

  const handlePresetSelect = (expression: string) => {
    onChange(expression);
    setIsCustom(false);
    setShowPresets(false);
  };

  const handleCustomChange = (newValue: string) => {
    setCustomInput(newValue);
    setIsCustom(true);
    if (isValidCron(newValue)) {
      onChange(newValue);
    }
  };

  return (
    <div className="space-y-3">
      {/* Preset Selector */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowPresets(!showPresets)}
          className="w-full px-4 py-2.5 rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 text-left flex items-center justify-between hover:border-primary-400 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Clock className="h-4 w-4 text-primary-500" />
            <span className="text-surface-900 dark:text-white">
              {isCustom ? 'Custom Schedule' : activePreset?.label || 'Select Schedule'}
            </span>
          </div>
          <ChevronDown
            className={`h-4 w-4 text-surface-400 transition-transform ${
              showPresets ? 'rotate-180' : ''
            }`}
          />
        </button>
        
        {showPresets && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowPresets(false)}
            />
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-surface-800 rounded-lg shadow-lg border border-surface-200 dark:border-surface-700 py-1 z-20 max-h-64 overflow-y-auto">
              {CRON_PRESETS.map((preset) => (
                <button
                  key={preset.expression}
                  type="button"
                  onClick={() => handlePresetSelect(preset.expression)}
                  className={`w-full px-4 py-2.5 text-left hover:bg-surface-50 dark:hover:bg-surface-700 flex items-center justify-between ${
                    value === preset.expression ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                  }`}
                >
                  <div>
                    <p className="font-medium text-surface-900 dark:text-white">
                      {preset.label}
                    </p>
                    <p className="text-xs text-surface-500">{preset.description}</p>
                  </div>
                  <code className="text-xs font-mono text-surface-400 ml-4">
                    {preset.expression}
                  </code>
                </button>
              ))}
              <hr className="my-1 border-surface-200 dark:border-surface-700" />
              <button
                type="button"
                onClick={() => {
                  setIsCustom(true);
                  setShowPresets(false);
                }}
                className="w-full px-4 py-2.5 text-left hover:bg-surface-50 dark:hover:bg-surface-700"
              >
                <p className="font-medium text-surface-900 dark:text-white">Custom</p>
                <p className="text-xs text-surface-500">Enter a custom cron expression</p>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Custom Input */}
      {isCustom && (
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
            Cron Expression
          </label>
          <input
            type="text"
            value={customInput}
            onChange={(e) => handleCustomChange(e.target.value)}
            placeholder="* * * * *"
            className={`w-full px-4 py-2 rounded-lg border font-mono text-sm ${
              customInput && !isValidCron(customInput)
                ? 'border-error-300 dark:border-error-600'
                : 'border-surface-300 dark:border-surface-600'
            } bg-white dark:bg-surface-800`}
          />
          <p className="mt-1 text-xs text-surface-500">
            Format: minute hour day month weekday (e.g., 0 9 * * 1-5)
          </p>
        </div>
      )}

      {/* Validation & Description */}
      <div
        className={`flex items-start gap-2 p-3 rounded-lg ${
          isValid
            ? 'bg-success-50 dark:bg-success-900/20'
            : 'bg-error-50 dark:bg-error-900/20'
        }`}
      >
        {isValid ? (
          <CheckCircle className="h-4 w-4 text-success-600 dark:text-success-400 mt-0.5 flex-shrink-0" />
        ) : (
          <AlertCircle className="h-4 w-4 text-error-600 dark:text-error-400 mt-0.5 flex-shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <p
            className={`text-sm font-medium ${
              isValid
                ? 'text-success-700 dark:text-success-300'
                : 'text-error-700 dark:text-error-300'
            }`}
          >
            {isValid ? description : 'Invalid cron expression'}
          </p>
          {isValid && (
            <p className="text-xs text-surface-500 mt-1">
              Timezone: {timezone}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
