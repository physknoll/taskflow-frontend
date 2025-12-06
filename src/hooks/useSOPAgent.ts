'use client';

import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sopAgentService } from '@/services/sopAgent.service';
import {
  SOPConversationMessage,
  SOPDraft,
  SOPAgentPhase,
} from '@/types';
import toast from 'react-hot-toast';

interface SOPAgentState {
  sessionId: string | null;
  phase: SOPAgentPhase;
  messages: SOPConversationMessage[];
  draft: SOPDraft;
  generatedContent: string | null;
  showConfirmation: boolean;
  createdGuideline: { id: string; name: string; slug: string } | null;
}

const initialDraft: SOPDraft = {
  typicalTasks: [],
  tools: [],
};

const initialState: SOPAgentState = {
  sessionId: null,
  phase: 'greeting',
  messages: [],
  draft: initialDraft,
  generatedContent: null,
  showConfirmation: false,
  createdGuideline: null,
};

export function useSOPAgent() {
  const queryClient = useQueryClient();
  const [state, setState] = useState<SOPAgentState>(initialState);
  const [error, setError] = useState<string | null>(null);

  // Start session mutation
  const startMutation = useMutation({
    mutationFn: sopAgentService.startSession,
    onSuccess: (data) => {
      setState({
        sessionId: data.sessionId,
        phase: data.phase,
        messages: data.response
          ? [
              {
                role: 'assistant',
                content: data.response,
                timestamp: new Date().toISOString(),
              },
            ]
          : [],
        draft: initialDraft,
        generatedContent: null,
        showConfirmation: false,
        createdGuideline: null,
      });
      setError(null);
    },
    onError: (err: any) => {
      const message = err.response?.data?.message || 'Failed to start SOP session';
      setError(message);
      toast.error(message);
    },
  });

  // Send message mutation
  const sendMutation = useMutation({
    mutationFn: ({ sessionId, message }: { sessionId: string; message: string }) =>
      sopAgentService.sendMessage(sessionId, message),
    onSuccess: (data) => {
      setState((prev) => ({
        ...prev,
        phase: data.phase,
        messages: [
          ...prev.messages,
          {
            role: 'assistant',
            content: data.response,
            timestamp: new Date().toISOString(),
          },
        ],
        draft: data.draft || prev.draft,
        generatedContent: data.generatedContent || prev.generatedContent,
        showConfirmation: data.showConfirmation,
        createdGuideline: data.createdGuideline || null,
      }));
      setError(null);

      // If guideline was created via chat confirmation
      if (data.createdGuideline) {
        queryClient.invalidateQueries({ queryKey: ['guidelines'] });
        toast.success('SOP created successfully!');
      }
    },
    onError: (err: any) => {
      const message = err.response?.data?.message || 'Failed to send message';
      setError(message);
      toast.error(message);
    },
  });

  // Confirm and save mutation
  const confirmMutation = useMutation({
    mutationFn: (sessionId: string) => sopAgentService.confirmAndSave(sessionId),
    onSuccess: (data) => {
      setState((prev) => ({
        ...prev,
        phase: 'complete',
        createdGuideline: data.guideline,
      }));
      queryClient.invalidateQueries({ queryKey: ['guidelines'] });
      toast.success('SOP saved successfully!');
    },
    onError: (err: any) => {
      const message = err.response?.data?.message || 'Failed to save SOP';
      setError(message);
      toast.error(message);
    },
  });

  // Cancel session mutation
  const cancelMutation = useMutation({
    mutationFn: (sessionId: string) => sopAgentService.cancelSession(sessionId),
    onSuccess: () => {
      setState(initialState);
    },
    onError: () => {
      setState(initialState);
    },
  });

  // Start a new session
  const startSession = useCallback(async () => {
    setState(initialState);
    await startMutation.mutateAsync();
  }, [startMutation]);

  // Send a message
  const sendMessage = useCallback(
    async (message: string) => {
      if (!state.sessionId || !message.trim()) return;

      // Optimistically add user message
      setState((prev) => ({
        ...prev,
        messages: [
          ...prev.messages,
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

  // Confirm and save the SOP
  const confirmAndSave = useCallback(async () => {
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

  // Reset the session
  const resetSession = useCallback(() => {
    if (state.sessionId) {
      sopAgentService.cancelSession(state.sessionId).catch(() => {});
    }
    setState(initialState);
  }, [state.sessionId]);

  // Check if we can confirm
  const canConfirm =
    state.showConfirmation &&
    state.phase === 'reviewing' &&
    Boolean(state.generatedContent);

  return {
    // State
    sessionId: state.sessionId,
    phase: state.phase,
    messages: state.messages,
    draft: state.draft,
    generatedContent: state.generatedContent,
    showConfirmation: state.showConfirmation,
    createdGuideline: state.createdGuideline,
    error,
    canConfirm,

    // Loading states
    isLoading: startMutation.isPending,
    isSending: sendMutation.isPending,
    isConfirming: confirmMutation.isPending,

    // Actions
    startSession,
    sendMessage,
    confirmAndSave,
    cancelSession,
    resetSession,
  };
}


