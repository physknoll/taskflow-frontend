'use client';

import { LinkedInPost, LinkedInActionStatus } from '@/types';
import { linkedinService } from '@/services/linkedin.service';
import { useAuthStore } from '@/stores/authStore';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import {
  ThumbsUp,
  MessageCircle,
  Repeat2,
  Eye,
  ExternalLink,
  TrendingUp,
  MoreVertical,
  Check,
  X,
  Clock,
  Image as ImageIcon,
  Video,
  FileText,
  BarChart2,
  Camera,
  Expand,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';

interface PostCardProps {
  post: LinkedInPost;
  onAction?: (status: LinkedInActionStatus) => void;
  onViewDetails?: () => void;
  onViewScreenshot?: () => void;
  compact?: boolean;
}

const actionStatusConfig: Record<
  LinkedInActionStatus,
  { label: string; variant: 'secondary' | 'primary' | 'success' | 'warning' }
> = {
  new: { label: 'New', variant: 'primary' },
  reviewed: { label: 'Reviewed', variant: 'secondary' },
  actioned: { label: 'Actioned', variant: 'success' },
  skipped: { label: 'Skipped', variant: 'warning' },
};

const mediaTypeIcons = {
  image: ImageIcon,
  video: Video,
  document: FileText,
  poll: BarChart2,
  carousel: ImageIcon,
  none: null,
};

export function PostCard({ post, onAction, onViewDetails, onViewScreenshot, compact = false }: PostCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [screenshotError, setScreenshotError] = useState(false);
  const { token } = useAuthStore();

  const MediaIcon = post.mediaType ? mediaTypeIcons[post.mediaType] : null;
  const hasScreenshot = !!post.screenshotPath && !screenshotError;
  const screenshotUrl = post.screenshotPath ? linkedinService.getScreenshotUrl(post._id, token || undefined) : null;

  const getProfileInfo = () => {
    if (typeof post.profileId === 'string') {
      return { displayName: post.author.name, profileType: null };
    }
    return {
      displayName: post.profileId.displayName,
      profileType: post.profileId.profileType,
    };
  };

  const { profileType } = getProfileInfo();

  return (
    <Card hover className={cn('h-full', compact && 'shadow-sm')}>
      <CardContent className={cn('p-5', compact && 'p-4')}>
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <Avatar
            firstName={post.author.name}
            lastName=""
            src={post.author.avatarUrl}
            size={compact ? 'sm' : 'md'}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-surface-900 dark:text-white truncate">
                {post.author.name}
              </h4>
              {post.isTrending && (
                <Badge variant="warning" size="sm" className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Trending
                </Badge>
              )}
            </div>
            {post.author.headline && (
              <p className="text-xs text-surface-500 dark:text-surface-400 truncate">
                {post.author.headline}
              </p>
            )}
            <p className="text-xs text-surface-400 dark:text-surface-500">
              {post.linkedinTimestamp} • {post.activityType}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant={actionStatusConfig[post.actionStatus].variant}
              size="sm"
            >
              {actionStatusConfig[post.actionStatus].label}
            </Badge>
            {onAction && (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
                >
                  <MoreVertical className="h-4 w-4 text-surface-500" />
                </button>
                {showMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowMenu(false)}
                    />
                    <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-surface-800 rounded-lg shadow-lg border border-surface-200 dark:border-surface-700 z-20 py-1">
                      <button
                        onClick={() => {
                          onAction('reviewed');
                          setShowMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-surface-100 dark:hover:bg-surface-700 flex items-center gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        Mark Reviewed
                      </button>
                      <button
                        onClick={() => {
                          onAction('actioned');
                          setShowMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-surface-100 dark:hover:bg-surface-700 flex items-center gap-2"
                      >
                        <Check className="h-4 w-4" />
                        Mark Actioned
                      </button>
                      <button
                        onClick={() => {
                          onAction('skipped');
                          setShowMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-surface-100 dark:hover:bg-surface-700 flex items-center gap-2"
                      >
                        <X className="h-4 w-4" />
                        Skip
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="mb-4">
          <p
            className={cn(
              'text-surface-700 dark:text-surface-300',
              compact ? 'line-clamp-2 text-sm' : 'line-clamp-4'
            )}
          >
            {post.contentPreview || post.content}
          </p>
          {MediaIcon && (
            <div className="mt-2 flex items-center gap-1 text-xs text-surface-500">
              <MediaIcon className="h-3 w-3" />
              <span className="capitalize">{post.mediaType}</span>
            </div>
          )}
        </div>

        {/* Screenshot Thumbnail */}
        {hasScreenshot && screenshotUrl && !compact && (
          <div className="mb-4">
            <button
              onClick={onViewScreenshot}
              className="relative w-full group rounded-lg overflow-hidden border border-surface-200 dark:border-surface-700 hover:border-primary-400 dark:hover:border-primary-500 transition-colors"
            >
              <img
                src={screenshotUrl}
                alt="Post screenshot"
                className="w-full h-40 object-cover object-top"
                onError={() => setScreenshotError(true)}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 dark:bg-surface-800/90 rounded-full p-2">
                  <Expand className="h-5 w-5 text-surface-700 dark:text-surface-300" />
                </div>
              </div>
              <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/60 text-white text-xs px-2 py-1 rounded">
                <Camera className="h-3 w-3" />
                Screenshot
              </div>
            </button>
          </div>
        )}

        {/* Screenshot indicator for compact mode */}
        {hasScreenshot && compact && (
          <div className="mb-3 flex items-center gap-1 text-xs text-surface-500">
            <Camera className="h-3 w-3" />
            <span>Has screenshot</span>
          </div>
        )}

        {/* Engagement Stats */}
        <div className="flex items-center gap-4 py-3 border-t border-surface-200 dark:border-surface-700">
          <div className="flex items-center gap-1 text-sm text-surface-600 dark:text-surface-400">
            <ThumbsUp className="h-4 w-4" />
            <span>{post.engagement.reactions.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-surface-600 dark:text-surface-400">
            <MessageCircle className="h-4 w-4" />
            <span>{post.engagement.comments.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-surface-600 dark:text-surface-400">
            <Repeat2 className="h-4 w-4" />
            <span>{post.engagement.reposts.toLocaleString()}</span>
          </div>
          {post.engagementVelocity !== undefined && post.engagementVelocity > 0 && (
            <div className="flex items-center gap-1 text-sm text-warning-600 dark:text-warning-400">
              <TrendingUp className="h-4 w-4" />
              <span>{post.engagementVelocity.toFixed(1)}/hr</span>
            </div>
          )}
        </div>

        {/* Top Comments Preview */}
        {!compact && post.topComments && post.topComments.length > 0 && (
          <div className="pt-3 border-t border-surface-200 dark:border-surface-700">
            <p className="text-xs font-medium text-surface-500 dark:text-surface-400 mb-2">
              Top Comments ({post.commentsCollected})
            </p>
            <div className="space-y-2">
              {post.topComments.slice(0, 2).map((comment, idx) => (
                <div key={idx} className="text-sm bg-surface-50 dark:bg-surface-700/50 p-2 rounded">
                  <p className="font-medium text-surface-700 dark:text-surface-300">
                    {comment.authorName}
                  </p>
                  <p className="text-surface-600 dark:text-surface-400 line-clamp-1">
                    {comment.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-surface-200 dark:border-surface-700">
          <p className="text-xs text-surface-500">
            First seen {formatDistanceToNow(new Date(post.firstSeenAt), { addSuffix: true })}
          </p>
          <div className="flex items-center gap-2">
            {onViewDetails && (
              <Button size="sm" variant="ghost" onClick={onViewDetails}>
                View Details
              </Button>
            )}
            <a
              href={post.postUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
            >
              <ExternalLink className="h-3 w-3" />
              LinkedIn
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
