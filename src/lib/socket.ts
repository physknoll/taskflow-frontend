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

