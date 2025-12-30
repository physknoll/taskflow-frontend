// User Types

// Per-user permission settings
export interface IUserPermissions {
  // For client_viewer users - can they create tickets?
  canCreateTickets?: boolean;
  // For employee users - ticket visibility scope
  ticketVisibility?: 'assigned_only' | 'all';
}

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
  // For client_viewer users - links them to a specific client
  clientId?: string;
  // Populated client data (when available)
  client?: IClient;
  // Per-user permission settings
  permissions?: IUserPermissions;
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
  // Onboarding fields
  organizationId?: string;
  authProvider?: 'local' | 'google';
  isEmailVerified?: boolean;
  onboardingCompleted?: boolean;
  onboardingStep?: number;
  referralSource?: string;
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

// Minimal project reference for ticket associations
export interface ITicketProject {
  _id: string;
  projectNumber: string;
  name: string;
  slug: string;
  color: string;
}

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
  requiresResource?: boolean;
  resourceId?: string;
  /** @deprecated Use requiresResource instead */
  requiresAttachment?: boolean;
  /** @deprecated Use resourceId instead */
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
  project?: ITicketProject | string | null;  // Populated project details or ObjectId, null for standalone tickets
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
  effectiveTags?: string[];  // Virtual field: merged project + ticket tags
  color?: string;  // Optional color for card banner
  labels: Array<{ name: string; color: string }>;
  parentTicket?: string;
  childTickets: string[];
  linkedTickets: string[];
  resources?: IResource[];
  /** @deprecated Use resources with resourceType: 'git' instead */
  gitBranch?: string;
  /** @deprecated Use resources with resourceType: 'git' instead */
  pullRequestUrl?: string;
  reviewInfo?: {
    requestedAt: Date;
    requestedBy: string;
    reviewers: string[];
    currentReviewId?: string;
  };
  /** @deprecated Use resources instead */
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
  resources?: IResource[];
  /** @deprecated Use resources instead */
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
  submittedResources?: IResource[];
  /** @deprecated Use submittedResources instead */
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

// ============================================
// Resource Types (Unified Attachment System)
// ============================================

export type ResourceType = 'file' | 'link' | 'integration' | 'git';
export type ResourceCategory = 'video' | 'design' | 'code' | 'cloud_storage' | 'docs' | 'other';
export type ResourcePurpose = 'deliverable' | 'reference' | 'source_file' | 'review_submission';
export type GitPRState = 'open' | 'merged' | 'closed' | 'draft';
export type EmbedType = 'iframe' | 'image' | 'none';

export interface IResourceProvider {
  name: string;
  category: ResourceCategory;
  faviconUrl: string;
  brandColor?: string;
}

export interface IResourceFile {
  filename: string;
  originalFilename: string;
  mimeType: string;
  size: number;
}

export interface IResourceLink {
  url: string;
  title?: string;
  description?: string;
  thumbnailUrl?: string;
  embedUrl?: string;
  embedType?: EmbedType;
}

export interface IResourceGit {
  repoUrl: string;
  repoOwner?: string;
  repoName?: string;
  branch?: string;
  pullRequestUrl?: string;
  prNumber?: number;
  prTitle?: string;
  prState?: GitPRState;
  commitHash?: string;
}

export interface IResourceAIContext {
  contentType: string;
  purpose?: ResourcePurpose;
}

export interface IResourceUploader {
  _id?: string;
  firstName: string;
  lastName: string;
  avatar?: string;
}

export interface IResource {
  _id: string;
  resourceType: ResourceType;
  provider: IResourceProvider;
  file?: IResourceFile;
  link?: IResourceLink;
  git?: IResourceGit;
  aiContext?: IResourceAIContext;
  displayName: string;
  description?: string;
  uploadedBy: IResourceUploader;
  attachedToModel: 'Ticket' | 'Project' | 'Review' | 'Client';
  attachedToId: string;
  clientId: string;
  createdAt: string;
  updatedAt: string;
}

export interface IResourceStats {
  total: number;
  byCategory: Record<string, number>;
  byPurpose: Record<string, number>;
  hasDeliverables: boolean;
  openPRs: number;
  providers: string[];
}

export interface IProviderInfo {
  name: string;
  category: ResourceCategory;
  displayName: string;
  brandColor?: string;
  supportsEmbed: boolean;
}

// ============================================
// Asset Types (DEPRECATED - Use Resource instead)
// ============================================

/** @deprecated Use IResource instead */
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
  role: 'manager' | 'employee' | 'client_viewer';
  // Required for client_viewer role
  clientId?: string;
  // Per-user permission settings
  permissions?: IUserPermissions;
}

// ============================================
// Signup/Registration Types
// ============================================

export interface SignupOptionsResponse {
  industries: string[];
  organizationSizes: string[];
  referralSources: string[];
}

export interface SignupDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface SignupResponse {
  email: string;
  verificationPending: boolean;
  message: string;
  expiresIn: number; // seconds (600 = 10 minutes)
}

export interface VerifyCodeDto {
  email: string;
  code: string;
}

export interface VerifyCodeResponse {
  user: IUser;
  token: string;
  refreshToken: string;
  message: string;
  nextStep: string;
}

export interface CompleteProfileDto {
  phone?: string;
  jobTitle?: string;
  referralSource?: string;
  timezone?: string;
}

export interface CompleteProfileResponse {
  user: IUser;
  message: string;
  nextStep: string;
}

export interface CreateOrganizationDto {
  name: string;
  industry?: string;
  size?: string;
}

export interface IOrganization {
  _id: string;
  name: string;
  slug: string;
  industry?: string;
  size?: string;
  owner: string;
  members: string[];
  subscriptionStatus: 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid';
  seatCount: number;
  trialEndsAt?: string;
  billingEmail?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrganizationResponse {
  user: IUser;
  organization: IOrganization;
  message: string;
  trialEndsAt?: string;
}

// ============================================
// Project Types
// ============================================

export type ProjectStatus = 'planning' | 'in_progress' | 'review' | 'completed';
export type ProjectPriority = 'low' | 'medium' | 'high' | 'critical';
export type ProjectType = 
  | 'campaign' 
  | 'product_launch' 
  | 'content_series' 
  | 'website' 
  | 'rebrand' 
  | 'video' 
  | 'event' 
  | 'retainer' 
  | 'other';

export interface IProjectTask {
  _id: string;
  title: string;
  description?: string;
  order: number;
  isCompleted: boolean;
  completedAt?: string;
  completedBy?: IUser | string;
  linkedTicket?: ITicket | string;
}

export interface IProjectMilestone {
  _id: string;
  title: string;
  description?: string;
  dueDate?: string;
  isCompleted: boolean;
  completedAt?: string;
  linkedTickets: (ITicket | string)[];
}

/** @deprecated Use IResource with resourceType: 'link' instead */
export interface IExternalLink {
  title: string;
  url: string;
  type: 'figma' | 'drive' | 'notion' | 'github' | 'other';
}

export interface IProjectProgress {
  totalTickets: number;
  completedTickets: number;
  percentage: number;
  lastCalculatedAt: string;
}

export interface IProjectBudget {
  estimated: number;
  actual: number;
  currency: string;
}

export interface IProject {
  _id: string;
  projectNumber: string;
  slug: string;
  name: string;
  description: string;
  client: IClient | string;
  status: ProjectStatus;
  columnId?: string;
  useCustomColumns: boolean;
  startDate?: string;
  targetEndDate?: string;
  actualEndDate?: string;
  projectLead: IUser | string;
  teamMembers: (IUser | string)[];
  objectives: string[];
  deliverables: string[];
  tasks: IProjectTask[];
  milestones: IProjectMilestone[];
  resources?: IResource[];
  /** @deprecated Use resources instead */
  attachments: IAsset[];
  /** @deprecated Use resources with resourceType: 'link' instead */
  externalLinks: IExternalLink[];
  aiGeneratedBrief?: string;
  aiGeneratedAt?: string;
  progress: IProjectProgress;
  budget?: IProjectBudget;
  estimatedHours?: number;
  actualHours?: number;
  priority: ProjectPriority;
  type: ProjectType;
  tags: string[];
  color: string;
  isArchived: boolean;
  archivedAt?: string;
  archivedBy?: IUser | string;
  createdBy: IUser | string;
  createdAt: string;
  updatedAt: string;
  tickets?: ITicket[];
}

export interface CreateProjectDto {
  name: string;
  description: string;
  client: string;
  projectLead: string;
  teamMembers?: string[];
  objectives?: string[];
  deliverables?: string[];
  startDate?: string;
  targetEndDate?: string;
  priority?: ProjectPriority;
  type?: ProjectType;
  color?: string;
  generateAIBrief?: boolean;
}

export interface UpdateProjectDto extends Partial<CreateProjectDto> {
  status?: ProjectStatus;
  tags?: string[];
  externalLinks?: IExternalLink[];
}

export interface ProjectFilters {
  client?: string;
  status?: string;
  projectLead?: string;
  teamMember?: string;
  priority?: string;
  type?: string;
  isArchived?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

// Workflow Column Types
export type WorkflowScope = 'system' | 'client' | 'project';

export interface IWorkflowColumn {
  _id: string;
  scope: WorkflowScope;
  scopeId?: string;
  name: string;
  key: string;
  color: string;
  icon?: string;
  order: number;
  isDefault: boolean;
  isFinal: boolean;
  isHidden: boolean;
  autoMoveAfterDays?: number;
  requiresReview?: boolean;
  notifyOnEnter?: boolean;
  wipLimit?: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkflowColumnDto {
  scope: 'client' | 'project';
  scopeId: string;
  name: string;
  color?: string;
  icon?: string;
  order?: number;
  isDefault?: boolean;
  isFinal?: boolean;
  wipLimit?: number;
  requiresReview?: boolean;
}

export interface ProjectBoardColumn {
  column: IWorkflowColumn;
  projects: IProject[];
}

export interface ProjectBoardData {
  columns: IWorkflowColumn[];
  board: ProjectBoardColumn[];
}

export interface TicketBoardColumn {
  column: IWorkflowColumn;
  tickets: ITicket[];
}

export interface ProjectDetailBoard {
  project: IProject;
  columns: IWorkflowColumn[];
  board: TicketBoardColumn[];
}

export interface ProjectStats {
  ticketsByStatus: Record<string, number>;
  ticketsByAssignee: Array<{ user: IUser; count: number }>;
  hoursLogged: number;
  overdueTickets: number;
}

// ============================================
// Project Agent Types (AI Project Creation)
// ============================================
export * from './projectAgent';

// ============================================
// Guidelines/SOP Types
// ============================================
export * from './guidelines';

// ============================================
// AIPM (AI Project Manager) Types
// ============================================
export * from './aipm';

// ============================================
// Knowledge Base Sources Types
// ============================================
export * from './kb-sources';

// ============================================
// Conversations API Types
// ============================================

export type ConversationType =
  | 'daily_checkin'
  | 'scheduled_checkin'
  | 'dashboard_chat'
  | 'project_creation'
  | 'knowledge_base'
  | 'sop_creation'
  | 'blocker_resolution'
  | 'ticket_discussion'
  | 'general';

export type ConversationStatus = 'active' | 'completed' | 'abandoned' | 'escalated';
export type ConversationChannel = 'web_app' | 'google_chat' | 'slack' | 'email' | 'sms' | 'api';
export type ConversationMessageRole = 'user' | 'assistant' | 'system' | 'tool';
export type MessageFeedbackRating = 'positive' | 'negative';

export interface ConversationMessageMetadata {
  ticketsMentioned?: string[];
  projectsMentioned?: string[];
  usersMentioned?: string[];
  toolsUsed?: string[];
  tokensUsed?: number;
  model?: string;
  latencyMs?: number;
  toolName?: string;
  toolInput?: Record<string, unknown>;
  toolOutput?: Record<string, unknown>;
}

export interface ConversationMessageFeedback {
  rating?: MessageFeedbackRating;
  comment?: string;
  ratedAt?: string;
}

export interface ConversationMessage {
  _id: string;
  role: ConversationMessageRole;
  content: string;
  timestamp: string;
  metadata?: ConversationMessageMetadata;
  feedback?: ConversationMessageFeedback;
}

export interface ConversationRelatedTicket {
  ticketId: string;
  ticketNumber: string;
  relationship: 'discussed' | 'created' | 'updated' | 'blocked_by' | 'blocking';
}

export interface ConversationRelatedProject {
  projectId: string;
  relationship: 'discussed' | 'created' | 'updated';
}

export interface ConversationAnalysis {
  sentiment?: 'positive' | 'neutral' | 'negative' | 'frustrated';
  topics?: string[];
  blockers?: string[];
  commitments?: string[];
  questionsAsked?: number;
  questionsAnswered?: number;
  progressSummary?: string;
  concernsRaised?: string[];
}

export interface Conversation {
  _id: string;
  conversationId: string;
  userId: string;
  type: ConversationType;
  status: ConversationStatus;
  channel: ConversationChannel;
  title?: string;
  messages: ConversationMessage[];
  relatedTickets: ConversationRelatedTicket[];
  relatedProjects: ConversationRelatedProject[];
  analysis?: ConversationAnalysis;
  startedAt: string;
  lastMessageAt: string;
  completedAt?: string;
  messageCount: number;
  userMessageCount?: number;
  assistantMessageCount?: number;
  agentName?: string;
  langGraphThreadId?: string;
}

export interface ConversationsQuery {
  type?: ConversationType;
  status?: ConversationStatus;
  channel?: ConversationChannel;
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
}

export interface ConversationsResponse {
  conversations: Conversation[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}

export interface ResumeConversationResponse {
  conversation: Conversation;
  routeTo: string;
  canResume: boolean;
  agentName?: string;
  langGraphThreadId?: string;
}

export interface ConversationFeedbackDto {
  rating?: 1 | 2 | 3 | 4 | 5;
  helpful?: boolean;
  comment?: string;
}

export interface MessageFeedbackDto {
  rating: MessageFeedbackRating;
  comment?: string;
}

export interface ConversationStatsQuery {
  startDate?: string;
  endDate?: string;
}

export interface ConversationStats {
  totalConversations: number;
  byType: Record<ConversationType, number>;
  byStatus: Record<ConversationStatus, number>;
  averageMessageCount: number;
  averageDuration: number;
}

// ============================================
// AI Chat Types
// ============================================

export interface GeneralChatRequest {
  message: string;
  clientId?: string;
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
  conversationId?: string;
}

export interface GeneralChatResponse {
  response: string;
  conversationId: string;
  tokenUsage?: {
    input: number;
    output: number;
  };
}

export interface KnowledgeChatRequest {
  message: string;
  clientId: string;
  conversationId?: string;
}

export interface KnowledgeChatCitation {
  documentId: string;
  title: string;
  excerpt: string;
  relevanceScore: number;
}

export interface KnowledgeChatResponse {
  response: string;
  conversationId: string;
  knowledgeBase: {
    answer: string;
    citations: KnowledgeChatCitation[];
    confidence: number;
  };
}

// ============================================
// Ticket Agent Types (AI Ticket Creation)
// ============================================
export * from './ticketAgent';

// ============================================
// Calendar Types
// ============================================
export * from './calendar';

