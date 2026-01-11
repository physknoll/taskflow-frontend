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
 * Widget analytics overview stats
 */
export interface WidgetAnalytics {
  totalSessions: number;
  totalMessages: number;
  avgResponseTimeMs: number;
  lastSessionAt?: string;
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
 * Individual message in a chat session
 */
export interface WidgetSessionMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  metadata?: WidgetMessageMetadata;
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
}

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
