'use client';

import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { projectAgentService } from '@/services/projectAgent.service';
import {
  ConversationMessage,
  ProjectDraft,
  ProjectAgentPhase,
  ValidationError,
  CreatedProject,
  CreatedTicket,
} from '@/types';
import toast from 'react-hot-toast';

interface ProjectAgentState {
  sessionId: string | null;
  phase: ProjectAgentPhase;
  messages: ConversationMessage[];
  draft: ProjectDraft;
  validationErrors: ValidationError[];
  showConfirmation: boolean;
  createdProject: CreatedProject | null;
  createdTickets: CreatedTicket[];
}

const initialState: ProjectAgentState = {
  sessionId: null,
  phase: 'greeting',
  messages: [],
  draft: {},
  validationErrors: [],
  showConfirmation: false,
  createdProject: null,
  createdTickets: [],
};

export function useProjectAgent() {
  const queryClient = useQueryClient();
  const [state, setState] = useState<ProjectAgentState>(initialState);
  const [error, setError] = useState<string | null>(null);

  // Start session mutation
  const startMutation = useMutation({
    mutationFn: (options?: { guidelineId?: string }) => projectAgentService.startSession(options),
    onSuccess: (data) => {
      // API returns { sessionId, response, phase }
      // response is the AI greeting message
      setState({
        sessionId: data.sessionId,
        phase: data.phase,
        messages: data.response ? [{
          role: 'assistant',
          content: data.response,
          timestamp: new Date().toISOString(),
        }] : [],
        draft: {},
        validationErrors: [],
        showConfirmation: false,
        createdProject: null,
        createdTickets: [],
      });
      setError(null);
    },
    onError: (err: any) => {
      const message = err.response?.data?.message || 'Failed to start AI session';
      setError(message);
      toast.error(message);
    },
  });

  // Send message mutation
  const sendMutation = useMutation({
    mutationFn: ({ sessionId, message }: { sessionId: string; message: string }) =>
      projectAgentService.sendMessage(sessionId, message),
    onSuccess: (data) => {
      // API returns { response, phase, showConfirmation, draft, validationErrors, createdProject?, createdTickets? }
      setState((prev) => ({
        ...prev,
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
        createdProject: data.createdProject || null,
        createdTickets: data.createdTickets || [],
      }));
      setError(null);

      // If project was created (user said "confirm" in chat), invalidate queries
      if (data.createdProject) {
        queryClient.invalidateQueries({ queryKey: ['projects'] });
        queryClient.invalidateQueries({ queryKey: ['projects-board'] });
        toast.success('Project and tickets created successfully!');
      }
    },
    onError: (err: any) => {
      const message = err.response?.data?.message || 'Failed to send message';
      setError(message);
      toast.error(message);
    },
  });

  // Confirm and create mutation (explicit confirmation endpoint)
  const confirmMutation = useMutation({
    mutationFn: (sessionId: string) => projectAgentService.confirmAndCreate(sessionId),
    onSuccess: (data) => {
      setState((prev) => ({
        ...prev,
        phase: 'complete',
        createdProject: data.project,
        createdTickets: data.tickets,
      }));
      // Invalidate projects queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects-board'] });
      toast.success('Project and tickets created successfully!');
    },
    onError: (err: any) => {
      const message = err.response?.data?.message || 'Failed to create project';
      setError(message);
      toast.error(message);
    },
  });

  // Cancel session mutation
  const cancelMutation = useMutation({
    mutationFn: (sessionId: string) => projectAgentService.cancelSession(sessionId),
    onSuccess: () => {
      setState(initialState);
    },
    onError: () => {
      // Silent fail - session might already be expired
      setState(initialState);
    },
  });

  // Start a new session
  const startSession = useCallback(async (guidelineId?: string) => {
    setState(initialState);
    await startMutation.mutateAsync(guidelineId ? { guidelineId } : undefined);
  }, [startMutation]);

  // Send a message
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

  // Confirm and create the project (using dedicated endpoint)
  const confirmAndCreate = useCallback(async () => {
    if (!state.sessionId) throw new Error('No active session');
    return confirmMutation.mutateAsync(state.sessionId);
  }, [state.sessionId, confirmMutation]);

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
      projectAgentService.cancelSession(state.sessionId).catch(() => {});
    }
    setState(initialState);
  }, [state.sessionId]);

  // Check if we can confirm (has required fields)
  const canConfirm =
    state.showConfirmation &&
    Boolean(state.draft?.name) &&
    Boolean(state.draft?.client) &&
    Boolean(state.draft?.projectLead);

  return {
    // State
    sessionId: state.sessionId,
    phase: state.phase,
    messages: state.messages || [],
    draft: state.draft || {},
    validationErrors: state.validationErrors || [],
    showConfirmation: state.showConfirmation,
    createdProject: state.createdProject,
    createdTickets: state.createdTickets,
    error,
    canConfirm,

    // Loading states
    isLoading: startMutation.isPending,
    isSending: sendMutation.isPending,
    isConfirming: confirmMutation.isPending,

    // Actions
    startSession,
    sendMessage,
    confirmAndCreate,
    cancelSession,
    resetSession,
  };
}
