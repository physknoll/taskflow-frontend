'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { integrationsService, GoogleChatStatus, GoogleChatPreferences } from '@/services/integrations.service';
import { cn } from '@/lib/utils';
import {
  MessageSquare,
  Check,
  X,
  ExternalLink,
  Loader2,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';

export default function GoogleChatIntegrationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [status, setStatus] = useState<GoogleChatStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Get connection params from URL (sent by Google Chat bot)
  const pendingSpace = searchParams.get('space');
  const pendingEmail = searchParams.get('user');
  const hasPendingConnection = !!(pendingSpace && pendingEmail);

  // Fetch current status on mount
  useEffect(() => {
    fetchStatus();
  }, []);

  // Auto-connect if we have params and status is loaded
  useEffect(() => {
    if (hasPendingConnection && status && !status.connected && !connecting && !error) {
      handleConnect();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasPendingConnection, status?.connected]);

  async function fetchStatus() {
    try {
      const data = await integrationsService.getGoogleChatStatus();
      setStatus(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load integration status');
    } finally {
      setLoading(false);
    }
  }

  async function handleConnect() {
    if (!pendingSpace || !pendingEmail) {
      setError('Missing connection parameters. Please click the link from Google Chat again.');
      return;
    }

    setConnecting(true);
    setError(null);

    try {
      const response = await integrationsService.connectGoogleChat({
        spaceName: pendingSpace,
        googleEmail: pendingEmail,
      });

      setSuccess('Google Chat connected successfully! You can now go back to Google Chat and message the bot.');
      setStatus({
        available: true,
        connected: true,
        googleEmail: pendingEmail,
        connectedAt: response.googleChat.connectedAt,
        preferences: response.googleChat.preferences,
      });

      // Clear URL params
      router.replace('/settings/integrations/google-chat');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to connect Google Chat');
    } finally {
      setConnecting(false);
    }
  }

  async function handleDisconnect() {
    try {
      await integrationsService.disconnectGoogleChat();
      setStatus(prev => prev ? { ...prev, connected: false, googleEmail: null, preferences: null } : null);
      setSuccess('Google Chat disconnected');
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to disconnect');
    }
  }

  async function handlePreferenceChange(key: keyof GoogleChatPreferences, value: boolean) {
    if (!status?.preferences) return;
    
    try {
      const response = await integrationsService.updateGoogleChatPreferences({ [key]: value });
      setStatus(prev => prev ? { ...prev, preferences: response.preferences } : null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update preference');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/settings">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Settings
          </Button>
        </Link>
      </div>

      <PageHeader
        title="Google Chat Integration"
        description="Connect your TaskFlow account to receive AI PM messages in Google Chat"
      />

      {/* Success Message */}
      {success && (
        <div className="flex items-start gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-emerald-800 dark:text-emerald-200">{success}</p>
            {status?.connected && (
              <a
                href="https://chat.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-emerald-700 dark:text-emerald-300 hover:underline mt-2"
              >
                Open Google Chat
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary-600 mb-4" />
              <p className="text-surface-500 dark:text-surface-400">Loading integration status...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      {!loading && (
        <Card>
          <CardContent className="p-0">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-surface-200 dark:border-surface-700">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <MessageSquare className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-surface-900 dark:text-white">
                    Google Chat
                  </h2>
                  <p className="text-sm text-surface-500 dark:text-surface-400">
                    AI Project Manager notifications & check-ins
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              {status?.connected ? (
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                    Connected
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-4 py-2 bg-surface-100 dark:bg-surface-800 rounded-full">
                  <div className="w-2.5 h-2.5 rounded-full bg-surface-400" />
                  <span className="text-sm text-surface-600 dark:text-surface-400">
                    Not Connected
                  </span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Server not configured */}
              {!status?.available && (
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <p className="text-amber-700 dark:text-amber-400">
                    Google Chat integration is not configured on this server. Please contact your administrator.
                  </p>
                </div>
              )}

              {/* Pending Connection - Auto connecting */}
              {status?.available && !status.connected && hasPendingConnection && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mx-auto mb-4">
                    {connecting ? (
                      <Loader2 className="h-8 w-8 animate-spin text-primary-600 dark:text-primary-400" />
                    ) : (
                      <MessageSquare className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-2">
                    {connecting ? 'Connecting...' : 'Ready to Connect'}
                  </h3>
                  <p className="text-surface-600 dark:text-surface-400 mb-6">
                    Connecting Google Chat account: <strong>{pendingEmail}</strong>
                  </p>
                  {!connecting && (
                    <Button onClick={handleConnect} size="lg">
                      <MessageSquare className="h-5 w-5 mr-2" />
                      Connect Google Chat
                    </Button>
                  )}
                </div>
              )}

              {/* Not Connected - Show Instructions */}
              {status?.available && !status.connected && !hasPendingConnection && (
                <div className="py-4">
                  <h3 className="font-semibold text-surface-900 dark:text-white mb-4">
                    How to Connect
                  </h3>
                  <ol className="space-y-4">
                    {[
                      { step: 'Open Google Chat on your device or browser', link: 'https://chat.google.com' },
                      { step: 'Search for "TaskFlow AI" and start a conversation' },
                      { step: 'Send any message to the bot' },
                      { step: 'Click the "Connect Account" link the bot sends you' },
                    ].map((item, index) => (
                      <li key={index} className="flex items-start gap-4">
                        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 font-semibold flex items-center justify-center">
                          {index + 1}
                        </span>
                        <div className="pt-1">
                          <span className="text-surface-700 dark:text-surface-300">
                            {item.step}
                          </span>
                          {item.link && (
                            <a
                              href={item.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 text-sm text-primary-600 dark:text-primary-400 hover:underline mt-1"
                            >
                              Open Google Chat
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          )}
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Connected State */}
              {status?.connected && (
                <div className="space-y-6">
                  {/* Connection Info */}
                  <div className="flex items-center justify-between p-4 bg-surface-50 dark:bg-surface-800/50 rounded-xl">
                    <div>
                      <p className="text-sm text-surface-500 dark:text-surface-400">
                        Connected Account
                      </p>
                      <p className="font-semibold text-surface-900 dark:text-white text-lg">
                        {status.googleEmail}
                      </p>
                      {status.connectedAt && (
                        <p className="text-sm text-surface-400 dark:text-surface-500 mt-1">
                          Connected {new Date(status.connectedAt).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      onClick={handleDisconnect}
                      className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/30"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Disconnect
                    </Button>
                  </div>

                  {/* Notification Preferences */}
                  {status.preferences && (
                    <div>
                      <h3 className="font-semibold text-surface-900 dark:text-white mb-4">
                        Notification Preferences
                      </h3>
                      <p className="text-sm text-surface-500 dark:text-surface-400 mb-4">
                        Choose which notifications you want to receive in Google Chat
                      </p>
                      <div className="space-y-4">
                        <PreferenceToggle
                          label="Morning Check-in Reminders"
                          description="Receive daily morning prompts to plan your day"
                          checked={status.preferences.morningCheckIn}
                          onChange={(value) => handlePreferenceChange('morningCheckIn', value)}
                        />
                        <PreferenceToggle
                          label="Evening Progress Summaries"
                          description="End-of-day summaries of your accomplishments"
                          checked={status.preferences.eveningCheckIn}
                          onChange={(value) => handlePreferenceChange('eveningCheckIn', value)}
                        />
                        <PreferenceToggle
                          label="Ticket Notifications"
                          description="Alerts when assigned or mentioned on tickets"
                          checked={status.preferences.ticketNotifications}
                          onChange={(value) => handlePreferenceChange('ticketNotifications', value)}
                        />
                        <PreferenceToggle
                          label="Blocker Alerts"
                          description="Notifications about blockers affecting your work"
                          checked={status.preferences.blockerAlerts}
                          onChange={(value) => handlePreferenceChange('blockerAlerts', value)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function PreferenceToggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-surface-50 dark:bg-surface-800/30 rounded-lg">
      <div>
        <p className="font-medium text-surface-900 dark:text-white">{label}</p>
        <p className="text-sm text-surface-500 dark:text-surface-400">{description}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
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

