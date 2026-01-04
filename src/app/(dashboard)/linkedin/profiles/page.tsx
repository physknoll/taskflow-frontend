'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLinkedInProfiles } from '@/hooks/useLinkedIn';
import { useClients } from '@/hooks/useClients';
import { ProfileCard, AddProfileModal, CSVUploadModal } from '@/components/linkedin';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Modal } from '@/components/ui/Modal';
import { LinkedInProfile, LinkedInProfileType, AddLinkedInProfileDto } from '@/types';
import { canManageLinkedIn } from '@/lib/permissions';
import { useAuthStore } from '@/stores/authStore';
import {
  Plus,
  Search,
  Users,
  RefreshCw,
  Filter,
  X,
  Upload,
} from 'lucide-react';

const profileTypeOptions: { value: LinkedInProfileType | ''; label: string }[] = [
  { value: '', label: 'All Types' },
  { value: 'own', label: 'Own' },
  { value: 'competitor', label: 'Competitor' },
  { value: 'industry', label: 'Industry' },
  { value: 'prospect', label: 'Prospect' },
];

export default function LinkedInProfilesPage() {
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const { clients } = useClients();
  
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [profileType, setProfileType] = useState<LinkedInProfileType | ''>(
    (searchParams.get('profileType') as LinkedInProfileType) || ''
  );
  const [clientId, setClientId] = useState(searchParams.get('clientId') || '');
  const [monitoringEnabled, setMonitoringEnabled] = useState<boolean | undefined>(undefined);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCSVUploadModal, setShowCSVUploadModal] = useState(false);
  const [editProfile, setEditProfile] = useState<LinkedInProfile | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<LinkedInProfile | null>(null);
  const [scrapingProfileId, setScrapingProfileId] = useState<string | null>(null);

  const {
    profiles,
    pagination,
    isLoading,
    refetch,
    addProfile,
    isAdding,
    updateProfile,
    isUpdating,
    deleteProfile,
    isDeleting,
    triggerScrape,
  } = useLinkedInProfiles({
    search: search || undefined,
    profileType: profileType || undefined,
    clientId: clientId || undefined,
    monitoringEnabled,
    limit: 50,
  });

  const canManage = canManageLinkedIn(user?.role);

  const handleAddProfile = async (data: AddLinkedInProfileDto) => {
    await addProfile(data);
  };

  const handleToggleMonitoring = async (profile: LinkedInProfile) => {
    await updateProfile(profile._id, { monitoringEnabled: !profile.monitoringEnabled });
  };

  const handleTriggerScrape = async (profile: LinkedInProfile) => {
    setScrapingProfileId(profile._id);
    try {
      await triggerScrape(profile._id);
    } finally {
      setScrapingProfileId(null);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    await deleteProfile(confirmDelete._id);
    setConfirmDelete(null);
  };

  const clearFilters = () => {
    setSearch('');
    setProfileType('');
    setClientId('');
    setMonitoringEnabled(undefined);
  };

  const hasFilters = search || profileType || clientId || monitoringEnabled !== undefined;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">
            LinkedIn Profiles
          </h1>
          <p className="text-surface-500 dark:text-surface-400">
            {pagination?.total || 0} profiles being monitored
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          {canManage && (
            <>
              <Button variant="outline" onClick={() => setShowCSVUploadModal(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Bulk Import
              </Button>
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Profile
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-surface-800 rounded-lg border border-surface-200 dark:border-surface-700 p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
            <input
              type="text"
              placeholder="Search profiles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Profile Type */}
          <select
            value={profileType}
            onChange={(e) => setProfileType(e.target.value as LinkedInProfileType | '')}
            className="px-4 py-2 rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {profileTypeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Client */}
          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="px-4 py-2 rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Clients</option>
            {clients.map((client) => (
              <option key={client._id} value={client._id}>
                {client.name}
              </option>
            ))}
          </select>

          {/* Monitoring Status */}
          <select
            value={monitoringEnabled === undefined ? '' : monitoringEnabled.toString()}
            onChange={(e) =>
              setMonitoringEnabled(
                e.target.value === '' ? undefined : e.target.value === 'true'
              )
            }
            className="px-4 py-2 rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Paused</option>
          </select>

          {/* Clear Filters */}
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Profiles Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} variant="rounded" height={280} />
          ))}
        </div>
      ) : profiles.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-surface-800 rounded-xl">
          <Users className="h-12 w-12 mx-auto mb-4 text-surface-400" />
          <h3 className="text-lg font-medium text-surface-900 dark:text-white mb-2">
            {hasFilters ? 'No profiles match your filters' : 'No profiles yet'}
          </h3>
          <p className="text-surface-500 dark:text-surface-400 mb-4 max-w-md mx-auto">
            {hasFilters
              ? 'Try adjusting your search or filters.'
              : 'Add LinkedIn profiles to start monitoring posts and engagement.'}
          </p>
          {!hasFilters && canManage && (
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Profile
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profiles.map((profile) => (
            <ProfileCard
              key={profile._id}
              profile={profile}
              onEdit={() => setEditProfile(profile)}
              onScrape={() => handleTriggerScrape(profile)}
              onDelete={() => setConfirmDelete(profile)}
              onToggleMonitoring={() => handleToggleMonitoring(profile)}
              isScraping={scrapingProfileId === profile._id}
              showActions={canManage}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex justify-center">
          <p className="text-sm text-surface-500">
            Showing {profiles.length} of {pagination.total} profiles
          </p>
        </div>
      )}

      {/* Add Profile Modal */}
      <AddProfileModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddProfile}
        isSubmitting={isAdding}
      />

      {/* CSV Upload Modal */}
      <CSVUploadModal
        isOpen={showCSVUploadModal}
        onClose={() => setShowCSVUploadModal(false)}
        onSuccess={() => refetch()}
      />

      {/* Edit Profile Modal */}
      <Modal
        isOpen={!!editProfile}
        onClose={() => setEditProfile(null)}
        title="Edit Profile"
        size="md"
      >
        {editProfile && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Display Name</label>
              <input
                type="text"
                value={editProfile.displayName}
                onChange={(e) =>
                  setEditProfile({ ...editProfile, displayName: e.target.value })
                }
                className="w-full px-4 py-2 rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Headline</label>
              <input
                type="text"
                value={editProfile.headline || ''}
                onChange={(e) =>
                  setEditProfile({ ...editProfile, headline: e.target.value })
                }
                className="w-full px-4 py-2 rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Profile Type</label>
              <select
                value={editProfile.profileType}
                onChange={(e) =>
                  setEditProfile({
                    ...editProfile,
                    profileType: e.target.value as LinkedInProfileType,
                  })
                }
                className="w-full px-4 py-2 rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800"
              >
                <option value="own">Own</option>
                <option value="competitor">Competitor</option>
                <option value="industry">Industry</option>
                <option value="prospect">Prospect</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Scrape Interval</label>
              <select
                value={editProfile.scrapeSchedule.intervalMinutes}
                onChange={(e) =>
                  setEditProfile({
                    ...editProfile,
                    scrapeSchedule: {
                      ...editProfile.scrapeSchedule,
                      intervalMinutes: parseInt(e.target.value),
                    },
                  })
                }
                className="w-full px-4 py-2 rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800"
              >
                <option value={15}>Every 15 minutes</option>
                <option value={30}>Every 30 minutes</option>
                <option value={60}>Every hour</option>
                <option value={120}>Every 2 hours</option>
                <option value={360}>Every 6 hours</option>
                <option value={720}>Every 12 hours</option>
                <option value={1440}>Daily</option>
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setEditProfile(null)}>
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  await updateProfile(editProfile._id, {
                    displayName: editProfile.displayName,
                    headline: editProfile.headline,
                    profileType: editProfile.profileType,
                    intervalMinutes: editProfile.scrapeSchedule.intervalMinutes,
                  });
                  setEditProfile(null);
                }}
                isLoading={isUpdating}
              >
                Save Changes
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Delete Profile"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-surface-600 dark:text-surface-400">
            Are you sure you want to delete <strong>{confirmDelete?.displayName}</strong>?
            All collected posts will be preserved but monitoring will stop.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} isLoading={isDeleting}>
              Delete Profile
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
