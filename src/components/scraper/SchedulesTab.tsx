'use client';

import { useState } from 'react';
import { useScrapingSchedules, useScrapingQueue } from '@/hooks/useScraping';
import {
  ScheduleCard,
  ScheduleModal,
  QueueStatusPanel,
} from '@/components/scraping';
import { SchedulesTable } from './SchedulesTable';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  ScrapeSchedule,
  CreateScrapeScheduleDto,
  UpdateScrapeScheduleDto,
} from '@/types/scraping';
import { canManageLinkedIn } from '@/lib/permissions';
import { useAuthStore } from '@/stores/authStore';
import {
  Plus,
  Calendar,
  RefreshCw,
  CheckCircle,
  Clock,
  AlertTriangle,
  LayoutGrid,
  List,
} from 'lucide-react';

export function SchedulesTab() {
  const { user } = useAuthStore();
  const {
    schedules,
    isLoading,
    refetch,
    createSchedule,
    isCreating,
    updateSchedule,
    isUpdating,
    deleteSchedule,
    isDeleting,
    triggerSchedule,
    isTriggering,
  } = useScrapingSchedules();

  const {
    status: queueStatus,
    commands: queueCommands,
    isLoading: queueLoading,
    refetch: refetchQueue,
    cancelCommand,
    isCancelling,
    retryCommand,
    isRetrying,
    clearFailed,
    isClearing,
  } = useScrapingQueue();

  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScrapeSchedule | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<ScrapeSchedule | null>(null);
  const [triggeringId, setTriggeringId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table'); // Default to table

  const canManage = canManageLinkedIn(user?.role);

  const handleCreateSchedule = async (data: CreateScrapeScheduleDto) => {
    await createSchedule(data);
    setShowScheduleModal(false);
  };

  const handleUpdateSchedule = async (data: UpdateScrapeScheduleDto) => {
    if (!editingSchedule) return;
    await updateSchedule(editingSchedule._id, data);
    setEditingSchedule(null);
  };

  const handleDeleteSchedule = async () => {
    if (!confirmDelete) return;
    await deleteSchedule(confirmDelete._id);
    setConfirmDelete(null);
  };

  const handleTriggerSchedule = async (id: string) => {
    setTriggeringId(id);
    try {
      await triggerSchedule(id);
    } finally {
      setTriggeringId(null);
    }
  };

  const activeSchedules = schedules.filter((s) => s.enabled).length;
  const totalSchedules = schedules.length;

  return (
    <div className="space-y-6">
      {/* Status Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-surface-900 dark:text-white">
                  {totalSchedules}
                </p>
                <p className="text-xs text-surface-500">Total Schedules</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success-100 dark:bg-success-900/30 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-success-600 dark:text-success-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-surface-900 dark:text-white">
                  {activeSchedules}
                </p>
                <p className="text-xs text-surface-500">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning-100 dark:bg-warning-900/30 flex items-center justify-center">
                <Clock className="h-5 w-5 text-warning-600 dark:text-warning-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-surface-900 dark:text-white">
                  {(queueStatus?.pending || 0) + (queueStatus?.inProgress || 0)}
                </p>
                <p className="text-xs text-surface-500">Queued Commands</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-error-100 dark:bg-error-900/30 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-error-600 dark:text-error-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-surface-900 dark:text-white">
                  {queueStatus?.failed || 0}
                </p>
                <p className="text-xs text-surface-500">Failed Commands</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center border border-surface-300 dark:border-surface-600 rounded-lg overflow-hidden">
          <button
            onClick={() => setViewMode('table')}
            className={`p-2 transition-colors ${
              viewMode === 'table'
                ? 'bg-primary-500 text-white'
                : 'bg-white dark:bg-surface-800 text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-700'
            }`}
            title="Table View"
          >
            <List className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('cards')}
            className={`p-2 transition-colors ${
              viewMode === 'cards'
                ? 'bg-primary-500 text-white'
                : 'bg-white dark:bg-surface-800 text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-700'
            }`}
            title="Card View"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          {canManage && (
            <Button onClick={() => setShowScheduleModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Schedule
            </Button>
          )}
        </div>
      </div>

      {/* Schedules Grid/Table */}
      {isLoading ? (
        viewMode === 'table' ? (
          <div className="bg-white dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700 p-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} variant="rounded" height={48} className="mb-2" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} variant="rounded" height={220} />
            ))}
          </div>
        )
      ) : schedules.length === 0 ? (
        <Card>
          <CardContent className="py-16">
            <div className="text-center">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-surface-400" />
              <h3 className="text-lg font-medium text-surface-900 dark:text-white mb-2">
                No schedules yet
              </h3>
              <p className="text-surface-500 dark:text-surface-400 mb-4 max-w-md mx-auto">
                Create your first scraping schedule to automatically collect data from multiple platforms on a recurring basis.
              </p>
              {canManage && (
                <Button onClick={() => setShowScheduleModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Schedule
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : viewMode === 'table' ? (
        <SchedulesTable
          schedules={schedules}
          onEdit={setEditingSchedule}
          onDelete={setConfirmDelete}
          onTrigger={handleTriggerSchedule}
          triggeringId={triggeringId}
          isTriggering={isTriggering}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {schedules.map((schedule) => (
            <ScheduleCard
              key={schedule._id}
              schedule={schedule}
              onEdit={() => setEditingSchedule(schedule)}
              onDelete={() => setConfirmDelete(schedule)}
              onTrigger={() => handleTriggerSchedule(schedule._id)}
              onViewDetails={() => setEditingSchedule(schedule)}
              isTriggering={triggeringId === schedule._id && isTriggering}
            />
          ))}
        </div>
      )}

      {/* Command Queue */}
      <QueueStatusPanel
        status={queueStatus}
        commands={queueCommands}
        isLoading={queueLoading}
        onRefresh={refetchQueue}
        onRetry={retryCommand}
        onCancel={cancelCommand}
        onClearFailed={clearFailed}
        isRetrying={isRetrying}
        isCancelling={isCancelling}
        isClearing={isClearing}
      />

      {/* Create Schedule Modal */}
      <ScheduleModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        onSubmit={handleCreateSchedule}
        isSubmitting={isCreating}
      />

      {/* Edit Schedule Modal */}
      <ScheduleModal
        isOpen={!!editingSchedule}
        onClose={() => setEditingSchedule(null)}
        schedule={editingSchedule}
        onSubmit={handleUpdateSchedule}
        isSubmitting={isUpdating}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Delete Schedule"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-surface-600 dark:text-surface-400">
            Are you sure you want to delete <strong>{confirmDelete?.name}</strong>?
            This will also remove all targets associated with this schedule.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteSchedule} isLoading={isDeleting}>
              Delete Schedule
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
