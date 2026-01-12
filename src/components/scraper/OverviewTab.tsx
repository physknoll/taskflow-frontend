'use client';

import { useState } from 'react';
import {
  useLinkedInStats,
  useLinkedInTrendingPosts,
  useLinkedInActionablePosts,
  useLinkedInSessions,
  useLinkedInPosts,
} from '@/hooks/useLinkedIn';
import { linkedinService } from '@/services/linkedin.service';
import { useAuthStore } from '@/stores/authStore';
import { PostCard, SessionCard } from '@/components/linkedin';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Modal } from '@/components/ui/Modal';
import { LinkedInPost, LinkedInActionStatus } from '@/types';
import {
  TrendingUp,
  Activity,
  ArrowRight,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
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

interface OverviewTabProps {
  onNavigate: (tab: string) => void;
}

export function OverviewTab({ onNavigate }: OverviewTabProps) {
  const { token } = useAuthStore();
  const { data: stats, isLoading: statsLoading } = useLinkedInStats();
  const { data: trendingPosts, isLoading: trendingLoading } = useLinkedInTrendingPosts(5);
  const { data: actionablePosts, isLoading: actionableLoading } = useLinkedInActionablePosts(5);
  const { sessions, isLoading: sessionsLoading } = useLinkedInSessions({ limit: 5 });
  const { updateAction } = useLinkedInPosts({});

  const [selectedPost, setSelectedPost] = useState<LinkedInPost | null>(null);
  const [screenshotPost, setScreenshotPost] = useState<LinkedInPost | null>(null);
  const [screenshotZoom, setScreenshotZoom] = useState(false);

  const handleAction = async (postId: string, status: LinkedInActionStatus) => {
    await updateAction(postId, status);
  };

  return (
    <div className="space-y-6">
      {/* Session Success Rate */}
      {stats && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-surface-900 dark:text-white">
                Scraping Activity (Last 24h)
              </h2>
              <Button variant="ghost" size="sm" onClick={() => onNavigate('sessions')}>
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Activity className="h-5 w-5 text-primary-500" />
                </div>
                <p className="text-3xl font-bold text-surface-900 dark:text-white">
                  {stats.sessions.last24Hours}
                </p>
                <p className="text-sm text-surface-500">Total Sessions</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-success-500" />
                </div>
                <p className="text-3xl font-bold text-success-600 dark:text-success-400">
                  {stats.sessions.successful}
                </p>
                <p className="text-sm text-surface-500">Successful</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <XCircle className="h-5 w-5 text-error-500" />
                </div>
                <p className="text-3xl font-bold text-error-600 dark:text-error-400">
                  {stats.sessions.failed}
                </p>
                <p className="text-sm text-surface-500">Failed</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-primary-500" />
                </div>
                <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                  {stats.sessions.successRate}%
                </p>
                <p className="text-sm text-surface-500">Success Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trending Posts */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-surface-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-warning-500" />
                Trending Posts
              </h2>
              <Button variant="ghost" size="sm" onClick={() => onNavigate('posts')}>
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            {trendingLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} variant="rounded" height={100} />
                ))}
              </div>
            ) : trendingPosts && trendingPosts.length > 0 ? (
              <div className="space-y-4">
                {trendingPosts.slice(0, 3).map((post) => (
                  <PostCard
                    key={post._id}
                    post={post}
                    compact
                    onViewDetails={() => setSelectedPost(post)}
                    onViewScreenshot={() => setScreenshotPost(post)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-surface-500 dark:text-surface-400">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No trending posts right now</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actionable Posts */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-surface-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-primary-500" />
                Needs Action
              </h2>
              <Button variant="ghost" size="sm" onClick={() => onNavigate('posts')}>
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            {actionableLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} variant="rounded" height={100} />
                ))}
              </div>
            ) : actionablePosts && actionablePosts.length > 0 ? (
              <div className="space-y-4">
                {actionablePosts.slice(0, 3).map((post) => (
                  <PostCard
                    key={post._id}
                    post={post}
                    compact
                    onViewDetails={() => setSelectedPost(post)}
                    onViewScreenshot={() => setScreenshotPost(post)}
                    onAction={(status) => handleAction(post._id, status)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-surface-500 dark:text-surface-400">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>All caught up!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Sessions */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-surface-900 dark:text-white">
              Recent Scrape Sessions
            </h2>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('sessions')}>
              View All <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          {sessionsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} variant="rounded" height={80} />
              ))}
            </div>
          ) : sessions && sessions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sessions.slice(0, 6).map((session) => (
                <SessionCard key={session._id} session={session} compact />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-surface-500 dark:text-surface-400">
              <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No scrape sessions yet</p>
            </div>
          )}
        </CardContent>
      </Card>

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
                  {selectedPost.linkedinTimestamp} • {selectedPost.itemType || selectedPost.activityType}
                </p>
              </div>
              <a
                href={selectedPost.itemUrl || selectedPost.url || selectedPost.postUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-primary-600 hover:text-primary-700"
              >
                <ExternalLink className="h-4 w-4" />
                View Original
              </a>
            </div>

            {/* Content */}
            <div className="p-4 bg-surface-50 dark:bg-surface-700/50 rounded-lg">
              <p className="whitespace-pre-wrap text-surface-700 dark:text-surface-300">
                {typeof selectedPost.content === 'object' 
                  ? (selectedPost.content as any).body || (selectedPost.content as any).preview || ''
                  : selectedPost.content}
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
                  <a
                    href={linkedinService.getScreenshotUrl(selectedPost._id, token || undefined)}
                    download={`post-${selectedPost._id}.png`}
                    className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </a>
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
                <span className="font-semibold">{((selectedPost.engagement as any).likes || (selectedPost.engagement as any).reactions || 0).toLocaleString()}</span>
                <span className="text-sm text-surface-500">likes</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-primary-500" />
                <span className="font-semibold">{(selectedPost.engagement.comments || 0).toLocaleString()}</span>
                <span className="text-sm text-surface-500">comments</span>
              </div>
              <div className="flex items-center gap-2">
                <Repeat2 className="h-5 w-5 text-primary-500" />
                <span className="font-semibold">{((selectedPost.engagement as any).shares || (selectedPost.engagement as any).reposts || 0).toLocaleString()}</span>
                <span className="text-sm text-surface-500">shares</span>
              </div>
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-surface-500">First Seen</p>
                <p className="font-medium">
                  {selectedPost.firstSeenAt || selectedPost.createdAt ? format(new Date(selectedPost.firstSeenAt || selectedPost.createdAt), 'MMM d, yyyy h:mm a') : 'Unknown'}
                </p>
              </div>
              <div>
                <p className="text-surface-500">Last Scraped</p>
                <p className="font-medium">
                  {selectedPost.lastScrapedAt ? formatDistanceToNow(new Date(selectedPost.lastScrapedAt), { addSuffix: true }) : 'Unknown'}
                </p>
              </div>
              <div>
                <p className="text-surface-500">Status</p>
                <p className="font-medium capitalize">{selectedPost.status || selectedPost.actionStatus}</p>
              </div>
              <div>
                <p className="text-surface-500">Engagement Velocity</p>
                <p className="font-medium">
                  {selectedPost.engagementVelocity?.toFixed(1) || '0'} / hr
                </p>
              </div>
            </div>

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
                  download={`post-${screenshotPost._id}.png`}
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
                  href={screenshotPost.itemUrl || screenshotPost.url || screenshotPost.postUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
                >
                  <ExternalLink className="h-4 w-4" />
                  View Original
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
          </div>
        )}
      </Modal>
    </div>
  );
}
