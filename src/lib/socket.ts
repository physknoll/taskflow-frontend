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

// AIPM Socket Event Names
export const AIPM_SOCKET_EVENTS = {
  CHECKIN_STARTED: 'aipm:checkin:started',
  CHECKIN_MESSAGE: 'aipm:checkin:message',
  CHECKIN_COMPLETED: 'aipm:checkin:completed',
  SESSION_FLAGGED: 'aipm:session:flagged',
  REPORT_GENERATED: 'aipm:report:generated',
} as const;

