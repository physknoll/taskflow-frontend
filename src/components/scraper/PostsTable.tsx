'use client';

import { LinkedInPost, LinkedInActionStatus } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SiteIcon } from './SiteIcon';
import {
  ExternalLink,
  ThumbsUp,
  MessageCircle,
  Repeat2,
  Camera,
  TrendingUp,
  Eye,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface PostsTableProps {
  posts: LinkedInPost[];
  onAction?: (postId: string, status: LinkedInActionStatus) => void;
  onViewDetails?: (post: LinkedInPost) => void;
  onViewScreenshot?: (post: LinkedInPost) => void;
}

const statusVariants: Record<LinkedInActionStatus, 'default' | 'success' | 'warning' | 'secondary'> = {
  new: 'warning',
  reviewed: 'secondary',
  actioned: 'success',
  skipped: 'default',
};

export function PostsTable({ posts, onAction, onViewDetails, onViewScreenshot }: PostsTableProps) {
  return (
    <div className="bg-white dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">
                Author
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">
                Content
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">
                Type
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">
                Engagement
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">
                Status
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">
                Age
              </th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-200 dark:divide-surface-700">
            {posts.map((post) => (
              <tr
                key={post._id}
                className="hover:bg-surface-50 dark:hover:bg-surface-800/80 transition-colors"
              >
                {/* Author */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <SiteIcon url={post.url || post.postUrl || ''} size="sm" />
                    <div className="min-w-0">
                      <p className="font-medium text-surface-900 dark:text-white truncate max-w-[150px]">
                        {post.author.name}
                      </p>
                      {post.author.headline && (
                        <p className="text-xs text-surface-500 truncate max-w-[150px]">
                          {post.author.headline}
                        </p>
                      )}
                    </div>
                  </div>
                </td>

                {/* Content */}
                <td className="px-4 py-3">
                  <p className="text-sm text-surface-700 dark:text-surface-300 line-clamp-2 max-w-[300px]">
                    {typeof post.content === 'object' 
                      ? ((post.content as any).preview || (post.content as any).body || '(No content)')
                      : (post.content || '(No content)')}
                  </p>
                </td>

                {/* Type */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" size="sm">
                      {post.activityType}
                    </Badge>
                    {post.isTrending && (
                      <TrendingUp className="h-4 w-4 text-warning-500" />
                    )}
                  </div>
                </td>

                {/* Engagement */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3 text-xs text-surface-500">
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="h-3 w-3" />
                      {((post.engagement as any).likes ?? (post.engagement as any).reactions ?? 0).toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="h-3 w-3" />
                      {(post.engagement.comments ?? 0).toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Repeat2 className="h-3 w-3" />
                      {((post.engagement as any).shares ?? (post.engagement as any).reposts ?? 0).toLocaleString()}
                    </span>
                  </div>
                </td>

                {/* Status */}
                <td className="px-4 py-3">
                  <Badge variant={statusVariants[(post.status || post.actionStatus) as LinkedInActionStatus] || 'secondary'} size="sm">
                    {post.status || post.actionStatus}
                  </Badge>
                </td>

                {/* Age */}
                <td className="px-4 py-3">
                  <span className="text-sm text-surface-500">
                    {(post.firstSeenAt || post.createdAt) 
                      ? formatDistanceToNow(new Date(post.firstSeenAt || post.createdAt), { addSuffix: true })
                      : 'Unknown'}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    {post.screenshotPath && onViewScreenshot && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewScreenshot(post)}
                        title="View Screenshot"
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                    )}
                    {onViewDetails && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewDetails(post)}
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    <a
                      href={post.url || post.postUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg text-surface-500 hover:text-primary-600 hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
                      title="View Original"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                    {onAction && post.actionStatus !== 'actioned' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onAction(post._id, 'actioned')}
                      >
                        Mark Done
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
