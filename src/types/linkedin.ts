// ============================================
// LinkedIn Monitoring Types
// ============================================

// Profile Types
export type LinkedInProfileType = 'own' | 'competitor' | 'industry' | 'prospect';
export type LinkedInUrlType = 'personal' | 'company' | 'hashtag';
export type LinkedInScrapeStatus = 'success' | 'partial' | 'failed' | 'pending' | 'never';
export type LinkedInPriority = 'low' | 'normal' | 'high';

export interface LinkedInProfile {
  _id: string;
  organizationId: string;
  clientId?: string | { _id: string; name: string };
  url: string;
  urlType: LinkedInUrlType;
  username: string;
  displayName: string;
  headline?: string;
  avatarUrl?: string;
  profileType: LinkedInProfileType;
  tags: string[];
  monitoringEnabled: boolean;
  activityTypes: ('posts' | 'comments' | 'reposts' | 'articles')[];
  scrapeSchedule: {
    intervalMinutes: number;
    preferredTimes?: string[];
  };
  priority: LinkedInPriority;
  preferredScraperId?: string;
  lastScrapedAt?: string;
  nextScheduledScrape?: string;
  lastScrapeStatus: LinkedInScrapeStatus;
  consecutiveFailures: number;
  lastError?: string;
  totalPostsCollected: number;
  totalCommentsCollected: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Post Types
export type LinkedInActivityType = 'post' | 'repost' | 'comment' | 'article' | 'shared' | 'celebration';
export type LinkedInMediaType = 'none' | 'image' | 'video' | 'document' | 'poll' | 'carousel';
export type LinkedInActionStatus = 'new' | 'reviewed' | 'actioned' | 'skipped';

export interface LinkedInPostAuthor {
  name: string;
  headline?: string;
  profileUrl?: string;
  avatarUrl?: string;
  isOriginalPoster: boolean;
}

export interface LinkedInPostEngagement {
  reactions: number;
  comments: number;
  reposts: number;
  views?: number;
}

export interface LinkedInPostComment {
  authorName: string;
  authorHeadline?: string;
  authorProfileUrl?: string;
  content: string;
  reactions: number;
  linkedinTimestamp: string;
  isAuthorReply: boolean;
}

export interface LinkedInPost {
  _id: string;
  organizationId: string;
  profileId: string | LinkedInProfile;
  linkedinUrn: string;
  postUrl: string;
  author: LinkedInPostAuthor;
  content: string;
  contentPreview: string;
  activityType: LinkedInActivityType;
  mediaType?: LinkedInMediaType;
  mediaUrls: string[];
  linkedinTimestamp: string;
  estimatedPostDate?: string;
  engagement: LinkedInPostEngagement;
  engagementHistory: Array<{
    timestamp: string;
    likes: number;
    comments: number;
    reposts: number;
  }>;
  engagementVelocity?: number;
  peakVelocity?: number;
  isTrending: boolean;
  commentsCollected: number;
  topComments: LinkedInPostComment[];
  actionStatus: LinkedInActionStatus;
  actionNotes?: string;
  actionTicketId?: string;
  actionedAt?: string;
  actionedBy?: string;
  screenshotPath?: string;
  firstSeenAt: string;
  lastScrapedAt: string;
  createdAt: string;
  updatedAt: string;
}

// Scraper Types
export type LinkedInScrapingMode = 'conservative' | 'balanced' | 'aggressive';
export type LinkedInScraperStatus = 'online' | 'offline' | 'revoked';

export interface LinkedInScraperSettings {
  scrapingMode: LinkedInScrapingMode;
  maxPostsPerScrape: number;
  enableCommentScraping: boolean;
  enableScreenshots: boolean;
}

export interface LinkedInScraper {
  _id: string;
  organizationId: string;
  name: string;
  status: LinkedInScraperStatus;
  isOnlineNow?: boolean;
  lastHeartbeatAt?: string;
  lastCommandAt?: string;
  lastResultAt?: string;
  connectedAt?: string;
  disconnectedAt?: string;
  agentVersion?: string;
  platform?: 'darwin' | 'win32' | 'linux' | 'chrome' | 'extension' | 'chrome-extension';
  cookiesValid?: boolean;
  cookiesExpireAt?: string;
  linkedInAccountEmail?: string;
  settings: LinkedInScraperSettings;
  totalScrapeCommands: number;
  totalPostsScraped: number;
  consecutiveFailures: number;
  registeredAt: string;
  registeredBy: string;
  revokedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Session Types
export type LinkedInSessionStatus = 'pending' | 'sent' | 'in_progress' | 'success' | 'partial' | 'failed' | 'timeout';
export type LinkedInTargetType = 'profile' | 'company' | 'search' | 'hashtag' | 'post_detail';
export type LinkedInTriggerType = 'scheduled' | 'manual' | 'search' | 'retry';

export interface LinkedInSessionResults {
  postsFound: number;
  newPosts: number;
  updatedPosts: number;
  skippedPosts: number;
  commentsCollected: number;
  profilesDiscovered?: number;
}

export interface LinkedInSessionError {
  code: string;
  message: string;
  recoverable: boolean;
}

export interface LinkedInSession {
  _id: string;
  organizationId: string;
  targetType: LinkedInTargetType;
  targetId?: string | LinkedInProfile;
  targetUrl: string;
  searchTerm?: string;
  scraperId: string | LinkedInScraper;
  scraperName: string;
  commandId: string;
  status: LinkedInSessionStatus;
  scheduledAt?: string;
  sentAt?: string;
  startedAt?: string;
  completedAt?: string;
  durationMs?: number;
  results?: LinkedInSessionResults;
  error?: LinkedInSessionError;
  triggerType: LinkedInTriggerType;
  triggeredBy?: string;
  createdAt: string;
  updatedAt: string;
}

// Connection Code Response
export interface LinkedInConnectionCode {
  code: string;
  expiresAt: string;
  expiresInSeconds: number;
}

// Stats Types
export interface LinkedInStats {
  scrapers: {
    total: number;
    online: number;
    offline: number;
    withValidCookies: number;
  };
  profiles: {
    total: number;
    active: number;
    paused: number;
  };
  posts: {
    total: number;
    last24Hours: number;
    last7Days: number;
    trending: number;
    pendingAction: number;
  };
  sessions: {
    last24Hours: number;
    successful: number;
    failed: number;
    successRate: number;
  };
  lastScrapeAt?: string;
  nextScheduledScrape?: string;
}

export interface LinkedInTimelineEntry {
  _id: string;
  total: number;
  successful: number;
  failed: number;
  postsFound: number;
  newPosts: number;
}

export interface LinkedInEngagementStats {
  topByVelocity: LinkedInPost[];
  topByTotal: LinkedInPost[];
}

// Filter Types
export interface LinkedInProfileFilters {
  clientId?: string;
  profileType?: LinkedInProfileType;
  monitoringEnabled?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface LinkedInPostFilters {
  profileId?: string;
  clientId?: string;
  actionStatus?: LinkedInActionStatus;
  isTrending?: boolean;
  activityType?: LinkedInActivityType;
  since?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface LinkedInSessionFilters {
  profileId?: string;
  scraperId?: string;
  status?: LinkedInSessionStatus;
  targetType?: LinkedInTargetType;
  triggerType?: LinkedInTriggerType;
  page?: number;
  limit?: number;
}

// Request DTOs
export interface AddLinkedInProfileDto {
  url: string;
  displayName?: string;
  headline?: string;
  profileType: LinkedInProfileType;
  clientId?: string;
  activityTypes?: ('posts' | 'comments' | 'reposts' | 'articles')[];
  intervalMinutes?: number;
  priority?: LinkedInPriority;
  tags?: string[];
  scrapeImmediately?: boolean;
}

export interface BulkAddLinkedInProfilesDto {
  profiles: AddLinkedInProfileDto[];
}

export interface UpdateLinkedInProfileDto {
  displayName?: string;
  headline?: string;
  profileType?: LinkedInProfileType;
  clientId?: string;
  monitoringEnabled?: boolean;
  activityTypes?: ('posts' | 'comments' | 'reposts' | 'articles')[];
  intervalMinutes?: number;
  priority?: LinkedInPriority;
  preferredScraperId?: string | null;
  tags?: string[];
  notes?: string;
}

export interface UpdateLinkedInScraperSettingsDto {
  scrapingMode?: LinkedInScrapingMode;
  maxPostsPerScrape?: number;
  enableCommentScraping?: boolean;
  enableScreenshots?: boolean;
}

export interface UpdateLinkedInPostActionDto {
  status: LinkedInActionStatus;
  notes?: string;
  ticketId?: string;
}

// Response Types
export interface LinkedInScrapersResponse {
  scrapers: LinkedInScraper[];
  onlineCount: number;
}

export interface TriggerScrapeOptions {
  scraperId?: string;
}

export interface LinkedInTriggerScrapeResponse {
  commandId: string;
  sessionId: string;
  status: string;
  scraperId?: string;
  scraperName?: string;
  selectionReason?: 'explicit' | 'preferred' | 'fallback';
}

export interface LinkedInCSVSkippedRow {
  row: number;
  url: string;
  reason: string;
}

export interface LinkedInCSVUploadResponse {
  created: number;
  skipped: number;
  createdProfiles: LinkedInProfile[];
  skippedRows: LinkedInCSVSkippedRow[];
}

// Organization Feature Flag
export interface LinkedInFeatureConfig {
  enabled: boolean;
  enabledAt?: string;
  maxProfiles?: number;
  maxScrapers?: number;
}

// Error Codes
export type LinkedInErrorCode =
  | 'LINKEDIN_FEATURE_DISABLED'
  | 'ORGANIZATION_REQUIRED'
  | 'SCRAPER_NOT_FOUND'
  | 'PROFILE_NOT_FOUND'
  | 'POST_NOT_FOUND'
  | 'MAX_SCRAPERS_REACHED'
  | 'MAX_PROFILES_REACHED'
  | 'INVALID_LINKEDIN_URL'
  | 'PROFILE_ALREADY_EXISTS'
  | 'NO_ONLINE_SCRAPER'
  | 'CONNECTION_CODE_EXPIRED'
  | 'CONNECTION_CODE_INVALID';
