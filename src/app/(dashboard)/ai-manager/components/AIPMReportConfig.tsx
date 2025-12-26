'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { IAIPMConfig, UpdateAIPMConfigDto, DayOfWeek } from '@/types/aipm';
import { cn } from '@/lib/utils';
import {
  FileText,
  Mail,
  Bell,
  Calendar,
  Clock,
  CheckSquare,
  AlertTriangle,
  TrendingUp,
  Users,
  Target,
  Lightbulb,
  Globe,
} from 'lucide-react';

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

const DAYS_OF_WEEK = [
  { value: '0', label: 'Sunday' },
  { value: '1', label: 'Monday' },
  { value: '2', label: 'Tuesday' },
  { value: '3', label: 'Wednesday' },
  { value: '4', label: 'Thursday' },
  { value: '5', label: 'Friday' },
  { value: '6', label: 'Saturday' },
];

interface AIPMReportConfigProps {
  config: IAIPMConfig;
  updateConfig: (updates: UpdateAIPMConfigDto) => Promise<IAIPMConfig>;
  isUpdating: boolean;
  disabled?: boolean;
}

export default function AIPMReportConfig({
  config,
  updateConfig,
  isUpdating,
  disabled,
}: AIPMReportConfigProps) {
  const { reporting } = config;
  const { dailyDigest, weeklyRetrospective, deliveryMethod } = reporting;

  const toggleDailyDigest = () => {
    updateConfig({
      reporting: {
        dailyDigest: { enabled: !dailyDigest.enabled },
      },
    });
  };

  const toggleWeeklyRetro = () => {
    updateConfig({
      reporting: {
        weeklyRetrospective: { enabled: !weeklyRetrospective.enabled },
      },
    });
  };

  const updateDailyDigestOption = (key: string, value: boolean) => {
    updateConfig({
      reporting: {
        dailyDigest: { [key]: value },
      },
    });
  };

  const updateWeeklyRetroOption = (key: string, value: boolean | number) => {
    updateConfig({
      reporting: {
        weeklyRetrospective: { [key]: value },
      },
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Daily Digest */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary-500" />
            Daily Digest
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-surface-50 dark:bg-surface-900/50">
            <div>
              <p className="font-medium text-surface-900 dark:text-white">
                Enable Daily Digest
              </p>
              <p className="text-sm text-surface-500 dark:text-surface-400">
                Receive a daily summary of team progress
              </p>
            </div>
            <ToggleSwitch
              checked={dailyDigest.enabled}
              onChange={toggleDailyDigest}
              disabled={disabled || isUpdating}
            />
          </div>

          {dailyDigest.enabled && (
            <>
              {/* Time & Timezone */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-surface-700 dark:text-surface-300 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Send at
                  </label>
                  <input
                    type="time"
                    value={dailyDigest.time}
                    onChange={(e) => updateConfig({
                      reporting: { dailyDigest: { time: e.target.value } },
                    })}
                    disabled={disabled}
                    className="w-full px-3 py-2 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-surface-700 dark:text-surface-300 flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Timezone
                  </label>
                  <Select
                    options={TIMEZONES}
                    value={dailyDigest.timezone || config.checkinSchedule?.timezone || 'America/Los_Angeles'}
                    onChange={(v) => updateConfig({
                      reporting: { dailyDigest: { timezone: v } },
                    })}
                    disabled={disabled}
                  />
                </div>
              </div>

              {/* Include Options */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-surface-700 dark:text-surface-300">
                  Include in Report
                </p>
                <ReportOption
                  icon={AlertTriangle}
                  label="Overdue Tickets"
                  description="List of overdue items"
                  checked={dailyDigest.includeOverdueTickets}
                  onChange={(v) => updateDailyDigestOption('includeOverdueTickets', v)}
                  disabled={disabled}
                />
                <ReportOption
                  icon={Target}
                  label="Blockers"
                  description="Issues blocking progress"
                  checked={dailyDigest.includeBlockers}
                  onChange={(v) => updateDailyDigestOption('includeBlockers', v)}
                  disabled={disabled}
                />
                <ReportOption
                  icon={CheckSquare}
                  label="Completed Count"
                  description="Tasks finished today"
                  checked={dailyDigest.includeCompletedCount}
                  onChange={(v) => updateDailyDigestOption('includeCompletedCount', v)}
                  disabled={disabled}
                />
                <ReportOption
                  icon={TrendingUp}
                  label="Sentiment Summary"
                  description="Team morale overview"
                  checked={dailyDigest.includeSentimentSummary}
                  onChange={(v) => updateDailyDigestOption('includeSentimentSummary', v)}
                  disabled={disabled}
                />
                <ReportOption
                  icon={Calendar}
                  label="Upcoming Deadlines"
                  description="Tasks due soon"
                  checked={dailyDigest.includeUpcomingDeadlines}
                  onChange={(v) => updateDailyDigestOption('includeUpcomingDeadlines', v)}
                  disabled={disabled}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Weekly Retrospective */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-accent-500" />
            Weekly Retrospective
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-surface-50 dark:bg-surface-900/50">
            <div>
              <p className="font-medium text-surface-900 dark:text-white">
                Enable Weekly Report
              </p>
              <p className="text-sm text-surface-500 dark:text-surface-400">
                Comprehensive weekly analysis
              </p>
            </div>
            <ToggleSwitch
              checked={weeklyRetrospective.enabled}
              onChange={toggleWeeklyRetro}
              disabled={disabled || isUpdating}
            />
          </div>

          {weeklyRetrospective.enabled && (
            <>
              {/* Day, Time & Timezone */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-surface-700 dark:text-surface-300 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Day
                  </label>
                  <Select
                    options={DAYS_OF_WEEK}
                    value={weeklyRetrospective.dayOfWeek.toString()}
                    onChange={(v) => updateWeeklyRetroOption('dayOfWeek', parseInt(v))}
                    disabled={disabled}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-surface-700 dark:text-surface-300 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Time
                  </label>
                  <input
                    type="time"
                    value={weeklyRetrospective.time}
                    onChange={(e) => updateConfig({
                      reporting: { weeklyRetrospective: { time: e.target.value } },
                    })}
                    disabled={disabled}
                    className="w-full px-3 py-2 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-surface-700 dark:text-surface-300 flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Timezone
                  </label>
                  <Select
                    options={TIMEZONES}
                    value={weeklyRetrospective.timezone || config.checkinSchedule?.timezone || 'America/Los_Angeles'}
                    onChange={(v) => updateConfig({
                      reporting: { weeklyRetrospective: { timezone: v } },
                    })}
                    disabled={disabled}
                  />
                </div>
              </div>

              {/* Include Options */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-surface-700 dark:text-surface-300">
                  Include in Report
                </p>
                <ReportOption
                  icon={TrendingUp}
                  label="Velocity Trends"
                  description="Week-over-week comparison"
                  checked={weeklyRetrospective.includeVelocityTrends}
                  onChange={(v) => updateWeeklyRetroOption('includeVelocityTrends', v)}
                  disabled={disabled}
                />
                <ReportOption
                  icon={Users}
                  label="Sentiment Trends"
                  description="Team morale over time"
                  checked={weeklyRetrospective.includeSentimentTrends}
                  onChange={(v) => updateWeeklyRetroOption('includeSentimentTrends', v)}
                  disabled={disabled}
                />
                <ReportOption
                  icon={Target}
                  label="Top Performers"
                  description="Highlight achievements"
                  checked={weeklyRetrospective.includeTopPerformers}
                  onChange={(v) => updateWeeklyRetroOption('includeTopPerformers', v)}
                  disabled={disabled}
                />
                <ReportOption
                  icon={AlertTriangle}
                  label="Concerns"
                  description="Items needing attention"
                  checked={weeklyRetrospective.includeConcerns}
                  onChange={(v) => updateWeeklyRetroOption('includeConcerns', v)}
                  disabled={disabled}
                />
                <ReportOption
                  icon={Lightbulb}
                  label="Recommendations"
                  description="AI suggestions for improvement"
                  checked={weeklyRetrospective.includeRecommendations}
                  onChange={(v) => updateWeeklyRetroOption('includeRecommendations', v)}
                  disabled={disabled}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Delivery Settings */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-emerald-500" />
            Delivery Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <DeliveryOption
              icon={Mail}
              title="Email Only"
              description="Receive reports via email"
              selected={deliveryMethod === 'email'}
              onClick={() => updateConfig({ reporting: { deliveryMethod: 'email' } })}
              disabled={disabled}
            />
            <DeliveryOption
              icon={Bell}
              title="In-App Only"
              description="View reports in TaskFlow"
              selected={deliveryMethod === 'in_app'}
              onClick={() => updateConfig({ reporting: { deliveryMethod: 'in_app' } })}
              disabled={disabled}
            />
            <DeliveryOption
              icon={CheckSquare}
              title="Both"
              description="Email and in-app notifications"
              selected={deliveryMethod === 'both'}
              onClick={() => updateConfig({ reporting: { deliveryMethod: 'both' } })}
              disabled={disabled}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Toggle Switch Component
function ToggleSwitch({
  checked,
  onChange,
  disabled,
  color = 'primary',
}: {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  color?: string;
}) {
  return (
    <button
      onClick={onChange}
      disabled={disabled}
      className={cn(
        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
        checked ? 'bg-primary-600' : 'bg-surface-300 dark:bg-surface-600',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <span
        className={cn(
          'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
          checked ? 'translate-x-6' : 'translate-x-1'
        )}
      />
    </button>
  );
}

// Report Option Component
function ReportOption({
  icon: Icon,
  label,
  description,
  checked,
  onChange,
  disabled,
}: {
  icon: typeof FileText;
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
      <div className="flex items-center gap-3">
        <Icon className="h-4 w-4 text-surface-400" />
        <div>
          <p className="text-sm font-medium text-surface-900 dark:text-white">{label}</p>
          <p className="text-xs text-surface-500">{description}</p>
        </div>
      </div>
      <ToggleSwitch
        checked={checked}
        onChange={() => onChange(!checked)}
        disabled={disabled}
      />
    </div>
  );
}

// Delivery Option Component
function DeliveryOption({
  icon: Icon,
  title,
  description,
  selected,
  onClick,
  disabled,
}: {
  icon: typeof Mail;
  title: string;
  description: string;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'p-4 rounded-xl border-2 text-left transition-all',
        selected
          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
          : 'border-surface-200 dark:border-surface-700 hover:border-surface-300 dark:hover:border-surface-600',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <Icon className={cn(
        'h-6 w-6 mb-2',
        selected ? 'text-primary-600 dark:text-primary-400' : 'text-surface-400'
      )} />
      <p className={cn(
        'font-medium',
        selected ? 'text-primary-700 dark:text-primary-300' : 'text-surface-700 dark:text-surface-300'
      )}>
        {title}
      </p>
      <p className="text-xs text-surface-500 mt-1">{description}</p>
    </button>
  );
}

