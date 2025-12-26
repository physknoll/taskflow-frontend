'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { authService } from '@/services/auth.service';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useGoogleChatIntegration } from '@/hooks/useGoogleChatIntegration';
import { useGoogleCalendar } from '@/hooks/useCalendar';
import type { GoogleChatPreferences } from '@/services/integrations.service';
import {
  User,
  Bell,
  Moon,
  Sun,
  Monitor,
  Shield,
  Clock,
  Save,
  Crown,
  Briefcase,
  UserCircle,
  Eye,
  Trash2,
  AlertTriangle,
  Link2,
  MessageSquare,
  Check,
  X,
  ExternalLink,
  Loader2,
  CalendarDays,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Role configuration for display
const roleConfig: Record<string, { label: string; variant: 'primary' | 'success' | 'info' | 'secondary'; icon: React.ComponentType<{ className?: string }> }> = {
  owner: { label: 'Owner', variant: 'primary', icon: Crown },
  manager: { label: 'Manager', variant: 'success', icon: Briefcase },
  employee: { label: 'Team Member', variant: 'info', icon: UserCircle },
  client_viewer: { label: 'Client', variant: 'secondary', icon: Eye },
};

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email required'),
  phone: z.string().optional(),
  timezone: z.string(),
  workStartTime: z.string(),
  workEndTime: z.string(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

function SettingsContent() {
  const { user, updateUser } = useAuthStore();
  const { theme, setTheme } = useUIStore();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('profile');

  // Handle tab from URL parameter
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['profile', 'notifications', 'appearance', 'security', 'integrations'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Sun },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'integrations', label: 'Integrations', icon: Link2 },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your account preferences"
      />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64 flex-shrink-0">
          <Card>
            <CardContent className="p-2">
              <nav className="space-y-1">
                {tabs.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
                      activeTab === id
                        ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300'
                        : 'text-surface-600 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'profile' && <ProfileSettings />}
          {activeTab === 'notifications' && <NotificationSettings />}
          {activeTab === 'appearance' && <AppearanceSettings />}
          {activeTab === 'security' && <SecuritySettings />}
          {activeTab === 'integrations' && <IntegrationsSettings />}
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-6 h-6 border-2 border-surface-300 dark:border-surface-600 border-t-primary-500 rounded-full animate-spin" />
      </div>
    }>
      <SettingsContent />
    </Suspense>
  );
}

function ProfileSettings() {
  const { user, updateUser } = useAuthStore();

  const profileMutation = useMutation({
    mutationFn: (data: Partial<ProfileForm>) => authService.updateProfile(data),
    onSuccess: (updatedUser) => {
      updateUser(updatedUser);
      toast.success('Profile updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      timezone: user?.timezone || 'America/Los_Angeles',
      workStartTime: user?.workStartTime || '09:00',
      workEndTime: user?.workEndTime || '17:00',
    },
  });

  const onSubmit = (data: ProfileForm) => {
    profileMutation.mutate(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Avatar & Role */}
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar
                firstName={user?.firstName}
                lastName={user?.lastName}
                src={user?.avatar}
                size="xl"
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-surface-900 dark:text-white">
                  {user?.firstName} {user?.lastName}
                </h3>
                {user?.role && roleConfig[user.role] && (
                  <Badge 
                    variant={roleConfig[user.role].variant} 
                    size="md"
                    className="flex items-center gap-1.5"
                  >
                    {(() => {
                      const RoleIcon = roleConfig[user.role].icon;
                      return <RoleIcon className="h-3 w-3" />;
                    })()}
                    {roleConfig[user.role].label}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-surface-500 dark:text-surface-400 mb-3">
                {user?.email}
              </p>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm">
                  Change Avatar
                </Button>
                <span className="text-xs text-surface-400 dark:text-surface-500">
                  JPG, PNG or GIF. Max 2MB.
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              {...register('firstName')}
              label="First Name"
              error={errors.firstName?.message}
            />
            <Input
              {...register('lastName')}
              label="Last Name"
              error={errors.lastName?.message}
            />
          </div>

          <Input
            {...register('email')}
            type="email"
            label="Email"
            error={errors.email?.message}
          />

          <Input
            {...register('phone')}
            label="Phone"
            placeholder="+1 555 123 4567"
          />

          <Select
            label="Timezone"
            options={[
              { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
              { value: 'America/Denver', label: 'Mountain Time (MT)' },
              { value: 'America/Chicago', label: 'Central Time (CT)' },
              { value: 'America/New_York', label: 'Eastern Time (ET)' },
              { value: 'Europe/London', label: 'London (GMT)' },
              { value: 'Europe/Paris', label: 'Paris (CET)' },
            ]}
            value={user?.timezone || 'America/Los_Angeles'}
            onChange={() => {}}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              {...register('workStartTime')}
              type="time"
              label="Work Start Time"
            />
            <Input
              {...register('workEndTime')}
              type="time"
              label="Work End Time"
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" isLoading={profileMutation.isPending}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function NotificationSettings() {
  const { user, updateUser } = useAuthStore();
  const [settings, setSettings] = useState({
    email: user?.notificationPreferences?.email ?? true,
    inApp: user?.notificationPreferences?.inApp ?? true,
    dailyDigest: user?.notificationPreferences?.dailyDigest ?? true,
    ticketAssigned: user?.notificationPreferences?.ticketAssigned ?? true,
    ticketUpdated: user?.notificationPreferences?.ticketUpdated ?? true,
    reviewRequired: user?.notificationPreferences?.reviewRequired ?? true,
    aiReminders: user?.notificationPreferences?.aiReminders ?? true,
  });

  const handleToggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Channels */}
          <div>
            <h4 className="font-medium text-surface-900 dark:text-white mb-4">
              Notification Channels
            </h4>
            <div className="space-y-4">
              <NotificationToggle
                label="Email Notifications"
                description="Receive notifications via email"
                checked={settings.email}
                onChange={() => handleToggle('email')}
              />
              <NotificationToggle
                label="In-App Notifications"
                description="Show notifications in the app"
                checked={settings.inApp}
                onChange={() => handleToggle('inApp')}
              />
              <NotificationToggle
                label="Daily Digest"
                description="Receive a daily summary email"
                checked={settings.dailyDigest}
                onChange={() => handleToggle('dailyDigest')}
              />
            </div>
          </div>

          {/* Event Types */}
          <div className="pt-6 border-t border-surface-200 dark:border-surface-700">
            <h4 className="font-medium text-surface-900 dark:text-white mb-4">
              Notification Types
            </h4>
            <div className="space-y-4">
              <NotificationToggle
                label="Ticket Assigned"
                description="When a ticket is assigned to you"
                checked={settings.ticketAssigned}
                onChange={() => handleToggle('ticketAssigned')}
              />
              <NotificationToggle
                label="Ticket Updated"
                description="When a ticket you're watching is updated"
                checked={settings.ticketUpdated}
                onChange={() => handleToggle('ticketUpdated')}
              />
              <NotificationToggle
                label="Review Required"
                description="When your work needs review or feedback"
                checked={settings.reviewRequired}
                onChange={() => handleToggle('reviewRequired')}
              />
              <NotificationToggle
                label="AI Reminders"
                description="Daily check-ins and reminders from AI PM"
                checked={settings.aiReminders}
                onChange={() => handleToggle('aiReminders')}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button>
              <Save className="h-4 w-4 mr-2" />
              Save Preferences
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function NotificationToggle({
  label,
  description,
  checked,
  onChange,
  disabled = false,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="font-medium text-surface-900 dark:text-white">{label}</p>
        <p className="text-sm text-surface-500 dark:text-surface-400">{description}</p>
      </div>
      <button
        type="button"
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
    </div>
  );
}

function AppearanceSettings() {
  const { theme, setTheme } = useUIStore();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h4 className="font-medium text-surface-900 dark:text-white mb-4">
              Theme
            </h4>
            <div className="grid grid-cols-3 gap-4">
              {[
                { id: 'light', label: 'Light', icon: Sun },
                { id: 'dark', label: 'Dark', icon: Moon },
                { id: 'system', label: 'System', icon: Monitor },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setTheme(id as 'light' | 'dark' | 'system')}
                  className={cn(
                    'p-4 rounded-xl border-2 transition-colors text-center',
                    theme === id
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                      : 'border-surface-200 dark:border-surface-700 hover:border-surface-300 dark:hover:border-surface-600'
                  )}
                >
                  <Icon className={cn(
                    'h-6 w-6 mx-auto mb-2',
                    theme === id ? 'text-primary-600 dark:text-primary-400' : 'text-surface-500'
                  )} />
                  <span className={cn(
                    'text-sm font-medium',
                    theme === id ? 'text-primary-700 dark:text-primary-300' : 'text-surface-700 dark:text-surface-300'
                  )}>
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function IntegrationsSettings() {
  const {
    status,
    isLoading,
    error,
    hasPendingConnection,
    pendingEmail,
    connect,
    disconnect,
    updatePreferences,
    isConnecting,
    isDisconnecting,
    isUpdatingPreferences,
  } = useGoogleChatIntegration();

  const {
    connectionStatus: googleCalendarStatus,
    isConnected: isGoogleCalendarConnected,
    isLoadingStatus: isGoogleCalendarLoading,
    calendars: googleCalendars,
    connect: connectGoogleCalendar,
    updateSettings: updateGoogleCalendarSettings,
    sync: syncGoogleCalendar,
    disconnect: disconnectGoogleCalendar,
    isConnecting: isGoogleCalendarConnecting,
    isSyncing: isGoogleCalendarSyncing,
    isDisconnecting: isGoogleCalendarDisconnecting,
  } = useGoogleCalendar();

  // Handle preference toggle
  const handlePreferenceToggle = (key: keyof GoogleChatPreferences) => {
    if (!status?.preferences) return;
    updatePreferences({
      [key]: !status.preferences[key],
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Integrations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-surface-500 dark:text-surface-400 mb-6">
            Connect TaskFlow AI with external services to sync calendars and receive notifications.
          </p>

          {/* Google Calendar Integration Card */}
          <div className="border border-surface-200 dark:border-surface-700 rounded-xl overflow-hidden mb-6">
            {/* Header */}
            <div className="flex items-center justify-between p-5 bg-surface-50 dark:bg-surface-800/50 border-b border-surface-200 dark:border-surface-700">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <CalendarDays className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-surface-900 dark:text-white">
                    Google Calendar
                  </h3>
                  <p className="text-sm text-surface-500 dark:text-surface-400">
                    Two-way sync with your Google Calendar
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              {isGoogleCalendarLoading ? (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-100 dark:bg-surface-800 rounded-full">
                  <Loader2 className="h-4 w-4 animate-spin text-surface-500" />
                  <span className="text-sm text-surface-500">Loading...</span>
                </div>
              ) : isGoogleCalendarConnected ? (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
                    Connected
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-100 dark:bg-surface-800 rounded-full">
                  <div className="w-2 h-2 rounded-full bg-surface-400" />
                  <span className="text-sm text-surface-600 dark:text-surface-400">
                    Not Connected
                  </span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-5">
              {!isGoogleCalendarConnected ? (
                <div className="space-y-4">
                  <p className="text-sm text-surface-600 dark:text-surface-400">
                    Connect your Google Calendar to sync events, deadlines, and meetings between TaskFlow and Google.
                  </p>
                  <ul className="space-y-2 text-sm text-surface-600 dark:text-surface-400">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      Two-way sync: Changes sync in both directions
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      See your Google events in TaskFlow calendar
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      Push TaskFlow meetings to Google Calendar
                    </li>
                  </ul>
                  <Button
                    onClick={() => connectGoogleCalendar()}
                    isLoading={isGoogleCalendarConnecting}
                    className="mt-4"
                  >
                    <CalendarDays className="h-4 w-4 mr-2" />
                    Connect Google Calendar
                  </Button>
                </div>
              ) : (
                <>
                  {/* Connection Info */}
                  <div className="flex items-center justify-between p-4 bg-surface-50 dark:bg-surface-800/50 rounded-lg mb-6">
                    <div>
                      <p className="text-sm text-surface-500 dark:text-surface-400">
                        Connected Account
                      </p>
                      <p className="font-medium text-surface-900 dark:text-white">
                        {googleCalendarStatus?.googleEmail}
                      </p>
                      {googleCalendarStatus?.lastSyncAt && (
                        <p className="text-xs text-surface-400 dark:text-surface-500 mt-1">
                          Last synced {new Date(googleCalendarStatus.lastSyncAt).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => syncGoogleCalendar()}
                        isLoading={isGoogleCalendarSyncing}
                      >
                        <RefreshCw className={cn('h-4 w-4 mr-2', isGoogleCalendarSyncing && 'animate-spin')} />
                        Sync Now
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => disconnectGoogleCalendar()}
                        isLoading={isGoogleCalendarDisconnecting}
                        className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/30"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Disconnect
                      </Button>
                    </div>
                  </div>

                  {/* Sync Direction */}
                  <div className="mb-6">
                    <h4 className="font-medium text-surface-900 dark:text-white mb-3">
                      Sync Direction
                    </h4>
                    <div className="flex gap-3">
                      {[
                        { value: 'two_way', label: 'Two-way sync' },
                        { value: 'one_way_to_google', label: 'TaskFlow → Google only' },
                        { value: 'one_way_from_google', label: 'Google → TaskFlow only' },
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => updateGoogleCalendarSettings({
                            syncEnabled: true,
                            syncDirection: option.value as any,
                            calendarsToSync: googleCalendarStatus?.calendarsToSync?.map(c => ({
                              calendarId: c.calendarId,
                              syncEnabled: c.syncEnabled,
                            })) || [],
                          })}
                          className={cn(
                            'px-4 py-2 rounded-lg border text-sm font-medium transition-colors',
                            googleCalendarStatus?.syncDirection === option.value
                              ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300'
                              : 'border-surface-200 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-800'
                          )}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Calendars to sync */}
                  {googleCalendars && googleCalendars.length > 0 && (
                    <div>
                      <h4 className="font-medium text-surface-900 dark:text-white mb-3">
                        Calendars to Sync
                      </h4>
                      <div className="space-y-2">
                        {googleCalendars.map((calendar) => (
                          <div
                            key={calendar.calendarId}
                            className="flex items-center justify-between p-3 bg-surface-50 dark:bg-surface-800/50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: calendar.color || '#4285F4' }}
                              />
                              <span className="text-sm text-surface-700 dark:text-surface-300">
                                {calendar.calendarName}
                                {calendar.isPrimary && (
                                  <span className="ml-2 text-xs text-surface-500">(Primary)</span>
                                )}
                              </span>
                            </div>
                            <button
                              onClick={() => {
                                const updated = googleCalendars.map(c => ({
                                  calendarId: c.calendarId,
                                  syncEnabled: c.calendarId === calendar.calendarId ? !c.syncEnabled : c.syncEnabled,
                                }));
                                updateGoogleCalendarSettings({
                                  syncEnabled: true,
                                  syncDirection: googleCalendarStatus?.syncDirection || 'two_way',
                                  calendarsToSync: updated,
                                });
                              }}
                              className={cn(
                                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                                calendar.syncEnabled ? 'bg-primary-600' : 'bg-surface-300 dark:bg-surface-600'
                              )}
                            >
                              <span
                                className={cn(
                                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                                  calendar.syncEnabled ? 'translate-x-6' : 'translate-x-1'
                                )}
                              />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Google Chat Integration Card */}
          <div className="border border-surface-200 dark:border-surface-700 rounded-xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-5 bg-surface-50 dark:bg-surface-800/50 border-b border-surface-200 dark:border-surface-700">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-surface-900 dark:text-white">
                    Google Chat
                  </h3>
                  <p className="text-sm text-surface-500 dark:text-surface-400">
                    Receive AI PM messages, blockers, and check-ins
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              {isLoading ? (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-100 dark:bg-surface-800 rounded-full">
                  <Loader2 className="h-4 w-4 animate-spin text-surface-500" />
                  <span className="text-sm text-surface-500">Loading...</span>
                </div>
              ) : status?.connected ? (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                    Connected
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-100 dark:bg-surface-800 rounded-full">
                  <div className="w-2 h-2 rounded-full bg-surface-400" />
                  <span className="text-sm text-surface-600 dark:text-surface-400">
                    Not Connected
                  </span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-5">
              {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              {!status?.available && !isLoading && (
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    Google Chat integration is not configured on this server. Contact your administrator.
                  </p>
                </div>
              )}

              {status?.available && !status.connected && (
                <>
                  {/* Pending connection from URL */}
                  {hasPendingConnection && pendingEmail && (
                    <div className="mb-6 p-4 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-800 flex items-center justify-center flex-shrink-0">
                          <Check className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-primary-900 dark:text-primary-100">
                            Ready to Connect
                          </h4>
                          <p className="text-sm text-primary-700 dark:text-primary-300 mt-1">
                            Connect your TaskFlow account with <strong>{pendingEmail}</strong>
                          </p>
                          <Button
                            className="mt-3"
                            onClick={connect}
                            isLoading={isConnecting}
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Connect Google Chat
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Instructions when not pending */}
                  {!hasPendingConnection && (
                    <div className="space-y-4">
                      <h4 className="font-medium text-surface-900 dark:text-white">
                        How to Connect
                      </h4>
                      <ol className="space-y-3">
                        {[
                          'Open Google Chat on your device',
                          'Search for "TaskFlow AI" and start a conversation',
                          'Send any message to the bot',
                          'Click the "Connect Account" link the bot sends you',
                        ].map((step, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 text-sm font-medium flex items-center justify-center">
                              {index + 1}
                            </span>
                            <span className="text-sm text-surface-600 dark:text-surface-400 pt-0.5">
                              {step}
                            </span>
                          </li>
                        ))}
                      </ol>
                      <a
                        href="https://chat.google.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400 hover:underline mt-2"
                      >
                        Open Google Chat
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  )}
                </>
              )}

              {status?.connected && (
                <>
                  {/* Connection Info */}
                  <div className="flex items-center justify-between p-4 bg-surface-50 dark:bg-surface-800/50 rounded-lg mb-6">
                    <div>
                      <p className="text-sm text-surface-500 dark:text-surface-400">
                        Connected Account
                      </p>
                      <p className="font-medium text-surface-900 dark:text-white">
                        {status.googleEmail}
                      </p>
                      {status.connectedAt && (
                        <p className="text-xs text-surface-400 dark:text-surface-500 mt-1">
                          Connected {new Date(status.connectedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={disconnect}
                      isLoading={isDisconnecting}
                      className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/30"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Disconnect
                    </Button>
                  </div>

                  {/* Notification Preferences */}
                  {status.preferences && (
                    <div>
                      <h4 className="font-medium text-surface-900 dark:text-white mb-4">
                        Notification Preferences
                      </h4>
                      <div className="space-y-4">
                        <NotificationToggle
                          label="Morning Check-in Reminders"
                          description="Receive daily morning prompts to plan your day"
                          checked={status.preferences.morningCheckIn}
                          onChange={() => handlePreferenceToggle('morningCheckIn')}
                          disabled={isUpdatingPreferences}
                        />
                        <NotificationToggle
                          label="Evening Progress Summaries"
                          description="End-of-day summaries of your accomplishments"
                          checked={status.preferences.eveningCheckIn}
                          onChange={() => handlePreferenceToggle('eveningCheckIn')}
                          disabled={isUpdatingPreferences}
                        />
                        <NotificationToggle
                          label="Ticket Notifications"
                          description="Alerts when assigned or mentioned on tickets"
                          checked={status.preferences.ticketNotifications}
                          onChange={() => handlePreferenceToggle('ticketNotifications')}
                          disabled={isUpdatingPreferences}
                        />
                        <NotificationToggle
                          label="Blocker Alerts"
                          description="Notifications about blockers affecting your work"
                          checked={status.preferences.blockerAlerts}
                          onChange={() => handlePreferenceToggle('blockerAlerts')}
                          disabled={isUpdatingPreferences}
                        />
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Placeholder for future integrations */}
          <div className="mt-6 p-6 border-2 border-dashed border-surface-200 dark:border-surface-700 rounded-xl text-center">
            <div className="w-12 h-12 rounded-xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center mx-auto mb-3">
              <Link2 className="h-6 w-6 text-surface-400" />
            </div>
            <p className="text-sm text-surface-500 dark:text-surface-400">
              More integrations coming soon
            </p>
            <p className="text-xs text-surface-400 dark:text-surface-500 mt-1">
              Slack, Microsoft Teams, and more
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SecuritySettings() {
  const { user, logout } = useAuthStore();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteError, setDeleteError] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const passwordMutation = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      authService.changePassword(data),
    onSuccess: () => {
      toast.success('Password changed successfully');
      reset();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to change password');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (data: { password?: string; confirmDelete: string }) =>
      authService.deleteAccount(data),
    onSuccess: () => {
      toast.success('Your account has been deleted');
      logout();
      window.location.href = '/login';
    },
    onError: (error: any) => {
      setDeleteError(error.response?.data?.message || 'Failed to delete account');
    },
  });

  const onSubmit = (data: PasswordForm) => {
    passwordMutation.mutate({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });
  };

  const handleDeleteAccount = () => {
    setDeleteError('');
    
    if (deleteConfirmText !== 'DELETE') {
      setDeleteError('Please type DELETE to confirm');
      return;
    }

    const isLocalAuth = user?.authProvider === 'local';
    if (isLocalAuth && !deletePassword) {
      setDeleteError('Password is required to delete your account');
      return;
    }

    deleteMutation.mutate({
      password: isLocalAuth ? deletePassword : undefined,
      confirmDelete: 'DELETE',
    });
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setDeletePassword('');
    setDeleteConfirmText('');
    setDeleteError('');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <h4 className="font-medium text-surface-900 dark:text-white mb-4">
                Change Password
              </h4>
              <div className="space-y-4">
                <Input
                  {...register('currentPassword')}
                  type="password"
                  label="Current Password"
                  error={errors.currentPassword?.message}
                />
                <Input
                  {...register('newPassword')}
                  type="password"
                  label="New Password"
                  error={errors.newPassword?.message}
                />
                <Input
                  {...register('confirmPassword')}
                  type="password"
                  label="Confirm New Password"
                  error={errors.confirmPassword?.message}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" isLoading={passwordMutation.isPending}>
                Update Password
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Delete Account Section */}
      <Card className="border-red-200 dark:border-red-900/50">
        <CardHeader>
          <CardTitle className="text-red-600 dark:text-red-400 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-surface-900 dark:text-white">
                Delete Account
              </h4>
              <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setDeleteModalOpen(true)}
              className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/30"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete Account Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={closeDeleteModal}
        title="Delete Account"
      >
        <div className="space-y-6">
          <div className="flex items-start gap-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-red-800 dark:text-red-300">
                This action is irreversible
              </h4>
              <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                Your account, profile, and all associated data will be permanently deleted.
                {user?.role === 'owner' && (
                  <span className="block mt-2 font-medium">
                    As an organization owner, you must remove all team members before deleting your account.
                  </span>
                )}
              </p>
            </div>
          </div>

          {user?.authProvider === 'local' && (
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                Enter your password to confirm
              </label>
              <Input
                type="password"
                placeholder="Your current password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
              Type <span className="font-bold text-red-600 dark:text-red-400">DELETE</span> to confirm
            </label>
            <Input
              type="text"
              placeholder="Type DELETE"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
            />
          </div>

          {deleteError && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{deleteError}</p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-surface-200 dark:border-surface-700">
            <Button variant="outline" onClick={closeDeleteModal}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteAccount}
              isLoading={deleteMutation.isPending}
              disabled={deleteConfirmText !== 'DELETE'}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete My Account
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}


