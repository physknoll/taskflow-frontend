'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLinkedInPosts, useLinkedInProfiles } from '@/hooks/useLinkedIn';
import { useClients } from '@/hooks/useClients';
import { linkedinService } from '@/services/linkedin.service';
import { useAuthStore } from '@/stores/authStore';
import { PostCard } from '@/components/linkedin';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Modal } from '@/components/ui/Modal';
import { LinkedInPost, LinkedInActionStatus, LinkedInActivityType } from '@/types';
import {
  Search,
  FileText,
  RefreshCw,
  Filter,
  X,
  TrendingUp,
  ExternalLink,
  ThumbsUp,
  MessageCircle,
  Repeat2,
  Camera,
  Download,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

const actionStatusOptions: { value: LinkedInActionStatus | ''; label: string }[] = [
  { value: '', label: 'All Status' },
  { value: 'new', label: 'New' },
  { value: 'reviewed', label: 'Reviewed' },
  { value: 'actioned', label: 'Actioned' },
  { value: 'skipped', label: 'Skipped' },
];

const activityTypeOptions: { value: LinkedInActivityType | ''; label: string }[] = [
  { value: '', label: 'All Types' },
  { value: 'post', label: 'Post' },
  { value: 'repost', label: 'Repost' },
  { value: 'article', label: 'Article' },
  { value: 'comment', label: 'Comment' },
  { value: 'shared', label: 'Shared' },
];

export default function LinkedInPostsPage() {
  const searchParams = useSearchParams();
  const { token } = useAuthStore();
  const { clients } = useClients();
  const { profiles } = useLinkedInProfiles({ limit: 100 });

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [actionStatus, setActionStatus] = useState<LinkedInActionStatus | ''>(
    (searchParams.get('actionStatus') as LinkedInActionStatus) || ''
  );
  const [activityType, setActivityType] = useState<LinkedInActivityType | ''>(
    (searchParams.get('activityType') as LinkedInActivityType) || ''
  );
  const [profileId, setProfileId] = useState(searchParams.get('profileId') || '');
  const [clientId, setClientId] = useState(searchParams.get('clientId') || '');
  const [isTrending, setIsTrending] = useState(searchParams.get('isTrending') === 'true');
  const [selectedPost, setSelectedPost] = useState<LinkedInPost | null>(null);
  const [screenshotPost, setScreenshotPost] = useState<LinkedInPost | null>(null);
  const [screenshotZoom, setScreenshotZoom] = useState(false);
  const [page, setPage] = useState(1);

  const {
    posts,
    pagination,
    isLoading,
    refetch,
    updateAction,
    isUpdatingAction,
  } = useLinkedInPosts({
    search: search || undefined,
    actionStatus: actionStatus || undefined,
    activityType: activityType || undefined,
    profileId: profileId || undefined,
    clientId: clientId || undefined,
    isTrending: isTrending || undefined,
    page,
    limit: 20,
  });

  const handleAction = async (postId: string, status: LinkedInActionStatus) => {
    await updateAction(postId, status);
  };

  const clearFilters = () => {
    setSearch('');
    setActionStatus('');
    setActivityType('');
    setProfileId('');
    setClientId('');
    setIsTrending(false);
    setPage(1);
  };

  const hasFilters =
    search || actionStatus || activityType || profileId || clientId || isTrending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">
            LinkedIn Posts
          </h1>
          <p className="text-surface-500 dark:text-surface-400">
            {pagination?.total || 0} posts collected
          </p>
        </div>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-surface-800 rounded-lg border border-surface-200 dark:border-surface-700 p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
            <input
              type="text"
              placeholder="Search posts..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Action Status */}
          <select
            value={actionStatus}
            onChange={(e) => {
              setActionStatus(e.target.value as LinkedInActionStatus | '');
              setPage(1);
            }}
            className="px-4 py-2 rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {actionStatusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Activity Type */}
          <select
            value={activityType}
            onChange={(e) => {
              setActivityType(e.target.value as LinkedInActivityType | '');
              setPage(1);
            }}
            className="px-4 py-2 rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {activityTypeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
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

          {/* Trending Toggle */}
          <label className="flex items-center gap-2 px-3 py-2 rounded-lg border border-surface-300 dark:border-surface-600 cursor-pointer hover:bg-surface-50 dark:hover:bg-surface-700">
            <input
              type="checkbox"
              checked={isTrending}
              onChange={(e) => {
                setIsTrending(e.target.checked);
                setPage(1);
              }}
              className="w-4 h-4 rounded"
            />
            <TrendingUp className="h-4 w-4 text-warning-500" />
            <span className="text-sm">Trending</span>
          </label>

          {/* Clear Filters */}
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Posts Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} variant="rounded" height={300} />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-surface-800 rounded-xl">
          <FileText className="h-12 w-12 mx-auto mb-4 text-surface-400" />
          <h3 className="text-lg font-medium text-surface-900 dark:text-white mb-2">
            {hasFilters ? 'No posts match your filters' : 'No posts collected yet'}
          </h3>
          <p className="text-surface-500 dark:text-surface-400 mb-4 max-w-md mx-auto">
            {hasFilters
              ? 'Try adjusting your search or filters.'
              : 'Posts will appear here once your scrapers start collecting data from monitored profiles.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onAction={(status) => handleAction(post._id, status)}
              onViewDetails={() => setSelectedPost(post)}
              onViewScreenshot={() => setScreenshotPost(post)}
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

      {/* Post Detail Modal */}
      <Modal
        isOpen={!!selectedPost}
        onClose={() => setSelectedPost(null)}
        title="Post Details"
        size="lg"
      >
        {selectedPost && (
          <div className="space-y-6">
            {/* Author */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-surface-200 dark:bg-surface-700 flex items-center justify-center">
                <span className="text-lg font-semibold">
                  {selectedPost.author.name.charAt(0)}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-surface-900 dark:text-white">
                  {selectedPost.author.name}
                </h3>
                {selectedPost.author.headline && (
                  <p className="text-sm text-surface-500">{selectedPost.author.headline}</p>
                )}
                <p className="text-xs text-surface-400 mt-1">
                  {selectedPost.linkedinTimestamp} • {selectedPost.activityType}
                </p>
              </div>
              <a
                href={selectedPost.postUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-primary-600 hover:text-primary-700"
              >
                <ExternalLink className="h-4 w-4" />
                View on LinkedIn
              </a>
            </div>

            {/* Content */}
            <div className="p-4 bg-surface-50 dark:bg-surface-700/50 rounded-lg">
              <p className="whitespace-pre-wrap text-surface-700 dark:text-surface-300">
                {selectedPost.content}
              </p>
            </div>

            {/* Screenshot */}
            {selectedPost.screenshotPath && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Camera className="h-4 w-4" />
                    Screenshot
                  </h4>
                  <div className="flex items-center gap-2">
                    <a
                      href={linkedinService.getScreenshotUrl(selectedPost._id, token || undefined)}
                      download={`linkedin-post-${selectedPost._id}.png`}
                      className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </a>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setScreenshotPost(selectedPost);
                    setSelectedPost(null);
                  }}
                  className="relative w-full group rounded-lg overflow-hidden border border-surface-200 dark:border-surface-700 hover:border-primary-400 transition-colors"
                >
                  <img
                    src={linkedinService.getScreenshotUrl(selectedPost._id, token || undefined)}
                    alt="Post screenshot"
                    className="w-full max-h-80 object-contain bg-surface-100 dark:bg-surface-800"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 dark:bg-surface-800/90 rounded-full p-2">
                      <ZoomIn className="h-5 w-5 text-surface-700 dark:text-surface-300" />
                    </div>
                  </div>
                </button>
              </div>
            )}

            {/* Engagement */}
            <div className="flex items-center gap-6 py-4 border-t border-b border-surface-200 dark:border-surface-700">
              <div className="flex items-center gap-2">
                <ThumbsUp className="h-5 w-5 text-primary-500" />
                <span className="font-semibold">{selectedPost.engagement.reactions.toLocaleString()}</span>
                <span className="text-sm text-surface-500">reactions</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-primary-500" />
                <span className="font-semibold">{selectedPost.engagement.comments.toLocaleString()}</span>
                <span className="text-sm text-surface-500">comments</span>
              </div>
              <div className="flex items-center gap-2">
                <Repeat2 className="h-5 w-5 text-primary-500" />
                <span className="font-semibold">{selectedPost.engagement.reposts.toLocaleString()}</span>
                <span className="text-sm text-surface-500">reposts</span>
              </div>
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-surface-500">First Seen</p>
                <p className="font-medium">
                  {format(new Date(selectedPost.firstSeenAt), 'MMM d, yyyy h:mm a')}
                </p>
              </div>
              <div>
                <p className="text-surface-500">Last Scraped</p>
                <p className="font-medium">
                  {formatDistanceToNow(new Date(selectedPost.lastScrapedAt), { addSuffix: true })}
                </p>
              </div>
              <div>
                <p className="text-surface-500">Status</p>
                <p className="font-medium capitalize">{selectedPost.actionStatus}</p>
              </div>
              <div>
                <p className="text-surface-500">Engagement Velocity</p>
                <p className="font-medium">
                  {selectedPost.engagementVelocity?.toFixed(1) || '0'} / hr
                </p>
              </div>
            </div>

            {/* Top Comments */}
            {selectedPost.topComments && selectedPost.topComments.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3">Top Comments</h4>
                <div className="space-y-3">
                  {selectedPost.topComments.map((comment, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-surface-50 dark:bg-surface-700/50 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-sm">{comment.authorName}</p>
                        <span className="text-xs text-surface-500">
                          {comment.reactions} reactions
                        </span>
                      </div>
                      <p className="text-sm text-surface-600 dark:text-surface-400">
                        {comment.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setSelectedPost(null)}>
                Close
              </Button>
              <Button
                onClick={() => {
                  handleAction(selectedPost._id, 'actioned');
                  setSelectedPost(null);
                }}
                disabled={selectedPost.actionStatus === 'actioned'}
              >
                Mark as Actioned
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Screenshot Viewer Modal */}
      <Modal
        isOpen={!!screenshotPost}
        onClose={() => {
          setScreenshotPost(null);
          setScreenshotZoom(false);
        }}
        title={`Screenshot: ${screenshotPost?.author.name || 'Post'}`}
        size="xl"
      >
        {screenshotPost && screenshotPost.screenshotPath && (
          <div className="space-y-4">
            {/* Image Container */}
            <div
              className={`relative bg-surface-100 dark:bg-surface-800 rounded-lg overflow-auto ${
                screenshotZoom ? 'max-h-[70vh]' : 'max-h-[60vh]'
              }`}
            >
              <img
                src={linkedinService.getScreenshotUrl(screenshotPost._id, token || undefined)}
                alt="Post screenshot"
                className={`${
                  screenshotZoom ? 'w-auto max-w-none' : 'w-full object-contain'
                }`}
                style={screenshotZoom ? { minWidth: '100%' } : undefined}
              />
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setScreenshotZoom(!screenshotZoom)}
                >
                  {screenshotZoom ? (
                    <>
                      <ZoomOut className="h-4 w-4 mr-1" />
                      Fit to View
                    </>
                  ) : (
                    <>
                      <ZoomIn className="h-4 w-4 mr-1" />
                      Full Size
                    </>
                  )}
                </Button>
                <a
                  href={linkedinService.getScreenshotUrl(screenshotPost._id, token || undefined)}
                  download={`linkedin-post-${screenshotPost._id}.png`}
                  className="inline-flex"
                >
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                </a>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href={screenshotPost.postUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
                >
                  <ExternalLink className="h-4 w-4" />
                  View on LinkedIn
                </a>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedPost(screenshotPost);
                    setScreenshotPost(null);
                    setScreenshotZoom(false);
                  }}
                >
                  View Post Details
                </Button>
              </div>
            </div>

            {/* Post Info Summary */}
            <div className="p-3 bg-surface-50 dark:bg-surface-700/50 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-surface-200 dark:bg-surface-700 flex items-center justify-center text-sm font-semibold">
                  {screenshotPost.author.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium">{screenshotPost.author.name}</p>
                  <p className="text-xs text-surface-500">
                    {screenshotPost.linkedinTimestamp} • {screenshotPost.activityType}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-surface-600 dark:text-surface-400">
                <span className="flex items-center gap-1">
                  <ThumbsUp className="h-4 w-4" />
                  {screenshotPost.engagement.reactions.toLocaleString()}
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4" />
                  {screenshotPost.engagement.comments.toLocaleString()}
                </span>
                <span className="flex items-center gap-1">
                  <Repeat2 className="h-4 w-4" />
                  {screenshotPost.engagement.reposts.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
