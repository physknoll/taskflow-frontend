import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from './constants';

let socket: Socket | null = null;

export const getSocket = (): Socket | null => {
  return socket;
};

export const initializeSocket = (token: string): Socket => {
  if (socket?.connected) {
    return socket;
  }

  socket = io(SOCKET_URL, {
    auth: {
      token,
    },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    console.log('🔌 Socket connected:', socket?.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('🔌 Socket disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('🔌 Socket connection error:', error.message);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Socket event types
export interface AIInteractiveCheckinData {
  notificationId: string;
  type: 'morning' | 'evening';
  title: string;
  message: string;
  questions: Array<{
    id: string;
    question: string;
    placeholder?: string;
    required: boolean;
  }>;
  isBlocking: boolean;
  timestamp: string;
}

export interface AICheckinProcessedData {
  notificationId: string;
  ticketsUpdated: number;
  tasksCompleted: number;
  notesAdded: number;
  summary: string;
}

export interface NotificationData {
  notification: {
    _id: string;
    type: string;
    title: string;
    message: string;
    [key: string]: any;
  };
}

// AIPM Socket Event Types
export interface AIPMCheckInStartedData {
  sessionId: string;
  message: string;
}

export interface AIPMCheckInMessageData {
  sessionId: string;
  message: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped' | 'failed';
}

export interface AIPMCheckInCompletedData {
  sessionId: string;
  summary: string;
  sentiment: 'positive' | 'neutral' | 'negative';
}

export interface AIPMSessionFlaggedData {
  sessionId: string;
  userId: string;
  reason?: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface AIPMReportGeneratedData {
  reportId: string;
  type: 'daily_digest' | 'weekly_retrospective';
  title: string;
}

// AI Tool Usage Event (shows "AI is searching..." indicator)
export interface AIToolUsageData {
  toolName: string;
  status: 'start' | 'complete';
}

// Interactive Check-in Processed
export interface AICheckinProcessedData {
  notificationId: string;
  ticketsUpdated: number;
  tasksCompleted: number;
  notesAdded: number;
  summary: string;
}

// AIPM Socket Event Names
export const AIPM_SOCKET_EVENTS = {
  CHECKIN_STARTED: 'aipm:checkin:started',
  CHECKIN_MESSAGE: 'aipm:checkin:message',
  CHECKIN_COMPLETED: 'aipm:checkin:completed',
  SESSION_FLAGGED: 'aipm:session:flagged',
  REPORT_GENERATED: 'aipm:report:generated',
  // Dashboard events
  DASHBOARD_GREETING: 'aipm:dashboard:greeting',
  DASHBOARD_MESSAGE: 'aipm:dashboard:message',
  ACTION_EXECUTED: 'aipm:action:executed',
  POINTS_EARNED: 'aipm:points:earned',
  FOCUS_UPDATED: 'aipm:focus:updated',
} as const;

// AI Socket Event Names
export const AI_SOCKET_EVENTS = {
  INTERACTIVE_CHECKIN: 'ai:interactive_checkin',
  CHECKIN_PROCESSED: 'ai:checkin_processed',
  TOOL_USAGE: 'ai:tool_usage',
} as const;

// Project Creation Socket Event Names
export const PROJECT_CREATION_EVENTS = {
  CREATING: 'project:creating',
  CREATED: 'project:created',
  TICKETS_ENRICHING: 'tickets:enriching',
  TICKET_CREATING: 'ticket:creating',
  TICKET_CREATED_PROGRESS: 'ticket:created:progress',
  TICKETS_ALL_CREATED: 'tickets:all_created',
  CREATION_ERROR: 'project:creation_error',
} as const;

// Knowledge Base Upload Socket Event Names
export const KB_UPLOAD_EVENTS = {
  STARTED: 'kb:upload:started',
  PROGRESS: 'kb:upload:progress',
  COMPLETE: 'kb:upload:complete',
} as const;

// Knowledge Base Upload Event Data Types
export interface KBUploadStartedData {
  batchId: string;
  clientId: string;
  totalFiles: number;
}

export interface KBUploadProgressData {
  batchId: string;
  filename: string;
  status: 'completed' | 'failed';
  completed: number;
  failed: number;
  total: number;
}

export interface KBUploadCompleteData {
  batchId: string;
  completed: number;
  failed: number;
  total: number;
  errors: Array<{ filename: string; error: string }>;
}

// Project Creation Event Data Types
export interface ProjectCreatingData {
  sessionId: string;
  projectName: string;
}

export interface ProjectCreatedData {
  sessionId: string;
  projectId: string;
  projectNumber: string;
  projectName: string;
}

export interface TicketsEnrichingData {
  sessionId: string;
  count: number;
}

export interface TicketCreatingData {
  sessionId: string;
  index: number;
  total: number;
  title: string;
}

export interface TicketCreatedProgressData {
  sessionId: string;
  ticketId: string;
  ticketNumber: string;
  title: string;
  taskCount: number;
  index: number;
  total: number;
}

export interface TicketsAllCreatedData {
  sessionId: string;
  count: number;
  totalTime: number;
}

export interface ProjectCreationErrorData {
  sessionId: string;
  error: string;
  phase: string;
}

