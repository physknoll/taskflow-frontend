'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { IAIPMConfig, UpdateAIPMConfigDto } from '@/types/aipm';
import { cn } from '@/lib/utils';
import {
  Zap,
  Trash2,
  Users,
  Calendar,
  Clock,
  Brain,
  Sparkles,
  AlertTriangle,
  Archive,
} from 'lucide-react';

interface AIPMSmartFeaturesProps {
  config: IAIPMConfig;
  updateConfig: (updates: UpdateAIPMConfigDto) => Promise<IAIPMConfig>;
  isUpdating: boolean;
  disabled?: boolean;
}

export default function AIPMSmartFeatures({
  config,
  updateConfig,
  isUpdating,
  disabled,
}: AIPMSmartFeaturesProps) {
  const { features } = config;

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-primary-500/10 via-accent-500/5 to-transparent border border-primary-200/50 dark:border-primary-800/50">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 shadow-lg">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-surface-900 dark:text-white">
              Smart Automation Features
            </h3>
            <p className="text-surface-600 dark:text-surface-400 mt-1">
              Enable AI-powered features that help keep your projects running smoothly. 
              These features work automatically in the background.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stale Ticket Cleanup */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-amber-500" />
              Stale Ticket Cleanup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-xl bg-surface-50 dark:bg-surface-900/50">
              <div>
                <p className="font-medium text-surface-900 dark:text-white">
                  Enable Cleanup Alerts
                </p>
                <p className="text-sm text-surface-500 dark:text-surface-400">
                  Get notified about inactive tickets
                </p>
              </div>
              <ToggleSwitch
                checked={features.staleTicketCleanup.enabled}
                onChange={() => updateConfig({
                  features: {
                    staleTicketCleanup: { enabled: !features.staleTicketCleanup.enabled },
                  },
                })}
                disabled={disabled || isUpdating}
              />
            </div>

            {features.staleTicketCleanup.enabled && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-surface-700 dark:text-surface-300">
                    Threshold (days without activity)
                  </label>
                  <Input
                    type="number"
                    min={7}
                    max={90}
                    value={features.staleTicketCleanup.thresholdDays}
                    onChange={(e) => updateConfig({
                      features: {
                        staleTicketCleanup: { thresholdDays: parseInt(e.target.value) || 30 },
                      },
                    })}
                    disabled={disabled}
                  />
                  <p className="text-xs text-surface-500">
                    Tickets inactive for longer than this will be flagged
                  </p>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                  <div className="flex items-center gap-3">
                    <Archive className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    <div>
                      <p className="font-medium text-amber-800 dark:text-amber-300">
                        Auto-Archive
                      </p>
                      <p className="text-sm text-amber-700 dark:text-amber-400">
                        Automatically archive stale tickets
                      </p>
                    </div>
                  </div>
                  <ToggleSwitch
                    checked={features.staleTicketCleanup.autoArchive}
                    onChange={() => updateConfig({
                      features: {
                        staleTicketCleanup: { autoArchive: !features.staleTicketCleanup.autoArchive },
                      },
                    })}
                    disabled={disabled}
                    color="amber"
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Resource Balancing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary-500" />
              Resource Balancing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-xl bg-surface-50 dark:bg-surface-900/50">
              <div>
                <p className="font-medium text-surface-900 dark:text-white">
                  Enable Balancing Suggestions
                </p>
                <p className="text-sm text-surface-500 dark:text-surface-400">
                  Get workload distribution recommendations
                </p>
              </div>
              <ToggleSwitch
                checked={features.resourceBalancing.enabled}
                onChange={() => updateConfig({
                  features: {
                    resourceBalancing: { enabled: !features.resourceBalancing.enabled },
                  },
                })}
                disabled={disabled || isUpdating}
              />
            </div>

            {features.resourceBalancing.enabled && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-surface-700 dark:text-surface-300">
                    Max tickets per person
                  </label>
                  <Input
                    type="number"
                    min={3}
                    max={50}
                    value={features.resourceBalancing.maxTicketsPerPerson}
                    onChange={(e) => updateConfig({
                      features: {
                        resourceBalancing: { maxTicketsPerPerson: parseInt(e.target.value) || 10 },
                      },
                    })}
                    disabled={disabled}
                  />
                  <p className="text-xs text-surface-500">
                    Alert when someone has more than this many tickets
                  </p>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800">
                  <div className="flex items-center gap-3">
                    <Brain className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                    <div>
                      <p className="font-medium text-primary-800 dark:text-primary-300">
                        Consider Sentiment
                      </p>
                      <p className="text-sm text-primary-700 dark:text-primary-400">
                        Factor in team member mood
                      </p>
                    </div>
                  </div>
                  <ToggleSwitch
                    checked={features.resourceBalancing.considerSentiment}
                    onChange={() => updateConfig({
                      features: {
                        resourceBalancing: { considerSentiment: !features.resourceBalancing.considerSentiment },
                      },
                    })}
                    disabled={disabled}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Meeting Prep */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-emerald-500" />
              Meeting Prep
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-xl bg-surface-50 dark:bg-surface-900/50">
              <div>
                <p className="font-medium text-surface-900 dark:text-white">
                  Enable Meeting Summaries
                </p>
                <p className="text-sm text-surface-500 dark:text-surface-400">
                  Get AI-generated prep before meetings
                </p>
              </div>
              <ToggleSwitch
                checked={features.meetingPrep.enabled}
                onChange={() => updateConfig({
                  features: {
                    meetingPrep: { enabled: !features.meetingPrep.enabled },
                  },
                })}
                disabled={disabled || isUpdating}
              />
            </div>

            {features.meetingPrep.enabled && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-surface-700 dark:text-surface-300">
                    Send summary before meeting
                  </label>
                  <Select
                    options={[
                      { value: '15', label: '15 minutes before' },
                      { value: '30', label: '30 minutes before' },
                      { value: '60', label: '1 hour before' },
                    ]}
                    value={features.meetingPrep.minutesBefore.toString()}
                    onChange={(v) => updateConfig({
                      features: {
                        meetingPrep: { minutesBefore: parseInt(v) },
                      },
                    })}
                    disabled={disabled}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-surface-700 dark:text-surface-300">
                    Calendar Integration
                  </label>
                  <Select
                    options={[
                      { value: 'none', label: 'None' },
                      { value: 'google', label: 'Google Calendar' },
                      { value: 'outlook', label: 'Microsoft Outlook' },
                    ]}
                    value={features.meetingPrep.calendarIntegration}
                    onChange={(v) => updateConfig({
                      features: {
                        meetingPrep: { calendarIntegration: v as 'google' | 'outlook' | 'none' },
                      },
                    })}
                    disabled={disabled}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Calendar Integration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-accent-500" />
              Calendar Awareness
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-xl bg-surface-50 dark:bg-surface-900/50">
              <div>
                <p className="font-medium text-surface-900 dark:text-white">
                  Enable Calendar Integration
                </p>
                <p className="text-sm text-surface-500 dark:text-surface-400">
                  Respect calendar availability for check-ins
                </p>
              </div>
              <ToggleSwitch
                checked={features.calendarIntegration.enabled}
                onChange={() => updateConfig({
                  features: {
                    calendarIntegration: { enabled: !features.calendarIntegration.enabled },
                  },
                })}
                disabled={disabled || isUpdating}
              />
            </div>

            {features.calendarIntegration.enabled && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-surface-700 dark:text-surface-300">
                    Calendar Provider
                  </label>
                  <Select
                    options={[
                      { value: 'none', label: 'None' },
                      { value: 'google', label: 'Google Calendar' },
                      { value: 'outlook', label: 'Microsoft Outlook' },
                    ]}
                    value={features.calendarIntegration.provider}
                    onChange={(v) => updateConfig({
                      features: {
                        calendarIntegration: { provider: v as 'google' | 'outlook' | 'none' },
                      },
                    })}
                    disabled={disabled}
                  />
                </div>

                <div className="space-y-3">
                  <FeatureToggle
                    label="Respect Busy Status"
                    description="Delay check-ins when user is in a meeting"
                    checked={features.calendarIntegration.respectBusyStatus}
                    onChange={() => updateConfig({
                      features: {
                        calendarIntegration: { respectBusyStatus: !features.calendarIntegration.respectBusyStatus },
                      },
                    })}
                    disabled={disabled}
                  />
                  <FeatureToggle
                    label="Respect Focus Time"
                    description="Skip check-ins during calendar focus time"
                    checked={features.calendarIntegration.respectFocusTime}
                    onChange={() => updateConfig({
                      features: {
                        calendarIntegration: { respectFocusTime: !features.calendarIntegration.respectFocusTime },
                      },
                    })}
                    disabled={disabled}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
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
  const colorClasses = {
    primary: 'bg-primary-600',
    amber: 'bg-amber-500',
  };

  return (
    <button
      onClick={onChange}
      disabled={disabled}
      className={cn(
        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
        checked ? colorClasses[color as keyof typeof colorClasses] : 'bg-surface-300 dark:bg-surface-600',
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

// Feature Toggle Component
function FeatureToggle({
  label,
  description,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
      <div>
        <p className="text-sm font-medium text-surface-900 dark:text-white">{label}</p>
        <p className="text-xs text-surface-500">{description}</p>
      </div>
      <ToggleSwitch checked={checked} onChange={onChange} disabled={disabled} />
    </div>
  );
}

