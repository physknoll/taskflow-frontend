// ============================================
// Admin Panel Types
// ============================================

// Platform Roles
export type PlatformRole = 'super_admin' | 'support_admin' | 'billing_admin';

// Admin User
export interface IAdminUser {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  platformRole: PlatformRole;
  platformRoleGrantedAt?: string;
  platformRoleGrantedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

// Admin Auth Response
export interface AdminAuthResponse {
  user: IAdminUser;
  token: string;
  expiresIn: string;
}

// Admin Login DTO
export interface AdminLoginDto {
  email: string;
  password: string;
}

// ============================================
// Organization Types (Admin View)
// ============================================

export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid';
export type SubscriptionPlan = 'free' | 'starter' | 'professional' | 'enterprise';

export interface IAdminOrganization {
  _id: string;
  name: string;
  slug: string;
  industry?: string;
  size?: string;
  subscriptionStatus: SubscriptionStatus;
  currentPlan: SubscriptionPlan;
  seatCount: number;
  trialEndsAt?: string;
  stripeCustomerId?: string;
  isFlagged: boolean;
  flagReason?: string;
  flaggedAt?: string;
  flaggedBy?: string;
  userCount: number;
  activeUserCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface IAdminOrganizationDetail extends IAdminOrganization {
  users: IAdminOrganizationUser[];
  stats: {
    userCount: number;
    activeUserCount: number;
    ticketCount: number;
    completedTickets: number;
    projectCount: number;
  };
  recentActivity?: {
    tickets: any[];
  };
}

export interface IAdminOrganizationUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  role: 'owner' | 'manager' | 'employee' | 'client_viewer';
  accountStatus: 'active' | 'suspended' | 'pending_deletion';
  lastLogin?: string;
  createdAt: string;
}

// ============================================
// User Types (Admin View)
// ============================================

export type UserAccountStatus = 'active' | 'suspended' | 'pending_deletion';

export interface IAdminUserListItem {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: 'owner' | 'manager' | 'employee' | 'client_viewer';
  accountStatus: UserAccountStatus;
  platformRole?: PlatformRole;
  organization?: {
    _id: string;
    name: string;
    slug: string;
  };
  lastLogin?: string;
  createdAt: string;
}

export interface IAdminUserDetail extends IAdminUserListItem {
  phone?: string;
  jobTitle?: string;
  department?: string;
  timezone: string;
  stats?: {
    totalTicketsCompleted: number;
    averageCompletionTime: number;
    reviewPassRate: number;
    currentStreak: number;
  };
  // Recent activity entries - backend should populate this array
  recentActivity?: Array<{
    _id?: string;
    action: string;           // e.g., 'created', 'updated', 'completed'
    entityType?: string;      // e.g., 'ticket', 'project', 'comment'
    entityId?: string;
    description?: string;
    timestamp?: string;
    createdAt?: string;
    metadata?: {
      ticketTitle?: string;
      projectName?: string;
      [key: string]: any;
    };
  }>;
  // Recent AI conversations - backend should populate this array
  recentConversations?: Array<{
    _id?: string;
    conversationId?: string;
    title?: string;
    type?: string;            // e.g., 'task_help', 'general', 'code_review'
    status?: 'active' | 'completed' | 'abandoned';
    channel?: string;         // e.g., 'web_app', 'slack', 'api'
    messageCount?: number;
    startedAt?: string;
    lastMessageAt?: string;
    createdAt?: string;
  }>;
}

// ============================================
// Billing Types
// ============================================

export interface IAdminSubscription {
  organizationId: string;
  organizationName: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  seats: number;
  trialEndsAt?: string;
  currentPeriodEnd?: string;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  createdAt: string;
}

export interface IAdminSubscriptionDetail extends IAdminSubscription {
  paymentHistory: IPaymentRecord[];
  billingEmail?: string;
  invoices?: IInvoice[];
}

export interface IPaymentRecord {
  id: string;
  amount: number;
  currency: string;
  status: 'succeeded' | 'failed' | 'pending' | 'refunded';
  description?: string;
  createdAt: string;
}

export interface IInvoice {
  id: string;
  amount: number;
  currency: string;
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  invoiceUrl?: string;
  createdAt: string;
}

// ============================================
// Analytics Types
// ============================================

export interface IAdminOverviewStats {
  organizations: {
    total: number;
    active: number;
    trialing: number;
    byPlan: Record<SubscriptionPlan, number>;
  };
  users: {
    total: number;
    active: number;
    newThisMonth: number;
    activeThisWeek: number;
  };
  ai: {
    totalConversations: number;
    conversationsThisMonth: number;
  };
  tickets: {
    total: number;
    createdThisMonth: number;
    completedThisMonth: number;
  };
  projects: {
    total: number;
    createdThisMonth: number;
  };
  generatedAt: string;
}

export interface IAdminUsageStats {
  timeRange: { start: string; end: string };
  aiUsage: Array<{ date: string; conversations: number; messages: number }>;
  ticketActivity: Array<{ date: string; created: number; completed: number }>;
  newUsers: Array<{ date: string; count: number }>;
  newOrganizations: Array<{ date: string; count: number }>;
}

export interface IAdminGrowthStats {
  timeRange: { start: string; end: string };
  organizations: Array<{ date: string; count: number; cumulative: number }>;
  users: Array<{ date: string; count: number; cumulative: number }>;
  trialConversion: {
    trialsStarted: number;
    trialsConverted: number;
    conversionRate: string;
  };
}

export interface IAdminRevenueStats {
  mrr: number;
  arr: number;
  subscriptionsByPlan: Record<SubscriptionPlan, number>;
  churnRate: string;
  arpu: string;
  totalActiveSubscriptions: number;
}

export interface IAdminAIStats {
  timeRange: { start: string; end: string };
  summary: {
    totalConversations: number;
    totalCompleted: number;
    totalAbandoned: number;
    totalEscalated: number;
    completionRate: string;
  };
  byType: Array<{
    type: string;
    count: number;
    avgMessages: number;
    totalMessages: number;
  }>;
  byChannel: Array<{
    channel: string;
    count: number;
  }>;
  byStatus: Array<{
    status: string;
    count: number;
  }>;
  topUsers: Array<{
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    conversationCount: number;
    totalMessages: number;
  }>;
  topOrganizations: Array<{
    organizationId: string;
    name: string;
    plan: SubscriptionPlan;
    conversationCount: number;
    totalMessages: number;
    uniqueUsers: number;
  }>;
  dailyUsage: Array<{
    date: string;
    conversations: number;
    messages: number;
    uniqueUsers: number;
  }>;
}

// ============================================
// Support Types
// ============================================

export interface IAdminConversation {
  _id: string;
  conversationId: string;
  userId: string;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
  organization?: {
    _id: string;
    name: string;
  };
  type: string;
  status: 'active' | 'completed' | 'abandoned' | 'escalated';
  channel: string;
  title?: string;
  messageCount: number;
  startedAt: string;
  lastMessageAt: string;
  completedAt?: string;
}

export interface IAdminConversationDetail extends IAdminConversation {
  messages: Array<{
    _id: string;
    role: 'user' | 'assistant' | 'system' | 'tool';
    content: string;
    timestamp: string;
    metadata?: Record<string, any>;
  }>;
  relatedTickets?: Array<{
    ticketId: string;
    ticketNumber: string;
    relationship: string;
  }>;
  relatedProjects?: Array<{
    projectId: string;
    relationship: string;
  }>;
}

export interface IAdminActivityLog {
  _id: string;
  userId: string;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
  organizationId?: string;
  organization?: {
    name: string;
  };
  action: string;
  entityType: string;
  entityId?: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface IAdminAuditLog {
  _id: string;
  adminId: string;
  admin?: {
    firstName: string;
    lastName: string;
    email: string;
    platformRole: PlatformRole;
  };
  category: 'organization' | 'user' | 'billing' | 'admin' | 'system' | 'support';
  action: string;
  targetType?: string;
  targetId?: string;
  targetName?: string;
  changes?: Record<string, { old: any; new: any }>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

export interface IAdminTicket {
  _id: string;
  ticketNumber: string;
  title: string;
  status: string;
  priority: string;
  type: string;
  organization?: {
    _id: string;
    name: string;
  };
  assignedTo?: Array<{
    _id: string;
    firstName: string;
    lastName: string;
  }>;
  createdBy?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// API Response Types
// ============================================

export interface AdminApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface AdminPaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// ============================================
// Query Parameter Types
// ============================================

export interface AdminListParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AdminOrganizationParams extends AdminListParams {
  plan?: SubscriptionPlan;
  status?: SubscriptionStatus;
  flagged?: boolean;
}

export interface AdminUserParams extends AdminListParams {
  organizationId?: string;
  role?: 'owner' | 'manager' | 'employee' | 'client_viewer';
  status?: UserAccountStatus;
  hasPlatformRole?: boolean;
}

export interface AdminConversationParams extends AdminListParams {
  userId?: string;
  organizationId?: string;
  type?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export interface AdminActivityParams extends AdminListParams {
  userId?: string;
  organizationId?: string;
  action?: string;
  entityType?: string;
  startDate?: string;
  endDate?: string;
}

export interface AdminAuditParams extends AdminListParams {
  adminId?: string;
  category?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
}

export interface AdminAnalyticsParams {
  startDate?: string;
  endDate?: string;
  granularity?: 'day' | 'week' | 'month';
}



