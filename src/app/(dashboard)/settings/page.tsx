'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { authService } from '@/services/auth.service';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import {
  User,
  Bell,
  Moon,
  Sun,
  Monitor,
  Shield,
  Clock,
  Save,
} from 'lucide-react';
import { cn } from '@/lib/utils';

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

export default function SettingsPage() {
  const { user, updateUser } = useAuthStore();
  const { theme, setTheme } = useUIStore();
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Sun },
    { id: 'security', label: 'Security', icon: Shield },
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
        </div>
      </div>
    </div>
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
          {/* Avatar */}
          <div className="flex items-center gap-6">
            <Avatar
              firstName={user?.firstName}
              lastName={user?.lastName}
              src={user?.avatar}
              size="xl"
            />
            <div>
              <Button variant="outline" size="sm">
                Change Avatar
              </Button>
              <p className="text-xs text-surface-500 dark:text-surface-400 mt-1">
                JPG, PNG or GIF. Max 2MB.
              </p>
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
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
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
        className={cn(
          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
          checked ? 'bg-primary-600' : 'bg-surface-300 dark:bg-surface-600'
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

function SecuritySettings() {
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

  const onSubmit = (data: PasswordForm) => {
    passwordMutation.mutate({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });
  };

  return (
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
  );
}

