'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { IAIPMConfig, UpdateAIPMConfigDto, DayOfWeek } from '@/types/aipm';
import { cn } from '@/lib/utils';
import {
  Calendar,
  Clock,
  Globe,
  Coffee,
  Sun,
  Save,
} from 'lucide-react';

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sun', fullLabel: 'Sunday' },
  { value: 1, label: 'Mon', fullLabel: 'Monday' },
  { value: 2, label: 'Tue', fullLabel: 'Tuesday' },
  { value: 3, label: 'Wed', fullLabel: 'Wednesday' },
  { value: 4, label: 'Thu', fullLabel: 'Thursday' },
  { value: 5, label: 'Fri', fullLabel: 'Friday' },
  { value: 6, label: 'Sat', fullLabel: 'Saturday' },
];

const TIMEZONES = [
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Central European (CET)' },
  { value: 'Asia/Tokyo', label: 'Japan (JST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST)' },
];

interface AIPMScheduleConfigProps {
  config: IAIPMConfig;
  updateConfig: (updates: UpdateAIPMConfigDto) => Promise<IAIPMConfig>;
  isUpdating: boolean;
  disabled?: boolean;
}

export default function AIPMScheduleConfig({
  config,
  updateConfig,
  isUpdating,
  disabled,
}: AIPMScheduleConfigProps) {
  const { checkinSchedule, deepWorkHours } = config;

  const handleToggleEnabled = () => {
    updateConfig({
      checkinSchedule: { enabled: !checkinSchedule.enabled },
    });
  };

  const handleTimeChange = (time: string) => {
    updateConfig({
      checkinSchedule: { time },
    });
  };

  const handleTimezoneChange = (timezone: string) => {
    updateConfig({
      checkinSchedule: { timezone },
    });
  };

  const handleFrequencyChange = (frequency: string) => {
    updateConfig({
      checkinSchedule: { frequency: frequency as 'daily' | 'weekly' | 'custom' },
    });
  };

  const handleDayToggle = (day: DayOfWeek) => {
    const currentDays = checkinSchedule.daysOfWeek;
    const newDays = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day].sort((a, b) => a - b);
    
    if (newDays.length === 0) return; // Must have at least one day
    
    updateConfig({
      checkinSchedule: { daysOfWeek: newDays },
    });
  };

  const handleDeepWorkToggle = () => {
    updateConfig({
      deepWorkHours: { enabled: !deepWorkHours.enabled },
    });
  };

  const handleDeepWorkTimeChange = (field: 'startTime' | 'endTime', value: string) => {
    updateConfig({
      deepWorkHours: { [field]: value },
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Check-in Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary-500" />
            Check-in Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-surface-50 dark:bg-surface-900/50">
            <div>
              <p className="font-medium text-surface-900 dark:text-white">
                Enable Scheduled Check-ins
              </p>
              <p className="text-sm text-surface-500 dark:text-surface-400">
                AI will automatically reach out to team members
              </p>
            </div>
            <button
              onClick={handleToggleEnabled}
              disabled={disabled || isUpdating}
              className={cn(
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                checkinSchedule.enabled 
                  ? 'bg-primary-600' 
                  : 'bg-surface-300 dark:bg-surface-600',
                (disabled || isUpdating) && 'opacity-50 cursor-not-allowed'
              )}
            >
              <span
                className={cn(
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  checkinSchedule.enabled ? 'translate-x-6' : 'translate-x-1'
                )}
              />
            </button>
          </div>

          {/* Frequency */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-surface-700 dark:text-surface-300">
              Frequency
            </label>
            <Select
              options={[
                { value: 'daily', label: 'Daily' },
                { value: 'weekly', label: 'Weekly' },
                { value: 'custom', label: 'Custom days' },
              ]}
              value={checkinSchedule.frequency}
              onChange={handleFrequencyChange}
              disabled={disabled || !checkinSchedule.enabled}
            />
          </div>

          {/* Days of Week */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-surface-700 dark:text-surface-300">
              Days
            </label>
            <div className="flex flex-wrap gap-2">
              {DAYS_OF_WEEK.map((day) => (
                <button
                  key={day.value}
                  onClick={() => handleDayToggle(day.value as DayOfWeek)}
                  disabled={disabled || !checkinSchedule.enabled}
                  className={cn(
                    'w-12 h-12 rounded-xl text-sm font-medium transition-all duration-200',
                    checkinSchedule.daysOfWeek.includes(day.value as DayOfWeek)
                      ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                      : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700',
                    (disabled || !checkinSchedule.enabled) && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>

          {/* Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-surface-700 dark:text-surface-300 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Check-in Time
              </label>
              <Input
                type="time"
                value={checkinSchedule.time}
                onChange={(e) => handleTimeChange(e.target.value)}
                disabled={disabled || !checkinSchedule.enabled}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-surface-700 dark:text-surface-300 flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Timezone
              </label>
              <Select
                options={TIMEZONES}
                value={checkinSchedule.timezone}
                onChange={handleTimezoneChange}
                disabled={disabled || !checkinSchedule.enabled}
              />
            </div>
          </div>

          {/* Skip Holidays */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-surface-50 dark:bg-surface-900/50">
            <div>
              <p className="font-medium text-surface-900 dark:text-white">
                Skip Holidays
              </p>
              <p className="text-sm text-surface-500 dark:text-surface-400">
                Automatically skip check-ins on public holidays
              </p>
            </div>
            <button
              onClick={() => updateConfig({ checkinSchedule: { skipHolidays: !checkinSchedule.skipHolidays } })}
              disabled={disabled || !checkinSchedule.enabled}
              className={cn(
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                checkinSchedule.skipHolidays 
                  ? 'bg-primary-600' 
                  : 'bg-surface-300 dark:bg-surface-600',
                (disabled || !checkinSchedule.enabled) && 'opacity-50 cursor-not-allowed'
              )}
            >
              <span
                className={cn(
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  checkinSchedule.skipHolidays ? 'translate-x-6' : 'translate-x-1'
                )}
              />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Deep Work Protection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coffee className="h-5 w-5 text-amber-500" />
            Deep Work Protection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-surface-50 dark:bg-surface-900/50">
            <div>
              <p className="font-medium text-surface-900 dark:text-white">
                Enable Focus Hours
              </p>
              <p className="text-sm text-surface-500 dark:text-surface-400">
                Block AI interruptions during focus time
              </p>
            </div>
            <button
              onClick={handleDeepWorkToggle}
              disabled={disabled || isUpdating}
              className={cn(
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                deepWorkHours.enabled 
                  ? 'bg-amber-500' 
                  : 'bg-surface-300 dark:bg-surface-600',
                (disabled || isUpdating) && 'opacity-50 cursor-not-allowed'
              )}
            >
              <span
                className={cn(
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  deepWorkHours.enabled ? 'translate-x-6' : 'translate-x-1'
                )}
              />
            </button>
          </div>

          {deepWorkHours.enabled && (
            <>
              {/* Time Range */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-surface-700 dark:text-surface-300">
                    Start Time
                  </label>
                  <Input
                    type="time"
                    value={deepWorkHours.startTime}
                    onChange={(e) => handleDeepWorkTimeChange('startTime', e.target.value)}
                    disabled={disabled}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-surface-700 dark:text-surface-300">
                    End Time
                  </label>
                  <Input
                    type="time"
                    value={deepWorkHours.endTime}
                    onChange={(e) => handleDeepWorkTimeChange('endTime', e.target.value)}
                    disabled={disabled}
                  />
                </div>
              </div>

              {/* Days */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-surface-700 dark:text-surface-300">
                  Apply on Days
                </label>
                <div className="flex flex-wrap gap-2">
                  {DAYS_OF_WEEK.map((day) => (
                    <button
                      key={day.value}
                      onClick={() => {
                        const currentDays = deepWorkHours.daysOfWeek;
                        const newDays = currentDays.includes(day.value as DayOfWeek)
                          ? currentDays.filter(d => d !== day.value)
                          : [...currentDays, day.value as DayOfWeek].sort((a, b) => a - b);
                        updateConfig({ deepWorkHours: { daysOfWeek: newDays } });
                      }}
                      disabled={disabled}
                      className={cn(
                        'w-12 h-12 rounded-xl text-sm font-medium transition-all duration-200',
                        deepWorkHours.daysOfWeek.includes(day.value as DayOfWeek)
                          ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/25'
                          : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700',
                        disabled && 'opacity-50 cursor-not-allowed'
                      )}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Info */}
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                <div className="flex items-start gap-3">
                  <Sun className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                      Focus Time Protected
                    </p>
                    <p className="text-sm text-amber-700 dark:text-amber-400">
                      Check-ins will be delayed until after {deepWorkHours.endTime} on selected days.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


