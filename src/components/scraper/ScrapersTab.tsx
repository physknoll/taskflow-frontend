'use client';

import { useState } from 'react';
import { useLinkedInScrapers } from '@/hooks/useLinkedIn';
import { ScraperCard, ConnectionCodeModal } from '@/components/linkedin';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Modal } from '@/components/ui/Modal';
import { LinkedInScraper, UpdateLinkedInScraperSettingsDto, LinkedInScrapingMode } from '@/types';
import { canManageLinkedIn } from '@/lib/permissions';
import { useAuthStore } from '@/stores/authStore';
import {
  Plus,
  Monitor,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';

export function ScrapersTab() {
  const { user } = useAuthStore();
  const {
    scrapers,
    onlineCount,
    isLoading,
    refetch,
    generateConnectionCode,
    isGeneratingCode,
    updateSettings,
    isUpdatingSettings,
    revokeScraper,
    isRevoking,
    deleteScraper,
    isDeleting,
  } = useLinkedInScrapers();

  const [showConnectModal, setShowConnectModal] = useState(false);
  const [settingsModal, setSettingsModal] = useState<LinkedInScraper | null>(null);
  const [confirmRevoke, setConfirmRevoke] = useState<LinkedInScraper | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<LinkedInScraper | null>(null);

  const canManage = canManageLinkedIn(user?.role);

  const handleUpdateSettings = async (settings: UpdateLinkedInScraperSettingsDto) => {
    if (!settingsModal) return;
    await updateSettings(settingsModal._id, settings);
    setSettingsModal(null);
  };

  const handleRevoke = async () => {
    if (!confirmRevoke) return;
    await revokeScraper(confirmRevoke._id);
    setConfirmRevoke(null);
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    await deleteScraper(confirmDelete._id);
    setConfirmDelete(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          {canManage && (
            <Button onClick={() => setShowConnectModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Scraper
            </Button>
          )}
        </div>
      </div>

      {/* Status Summary */}
      <div className="flex items-center gap-4 p-4 bg-surface-50 dark:bg-surface-800 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-success-500"></div>
          <span className="text-sm font-medium text-surface-700 dark:text-surface-300">
            {onlineCount} Online
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-surface-400"></div>
          <span className="text-sm font-medium text-surface-700 dark:text-surface-300">
            {scrapers.length - onlineCount} Offline
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Monitor className="h-4 w-4 text-surface-500" />
          <span className="text-sm font-medium text-surface-700 dark:text-surface-300">
            {scrapers.length} Total
          </span>
        </div>
      </div>

      {/* No online scrapers warning */}
      {!isLoading && scrapers.length > 0 && onlineCount === 0 && (
        <div className="flex items-center gap-3 p-4 bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-warning-600 dark:text-warning-400" />
          <div>
            <p className="font-medium text-warning-800 dark:text-warning-300">
              No scrapers are online
            </p>
            <p className="text-sm text-warning-700 dark:text-warning-400">
              Make sure at least one desktop agent is running to scrape profiles.
            </p>
          </div>
        </div>
      )}

      {/* Scrapers Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rounded" height={300} />
          ))}
        </div>
      ) : scrapers.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-surface-800 rounded-xl">
          <Monitor className="h-12 w-12 mx-auto mb-4 text-surface-400" />
          <h3 className="text-lg font-medium text-surface-900 dark:text-white mb-2">
            No scrapers configured
          </h3>
          <p className="text-surface-500 dark:text-surface-400 mb-4 max-w-md mx-auto">
            Desktop scrapers run on your team&apos;s computers and connect to collect posts.
            Add your first scraper to get started.
          </p>
          {canManage && (
            <Button onClick={() => setShowConnectModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Scraper
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {scrapers.map((scraper) => (
            <ScraperCard
              key={scraper._id}
              scraper={scraper}
              onSettings={() => setSettingsModal(scraper)}
              onRevoke={() => setConfirmRevoke(scraper)}
              onDelete={() => setConfirmDelete(scraper)}
            />
          ))}
        </div>
      )}

      {/* Connection Code Modal */}
      <ConnectionCodeModal
        isOpen={showConnectModal}
        onClose={() => setShowConnectModal(false)}
        onGenerateCode={generateConnectionCode}
        isGenerating={isGeneratingCode}
      />

      {/* Settings Modal */}
      <Modal
        isOpen={!!settingsModal}
        onClose={() => setSettingsModal(null)}
        title={`Settings: ${settingsModal?.name}`}
        size="md"
      >
        {settingsModal && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                Scraping Mode
              </label>
              <select
                value={settingsModal.settings.scrapingMode}
                onChange={(e) =>
                  setSettingsModal({
                    ...settingsModal,
                    settings: {
                      ...settingsModal.settings,
                      scrapingMode: e.target.value as LinkedInScrapingMode,
                    },
                  })
                }
                className="w-full px-4 py-2 rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800"
              >
                <option value="conservative">Conservative (Safer, slower)</option>
                <option value="balanced">Balanced (Recommended)</option>
                <option value="aggressive">Aggressive (Faster, riskier)</option>
              </select>
              <p className="mt-1 text-xs text-surface-500">
                Conservative mode is recommended for new accounts.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                Max Posts Per Scrape
              </label>
              <input
                type="number"
                min={5}
                max={50}
                value={settingsModal.settings.maxPostsPerScrape}
                onChange={(e) =>
                  setSettingsModal({
                    ...settingsModal,
                    settings: {
                      ...settingsModal.settings,
                      maxPostsPerScrape: parseInt(e.target.value) || 20,
                    },
                  })
                }
                className="w-full px-4 py-2 rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800"
              />
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settingsModal.settings.enableCommentScraping}
                  onChange={(e) =>
                    setSettingsModal({
                      ...settingsModal,
                      settings: {
                        ...settingsModal.settings,
                        enableCommentScraping: e.target.checked,
                      },
                    })
                  }
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm">Enable comment scraping</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settingsModal.settings.enableScreenshots}
                  onChange={(e) =>
                    setSettingsModal({
                      ...settingsModal,
                      settings: {
                        ...settingsModal.settings,
                        enableScreenshots: e.target.checked,
                      },
                    })
                  }
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm">Enable screenshots</span>
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setSettingsModal(null)}>
                Cancel
              </Button>
              <Button
                onClick={() => handleUpdateSettings(settingsModal.settings)}
                isLoading={isUpdatingSettings}
              >
                Save Settings
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Revoke Confirmation Modal */}
      <Modal
        isOpen={!!confirmRevoke}
        onClose={() => setConfirmRevoke(null)}
        title="Revoke Scraper Access"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-surface-600 dark:text-surface-400">
            Are you sure you want to revoke access for <strong>{confirmRevoke?.name}</strong>?
            The agent will be disconnected and won&apos;t be able to reconnect.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setConfirmRevoke(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleRevoke} isLoading={isRevoking}>
              Revoke Access
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Delete Scraper"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-surface-600 dark:text-surface-400">
            Are you sure you want to delete <strong>{confirmDelete?.name}</strong>?
            This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} isLoading={isDeleting}>
              Delete Scraper
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
