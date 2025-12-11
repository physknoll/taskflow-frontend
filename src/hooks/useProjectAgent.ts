'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { projectAgentService } from '@/services/projectAgent.service';
import {
  ProjectDraft,
  ProjectAgentPhase,
  ValidationError,
  CreatedProject,
  CreatedTicket,
  UpdateProjectDraftDto,
} from '@/types';
import {
  PROJECT_CREATION_EVENTS,
  ProjectCreatingData,
  ProjectCreatedData,
  TicketsEnrichingData,
  TicketCreatingData,
  TicketCreatedProgressData,
  TicketsAllCreatedData,
  ProjectCreationErrorData,
} from '@/lib/socket';
import { useSocket } from '@/components/providers/SocketProvider';
import toast from 'react-hot-toast';

// Local message type for project agent conversation
interface ProjectAgentMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

// Status message for creation progress
export interface CreationStatusMessage {
  id: string;
  type: 'info' | 'success' | 'error' | 'progress';
  message: string;
  timestamp: string;
  progress?: {
    current: number;
    total: number;
  };
}

interface ProjectAgentState {
  sessionId: string | null;
  conversationId: string | null;
  phase: ProjectAgentPhase;
  messages: ProjectAgentMessage[];
  draft: ProjectDraft;
  validationErrors: ValidationError[];
  showConfirmation: boolean;
  createdProject: CreatedProject | null;
  createdTickets: CreatedTicket[];
  creationStatusMessages: CreationStatusMessage[];
}

const initialState: ProjectAgentState = {
  sessionId: null,
  conversationId: null,
  phase: 'greeting',
  messages: [],
  draft: {},
  validationErrors: [],
  showConfirmation: false,
  createdProject: null,
  createdTickets: [],
  creationStatusMessages: [],
};

export function useProjectAgent() {
  const queryClient = useQueryClient();
  const { socket } = useSocket();
  const [state, setState] = useState<ProjectAgentState>(initialState);
  const [error, setError] = useState<string | null>(null);

  // Helper to add a status message
  const addStatusMessage = useCallback((
    type: CreationStatusMessage['type'],
    message: string,
    progress?: { current: number; total: number }
  ) => {
    setState((prev) => ({
      ...prev,
      creationStatusMessages: [
        ...prev.creationStatusMessages,
        {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type,
          message,
          timestamp: new Date().toISOString(),
          progress,
        },
      ],
    }));
  }, []);

  // Use refs to keep stable references for event handlers
  const sessionIdRef = useRef<string | null>(null);
  const addStatusMessageRef = useRef(addStatusMessage);
  
  // Keep refs updated
  useEffect(() => {
    sessionIdRef.current = state.sessionId;
  }, [state.sessionId]);
  
  useEffect(() => {
    addStatusMessageRef.current = addStatusMessage;
  }, [addStatusMessage]);

  // Subscribe to WebSocket events for project creation progress
  // Only subscribe once when socket is available, use refs for current values
  useEffect(() => {
    if (!socket) {
      return;
    }

    console.log('🔌 Setting up project creation event listeners');

    const handleProjectCreating = (data: ProjectCreatingData) => {
      console.log('📥 Received project:creating', data);
      if (data.sessionId !== sessionIdRef.current) {
        console.log('  ↳ Ignoring (session mismatch):', sessionIdRef.current);
        return;
      }
      addStatusMessageRef.current('info', `Creating project: ${data.projectName}...`);
    };

    const handleProjectCreated = (data: ProjectCreatedData) => {
      console.log('📥 Received project:created', data);
      if (data.sessionId !== sessionIdRef.current) {
        console.log('  ↳ Ignoring (session mismatch):', sessionIdRef.current);
        return;
      }
      addStatusMessageRef.current('success', `✓ Project ${data.projectNumber} created`);
    };

    const handleTicketsEnriching = (data: TicketsEnrichingData) => {
      console.log('📥 Received tickets:enriching', data);
      if (data.sessionId !== sessionIdRef.current) {
        console.log('  ↳ Ignoring (session mismatch):', sessionIdRef.current);
        return;
      }
      addStatusMessageRef.current('info', `Enriching ${data.count} tickets with AI...`, {
        current: 0,
        total: data.count,
      });
    };

    const handleTicketCreating = (data: TicketCreatingData) => {
      console.log('📥 Received ticket:creating', data);
      if (data.sessionId !== sessionIdRef.current) {
        console.log('  ↳ Ignoring (session mismatch):', sessionIdRef.current);
        return;
      }
      // Don't show intermediate "creating" status - we'll show the "created" result instead
      // This avoids pills with spinners that never stop
    };

    const handleTicketCreatedProgress = (data: TicketCreatedProgressData) => {
      console.log('📥 Received ticket:created:progress', data);
      if (data.sessionId !== sessionIdRef.current) {
        console.log('  ↳ Ignoring (session mismatch):', sessionIdRef.current);
        return;
      }
      addStatusMessageRef.current('success', `✓ ${data.ticketNumber}: ${data.title} (${data.taskCount} tasks)`, {
        current: data.index,
        total: data.total,
      });
    };

    const handleTicketsAllCreated = (data: TicketsAllCreatedData) => {
      console.log('📥 Received tickets:all_created', data);
      if (data.sessionId !== sessionIdRef.current) {
        console.log('  ↳ Ignoring (session mismatch):', sessionIdRef.current);
        return;
      }
      const timeInSeconds = (data.totalTime / 1000).toFixed(1);
      addStatusMessageRef.current('success', `✓ All ${data.count} tickets created in ${timeInSeconds}s`);
    };

    const handleCreationError = (data: ProjectCreationErrorData) => {
      console.log('📥 Received project:creation_error', data);
      if (data.sessionId !== sessionIdRef.current) {
        console.log('  ↳ Ignoring (session mismatch):', sessionIdRef.current);
        return;
      }
      addStatusMessageRef.current('error', `Error during ${data.phase}: ${data.error}`);
    };

    // Subscribe to events
    socket.on(PROJECT_CREATION_EVENTS.CREATING, handleProjectCreating);
    socket.on(PROJECT_CREATION_EVENTS.CREATED, handleProjectCreated);
    socket.on(PROJECT_CREATION_EVENTS.TICKETS_ENRICHING, handleTicketsEnriching);
    socket.on(PROJECT_CREATION_EVENTS.TICKET_CREATING, handleTicketCreating);
    socket.on(PROJECT_CREATION_EVENTS.TICKET_CREATED_PROGRESS, handleTicketCreatedProgress);
    socket.on(PROJECT_CREATION_EVENTS.TICKETS_ALL_CREATED, handleTicketsAllCreated);
    socket.on(PROJECT_CREATION_EVENTS.CREATION_ERROR, handleCreationError);

    return () => {
      console.log('🔌 Removing project creation event listeners');
      socket.off(PROJECT_CREATION_EVENTS.CREATING, handleProjectCreating);
      socket.off(PROJECT_CREATION_EVENTS.CREATED, handleProjectCreated);
      socket.off(PROJECT_CREATION_EVENTS.TICKETS_ENRICHING, handleTicketsEnriching);
      socket.off(PROJECT_CREATION_EVENTS.TICKET_CREATING, handleTicketCreating);
      socket.off(PROJECT_CREATION_EVENTS.TICKET_CREATED_PROGRESS, handleTicketCreatedProgress);
      socket.off(PROJECT_CREATION_EVENTS.TICKETS_ALL_CREATED, handleTicketsAllCreated);
      socket.off(PROJECT_CREATION_EVENTS.CREATION_ERROR, handleCreationError);
    };
  }, [socket]); // Only depend on socket - use refs for everything else

  // Start session mutation
  const startMutation = useMutation({
    mutationFn: (options?: { guidelineId?: string }) => projectAgentService.startSession(options),
    onSuccess: (data) => {
      setState({
        sessionId: data.sessionId,
        conversationId: data.conversationId || null,
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
        creationStatusMessages: [],
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
        createdProject: data.createdProject || null,
        createdTickets: data.createdTickets || [],
      }));
      setError(null);

      // If project was created, invalidate queries
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

  // Update draft mutation (direct UI edits)
  const updateDraftMutation = useMutation({
    mutationFn: ({ sessionId, updates }: { sessionId: string; updates: UpdateProjectDraftDto }) =>
      projectAgentService.updateDraft(sessionId, updates),
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

  // Confirm and create mutation
  const confirmMutation = useMutation({
    mutationFn: (sessionId: string) => projectAgentService.confirmAndCreate(sessionId),
    onSuccess: (data) => {
      setState((prev) => ({
        ...prev,
        phase: 'completed',
        createdProject: data.project,
        createdTickets: data.tickets,
      }));
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

  // Update draft directly from UI
  const updateDraft = useCallback(
    async (updates: UpdateProjectDraftDto) => {
      if (!state.sessionId) return;
      await updateDraftMutation.mutateAsync({
        sessionId: state.sessionId,
        updates,
      });
    },
    [state.sessionId, updateDraftMutation]
  );

  // Confirm and create the project
  const confirmAndCreate = useCallback(async () => {
    if (!state.sessionId) throw new Error('No active session');
    // Clear previous status messages before starting creation
    setState((prev) => ({ ...prev, creationStatusMessages: [] }));
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
    conversationId: state.conversationId,
    phase: state.phase,
    messages: state.messages || [],
    draft: state.draft || {},
    validationErrors: state.validationErrors || [],
    showConfirmation: state.showConfirmation,
    createdProject: state.createdProject,
    createdTickets: state.createdTickets,
    creationStatusMessages: state.creationStatusMessages || [],
    error,
    canConfirm,

    // Loading states
    isLoading: startMutation.isPending,
    isSending: sendMutation.isPending,
    isConfirming: confirmMutation.isPending,
    isUpdatingDraft: updateDraftMutation.isPending,

    // Actions
    startSession,
    sendMessage,
    updateDraft,
    confirmAndCreate,
    cancelSession,
    resetSession,
  };
}
