'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLinkedInSessions, useLinkedInScrapers, useLinkedInProfiles, useLinkedInSessionPosts } from '@/hooks/useLinkedIn';
import { SessionCard, PostCard } from '@/components/linkedin';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Modal } from '@/components/ui/Modal';
import { LinkedInSession, LinkedInSessionStatus, LinkedInTargetType, LinkedInTriggerType } from '@/types';
import {
  Activity,
  RefreshCw,
  X,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

const statusOptions: { value: LinkedInSessionStatus | ''; label: string }[] = [
  { value: '', label: 'All Status' },
  { value: 'success', label: 'Success' },
  { value: 'partial', label: 'Partial' },
  { value: 'failed', label: 'Failed' },
  { value: 'timeout', label: 'Timeout' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'pending', label: 'Pending' },
];

const targetTypeOptions: { value: LinkedInTargetType | ''; label: string }[] = [
  { value: '', label: 'All Targets' },
  { value: 'profile', label: 'Profile' },
  { value: 'company', label: 'Company' },
  { value: 'search', label: 'Search' },
  { value: 'hashtag', label: 'Hashtag' },
];

const triggerTypeOptions: { value: LinkedInTriggerType | ''; label: string }[] = [
  { value: '', label: 'All Triggers' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'manual', label: 'Manual' },
  { value: 'search', label: 'Search' },
  { value: 'retry', label: 'Retry' },
];

export default function LinkedInSessionsPage() {
  const searchParams = useSearchParams();
  const { scrapers } = useLinkedInScrapers();
  const { profiles } = useLinkedInProfiles({ limit: 100 });

  const [status, setStatus] = useState<LinkedInSessionStatus | ''>(
    (searchParams.get('status') as LinkedInSessionStatus) || ''
  );
  const [targetType, setTargetType] = useState<LinkedInTargetType | ''>(
    (searchParams.get('targetType') as LinkedInTargetType) || ''
  );
  const [triggerType, setTriggerType] = useState<LinkedInTriggerType | ''>(
    (searchParams.get('triggerType') as LinkedInTriggerType) || ''
  );
  const [scraperId, setScraperId] = useState(searchParams.get('scraperId') || '');
  const [profileId, setProfileId] = useState(searchParams.get('profileId') || '');
  const [selectedSession, setSelectedSession] = useState<LinkedInSession | null>(null);
  const [page, setPage] = useState(1);

  const {
    sessions,
    pagination,
    isLoading,
    refetch,
  } = useLinkedInSessions({
    status: status || undefined,
    targetType: targetType || undefined,
    triggerType: triggerType || undefined,
    scraperId: scraperId || undefined,
    profileId: profileId || undefined,
    page,
    limit: 20,
  });

  // Fetch session posts when a session is selected
  const { data: sessionPosts, isLoading: postsLoading } = useLinkedInSessionPosts(
    selectedSession?._id || ''
  );

  const clearFilters = () => {
    setStatus('');
    setTargetType('');
    setTriggerType('');
    setScraperId('');
    setProfileId('');
    setPage(1);
  };

  const hasFilters = status || targetType || triggerType || scraperId || profileId;

  const getStatusSummary = () => {
    const successCount = sessions.filter((s) => s.status === 'success').length;
    const failedCount = sessions.filter((s) => s.status === 'failed' || s.status === 'timeout').length;
    const inProgressCount = sessions.filter((s) => s.status === 'in_progress' || s.status === 'pending' || s.status === 'sent').length;
    return { successCount, failedCount, inProgressCount };
  };

  const { successCount, failedCount, inProgressCount } = getStatusSummary();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">
            Scrape Sessions
          </h1>
          <p className="text-surface-500 dark:text-surface-400">
            {pagination?.total || 0} total sessions
          </p>
        </div>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Status Summary */}
      <div className="flex items-center gap-6 p-4 bg-surface-50 dark:bg-surface-800 rounded-lg">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-success-500" />
          <span className="font-medium">{successCount}</span>
          <span className="text-sm text-surface-500">Successful</span>
        </div>
        <div className="flex items-center gap-2">
          <XCircle className="h-5 w-5 text-error-500" />
          <span className="font-medium">{failedCount}</span>
          <span className="text-sm text-surface-500">Failed</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary-500" />
          <span className="font-medium">{inProgressCount}</span>
          <span className="text-sm text-surface-500">In Progress</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-surface-800 rounded-lg border border-surface-200 dark:border-surface-700 p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Status */}
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as LinkedInSessionStatus | '');
              setPage(1);
            }}
            className="px-4 py-2 rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Target Type */}
          <select
            value={targetType}
            onChange={(e) => {
              setTargetType(e.target.value as LinkedInTargetType | '');
              setPage(1);
            }}
            className="px-4 py-2 rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {targetTypeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Trigger Type */}
          <select
            value={triggerType}
            onChange={(e) => {
              setTriggerType(e.target.value as LinkedInTriggerType | '');
              setPage(1);
            }}
            className="px-4 py-2 rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {triggerTypeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Scraper */}
          <select
            value={scraperId}
            onChange={(e) => {
              setScraperId(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Scrapers</option>
            {scrapers.map((scraper) => (
              <option key={scraper._id} value={scraper._id}>
                {scraper.name}
              </option>
            ))}
          </select>

          {/* Profile */}
          <select
            value={profileId}
            onChange={(e) => {
              setProfileId(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Profiles</option>
            {profiles.map((profile) => (
              <option key={profile._id} value={profile._id}>
                {profile.displayName}
              </option>
            ))}
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

      {/* Sessions List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} variant="rounded" height={200} />
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-surface-800 rounded-xl">
          <Activity className="h-12 w-12 mx-auto mb-4 text-surface-400" />
          <h3 className="text-lg font-medium text-surface-900 dark:text-white mb-2">
            {hasFilters ? 'No sessions match your filters' : 'No scrape sessions yet'}
          </h3>
          <p className="text-surface-500 dark:text-surface-400 mb-4 max-w-md mx-auto">
            {hasFilters
              ? 'Try adjusting your filters.'
              : 'Sessions will appear here once your scrapers start running.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map((session) => (
            <SessionCard
              key={session._id}
              session={session}
              onClick={() => setSelectedSession(session)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-surface-600 dark:text-surface-400">
            Page {page} of {pagination.pages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
            disabled={page === pagination.pages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Session Detail Modal */}
      <Modal
        isOpen={!!selectedSession}
        onClose={() => setSelectedSession(null)}
        title="Session Details"
        size="xl"
      >
        {selectedSession && (
          <div className="space-y-6">
            {/* Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-surface-500">Target</p>
                <p className="font-medium">{selectedSession.targetUrl}</p>
              </div>
              <div>
                <p className="text-sm text-surface-500">Scraper</p>
                <p className="font-medium">{selectedSession.scraperName}</p>
              </div>
              <div>
                <p className="text-sm text-surface-500">Status</p>
                <p className="font-medium capitalize">{selectedSession.status}</p>
              </div>
              <div>
                <p className="text-sm text-surface-500">Duration</p>
                <p className="font-medium">
                  {selectedSession.durationMs
                    ? `${(selectedSession.durationMs / 1000).toFixed(1)}s`
                    : 'N/A'}
                </p>
              </div>
            </div>

            {/* Timestamps */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-surface-50 dark:bg-surface-700/50 rounded-lg">
              <div>
                <p className="text-xs text-surface-500">Created</p>
                <p className="text-sm font-medium">
                  {format(new Date(selectedSession.createdAt), 'MMM d, h:mm a')}
                </p>
              </div>
              {selectedSession.startedAt && (
                <div>
                  <p className="text-xs text-surface-500">Started</p>
                  <p className="text-sm font-medium">
                    {format(new Date(selectedSession.startedAt), 'MMM d, h:mm a')}
                  </p>
                </div>
              )}
              {selectedSession.completedAt && (
                <div>
                  <p className="text-xs text-surface-500">Completed</p>
                  <p className="text-sm font-medium">
                    {format(new Date(selectedSession.completedAt), 'MMM d, h:mm a')}
                  </p>
                </div>
              )}
              <div>
                <p className="text-xs text-surface-500">Trigger</p>
                <p className="text-sm font-medium capitalize">{selectedSession.triggerType}</p>
              </div>
            </div>

            {/* Results */}
            {selectedSession.results && (
              <div>
                <h4 className="font-semibold mb-3">Results</h4>
                <div className="grid grid-cols-5 gap-4 p-4 bg-success-50 dark:bg-success-900/20 rounded-lg">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-success-700 dark:text-success-400">
                      {selectedSession.results.postsFound}
                    </p>
                    <p className="text-xs text-success-600 dark:text-success-500">Found</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-success-700 dark:text-success-400">
                      {selectedSession.results.newPosts}
                    </p>
                    <p className="text-xs text-success-600 dark:text-success-500">New</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-success-700 dark:text-success-400">
                      {selectedSession.results.updatedPosts}
                    </p>
                    <p className="text-xs text-success-600 dark:text-success-500">Updated</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-success-700 dark:text-success-400">
                      {selectedSession.results.skippedPosts}
                    </p>
                    <p className="text-xs text-success-600 dark:text-success-500">Skipped</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-success-700 dark:text-success-400">
                      {selectedSession.results.commentsCollected}
                    </p>
                    <p className="text-xs text-success-600 dark:text-success-500">Comments</p>
                  </div>
                </div>
              </div>
            )}

            {/* Error */}
            {selectedSession.error && (
              <div className="p-4 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-error-500 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-error-800 dark:text-error-300">
                      {selectedSession.error.code}
                    </p>
                    <p className="text-sm text-error-700 dark:text-error-400">
                      {selectedSession.error.message}
                    </p>
                    <p className="text-xs text-error-600 dark:text-error-500 mt-1">
                      Recoverable: {selectedSession.error.recoverable ? 'Yes' : 'No'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Posts from this session */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Posts from this Session
              </h4>
              {postsLoading ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <Skeleton key={i} variant="rounded" height={100} />
                  ))}
                </div>
              ) : sessionPosts && sessionPosts.length > 0 ? (
                <div className="space-y-4 max-h-[300px] overflow-y-auto">
                  {sessionPosts.slice(0, 5).map((post) => (
                    <PostCard key={post._id} post={post} compact />
                  ))}
                  {sessionPosts.length > 5 && (
                    <p className="text-sm text-center text-surface-500">
                      +{sessionPosts.length - 5} more posts
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-surface-500 text-center py-4">
                  No posts from this session
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end pt-4 border-t">
              <Button variant="outline" onClick={() => setSelectedSession(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
