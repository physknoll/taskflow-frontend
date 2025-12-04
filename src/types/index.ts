// User Types
export interface IUser {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: 'owner' | 'manager' | 'employee' | 'client_viewer';
  department?: string;
  jobTitle?: string;
  phone?: string;
  timezone: string;
  workStartTime: string;
  workEndTime: string;
  preferredCheckInTime: 'start_of_day' | 'end_of_day' | 'both';
  notificationPreferences: {
    email: boolean;
    inApp: boolean;
    dailyDigest: boolean;
    ticketAssigned: boolean;
    ticketUpdated: boolean;
    reviewRequired: boolean;
    aiReminders: boolean;
  };
  assignedClients: string[];
  stats: {
    totalTicketsCompleted: number;
    averageCompletionTime: number;
    reviewPassRate: number;
    currentStreak: number;
  };
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Client Types
export interface IClientContact {
  name: string;
  email: string;
  phone?: string;
  role: string;
  department?: string;
  isDecisionMaker: boolean;
  notes?: string;
}

export interface IClient {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  website?: string;
  industry?: string;
  primaryContact: {
    name: string;
    email: string;
    phone?: string;
    role?: string;
  };
  contacts: IClientContact[];
  knowledgeBase: {
    fileSearchStoreId?: string;
    lastSyncedAt?: Date;
    documentCount: number;
    categories: string[];
  };
  services: Array<{
    type: string;
    description?: string;
    isActive: boolean;
  }>;
  brandGuidelines?: {
    primaryColors: string[];
    secondaryColors: string[];
    fonts: string[];
    voiceTone: string;
    doList: string[];
    dontList: string[];
    additionalNotes?: string;
  };
  settings: {
    defaultPriority: 'low' | 'medium' | 'high' | 'urgent';
    requireReviewForAll: boolean;
    autoAssignTickets: boolean;
    defaultAssignees: string[];
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Ticket Types
export interface ITicketTask {
  _id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  order: number;
  estimatedMinutes?: number;
  actualMinutes?: number;
  completedAt?: Date;
  completedBy?: string;
  notes?: string;
  requiresAttachment?: boolean;
  attachmentId?: string;
}

export interface ITicketComment {
  _id: string;
  user: IUser | string;
  content: string;
  isAIGenerated: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

export interface ITicket {
  _id: string;
  ticketNumber: string;
  client: IClient | string;
  title: string;
  description: string;
  type: 'feature' | 'bug' | 'content' | 'design' | 'maintenance' | 'other';
  category?: string;
  aiGeneratedInstructions?: string;
  aiGeneratedAt?: Date;
  tasks: ITicketTask[];
  assignedTo: IUser[] | string[];
  createdBy: IUser | string;
  status: 'backlog' | 'todo' | 'in_progress' | 'in_review' | 'approved' | 'completed' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: Date;
  startDate?: Date;
  completedAt?: Date;
  estimatedHours?: number;
  actualHours?: number;
  tags: string[];
  labels: Array<{ name: string; color: string }>;
  parentTicket?: string;
  childTickets: string[];
  linkedTickets: string[];
  gitBranch?: string;
  pullRequestUrl?: string;
  reviewInfo?: {
    requestedAt: Date;
    requestedBy: string;
    reviewers: string[];
    currentReviewId?: string;
  };
  attachments: string[];
  comments: ITicketComment[];
  aiInteractions: Array<{
    type: 'check_in' | 'reminder' | 'question' | 'update_parse';
    message: string;
    response?: string;
    timestamp: Date;
  }>;
  watchers: string[];
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Review Types
export interface IReviewCriteria {
  name: string;
  score: number;
  weight: number;
  feedback?: string;
}

export interface IReviewRevision {
  version: number;
  submittedAt: Date;
  submittedBy: IUser | string;
  assets: string[];
  notes?: string;
  reviewedAt?: Date;
  reviewedBy?: IUser | string;
  status: 'pending' | 'approved' | 'rejected';
  feedback?: string;
  score?: number;
}

export interface IReview {
  _id: string;
  ticket: ITicket | string;
  reviewNumber: string;
  status: 'pending' | 'in_progress' | 'approved' | 'rejected' | 'needs_revision';
  submittedBy: IUser | string;
  assignedReviewers: (IUser | string)[];
  currentReviewer?: IUser | string;
  submittedAt: Date;
  submissionNotes?: string;
  submittedAssets: string[];
  reviewedAt?: Date;
  reviewedBy?: IUser | string;
  criteria: IReviewCriteria[];
  overallScore?: number;
  feedback?: string;
  privateNotes?: string;
  revisions: IReviewRevision[];
  reviewChecklist: Array<{
    item: string;
    isChecked: boolean;
    checkedBy?: string;
    checkedAt?: Date;
  }>;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// AI Check-in Question Type
export interface IAICheckinQuestion {
  id: string;
  question: string;
  placeholder?: string;
  required: boolean;
}

// AI Check-in Response Type
export interface IAICheckinResponse {
  questionId: string;
  answer: string;
}

// AI Check-in Processing Result
export interface IAICheckinProcessingResult {
  ticketsUpdated: number;
  tasksCompleted: number;
  notesAdded: number;
  summary: string;
  details: Array<{
    ticketId: string;
    ticketNumber: string;
    actions: Array<{
      type: 'complete_task' | 'add_note' | 'log_time' | 'update_status';
      taskId?: string;
      taskTitle?: string;
      note?: string;
      minutes?: number;
    }>;
  }>;
}

// Notification Types
export interface INotification {
  _id: string;
  user: string;
  type: 
    | 'ticket_assigned'
    | 'ticket_updated'
    | 'ticket_comment'
    | 'review_requested'
    | 'review_completed'
    | 'review_feedback'
    | 'ai_checkin'
    | 'ai_checkin_interactive'
    | 'ai_reminder'
    | 'due_date_approaching'
    | 'due_date_passed'
    | 'mention'
    | 'system';
  title: string;
  message: string;
  ticket?: string;
  review?: string;
  client?: string;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, any>;
  isRead: boolean;
  readAt?: Date;
  emailSent: boolean;
  isDismissed: boolean;
  createdAt: Date;
  
  // Interactive AI Check-in fields
  requiresResponse?: boolean;
  isBlocking?: boolean;
  questions?: IAICheckinQuestion[];
  responses?: IAICheckinResponse[];
  respondedAt?: Date;
  aiProcessedAt?: Date;
  aiProcessingResult?: IAICheckinProcessingResult;
}

// Asset Types
export interface IAsset {
  _id: string;
  filename: string;
  originalFilename: string;
  mimeType: string;
  size: number;
  storageType: 'gridfs' | 's3' | 'local';
  storagePath: string;
  storageId?: string;
  type: 'image' | 'video' | 'document' | 'code' | 'archive' | 'other';
  client?: string;
  ticket?: string;
  review?: string;
  uploadedBy: string;
  version: number;
  thumbnailPath?: string;
  previewUrl?: string;
  metadata?: Record<string, any>;
  tags: string[];
  description?: string;
  isPublic: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Daily Update Types
export interface IParsedUpdate {
  ticketId: string;
  ticketNumber: string;
  ticketTitle: string;
  updateType: 'progress' | 'completed' | 'blocked' | 'started';
  description: string;
  tasksCompleted?: string[];
  timeSpent?: number;
  confidence: number;
  accepted: boolean;
  acceptedAt?: Date;
}

export interface IDailyUpdate {
  _id: string;
  user: string;
  date: Date;
  rawInput: string;
  inputMethod: 'chat' | 'form' | 'email' | 'voice';
  parsedUpdates: IParsedUpdate[];
  aiProcessedAt?: Date;
  aiModel: string;
  status: 'pending_review' | 'accepted' | 'modified' | 'rejected';
  confirmedAt?: Date;
  userModifications?: string;
  conversation: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

// Analytics Types
export interface IDashboardStats {
  overview: {
    totalTickets: number;
    completedThisWeek: number;
    inProgress: number;
    overdue: number;
    avgCompletionTime: number;
  };
  ticketsByStatus: Record<string, number>;
  ticketsByClient: Array<{ client: string; count: number }>;
  ticketsByPriority: Record<string, number>;
  recentActivity: any[];
}

export interface ITeamMemberStats {
  user: IUser;
  ticketsCompleted: number;
  ticketsInProgress: number;
  avgCompletionTime: number;
  reviewPassRate: number;
}

// Contribution Calendar Types (GitHub-style)
export interface IContributionDay {
  date: string;
  activityCount: number;
  ticketsCompleted: number;
  tasksCompleted: number;
  checkinsCompleted: number;
  level: 0 | 1 | 2 | 3 | 4; // 0=none, 1=low, 2=medium, 3=high, 4=very high
}

export interface IContributionData {
  calendar: IContributionDay[];
  totals: {
    totalActivities: number;
    totalTicketsCompleted: number;
    totalTasksCompleted: number;
    totalCheckins: number;
    daysActive: number;
  };
  period: {
    start: string;
    end: string;
    days: number;
  };
}

export interface IWeekDay {
  day: string;
  count: number;
  isToday: boolean;
}

export interface IStreakData {
  currentStreak: number;
  longestStreak: number;
  weeksActive: number;
  totalDaysActive: number;
  lastActivityDate: string;
  isActiveToday: boolean;
  thisWeek: IWeekDay[];
}

export interface IActivitySummary {
  period: { days: number };
  byActionType: Array<{ action: string; count: number }>;
  byEntityType: Array<{ entity: string; count: number }>;
  byHourOfDay: Array<{ hour: number; count: number }>;
  byDayOfWeek: Array<{ day: string; count: number }>;
}

export interface ILeaderboardEntry {
  user: { firstName: string; lastName: string; avatar?: string };
  activityCount?: number;
  ticketsCompleted?: number;
  currentStreak?: number;
  longestStreak?: number;
}

export interface ILeaderboardData {
  period: { days: number };
  topByActivity: ILeaderboardEntry[];
  topByTickets: ILeaderboardEntry[];
  topByStreak: ILeaderboardEntry[];
}

// Ticket in Review (new endpoint response)
export interface ITicketInReview {
  ticket: ITicket;
  review: IReview | null;
  hasReviewRecord: boolean;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Form Types
export interface CreateTicketDto {
  client: string;
  title: string;
  description: string;
  type: string;
  priority?: string;
  dueDate?: Date | string;
  assignedTo?: string[];
  generateAIContent?: boolean;
  tags?: string[];
}

export interface CreateClientDto {
  name: string;
  primaryContact: {
    name: string;
    email: string;
    phone?: string;
    role?: string;
  };
  description?: string;
  website?: string;
  industry?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'manager' | 'employee';
}

