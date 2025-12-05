'use client';

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ticketsService, TicketFilters } from '@/services/tickets.service';
import { ITicket, ITicketTask, CreateTicketDto } from '@/types';
import toast from 'react-hot-toast';

interface UseTicketsOptions {
  clientId?: string;
  projectId?: string;
  status?: string;
  assignedTo?: string;
  enabled?: boolean;
}

export function useTickets(options: UseTicketsOptions = {}) {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<TicketFilters>({
    client: options.clientId,
    project: options.projectId,
    status: options.status,
    assignedTo: options.assignedTo,
  });

  // Fetch tickets
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['tickets', filters],
    queryFn: () => ticketsService.getTickets(filters),
    enabled: options.enabled !== false,
  });

  // Create ticket mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateTicketDto) => ticketsService.createTicket(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      toast.success('Ticket created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create ticket');
    },
  });

  // Update ticket mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ITicket> }) =>
      ticketsService.updateTicket(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      toast.success('Ticket updated');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update ticket');
    },
  });

  // Update status mutation (optimistic)
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      ticketsService.updateStatus(id, status),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ['tickets'] });
      const previousTickets = queryClient.getQueryData(['tickets', filters]);

      queryClient.setQueryData(['tickets', filters], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.map((ticket: ITicket) =>
            ticket._id === id ? { ...ticket, status } : ticket
          ),
        };
      });

      return { previousTickets };
    },
    onError: (err, variables, context) => {
      if (context?.previousTickets) {
        queryClient.setQueryData(['tickets', filters], context.previousTickets);
      }
      toast.error('Failed to update status');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });

  // Update task mutation
  const taskMutation = useMutation({
    mutationFn: ({
      ticketId,
      taskId,
      data,
    }: {
      ticketId: string;
      taskId: string;
      data: Partial<ITicketTask>;
    }) => ticketsService.updateTask(ticketId, taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['ticket'] });
    },
  });

  // Add task mutation
  const addTaskMutation = useMutation({
    mutationFn: ({
      ticketId,
      data,
    }: {
      ticketId: string;
      data: {
        title: string;
        description?: string;
        estimatedMinutes?: number;
        requiresAttachment?: boolean;
      };
    }) => ticketsService.addTask(ticketId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['ticket'] });
      toast.success('Task added');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add task');
    },
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: ({ ticketId, taskId }: { ticketId: string; taskId: string }) =>
      ticketsService.deleteTask(ticketId, taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['ticket'] });
      toast.success('Task deleted');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete task');
    },
  });

  // Reorder tasks mutation
  const reorderTasksMutation = useMutation({
    mutationFn: ({ ticketId, taskOrder }: { ticketId: string; taskOrder: string[] }) =>
      ticketsService.reorderTasks(ticketId, taskOrder),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['ticket'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to reorder tasks');
    },
  });

  // Submit for review mutation
  const submitForReviewMutation = useMutation({
    mutationFn: ({
      ticketId,
      data,
    }: {
      ticketId: string;
      data: { notes?: string; assetIds?: string[] };
    }) => ticketsService.submitForReview(ticketId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      toast.success('Submitted for review');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to submit for review');
    },
  });

  // Delete ticket mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => ticketsService.deleteTicket(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      toast.success('Ticket deleted');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete ticket');
    },
  });

  const updateFilters = useCallback((newFilters: Partial<TicketFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const updateTicketStatus = useCallback(
    (ticketId: string, status: string) => {
      return statusMutation.mutateAsync({ id: ticketId, status });
    },
    [statusMutation]
  );

  return {
    tickets: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    error,
    filters,
    updateFilters,
    refetch,
    createTicket: createMutation.mutateAsync,
    updateTicket: (id: string, data: Partial<ITicket>) =>
      updateMutation.mutateAsync({ id, data }),
    updateTicketStatus,
    updateTask: (ticketId: string, taskId: string, data: Partial<ITicketTask>) =>
      taskMutation.mutateAsync({ ticketId, taskId, data }),
    addTask: (ticketId: string, data: { title: string; description?: string; estimatedMinutes?: number; requiresAttachment?: boolean }) =>
      addTaskMutation.mutateAsync({ ticketId, data }),
    deleteTask: (ticketId: string, taskId: string) =>
      deleteTaskMutation.mutateAsync({ ticketId, taskId }),
    reorderTasks: (ticketId: string, taskOrder: string[]) =>
      reorderTasksMutation.mutateAsync({ ticketId, taskOrder }),
    submitForReview: (ticketId: string, data: any) =>
      submitForReviewMutation.mutateAsync({ ticketId, data }),
    deleteTicket: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending || statusMutation.isPending,
    isAddingTask: addTaskMutation.isPending,
    isDeletingTask: deleteTaskMutation.isPending,
  };
}

// Single ticket hook
export function useTicket(ticketId: string) {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['ticket', ticketId],
    queryFn: () => ticketsService.getTicket(ticketId),
    enabled: !!ticketId,
  });

  const addCommentMutation = useMutation({
    mutationFn: (content: string) => ticketsService.addComment(ticketId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
      toast.success('Comment added');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add comment');
    },
  });

  return {
    ticket: data,
    isLoading,
    error,
    addComment: addCommentMutation.mutateAsync,
    isAddingComment: addCommentMutation.isPending,
  };
}

