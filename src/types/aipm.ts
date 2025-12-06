// ============================================
// AIPM (AI Project Manager) Types
// ============================================

// Schedule Types
export type CheckInFrequency = 'daily' | 'weekly' | 'custom';
export type PersonalityMode = 'supportive' | 'balanced' | 'deadline_focused';
export type DeliveryMethod = 'email' | 'in_app' | 'both';
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday

// Session Types
export type SessionStatus = 'scheduled' | 'pending' | 'in_progress' | 'completed' | 'skipped' | 'failed';
export type MessageRole = 'aipm' | 'user' | 'system';
export type SentimentLabel = 'negative' | 'neutral' | 'positive';

// Report Types
export type ReportType = 'daily_digest' | 'weekly_retrospective';
export type InterventionPriority = 'low' | 'medium' | 'high' | 'urgent';
export type InterventionType = 'unresolved_question' | 'blocker' | 'low_sentiment' | 'overdue' | 'workload' | 'other';
export type HighlightType = 'praise' | 'concern' | 'blocker' | 'achievement';
export type VelocityTrend = 'increasing' | 'stable' | 'decreasing';
export type SentimentTrend = 'improving' | 'stable' | 'declining';

// ============================================
// Configuration Interfaces
// ============================================

export interface ICheckinSchedule {
  enabled: boolean;
  frequency: CheckInFrequency;
  daysOfWeek: DayOfWeek[];
  time: string; // "09:00" (24hr format)
  timezone: string;
  skipHolidays: boolean;
}

export interface IDeepWorkHours {
  enabled: boolean;
  startTime: string;
  endTime: string;
  daysOfWeek: DayOfWeek[];
}

export interface IDailyDigestConfig {
  enabled: boolean;
  time: string;
  includeOverdueTickets: boolean;
  includeBlockers: boolean;
  includeBacklogCount: boolean;
  includeCompletedCount: boolean;
  includeSentimentSummary: boolean;
  includeUpcomingDeadlines: boolean;
}

export interface IWeeklyRetroConfig {
  enabled: boolean;
  dayOfWeek: DayOfWeek;
  time: string;
  includeVelocityTrends: boolean;
  includeSentimentTrends: boolean;
  includeTopPerformers: boolean;
  includeConcerns: boolean;
  includeRecommendations: boolean;
}

export interface IReportingConfig {
  dailyDigest: IDailyDigestConfig;
  weeklyRetrospective: IWeeklyRetroConfig;
  deliveryMethod: DeliveryMethod;
  recipients: string[];
}

export interface ISmartFeatures {
  staleTicketCleanup: {
    enabled: boolean;
    thresholdDays: number;
    autoArchive: boolean;
  };
  resourceBalancing: {
    enabled: boolean;
    maxTicketsPerPerson: number;
    considerSentiment: boolean;
  };
  meetingPrep: {
    enabled: boolean;
    minutesBefore: number;
    calendarIntegration: 'google' | 'outlook' | 'none';
  };
  calendarIntegration: {
    enabled: boolean;
    provider: 'google' | 'outlook' | 'none';
    respectBusyStatus: boolean;
    respectFocusTime: boolean;
  };
}

export interface IAIPMConfig {
  _id: string;
  organizationId: string;
  checkinSchedule: ICheckinSchedule;
  deepWorkHours: IDeepWorkHours;
  personalityMode: PersonalityMode;
  customInstructions?: string;
  reporting: IReportingConfig;
  features: ISmartFeatures;
  isActive: boolean;
  lastCheckInRun?: string;
  lastReportGenerated?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Session Interfaces
// ============================================

export interface ISessionMessage {
  role: MessageRole;
  content: string;
  timestamp: string;
  metadata?: {
    ticketsDiscussed?: string[];
    toolsUsed?: string[];
    tokensUsed?: number;
  };
}

export interface IDetectedBlocker {
  description: string;
  ticketId?: string;
  severity: 'low' | 'medium' | 'high';
}

export interface IUnresolvedQuestion {
  question: string;
  context: string;
  daysPending?: number;
}

export interface ITicketUpdate {
  ticketId: string;
  ticketNumber: string;
  previousStatus?: string;
  newStatus?: string;
  progressReported: string;
  hoursLogged?: number;
  blockerMentioned?: boolean;
}

export interface ISessionAnalysis {
  sentimentScore: number;
  sentimentLabel: SentimentLabel;
  detectedBlockers: IDetectedBlocker[];
  unresolvedQuestions: IUnresolvedQuestion[];
  ticketUpdates: ITicketUpdate[];
  keyTopics: string[];
  managerFlagged: boolean;
  flagReason?: string;
  flagPriority?: 'low' | 'medium' | 'high';
  aiSummary: string;
}

export interface IContextSnapshot {
  assignedTicketCount: number;
  overdueTicketCount: number;
  ticketsInProgress: number;
  recentCompletions: number;
  previousCheckInDate?: string;
  managerFeedback?: string;
}

export interface ICheckInSession {
  _id: string;
  sessionId: string;
  userId: string | {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  organizationId: string;
  scheduledAt: string;
  reminderSentAt?: string;
  status: SessionStatus;
  startedAt?: string;
  completedAt?: string;
  skipReason?: string;
  failureReason?: string;
  messages: ISessionMessage[];
  langGraphThreadId?: string;
  contextSnapshot: IContextSnapshot;
  analysis?: ISessionAnalysis;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Report Interfaces
// ============================================

export interface IReportStats {
  ticketsCompleted: number;
  ticketsCreated: number;
  ticketsOverdue: number;
  ticketsClosed: number;
  backlogCount: number;
  inProgressCount: number;
  averageCompletionTime?: number;
  velocityTrend?: VelocityTrend;
  velocityChange?: number;
  checkInsScheduled: number;
  checkInsCompleted: number;
  checkInsSkipped: number;
  averageCheckInDuration?: number;
  averageSentiment: number;
  sentimentTrend?: SentimentTrend;
  sentimentByEmployee?: Array<{
    userId: string;
    name: string;
    sentiment: number;
  }>;
  totalBlockers: number;
  resolvedBlockers: number;
  newBlockers: number;
}

export interface IIntervention {
  id: string;
  userId: string;
  userName: string;
  sessionId?: string;
  ticketId?: string;
  ticketNumber?: string;
  type: InterventionType;
  issue: string;
  context: string;
  priority: InterventionPriority;
  resolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
  resolution?: string;
  createdAt: string;
}

export interface IEmployeeHighlight {
  userId: string;
  userName: string;
  type: HighlightType;
  title: string;
  note: string;
  metrics?: {
    ticketsCompleted?: number;
    sentiment?: number;
    streak?: number;
  };
}

export interface IReportSection {
  title: string;
  content: string;
  priority: number;
}

export interface IAIPMReport {
  _id: string;
  reportId: string;
  organizationId: string;
  type: ReportType;
  title: string;
  periodStart: string;
  periodEnd: string;
  generatedAt: string;
  executiveSummary: string;
  sections: IReportSection[];
  stats: IReportStats;
  interventions: IIntervention[];
  employeeHighlights: IEmployeeHighlight[];
  recommendations: string[];
  deliveredVia: ('email' | 'in_app')[];
  deliveredTo: string[];
  deliveredAt?: string;
  sourceSessionIds: string[];
  createdAt: string;
  updatedAt: string;
}

// ============================================
// API Response Types
// ============================================

export interface INextCheckIn {
  scheduledAt: string;
  timezone: string;
  isToday: boolean;
  hoursUntil: number;
  formattedTime: string;
}

export interface IMessageResponse {
  response: string;
  sessionStatus: SessionStatus;
  ticketsDiscussed?: string[];
}

// ============================================
// Socket Event Payloads
// ============================================

export interface IAIPMCheckInStartedPayload {
  sessionId: string;
  message: string;
}

export interface IAIPMCheckInMessagePayload {
  sessionId: string;
  message: string;
  status: SessionStatus;
}

export interface IAIPMCheckInCompletedPayload {
  sessionId: string;
  summary: string;
  sentiment: SentimentLabel;
}

export interface IAIPMSessionFlaggedPayload {
  sessionId: string;
  userId: string;
  reason?: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface IAIPMReportGeneratedPayload {
  reportId: string;
  type: ReportType;
  title: string;
}

// ============================================
// Form/Update DTOs
// ============================================

export interface UpdateAIPMConfigDto {
  checkinSchedule?: Partial<ICheckinSchedule>;
  deepWorkHours?: Partial<IDeepWorkHours>;
  personalityMode?: PersonalityMode;
  customInstructions?: string;
  reporting?: {
    dailyDigest?: Partial<IDailyDigestConfig>;
    weeklyRetrospective?: Partial<IWeeklyRetroConfig>;
    deliveryMethod?: DeliveryMethod;
    recipients?: string[];
  };
  features?: {
    staleTicketCleanup?: Partial<ISmartFeatures['staleTicketCleanup']>;
    resourceBalancing?: Partial<ISmartFeatures['resourceBalancing']>;
    meetingPrep?: Partial<ISmartFeatures['meetingPrep']>;
    calendarIntegration?: Partial<ISmartFeatures['calendarIntegration']>;
  };
  isActive?: boolean;
}

export interface SessionFilters {
  userId?: string;
  status?: SessionStatus;
  flagged?: boolean;
  limit?: number;
}

export interface ReportFilters {
  type?: ReportType;
  limit?: number;
}

