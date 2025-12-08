'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useReviews } from '@/hooks/useReviews';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Skeleton } from '@/components/ui/Skeleton';
import { Modal } from '@/components/ui/Modal';
import { Progress } from '@/components/ui/Progress';
import { Textarea } from '@/components/ui/Input';
import { REVIEW_CRITERIA_TEMPLATES } from '@/lib/constants';
import { formatRelativeTime, getStatusColor } from '@/lib/utils';
import {
  CheckCircle,
  XCircle,
  RotateCcw,
  Star,
  Clock,
  FileText,
  ChevronRight,
  Eye,
  AlertCircle,
} from 'lucide-react';
import { IReview, IReviewCriteria, ITicketInReview, ITicket } from '@/types';

export default function ReviewPage() {
  const { ticketsInReview, ticketsInReviewCount, reviews, isLoading, completeReview, isSubmitting } = useReviews();
  const [selectedItem, setSelectedItem] = useState<ITicketInReview | null>(null);
  const [criteria, setCriteria] = useState<IReviewCriteria[]>([]);
  const [feedback, setFeedback] = useState('');
  const [privateNotes, setPrivateNotes] = useState('');

  const handleStartReview = (item: ITicketInReview) => {
    // Initialize criteria based on ticket type
    const ticketType = item.ticket.type || 'default';
    const template = REVIEW_CRITERIA_TEMPLATES[ticketType as keyof typeof REVIEW_CRITERIA_TEMPLATES] || REVIEW_CRITERIA_TEMPLATES.default;
    
    setCriteria(template.map(c => ({
      name: c.name,
      score: 0,
      weight: c.weight,
      feedback: '',
    })));
    setFeedback('');
    setPrivateNotes('');
    setSelectedItem(item);
  };

  const handleScoreChange = (index: number, score: number) => {
    const updated = [...criteria];
    updated[index] = { ...updated[index], score };
    setCriteria(updated);
  };

  const calculateOverallScore = () => {
    const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);
    const weightedSum = criteria.reduce((sum, c) => sum + (c.score * c.weight), 0);
    return totalWeight > 0 ? (weightedSum / totalWeight).toFixed(1) : '0';
  };

  const handleSubmitReview = async (status: 'approved' | 'rejected' | 'needs_revision') => {
    if (!selectedItem || !selectedItem.review) return;

    await completeReview(selectedItem.review._id, {
      status,
      criteria,
      feedback,
      privateNotes,
    });
    setSelectedItem(null);
  };

  const allScored = criteria.every(c => c.score > 0);
  
  // Count tickets with and without review records
  const ticketsWithReview = ticketsInReview.filter(t => t.hasReviewRecord);
  const ticketsWithoutReview = ticketsInReview.filter(t => !t.hasReviewRecord);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Review Queue"
        description={`${ticketsInReviewCount} tickets in review`}
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300">
              <Eye className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-surface-900 dark:text-white">
                {ticketsInReviewCount}
              </p>
              <p className="text-sm text-surface-500 dark:text-surface-400">In Review</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-surface-900 dark:text-white">
                {ticketsWithReview.length}
              </p>
              <p className="text-sm text-surface-500 dark:text-surface-400">Ready to Review</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-surface-100 text-surface-600 dark:bg-surface-700 dark:text-surface-300">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-surface-900 dark:text-white">
                {ticketsWithoutReview.length}
              </p>
              <p className="text-sm text-surface-500 dark:text-surface-400">Awaiting Submission</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-surface-900 dark:text-white">
                {reviews.filter(r => r.status === 'approved').length}
              </p>
              <p className="text-sm text-surface-500 dark:text-surface-400">Approved</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tickets In Review */}
      <div>
        <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">
          Tickets In Review
        </h2>
        
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Skeleton variant="circular" width={40} height={40} />
                    <div className="flex-1">
                      <Skeleton variant="text" width="40%" />
                      <Skeleton variant="text" width="60%" className="mt-2" />
                    </div>
                    <Skeleton variant="rounded" width={100} height={36} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : ticketsInReview.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-emerald-500" />
              <h3 className="text-lg font-medium text-surface-900 dark:text-white mb-2">
                All caught up!
              </h3>
              <p className="text-surface-500 dark:text-surface-400">
                No tickets in review at the moment.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {ticketsInReview.map((item) => {
              const { ticket, review, hasReviewRecord } = item;
              const client = typeof ticket.client === 'object' ? ticket.client : null;
              const assignees = Array.isArray(ticket.assignedTo) 
                ? ticket.assignedTo.filter((a): a is import('@/types').IUser => typeof a === 'object')
                : [];
              const firstAssignee = assignees[0];

              return (
                <Card key={ticket._id} hover>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <Avatar
                        firstName={firstAssignee?.firstName}
                        lastName={firstAssignee?.lastName}
                        src={firstAssignee?.avatar}
                        size="md"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-surface-500 dark:text-surface-400">
                            {ticket.ticketNumber}
                          </span>
                          {hasReviewRecord && review ? (
                            <Badge className={getStatusColor(review.status)} size="sm">
                              {review.status.replace('_', ' ')}
                            </Badge>
                          ) : (
                            <Badge variant="secondary" size="sm">
                              Awaiting Submission
                            </Badge>
                          )}
                        </div>
                        <h4 className="font-medium text-surface-900 dark:text-white truncate mt-1">
                          {ticket.title}
                        </h4>
                        <p className="text-sm text-surface-500 dark:text-surface-400">
                          {client?.name || 'Unknown Client'}
                          {firstAssignee && ` • Assigned to ${firstAssignee.firstName} ${firstAssignee.lastName}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {hasReviewRecord && review ? (
                          <>
                            <Badge variant="secondary" size="sm">
                              {(review.submittedResources?.length || review.submittedAssets?.length || 0)} resources
                            </Badge>
                            <Button onClick={() => handleStartReview(item)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Review
                            </Button>
                          </>
                        ) : (
                          <Link href={`/tickets/${ticket._id}`}>
                            <Button variant="outline">
                              <FileText className="h-4 w-4 mr-2" />
                              View Ticket
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Review Modal */}
      <Modal
        isOpen={!!selectedItem && !!selectedItem.review}
        onClose={() => setSelectedItem(null)}
        title={`Review: ${selectedItem?.review?.reviewNumber || selectedItem?.ticket.ticketNumber}`}
        size="xl"
      >
        {selectedItem && selectedItem.review && (
          <div className="space-y-6">
            {/* Overall Score */}
            <div className="bg-primary-50 dark:bg-primary-900/30 rounded-xl p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Star className="h-8 w-8 text-amber-400 fill-amber-400" />
                <span className="text-4xl font-bold text-primary-700 dark:text-primary-300">
                  {calculateOverallScore()}
                </span>
                <span className="text-xl text-surface-500 dark:text-surface-400">/5</span>
              </div>
              <p className="text-sm text-surface-600 dark:text-surface-400">Overall Score</p>
            </div>

            {/* Criteria Rating */}
            <div className="space-y-4">
              <h4 className="font-medium text-surface-900 dark:text-white">Rating Criteria</h4>
              {criteria.map((criterion, index) => (
                <div key={index} className="p-4 bg-surface-50 dark:bg-surface-800 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-surface-900 dark:text-white">
                      {criterion.name}
                    </span>
                    <span className="text-sm text-surface-500 dark:text-surface-400">
                      Weight: {criterion.weight}%
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((score) => (
                      <button
                        key={score}
                        onClick={() => handleScoreChange(index, score)}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`h-8 w-8 transition-colors ${
                            score <= criterion.score
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-surface-300 dark:text-surface-600'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-lg font-medium text-surface-700 dark:text-surface-300">
                      {criterion.score}/5
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Feedback */}
            <Textarea
              label="Feedback (visible to employee)"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Provide constructive feedback..."
              rows={4}
            />

            {/* Private Notes */}
            <Textarea
              label="Private Notes (managers only)"
              value={privateNotes}
              onChange={(e) => setPrivateNotes(e.target.value)}
              placeholder="Internal notes..."
              rows={2}
            />

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-surface-200 dark:border-surface-700">
              <Button
                variant="outline"
                onClick={() => handleSubmitReview('needs_revision')}
                disabled={isSubmitting}
                className="flex-1"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Request Revision
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleSubmitReview('rejected')}
                disabled={isSubmitting || !allScored}
                className="flex-1"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
              <Button
                onClick={() => handleSubmitReview('approved')}
                disabled={isSubmitting || !allScored}
                className="flex-1"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

