'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useKBSources, useDeleteKBSource } from '@/services/kb-sources.service';
import { useAuthStore } from '@/stores/authStore';
import { hasPermission } from '@/lib/permissions';
import { KnowledgeBaseSource } from '@/types/kb-sources';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { ConfirmModal } from '@/components/ui/Modal';
import { KBSourceCard } from './KBSourceCard';
import { AddEditSourceModal } from './AddEditSourceModal';
import { SyncProgressModal } from './SyncProgressModal';
import { SyncedURLsDrawer } from './SyncedURLsDrawer';
import { SyncHistoryPanel } from './SyncHistoryPanel';
import {
  Plus,
  Globe,
  RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface KBSourcesListProps {
  clientId: string;
}

export function KBSourcesList({ clientId }: KBSourcesListProps) {
  const { user } = useAuthStore();
  const canManage = hasPermission(user?.role, 'clients.manage_kb_sources');

  // Fetch sources
  const { data: sourcesData, isLoading, error } = useKBSources(clientId);
  const sources = sourcesData?.data || [];

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSource, setEditingSource] = useState<KnowledgeBaseSource | null>(null);
  const [syncingSource, setSyncingSource] = useState<KnowledgeBaseSource | null>(null);
  const [viewingUrlsSource, setViewingUrlsSource] = useState<KnowledgeBaseSource | null>(null);
  const [viewingHistorySource, setViewingHistorySource] = useState<KnowledgeBaseSource | null>(null);
  const [deletingSource, setDeletingSource] = useState<KnowledgeBaseSource | null>(null);

  // Mutations
  const deleteMutation = useDeleteKBSource(clientId);
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    if (!deletingSource) return;
    
    try {
      await deleteMutation.mutateAsync(deletingSource._id);
      toast.success('Source deleted successfully');
      setDeletingSource(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete source');
    }
  };

  const handleToggleSync = async (source: KnowledgeBaseSource) => {
    try {
      // Call the service directly since we can't call hooks with dynamic sourceId
      const { kbSourcesService } = await import('@/services/kb-sources.service');
      await kbSourcesService.toggleSync(clientId, source._id, !source.syncEnabled);
      // Invalidate queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ['kb-sources', clientId] });
      toast.success(source.syncEnabled ? 'Sync disabled' : 'Sync enabled');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to toggle sync');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700 p-6"
          >
            <div className="flex items-start gap-4">
              <Skeleton variant="rounded" width={48} height={48} />
              <div className="flex-1">
                <Skeleton variant="text" width="40%" />
                <Skeleton variant="text" width="60%" className="mt-2" />
                <Skeleton variant="text" width="30%" className="mt-2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700 p-8 text-center">
        <div className="text-red-500 mb-4">
          <Globe className="h-12 w-12 mx-auto opacity-50" />
        </div>
        <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-2">
          Failed to load sources
        </h3>
        <p className="text-surface-500 mb-4">
          {(error as any)?.response?.data?.message || 'An error occurred while loading KB sources'}
        </p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  // Empty state
  if (sources.length === 0) {
    return (
      <>
        <div className="bg-white dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700 p-12 text-center">
          <Globe className="h-16 w-16 mx-auto mb-4 text-surface-300" />
          <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-2">
            No Knowledge Base Sources
          </h3>
          <p className="text-surface-500 mb-6 max-w-md mx-auto">
            Connect external knowledge bases like HubSpot KB to automatically sync articles for AI-powered search and chat.
          </p>
          {canManage && (
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Source
            </Button>
          )}
        </div>

        {/* Add Source Modal */}
        <AddEditSourceModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          clientId={clientId}
        />
      </>
    );
  }

  return (
    <>
      {/* Header with Add Button */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-surface-900 dark:text-white">
            Knowledge Base Sources
          </h3>
          <p className="text-sm text-surface-500">
            {sources.length} source{sources.length !== 1 ? 's' : ''} configured
          </p>
        </div>
        {canManage && (
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Source
          </Button>
        )}
      </div>

      {/* Sources List */}
      <div className="space-y-4">
        {sources.map((source) => (
          <KBSourceCard
            key={source._id}
            source={source}
            canManage={canManage}
            onEdit={() => setEditingSource(source)}
            onSync={() => setSyncingSource(source)}
            onViewUrls={() => setViewingUrlsSource(source)}
            onViewHistory={() => setViewingHistorySource(source)}
            onToggleSync={() => handleToggleSync(source)}
            onDelete={() => setDeletingSource(source)}
          />
        ))}
      </div>

      {/* Add/Edit Source Modal */}
      <AddEditSourceModal
        isOpen={showAddModal || !!editingSource}
        onClose={() => {
          setShowAddModal(false);
          setEditingSource(null);
        }}
        clientId={clientId}
        source={editingSource || undefined}
      />

      {/* Sync Progress Modal */}
      {syncingSource && (
        <SyncProgressModal
          isOpen={!!syncingSource}
          onClose={() => setSyncingSource(null)}
          clientId={clientId}
          source={syncingSource}
        />
      )}

      {/* Synced URLs Drawer */}
      {viewingUrlsSource && (
        <SyncedURLsDrawer
          isOpen={!!viewingUrlsSource}
          onClose={() => setViewingUrlsSource(null)}
          clientId={clientId}
          source={viewingUrlsSource}
        />
      )}

      {/* Sync History Panel */}
      {viewingHistorySource && (
        <SyncHistoryPanel
          isOpen={!!viewingHistorySource}
          onClose={() => setViewingHistorySource(null)}
          clientId={clientId}
          source={viewingHistorySource}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingSource}
        onClose={() => setDeletingSource(null)}
        onConfirm={handleDelete}
        title="Delete Source"
        description={`Are you sure you want to delete "${deletingSource?.name}"? This will also remove all synced content from the RAG system. This action cannot be undone.`}
        confirmText="Delete Source"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}
