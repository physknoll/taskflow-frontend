'use client';

import { useState, useCallback } from 'react';
import { 
  MessageSquare, 
  AlertCircle, 
  Copy, 
  Check, 
  BookOpen, 
  Settings, 
  BarChart3, 
  AlertTriangle,
  FileText,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { Modal } from '@/components/ui/Modal';
import { ChatWidgetConfigForm } from './ChatWidgetConfigForm';
import { WidgetPreview } from './WidgetPreview';
import { EmbedCodeDisplay } from './EmbedCodeDisplay';
import { ApiKeySection } from './ApiKeySection';
import { WidgetAnalyticsSection } from './WidgetAnalyticsSection';
import { WidgetIssuesTab } from './WidgetIssuesTab';
import { SetupGuideModal } from './SetupGuideModal';
import {
  useChatWidgetConfig,
  useSaveChatWidgetConfig,
  useUpdateChatWidgetConfig,
  useChatWidgetAnalytics,
  useChatWidgetIssues,
} from '@/hooks/useChatWidget';
import { ChatWidgetConfigForm as ConfigFormType, DEFAULT_WIDGET_CONFIG } from '@/types/chat-widget';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';

interface ChatWidgetTabProps {
  clientId: string;
}

type InnerTab = 'configuration' | 'analytics' | 'issues';

/**
 * Main tab component for Chat Widget configuration and analytics
 */
export function ChatWidgetTab({ clientId }: ChatWidgetTabProps) {
  const { user } = useAuthStore();
  const canManage = user?.role === 'owner' || user?.role === 'manager';

  // Inner tab state
  const [activeTab, setActiveTab] = useState<InnerTab>('configuration');

  // Fetch existing config
  const {
    data: existingConfig,
    isLoading,
    error,
  } = useChatWidgetConfig(clientId);

  // Fetch analytics for needs review count badge
  const { data: analytics } = useChatWidgetAnalytics(clientId, !!existingConfig);
  
  // Fetch issues count for badge
  const { data: issuesData } = useChatWidgetIssues(clientId, { limit: 1 }, !!existingConfig);

  // Mutations
  const saveMutation = useSaveChatWidgetConfig(clientId);
  const updateMutation = useUpdateChatWidgetConfig(clientId);

  // Local form state for preview
  const [formConfig, setFormConfig] = useState<ConfigFormType>({
    ...DEFAULT_WIDGET_CONFIG,
    allowedCategories: [],
  });

  // New API key display modal
  const [newApiKey, setNewApiKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  // Setup guide modal
  const [showSetupGuide, setShowSetupGuide] = useState(false);

  const isNewWidget = !existingConfig && !error;
  const isConfigured = !!existingConfig;

  // Badge counts
  const needsReviewCount = analytics?.feedback?.sessionsNeedingReview || 0;
  const openIssuesCount = issuesData?.total || 0;

  // Handle config changes from form
  const handleConfigChange = useCallback((config: ConfigFormType) => {
    setFormConfig(config);
  }, []);

  // Handle save
  const handleSave = async () => {
    try {
      if (isNewWidget || error) {
        // Create new widget
        const result = await saveMutation.mutateAsync(formConfig);
        if (result.apiKey) {
          // Show the new API key to the user
          setNewApiKey(result.apiKey);
        }
      } else {
        // Update existing widget
        await updateMutation.mutateAsync(formConfig);
      }
    } catch (err) {
      // Error handled by mutation
    }
  };

  const handleCopyApiKey = async () => {
    if (!newApiKey) return;
    try {
      await navigator.clipboard.writeText(newApiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Tab definitions
  const tabs = [
    { 
      id: 'configuration' as InnerTab, 
      label: 'Configuration', 
      icon: Settings,
    },
    { 
      id: 'analytics' as InnerTab, 
      label: 'Analytics', 
      icon: BarChart3,
      badge: needsReviewCount > 0 ? needsReviewCount : undefined,
      badgeVariant: 'warning' as const,
    },
    { 
      id: 'issues' as InnerTab, 
      label: 'Issues', 
      icon: FileText,
      badge: openIssuesCount > 0 ? openIssuesCount : undefined,
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-4">
                <Skeleton variant="text" width="30%" className="mb-4" />
                <Skeleton variant="rounded" height={40} className="mb-2" />
                <Skeleton variant="rounded" height={40} />
              </Card>
            ))}
          </div>
          <Card className="p-4">
            <Skeleton variant="rounded" height={400} />
          </Card>
        </div>
      </div>
    );
  }

  // Check if 404 (not configured yet) vs actual error
  const is404 = error && (error as any)?.response?.status === 404;
  const hasError = error && !is404;

  if (hasError) {
    return (
      <Card className="p-8 text-center">
        <AlertCircle className="h-12 w-12 mx-auto mb-3 text-red-400" />
        <h3 className="font-semibold text-surface-900 dark:text-white mb-2">
          Failed to Load Configuration
        </h3>
        <p className="text-surface-500">
          {(error as any)?.response?.data?.message || 'An error occurred'}
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-surface-900 dark:text-white mb-1">
            Chat Widget
          </h2>
          <p className="text-surface-500">
            {isConfigured
              ? 'Configure your AI-powered chat widget for this client\'s website.'
              : 'Set up an AI chat widget powered by this client\'s knowledge base.'}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowSetupGuide(true)}
        >
          <BookOpen className="h-4 w-4 mr-2" />
          Setup Guide
        </Button>
      </div>

      {/* Inner Tab Navigation */}
      <div className="border-b border-surface-200 dark:border-surface-700">
        <nav className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 pb-3 text-sm font-medium border-b-2 transition-colors',
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
              {tab.badge !== undefined && (
                <Badge 
                  variant={tab.badgeVariant === 'warning' ? 'primary' : 'secondary'} 
                  size="sm"
                  className={cn(
                    tab.badgeVariant === 'warning' && 'bg-amber-500 text-white'
                  )}
                >
                  {tab.badge}
                </Badge>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'configuration' && (
        <div className="space-y-8">
          {/* Configuration and Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Configuration Form */}
            <div>
              {canManage ? (
                <ChatWidgetConfigForm
                  clientId={clientId}
                  initialConfig={existingConfig || undefined}
                  onConfigChange={handleConfigChange}
                  onSave={handleSave}
                  isSaving={saveMutation.isPending || updateMutation.isPending}
                  isNewWidget={!isConfigured}
                />
              ) : (
                <Card className="p-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-surface-900 dark:text-white">
                        View Only
                      </p>
                      <p className="text-sm text-surface-500 mt-1">
                        You need Owner or Manager permissions to configure the chat widget.
                      </p>
                    </div>
                  </div>
                  {existingConfig && (
                    <div className="mt-6 pt-6 border-t border-surface-200 dark:border-surface-700 space-y-4">
                      <div>
                        <p className="text-sm text-surface-500">Status</p>
                        <p className="font-medium text-surface-900 dark:text-white">
                          {existingConfig.isActive ? 'Enabled' : 'Disabled'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-surface-500">Bot Name</p>
                        <p className="font-medium text-surface-900 dark:text-white">
                          {existingConfig.botName}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-surface-500">Greeting</p>
                        <p className="font-medium text-surface-900 dark:text-white">
                          {existingConfig.greeting}
                        </p>
                      </div>
                    </div>
                  )}
                </Card>
              )}
            </div>

            {/* Right: Live Preview */}
            <div className="lg:sticky lg:top-6 self-start">
              <h3 className="font-medium text-surface-900 dark:text-white mb-3">
                Live Preview
              </h3>
              <WidgetPreview
                greeting={formConfig.greeting}
                placeholderText={formConfig.placeholderText}
                botName={formConfig.botName}
                botAvatarUrl={formConfig.botAvatarUrl}
                theme={formConfig.theme}
                isActive={formConfig.isActive}
              />
            </div>
          </div>

          {/* Embed Code and API Key (only if configured) */}
          {isConfigured && existingConfig && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <EmbedCodeDisplay chatWidgetId={existingConfig.chatWidgetId} />
              <ApiKeySection
                clientId={clientId}
                apiKeyPrefix={existingConfig.apiKeyPrefix}
                canRegenerate={canManage}
              />
            </div>
          )}
        </div>
      )}

      {activeTab === 'analytics' && (
        <WidgetAnalyticsSection clientId={clientId} isConfigured={isConfigured} />
      )}

      {activeTab === 'issues' && (
        <WidgetIssuesTab clientId={clientId} />
      )}

      {/* New API Key Modal */}
      <Modal
        isOpen={!!newApiKey}
        onClose={() => setNewApiKey(null)}
        title="Widget Created Successfully!"
        size="md"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <MessageSquare className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-green-800 dark:text-green-200">
                Your chat widget has been created!
              </p>
              <p className="text-green-700 dark:text-green-300 mt-1">
                Copy your API key now - it will not be shown again.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
              API Key
            </label>
            <div className="relative">
              <pre className="bg-surface-900 dark:bg-surface-950 text-surface-100 p-4 rounded-lg text-sm overflow-x-auto font-mono break-all">
                {newApiKey}
              </pre>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyApiKey}
                className="absolute top-2 right-2 bg-surface-800 hover:bg-surface-700 border-surface-600"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-1 text-green-400" />
                    <span className="text-green-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>

          <p className="text-sm text-surface-500">
            Add the embed code shown below to your website to start using the widget.
          </p>

          <div className="flex justify-end">
            <Button onClick={() => setNewApiKey(null)}>Got it!</Button>
          </div>
        </div>
      </Modal>

      {/* Setup Guide Modal */}
      <SetupGuideModal
        isOpen={showSetupGuide}
        onClose={() => setShowSetupGuide(false)}
        chatWidgetId={existingConfig?.chatWidgetId}
        apiKeyPrefix={existingConfig?.apiKeyPrefix}
      />
    </div>
  );
}
