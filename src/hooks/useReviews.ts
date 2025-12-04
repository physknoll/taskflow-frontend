'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewsService, ReviewFilters, CompleteReviewDto } from '@/services/reviews.service';
import { IReview, ITicketInReview } from '@/types';
import toast from 'react-hot-toast';

export function useReviews(filters: ReviewFilters = {}) {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['reviews', filters],
    queryFn: () => reviewsService.getReviews(filters),
  });

  // Fetch tickets in review (new endpoint)
  const { data: ticketsInReviewData, isLoading: isLoadingTicketsInReview } = useQuery({
    queryKey: ['reviews', 'tickets-in-review'],
    queryFn: () => reviewsService.getTicketsInReview(),
  });

  // Fetch pending reviews (legacy - kept for compatibility)
  const { data: pendingData, isLoading: isLoadingPending } = useQuery({
    queryKey: ['reviews', 'pending'],
    queryFn: () => reviewsService.getPendingReviews(),
  });

  // Start review mutation
  const startMutation = useMutation({
    mutationFn: (reviewId: string) => reviewsService.startReview(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to start review');
    },
  });

  // Complete review mutation
  const completeMutation = useMutation({
    mutationFn: ({ reviewId, data }: { reviewId: string; data: CompleteReviewDto }) =>
      reviewsService.completeReview(reviewId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });

      const statusMessages = {
        approved: 'Review approved!',
        rejected: 'Review rejected',
        needs_revision: 'Revision requested',
      };
      toast.success(statusMessages[variables.data.status]);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to complete review');
    },
  });

  // Submit revision mutation
  const revisionMutation = useMutation({
    mutationFn: ({
      reviewId,
      data,
    }: {
      reviewId: string;
      data: { notes: string; assetIds: string[] };
    }) => reviewsService.submitRevision(reviewId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      toast.success('Revision submitted');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to submit revision');
    },
  });

  return {
    reviews: data?.data || [],
    pagination: data?.pagination,
    // New endpoint data
    ticketsInReview: ticketsInReviewData?.data || [],
    ticketsInReviewCount: ticketsInReviewData?.count || 0,
    // Legacy endpoint data (kept for compatibility)
    pendingReviews: pendingData?.data || [],
    pendingCount: pendingData?.data?.length || 0,
    isLoading: isLoading || isLoadingPending || isLoadingTicketsInReview,
    error,
    refetch,
    startReview: startMutation.mutateAsync,
    completeReview: (reviewId: string, data: CompleteReviewDto) =>
      completeMutation.mutateAsync({ reviewId, data }),
    submitRevision: (reviewId: string, data: { notes: string; assetIds: string[] }) =>
      revisionMutation.mutateAsync({ reviewId, data }),
    isSubmitting: completeMutation.isPending || revisionMutation.isPending,
  };
}

// Single review hook
export function useReview(reviewId: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['review', reviewId],
    queryFn: () => reviewsService.getReview(reviewId),
    enabled: !!reviewId,
  });

  return {
    review: data,
    isLoading,
    error,
  };
}

