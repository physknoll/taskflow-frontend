'use client';

import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ticketAgentService, StartTicketSessionOptions } from '@/services/ticketAgent.service';
import {
  TicketAgentPhase,
  TicketDraftFromAgent,
  ValidationError, // from projectAgent, re-exported via index
  CreatedTicketInfo,
  TicketAgentMessage,
  UpdateTicketDraftDto,
} from '@/types';
import toast from 'react-hot-toast';

interface TicketAgentState {
  sessionId: string | null;
  conversationId: string | null;
  phase: TicketAgentPhase;
  messages: TicketAgentMessage[];
  draft: TicketDraftFromAgent;
  validationErrors: ValidationError[];
  showConfirmation: boolean;
  createdTicket: CreatedTicketInfo | null;
  createdTickets: CreatedTicketInfo[];
  streamingText: string;
}

const initialState: TicketAgentState = {
  sessionId: null,
  conversationId: null,
  phase: 'gathering',
  messages: [],
  draft: {},
  validationErrors: [],
  showConfirmation: false,
  createdTicket: null,
  createdTickets: [],
  streamingText: '',
};

export function useTicketAgent() {
  const queryClient = useQueryClient();
  const [state, setState] = useState<TicketAgentState>(initialState);
  const [error, setError] = useState<string | null>(null);

  // Start session mutation
  const startMutation = useMutation({
    mutationFn: (options?: StartTicketSessionOptions) => ticketAgentService.startSession(options),
    onSuccess: (data) => {
      setState({
        sessionId: data.sessionId,
        conversationId: null,
        phase: 'gathering',
        messages: data.response ? [{
          role: 'assistant',
          content: data.response,
          timestamp: new Date().toISOString(),
        }] : [],
        draft: data.draft || {},
        validationErrors: [],
        showConfirmation: false,
        createdTicket: null,
        createdTickets: [],
        streamingText: '',
      });
      setError(null);
    },
    onError: (err: any) => {
      const message = err.response?.data?.message || 'Failed to start AI session';
      setError(message);
      toast.error(message);
    },
  });

  // Send message mutation (non-streaming)
  const sendMutation = useMutation({
    mutationFn: ({ sessionId, message }: { sessionId: string; message: string }) =>
      ticketAgentService.sendMessage(sessionId, message),
    onSuccess: (data) => {
      setState((prev) => ({
        ...prev,
        conversationId: data.conversationId || prev.conversationId,
        phase: data.phase,
        messages: [
          ...(prev.messages || []),
          {
            role: 'assistant',
            content: data.response,
            timestamp: new Date().toISOString(),
          },
        ],
        draft: data.draft || {},
        validationErrors: data.validationErrors || [],
        showConfirmation: data.showConfirmation,
        createdTicket: data.createdTicket || null,
        createdTickets: data.createdTickets || [],
        streamingText: '',
      }));
      setError(null);

      // If ticket was created, invalidate queries
      if (data.createdTicket || data.createdTickets?.length) {
        queryClient.invalidateQueries({ queryKey: ['tickets'] });
        const count = data.createdTickets?.length || 1;
        toast.success(`${count === 1 ? 'Ticket' : `${count} tickets`} created successfully!`);
      }
    },
    onError: (err: any) => {
      const message = err.response?.data?.message || 'Failed to send message';
      setError(message);
      toast.error(message);
    },
  });

  // Update draft mutation (direct UI edits)
  const updateDraftMutation = useMutation({
    mutationFn: ({ sessionId, updates }: { sessionId: string; updates: UpdateTicketDraftDto }) =>
      ticketAgentService.updateDraft(sessionId, updates),
    onSuccess: (data) => {
      setState((prev) => ({
        ...prev,
        draft: data.draft,
        validationErrors: data.validationErrors,
        showConfirmation: data.readyForConfirmation,
      }));
    },
    onError: (err: any) => {
      const message = err.response?.data?.message || 'Failed to update draft';
      toast.error(message);
    },
  });

  // Cancel session mutation
  const cancelMutation = useMutation({
    mutationFn: (sessionId: string) => ticketAgentService.cancelSession(sessionId),
    onSuccess: () => {
      setState(initialState);
    },
    onError: () => {
      // Silent fail - session might already be expired
      setState(initialState);
    },
  });

  // Start a new session
  const startSession = useCallback(async (projectId?: string) => {
    setState(initialState);
    await startMutation.mutateAsync(projectId ? { projectId } : undefined);
  }, [startMutation]);

  // Send a message (non-streaming)
  const sendMessage = useCallback(
    async (message: string) => {
      if (!state.sessionId || !message.trim()) return;

      // Optimistically add user message
      setState((prev) => ({
        ...prev,
        messages: [
          ...(prev.messages || []),
          {
            role: 'user',
            content: message,
            timestamp: new Date().toISOString(),
          },
        ],
      }));

      await sendMutation.mutateAsync({
        sessionId: state.sessionId,
        message,
      });
    },
    [state.sessionId, sendMutation]
  );

  // Send a message with streaming
  const sendMessageStreaming = useCallback(
    async (message: string) => {
      if (!state.sessionId || !message.trim()) return;

      // Optimistically add user message and reset streaming text
      setState((prev) => ({
        ...prev,
        messages: [
          ...(prev.messages || []),
          {
            role: 'user',
            content: message,
            timestamp: new Date().toISOString(),
          },
        ],
        streamingText: '',
      }));

      try {
        let fullResponse = '';
        let finalDraft: TicketDraftFromAgent = state.draft;
        let finalPhase: TicketAgentPhase = state.phase;
        let createdTicket: CreatedTicketInfo | null = null;
        let createdTickets: CreatedTicketInfo[] = [];

        for await (const event of ticketAgentService.sendMessageStream(state.sessionId, message)) {
          switch (event.type) {
            case 'token':
              fullResponse += event.data;
              setState((prev) => ({
                ...prev,
                streamingText: fullResponse,
              }));
              break;
            case 'sops_found':
              setState((prev) => ({
                ...prev,
                draft: { ...prev.draft, sops: event.data },
                phase: 'sops_found',
              }));
              finalDraft = { ...finalDraft, sops: event.data };
              finalPhase = 'sops_found';
              break;
            case 'preview':
              finalDraft = event.data.ticket;
              finalPhase = 'preview';
              setState((prev) => ({
                ...prev,
                draft: event.data.ticket,
                phase: 'preview',
                showConfirmation: true,
              }));
              break;
            case 'ticket_created':
              createdTicket = event.data;
              finalPhase = 'created';
              break;
            case 'tickets_created':
              createdTickets = event.data;
              finalPhase = 'created';
              break;
            case 'error':
              setError(event.data);
              toast.error(event.data);
              break;
            case 'done':
              // Finalize the response
              if (event.data.phase) {
                finalPhase = event.data.phase;
              }
              break;
          }
        }

        // Add the complete assistant message
        setState((prev) => ({
          ...prev,
          messages: [
            ...prev.messages,
            {
              role: 'assistant',
              content: fullResponse || prev.streamingText,
              timestamp: new Date().toISOString(),
            },
          ],
          streamingText: '',
          draft: finalDraft,
          phase: finalPhase,
          showConfirmation: finalPhase === 'preview',
          createdTicket,
          createdTickets,
        }));

        // Invalidate queries if tickets were created
        if (createdTicket || createdTickets.length > 0) {
          queryClient.invalidateQueries({ queryKey: ['tickets'] });
          const count = createdTickets.length || 1;
          toast.success(`${count === 1 ? 'Ticket' : `${count} tickets`} created successfully!`);
        }
      } catch (err: any) {
        const message = err.message || 'Failed to send message';
        setError(message);
        toast.error(message);
        setState((prev) => ({ ...prev, streamingText: '' }));
      }
    },
    [state.sessionId, state.draft, state.phase, queryClient]
  );

  // Update draft directly from UI
  const updateDraft = useCallback(
    async (updates: UpdateTicketDraftDto) => {
      if (!state.sessionId) return;
      await updateDraftMutation.mutateAsync({
        sessionId: state.sessionId,
        updates,
      });
    },
    [state.sessionId, updateDraftMutation]
  );

  // Cancel the session
  const cancelSession = useCallback(async () => {
    if (state.sessionId) {
      await cancelMutation.mutateAsync(state.sessionId);
    } else {
      setState(initialState);
    }
  }, [state.sessionId, cancelMutation]);

  // Reset the session (for when modal closes)
  const resetSession = useCallback(() => {
    if (state.sessionId) {
      // Fire and forget - don't wait for response
      ticketAgentService.cancelSession(state.sessionId).catch(() => {});
    }
    setState(initialState);
  }, [state.sessionId]);

  // Check if we can confirm (has required fields)
  const canConfirm =
    state.showConfirmation &&
    Boolean(state.draft?.title);

  // Check if ticket was created
  const isCreated = state.phase === 'created' || Boolean(state.createdTicket);

  return {
    // State
    sessionId: state.sessionId,
    conversationId: state.conversationId,
    phase: state.phase,
    messages: state.messages || [],
    draft: state.draft || {},
    validationErrors: state.validationErrors || [],
    showConfirmation: state.showConfirmation,
    createdTicket: state.createdTicket,
    createdTickets: state.createdTickets,
    streamingText: state.streamingText,
    error,
    canConfirm,
    isCreated,

    // Loading states
    isLoading: startMutation.isPending,
    isSending: sendMutation.isPending,
    isUpdatingDraft: updateDraftMutation.isPending,

    // Actions
    startSession,
    sendMessage,
    sendMessageStreaming,
    updateDraft,
    cancelSession,
    resetSession,
  };
}
