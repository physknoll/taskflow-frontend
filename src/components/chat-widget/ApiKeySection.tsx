'use client';

import { useState } from 'react';
import { Key, RefreshCw, Copy, Check, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { useRegenerateApiKey } from '@/hooks/useChatWidget';

interface ApiKeySectionProps {
  clientId: string;
  apiKeyPrefix: string;
  canRegenerate: boolean;
}

/**
 * Displays API key prefix and allows regeneration
 * Shows warning modal before regenerating
 */
export function ApiKeySection({
  clientId,
  apiKeyPrefix,
  canRegenerate,
}: ApiKeySectionProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [newApiKey, setNewApiKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const regenerateMutation = useRegenerateApiKey(clientId);

  const handleRegenerate = async () => {
    try {
      const result = await regenerateMutation.mutateAsync();
      setNewApiKey(result.apiKey);
      setShowConfirm(false);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleCopyNewKey = async () => {
    if (!newApiKey) return;
    try {
      await navigator.clipboard.writeText(newApiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleCloseNewKeyModal = () => {
    setNewApiKey(null);
    setCopied(false);
  };

  return (
    <>
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Key className="h-5 w-5 text-primary-500" />
          <h4 className="font-semibold text-surface-900 dark:text-white">
            API Key
          </h4>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-surface-600 dark:text-surface-400 font-mono">
              {apiKeyPrefix}
            </p>
            <p className="text-xs text-surface-400 mt-1">
              Used for widget authentication
            </p>
          </div>

          {canRegenerate && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowConfirm(true)}
              disabled={regenerateMutation.isPending}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${
                  regenerateMutation.isPending ? 'animate-spin' : ''
                }`}
              />
              Regenerate
            </Button>
          )}
        </div>
      </Card>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        title="Regenerate API Key?"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-amber-800 dark:text-amber-200">
                Warning: This action cannot be undone
              </p>
              <p className="text-amber-700 dark:text-amber-300 mt-1">
                The current API key will be invalidated immediately. Any websites
                using the current key will stop working until updated with the new
                key.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowConfirm(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleRegenerate}
              disabled={regenerateMutation.isPending}
              className="bg-amber-500 hover:bg-amber-600"
            >
              {regenerateMutation.isPending ? 'Regenerating...' : 'Regenerate Key'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* New Key Display Modal */}
      <Modal
        isOpen={!!newApiKey}
        onClose={handleCloseNewKeyModal}
        title="New API Key Generated"
        size="md"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-green-800 dark:text-green-200">
                Your new API key has been generated
              </p>
              <p className="text-green-700 dark:text-green-300 mt-1">
                Copy this key now - it will not be shown again.
              </p>
            </div>
          </div>

          <div className="relative">
            <pre className="bg-surface-900 dark:bg-surface-950 text-surface-100 p-4 rounded-lg text-sm overflow-x-auto font-mono break-all">
              {newApiKey}
            </pre>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyNewKey}
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

          <div className="flex justify-end">
            <Button onClick={handleCloseNewKeyModal}>Done</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
