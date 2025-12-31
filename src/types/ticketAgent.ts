// Ticket Agent Types for AI-powered ticket creation

import { ValidationError } from './projectAgent';

export type TicketAgentPhase = 
  | 'gathering' 
  | 'sops_found' 
  | 'preview' 
  | 'created';

export interface TicketSOPReference {
  id: string;
  name: string;
}

export interface TicketDraftFromAgent {
  title?: string;
  description?: string;
  type?: 'feature' | 'bug' | 'content' | 'design' | 'maintenance' | 'other';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  assignee?: string;
  assigneeName?: string;
  projectId?: string | null;
  projectName?: string | null;
  dueDate?: string;
  sops?: TicketSOPReference[];
}

// ValidationError is imported from projectAgent in the consuming files

export interface CreatedTicketInfo {
  id: string;
  ticketNumber: string;
  title: string;
}

/**
 * Attached SOP reference in session response
 */
export interface AttachedSOP {
  id: string;
  title: string;
}

// API Response Types

export interface TicketAgentStartResponse {
  sessionId: string;
  response: string;
  draft?: TicketDraftFromAgent;
  /** SOP that was explicitly attached when starting the session */
  attachedSOP?: AttachedSOP;
}

export interface TicketAgentMessageResponse {
  response: string;
  phase: TicketAgentPhase;
  showConfirmation: boolean;
  draft: TicketDraftFromAgent;
  validationErrors: ValidationError[];
  createdTicket?: CreatedTicketInfo;
  createdTickets?: CreatedTicketInfo[];
  conversationId?: string;
}

export interface TicketAgentSessionState {
  sessionId: string;
  phase: TicketAgentPhase;
  draft: TicketDraftFromAgent;
  readyForConfirmation: boolean;
  validationErrors: ValidationError[];
  pendingQuestions: string[];
  missingFields: string[];
}

export interface TicketAgentHistoryResponse {
  messages: Array<{
    role: 'human' | 'ai';
    content: string;
  }>;
}

export interface UpdateTicketDraftDto {
  title?: string;
  description?: string;
  type?: 'feature' | 'bug' | 'content' | 'design' | 'maintenance' | 'other';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  assignee?: string;
  projectId?: string | null;
  dueDate?: string;
}

// SSE Stream event types
export type TicketStreamEvent = 
  | { type: 'token'; data: string }
  | { type: 'sops_found'; data: TicketSOPReference[] }
  | { type: 'preview'; data: { ticket: TicketDraftFromAgent } }
  | { type: 'ticket_created'; data: CreatedTicketInfo }
  | { type: 'tickets_created'; data: CreatedTicketInfo[] }
  | { type: 'error'; data: string }
  | { type: 'done'; data: { response: string; phase?: TicketAgentPhase } };

// Local message type for ticket agent conversation
export interface TicketAgentMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
