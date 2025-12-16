'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, ChevronRight, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { staggerContainer, listItemEnter } from '@/lib/animations';
import { useReviews } from '@/hooks/useReviews';
import Link from 'next/link';
import { formatRelativeTime } from '@/lib/utils';

interface PendingReviewsWidgetProps {
  className?: string;
  limit?: number;
}

export function PendingReviewsWidget({
  className,
  limit = 5,
}: PendingReviewsWidgetProps) {
  const { reviews, pendingCount, isLoading } = useReviews();
  
  // Filter to pending reviews and limit
  const pendingReviews = reviews
    .filter((r) => r.status === 'pending' || r.status === 'in_progress')
    .slice(0, limit);

  return (
    <div
      className={cn(
        'bg-white dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700 p-4',
        className
      )}
    >
      <h3 className="font-semibold mb-3 text-sm flex items-center gap-2 text-surface-900 dark:text-white">
        <AlertCircle className="w-4 h-4 text-amber-500" />
        Pending Reviews
        {pendingCount > 0 && (
          <span className="text-xs bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full">
            {pendingCount}
          </span>
        )}
      </h3>

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="animate-pulse p-2 rounded-lg bg-surface-50 dark:bg-surface-700/50"
            >
              <div className="h-4 bg-surface-200 dark:bg-surface-600 rounded w-3/4 mb-1" />
              <div className="h-3 bg-surface-200 dark:bg-surface-600 rounded w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && pendingReviews.length === 0 && (
        <div className="text-center py-6">
          <Eye className="w-10 h-10 text-surface-300 dark:text-surface-600 mx-auto mb-2" />
          <p className="text-sm text-surface-500 dark:text-surface-400">
            No pending reviews
          </p>
        </div>
      )}

      {/* Reviews list */}
      {!isLoading && pendingReviews.length > 0 && (
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="space-y-2"
        >
          {pendingReviews.map((review) => {
            const ticket = typeof review.ticket === 'object' ? review.ticket : null;
            const submittedBy = typeof review.submittedBy === 'object' ? review.submittedBy : null;

            return (
              <motion.div key={review._id} variants={listItemEnter}>
                <Link href={`/review?reviewId=${review._id}`}>
                  <div className="w-full text-left p-2 rounded-lg hover:bg-surface-50 dark:hover:bg-surface-700/50 transition-colors flex items-center justify-between cursor-pointer group">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-surface-900 dark:text-white truncate">
                        {ticket?.title || `Review ${review.reviewNumber}`}
                      </p>
                      <p className="text-xs text-surface-500 dark:text-surface-400">
                        {submittedBy
                          ? `From ${submittedBy.firstName} ${submittedBy.lastName}`
                          : formatRelativeTime(review.submittedAt)}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-surface-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* View all link */}
      {pendingCount > limit && (
        <Link href="/review">
          <div className="mt-3 text-center">
            <span className="text-xs text-primary-600 dark:text-primary-400 hover:underline">
              View all {pendingCount} pending reviews →
            </span>
          </div>
        </Link>
      )}
    </div>
  );
}

export default PendingReviewsWidget;


