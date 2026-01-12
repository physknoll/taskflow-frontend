// ============================================
// Chat Widget Types
// ============================================

/**
 * Theme configuration for the chat widget
 */
export interface ChatWidgetTheme {
  primaryColor: string;
  position: 'bottom-right' | 'bottom-left';
  buttonSize: number; // 40-80
  borderRadius: number; // 0-24
}

/**
 * Chat widget configuration form data
 */
export interface ChatWidgetConfigForm {
  // Enable/Disable
  isActive: boolean;

  // Customization
  greeting: string; // Max 500 chars
  placeholderText: string; // Max 100 chars
  botName: string; // Max 50 chars
  botAvatarUrl?: string; // Optional URL

  // Knowledge Base Filtering
  allowedCategories: string[]; // Multi-select from client.knowledgeBase.categories

  // Theme
  theme: ChatWidgetTheme;

  // Security
  allowedDomains: string[]; // List of domains (e.g., "example.com", "*.example.com")
}

/**
 * Full chat widget configuration from API
 */
export interface ChatWidgetConfig extends ChatWidgetConfigForm {
  _id: string;
  chatWidgetId: string;
  clientId: string;
  apiKeyPrefix: string; // Partial key for display (e.g., "tfcw_abc...xyz")
  createdAt: string;
  updatedAt: string;
}

/**
 * Response when creating/saving widget config (includes full API key once)
 */
export interface ChatWidgetConfigResponse {
  config: ChatWidgetConfig;
  apiKey?: string; // Only returned on first creation - save it!
}

/**
 * Response when regenerating API key
 */
export interface RegenerateKeyResponse {
  apiKey: string; // New key - save it, won't be shown again
  apiKeyPrefix: string;
}

/**
 * Feedback metrics for analytics
 */
export interface WidgetFeedbackStats {
  totalPositive: number;
  totalNegative: number;
  sessionsNeedingReview: number;
  sessionsReviewed: number;
}

/**
 * Widget analytics overview stats
 */
export interface WidgetAnalytics {
  totalSessions: number;
  totalMessages: number;
  avgResponseTimeMs: number;
  lastSessionAt?: string;
  // Feedback metrics
  feedback?: WidgetFeedbackStats;
}

/**
 * RAG source citation in AI response
 */
export interface WidgetRAGSource {
  documentId: string;
  title: string;
  excerpt: string;
  category: string;
}

/**
 * Metadata for assistant messages
 */
export interface WidgetMessageMetadata {
  ragSources?: WidgetRAGSource[];
  ragConfidence?: number;
  latencyMs?: number;
}

/**
 * Feedback for a single message
 */
export interface WidgetMessageFeedback {
  messageId: string;
  rating: 'positive' | 'negative';
  comment?: string;
  timestamp: string;
}

/**
 * Session feedback data
 */
export interface WidgetSessionFeedback {
  overallRating?: 'positive' | 'negative';
  messageFeedback: WidgetMessageFeedback[];
}

/**
 * Individual message in a chat session
 */
export interface WidgetSessionMessage {
  _id?: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  metadata?: WidgetMessageMetadata;
  // Feedback on this message (if any)
  feedback?: {
    rating: 'positive' | 'negative';
    comment?: string;
  };
}

/**
 * Visitor information for a session
 */
export interface WidgetSessionVisitor {
  country?: string;
  city?: string;
  deviceType?: 'desktop' | 'mobile' | 'tablet';
}

/**
 * Context information for a session
 */
export interface WidgetSessionContext {
  domain: string;
  pageUrl: string;
}

/**
 * Analytics for a single session
 */
export interface WidgetSessionAnalytics {
  messageCount: number;
  avgResponseTimeMs?: number;
}

/**
 * Full widget session with messages
 */
export interface WidgetSession {
  sessionId: string;
  startedAt: string;
  lastMessageAt: string;
  status: 'active' | 'completed' | 'abandoned';
  visitor: WidgetSessionVisitor;
  context: WidgetSessionContext;
  analytics: WidgetSessionAnalytics;
  messages: WidgetSessionMessage[];
  // Feedback data
  feedback?: WidgetSessionFeedback;
  // Review status
  needsReview?: boolean;
  reviewedAt?: string;
  reviewTicketId?: string;
}

/**
 * Paginated sessions response
 */
export interface WidgetSessionsResponse {
  sessions: WidgetSession[];
  total: number;
}

/**
 * Geographic analytics data
 */
export interface GeoData {
  country: string;
  sessionCount: number;
}

/**
 * Query parameters for fetching sessions
 */
export interface WidgetSessionsQuery {
  limit?: number;
  offset?: number;
  status?: 'active' | 'completed' | 'abandoned';
  needsReview?: boolean;
}

/**
 * Query parameters for needs-review sessions
 */
export interface NeedsReviewSessionsQuery {
  limit?: number;
  offset?: number;
  includeReviewed?: boolean;
}

/**
 * Issue type for chat widget improvement tickets
 */
export type WidgetIssueType = 
  | 'missing-content'
  | 'outdated-content'
  | 'unclear-content'
  | 'wrong-answer'
  | 'slow-response';

/**
 * Widget issue (ticket created from session review)
 */
export interface WidgetIssue {
  _id: string;
  ticketNumber: string;
  title: string;
  description: string;
  status: 'backlog' | 'todo' | 'in_progress' | 'in_review' | 'completed';
  issueType: WidgetIssueType;
  sessionId?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Widget issues response
 */
export interface WidgetIssuesResponse {
  tickets: WidgetIssue[];
  total: number;
}

/**
 * Query parameters for fetching widget issues
 */
export interface WidgetIssuesQuery {
  limit?: number;
  offset?: number;
  status?: 'open' | 'completed' | 'all';
}

/**
 * Issue type display configuration
 */
export const WIDGET_ISSUE_TYPES: Record<WidgetIssueType, { label: string; color: string; description: string }> = {
  'missing-content': { 
    label: 'Missing Content', 
    color: 'orange',
    description: 'KB lacks needed info'
  },
  'outdated-content': { 
    label: 'Outdated Content', 
    color: 'red',
    description: 'Info is stale/wrong'
  },
  'unclear-content': { 
    label: 'Unclear Content', 
    color: 'yellow',
    description: 'Info is confusing'
  },
  'wrong-answer': { 
    label: 'Wrong Answer', 
    color: 'red',
    description: 'AI misinterpreted sources'
  },
  'slow-response': { 
    label: 'Slow Response', 
    color: 'gray',
    description: 'Response too slow'
  },
};

/**
 * Default values for new widget configuration
 */
export const DEFAULT_WIDGET_CONFIG: Omit<ChatWidgetConfigForm, 'allowedCategories'> = {
  isActive: false,
  greeting: 'Hi there! How can I help you today?',
  placeholderText: 'Type your message...',
  botName: 'Assistant',
  botAvatarUrl: undefined,
  theme: {
    primaryColor: '#6366F1', // Indigo
    position: 'bottom-right',
    buttonSize: 56,
    borderRadius: 16,
  },
  allowedDomains: [],
};
