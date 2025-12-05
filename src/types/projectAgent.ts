// Project Agent Types for AI-powered project creation

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface TeamMemberDraft {
  id?: string;
  name: string;
  matchConfidence: number;
  role?: string;
}

export interface TicketDraft {
  title: string;
  description?: string;
  assignedTo: TeamMemberDraft[];
  dueDate?: string;
  relativeDueDate?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedHours?: number;
  order: number;
  type?: 'feature' | 'bug' | 'content' | 'design' | 'maintenance' | 'other';
}

export interface ProjectDraft {
  // Basic Info
  name?: string;
  description?: string;
  
  // Client (matched from database)
  client?: string;
  clientName?: string;
  clientMatchConfidence?: number;
  
  // Project Lead (matched from database)
  projectLead?: string;
  projectLeadName?: string;
  projectLeadMatchConfidence?: number;
  
  // Team
  teamMembers?: TeamMemberDraft[];
  
  // Dates
  startDate?: string;
  targetEndDate?: string;
  relativeDueDate?: string;
  
  // Classification
  priority?: 'low' | 'medium' | 'high' | 'critical';
  type?: 'campaign' | 'product_launch' | 'content_series' | 'website' | 'rebrand' | 'video' | 'event' | 'retainer' | 'other';
  
  // Content
  objectives?: string[];
  deliverables?: string[];
  
  // Tickets to create
  tickets?: TicketDraft[];
  
  // Visual
  color?: string;
}

export type ProjectAgentPhase = 
  | 'greeting' 
  | 'gathering' 
  | 'clarifying' 
  | 'confirming' 
  | 'creating' 
  | 'complete';

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

// API Response Types

export interface ProjectAgentStartResponse {
  sessionId: string;
  response: string;  // AI greeting message (markdown)
  phase: ProjectAgentPhase;
}

export interface CreatedProject {
  id: string;
  projectNumber: string;
  name: string;
  slug: string;
}

export interface CreatedTicket {
  id: string;
  ticketNumber: string;
  title: string;
}

export interface ProjectAgentMessageResponse {
  response: string;  // AI response message (markdown)
  phase: ProjectAgentPhase;
  showConfirmation: boolean;
  draft: ProjectDraft;
  validationErrors: ValidationError[];
  createdProject?: CreatedProject;
  createdTickets?: CreatedTicket[];
}

export interface ProjectAgentSessionState {
  sessionId: string;
  phase: ProjectAgentPhase;
  draft: ProjectDraft;
  readyForConfirmation: boolean;
  validationErrors: ValidationError[];
  pendingQuestions: string[];
  missingFields: string[];
}

export interface ProjectAgentConfirmResponse {
  project: CreatedProject;
  tickets: CreatedTicket[];
}
