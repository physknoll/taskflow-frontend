'use client';

import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useCreateKBSource,
  useUpdateKBSource,
  useTestConnection,
} from '@/services/kb-sources.service';
import {
  KnowledgeBaseSource,
  KBSourceType,
  CreateKBSourceInput,
  UpdateKBSourceInput,
  CreateSourceResponse,
  KB_SOURCE_TYPES,
  SYNC_INTERVAL_OPTIONS,
} from '@/types/kb-sources';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import {
  CheckCircle,
  XCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Globe,
  AlertTriangle,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface AddEditSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  source?: KnowledgeBaseSource;
  onCreated?: (response: CreateSourceResponse) => void;
}

export function AddEditSourceModal({
  isOpen,
  onClose,
  clientId,
  source,
  onCreated,
}: AddEditSourceModalProps) {
  const queryClient = useQueryClient();
  const isEditing = !!source;

  // Form state
  const [sourceType, setSourceType] = useState<KBSourceType>('hubspot_kb');
  const [name, setName] = useState('');
  const [sitemapUrl, setSitemapUrl] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [category, setCategory] = useState('');
  const [syncIntervalHours, setSyncIntervalHours] = useState(2);
  const [contentSelectors, setContentSelectors] = useState('');
  const [excludeSelectors, setExcludeSelectors] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Test connection state
  const [testResult, setTestResult] = useState<{
    success: boolean;
    urlCount?: number;
    error?: string;
  } | null>(null);

  // Mutations
  const createMutation = useCreateKBSource(clientId);
  const updateMutation = useUpdateKBSource(clientId, source?._id || '');
  const testConnectionMutation = useTestConnection(clientId);

  // Initialize form when editing
  useEffect(() => {
    if (source) {
      setSourceType(source.sourceType);
      setName(source.name);
      setSitemapUrl(source.sitemapUrl);
      setBaseUrl(source.baseUrl || '');
      setCategory(source.category);
      setSyncIntervalHours(source.syncIntervalHours);
      setContentSelectors(source.contentSelectors?.join(', ') || '');
      setExcludeSelectors(source.excludeSelectors?.join(', ') || '');
    } else {
      // Reset form
      setSourceType('hubspot_kb');
      setName('');
      setSitemapUrl('');
      setBaseUrl('');
      setCategory('');
      setSyncIntervalHours(2);
      setContentSelectors('');
      setExcludeSelectors('');
      setShowAdvanced(false);
    }
    setTestResult(null);
  }, [source, isOpen]);

  // Test connection
  const handleTestConnection = async () => {
    if (!sitemapUrl.trim()) {
      toast.error('Please enter a sitemap URL');
      return;
    }

    setTestResult(null);
    try {
      const result = await testConnectionMutation.mutateAsync(sitemapUrl);
      setTestResult(result);
    } catch (error: any) {
      setTestResult({
        success: false,
        error: error.response?.data?.message || 'Connection test failed',
      });
    }
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }
    if (!sitemapUrl.trim()) {
      toast.error('Sitemap URL is required');
      return;
    }
    if (!category.trim()) {
      toast.error('Category is required');
      return;
    }

    // Parse selectors
    const parseSelectors = (str: string): string[] | undefined => {
      if (!str.trim()) return undefined;
      return str
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    };

    try {
      if (isEditing) {
        const updateData: UpdateKBSourceInput = {
          name: name.trim(),
          sitemapUrl: sitemapUrl.trim(),
          baseUrl: baseUrl.trim() || undefined,
          category: category.trim(),
          syncIntervalHours,
          contentSelectors: parseSelectors(contentSelectors),
          excludeSelectors: parseSelectors(excludeSelectors),
        };
        await updateMutation.mutateAsync(updateData);
        toast.success('Source updated successfully');
        // Invalidate queries
        queryClient.invalidateQueries({ queryKey: ['kb-sources', clientId] });
        onClose();
      } else {
        const createData: CreateKBSourceInput = {
          name: name.trim(),
          sourceType,
          sitemapUrl: sitemapUrl.trim(),
          baseUrl: baseUrl.trim() || undefined,
          category: category.trim(),
          syncIntervalHours,
          contentSelectors: parseSelectors(contentSelectors),
          excludeSelectors: parseSelectors(excludeSelectors),
        };
        const response = await createMutation.mutateAsync(createData);
        
        // Invalidate queries to refresh the list
        queryClient.invalidateQueries({ queryKey: ['kb-sources', clientId] });
        
        // Notify parent with the created source and sync job info
        if (onCreated) {
          toast.success(`Source created with ${response.discovery.totalUrls} URLs. Sync started.`);
          onCreated(response);
        } else {
          toast.success('Source created successfully! Initial sync will start shortly.');
          onClose();
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save source');
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Knowledge Base Source' : 'Add Knowledge Base Source'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Source Type Selection (only for new sources) */}
        {!isEditing && (
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-3">
              Source Type *
            </label>
            <div className="space-y-2">
              {KB_SOURCE_TYPES.map((type) => (
                <label
                  key={type.value}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
                    sourceType === type.value
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-surface-200 dark:border-surface-700 hover:border-surface-300 dark:hover:border-surface-600',
                    !type.enabled && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  <input
                    type="radio"
                    name="sourceType"
                    value={type.value}
                    checked={sourceType === type.value}
                    onChange={(e) => setSourceType(e.target.value as KBSourceType)}
                    disabled={!type.enabled}
                    className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-surface-900 dark:text-white">
                        {type.label}
                      </span>
                      {!type.enabled && (
                        <Badge variant="secondary" size="sm">
                          Coming soon
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-surface-500">{type.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Name */}
        <Input
          label="Name *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Product Documentation"
        />

        {/* Sitemap URL with Test Connection */}
        <div>
          <Input
            label="Sitemap URL *"
            value={sitemapUrl}
            onChange={(e) => {
              setSitemapUrl(e.target.value);
              setTestResult(null);
            }}
            placeholder="https://example.com/sitemap.xml"
          />
          <div className="mt-2 flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleTestConnection}
              disabled={testConnectionMutation.isPending || !sitemapUrl.trim()}
            >
              {testConnectionMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Globe className="h-4 w-4 mr-2" />
                  Test Connection
                </>
              )}
            </Button>

            {testResult && (
              <div
                className={cn(
                  'flex items-center gap-2 text-sm',
                  testResult.success ? 'text-green-600' : 'text-red-600'
                )}
              >
                {testResult.success ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Valid - {testResult.urlCount} URLs found
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4" />
                    {testResult.error}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Base URL (optional) */}
        <Input
          label="Base URL (optional)"
          value={baseUrl}
          onChange={(e) => setBaseUrl(e.target.value)}
          placeholder="https://example.com/docs"
        />
        <p className="text-xs text-surface-500 -mt-4">
          Only sync URLs that start with this path. Leave empty to sync all URLs from the sitemap.
        </p>

        {/* Category */}
        <Input
          label="Category *"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="e.g., product-docs"
        />
        <p className="text-xs text-surface-500 -mt-4">
          Used for filtering in RAG queries. Use lowercase with hyphens.
        </p>

        {/* Sync Interval */}
        <Select
          label="Sync Interval"
          options={SYNC_INTERVAL_OPTIONS.map((opt) => ({
            value: String(opt.value),
            label: opt.label,
          }))}
          value={String(syncIntervalHours)}
          onChange={(val) => setSyncIntervalHours(Number(val))}
        />

        {/* Advanced Options Toggle */}
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-sm font-medium text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white transition-colors"
        >
          {showAdvanced ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
          Advanced Options
        </button>

        {/* Advanced Options */}
        {showAdvanced && (
          <div className="space-y-4 p-4 bg-surface-50 dark:bg-surface-800/50 rounded-lg">
            <div>
              <Input
                label="Content Selectors"
                value={contentSelectors}
                onChange={(e) => setContentSelectors(e.target.value)}
                placeholder=".article-body, #main-content"
              />
              <p className="text-xs text-surface-500 mt-1">
                CSS selectors for extracting main content. Comma-separated.
              </p>
            </div>

            <div>
              <Input
                label="Exclude Selectors"
                value={excludeSelectors}
                onChange={(e) => setExcludeSelectors(e.target.value)}
                placeholder=".sidebar, .navigation, .footer"
              />
              <p className="text-xs text-surface-500 mt-1">
                CSS selectors for elements to exclude. Comma-separated.
              </p>
            </div>

            <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 dark:text-amber-300">
                Only change these settings if you understand CSS selectors. Incorrect selectors may
                result in missing or incorrect content extraction.
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-surface-200 dark:border-surface-700">
          <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {isEditing ? 'Saving...' : 'Creating...'}
              </>
            ) : isEditing ? (
              'Save Changes'
            ) : (
              'Create Source'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

