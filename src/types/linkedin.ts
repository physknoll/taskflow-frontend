// ============================================
// Multi-Platform Scraping Types (Unified API)
// ============================================

// Platform Types
export type ScrapingPlatform = 'linkedin' | 'reddit' | 'youtube' | 'website';
export type SourceType = 'profile' | 'company' | 'subreddit' | 'channel' | 'page';
export type SourceStatus = 'active' | 'paused' | 'error' | 'archived';
export type ItemStatus = 'new' | 'reviewed' | 'actionable' | 'archived';
export type ItemType = 'post' | 'comment' | 'article' | 'video' | 'page';
export type ScraperStatus = 'online' | 'offline' | 'error' | 'revoked';
export type AgentType = 'chrome_extension' | 'electron_app';

// Legacy type aliases for backwards compatibility
export type LinkedInProfileType = 'own' | 'competitor' | 'industry' | 'prospect';
export type LinkedInUrlType = 'personal' | 'company' | 'hashtag';
export type LinkedInScrapeStatus = 'success' | 'partial' | 'failed' | 'pending' | 'never';
export type LinkedInPriority = 'low' | 'normal' | 'high';
export type LinkedInActivityType = 'post' | 'repost' | 'comment' | 'article' | 'shared' | 'celebration';
export type LinkedInMediaType = 'none' | 'image' | 'video' | 'document' | 'poll' | 'carousel';
export type LinkedInActionStatus = 'new' | 'reviewed' | 'actioned' | 'skipped';
export type LinkedInScrapingMode = 'conservative' | 'balanced' | 'aggressive';
export type LinkedInScraperStatus = 'online' | 'offline' | 'revoked';
export type LinkedInSessionStatus = 'pending' | 'sent' | 'in_progress' | 'success' | 'partial' | 'failed' | 'timeout';
export type LinkedInTargetType = 'profile' | 'company' | 'search' | 'hashtag' | 'post_detail';
export type LinkedInTriggerType = 'scheduled' | 'manual' | 'search' | 'retry';

// ============================================
// Scraper/Connection Types (New API)
// ============================================

export interface PlatformCredentials {
  linkedin?: {
    accountEmail?: string;
    cookiesValid?: boolean;
    lastValidated?: string;
  };
  reddit?: {
    username?: string;
    authenticated?: boolean;
  };
}

export interface ScraperStats {
  totalCommands: number;
  totalItemsScraped: number;
  totalErrors: number;
}

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
  status: LinkedInScraperStatus | ScraperStatus;
  isOnlineNow?: boolean;
  lastHeartbeatAt?: string;
  lastCommandAt?: string;
  lastResultAt?: string;
  connectedAt?: string;
  disconnectedAt?: string;
  agentVersion?: string;
  // New API fields
  agentType?: AgentType;
  supportedPlatforms?: ScrapingPlatform[];
  currentPlatform?: ScrapingPlatform;
  platformCredentials?: PlatformCredentials;
  stats?: ScraperStats;
  isActive?: boolean;
  // Legacy fields (still supported for backwards compat)
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

// ============================================
// Source Types (Previously Profile)
// ============================================

export interface SourceMetadata {
  firstName?: string;
  lastName?: string;
  headline?: string;
  avatarUrl?: string;
  // Reddit-specific
  subscribers?: number;
  // Website-specific
  siteName?: string;
}

export interface ScrapeSettings {
  frequency: string;
  maxItems?: number;
}

export interface SourceStats {
  totalItemsScraped: number;
  lastScrapedAt?: string;
}

export interface LinkedInProfile {
  _id: string;
  organizationId: string;
  clientId?: string | { _id: string; name: string };
  // New API fields
  platform?: ScrapingPlatform;
  siteType?: string;
  sourceType?: SourceType;
  platformId?: string;
  status?: SourceStatus;
  priority?: LinkedInPriority;
  metadata?: SourceMetadata;
  scrapeSettings?: ScrapeSettings;
  stats?: SourceStats;
  // Legacy and common fields
  url: string;
  name?: string;
  urlType?: LinkedInUrlType;
  username?: string;
  displayName?: string;
  headline?: string;
  avatarUrl?: string;
  profileType?: LinkedInProfileType;
  tags?: string[];
  monitoringEnabled?: boolean;
  activityTypes?: ('posts' | 'comments' | 'reposts' | 'articles')[];
  scrapeSchedule?: {
    intervalMinutes: number;
    preferredTimes?: string[];
  };
  preferredScraperId?: string;
  lastScrapedAt?: string;
  nextScheduledScrape?: string;
  lastScrapeStatus?: LinkedInScrapeStatus;
  consecutiveFailures?: number;
  lastError?: string;
  totalPostsCollected?: number;
  totalCommentsCollected?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Alias for new API naming
export type ScrapeSource = LinkedInProfile;

// ============================================
// Item Types (Previously Post)
// ============================================

export interface ItemAuthor {
  name: string;
  platformId?: string;
  url?: string;
  metadata?: {
    headline?: string;
    avatarUrl?: string;
  };
  // Legacy fields
  headline?: string;
  profileUrl?: string;
  avatarUrl?: string;
  isOriginalPoster?: boolean;
}

export interface ItemContent {
  body: string;
  preview?: string;
  mediaType?: string;
}

export interface ItemEngagement {
  likes?: number;
  comments?: number;
  shares?: number;
  // Legacy fields
  reactions?: number;
  reposts?: number;
  views?: number;
}

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
  // New API fields
  sourceId?: string;
  platform?: ScrapingPlatform;
  itemType?: ItemType;
  platformItemId?: string;
  url?: string;
  author: ItemAuthor | LinkedInPostAuthor;
  content: string | ItemContent;
  status?: ItemStatus;
  engagement: ItemEngagement | LinkedInPostEngagement;
  // Legacy fields
  profileId?: string | LinkedInProfile;
  linkedinUrn?: string;
  postUrl?: string;
  contentPreview?: string;
  activityType?: LinkedInActivityType;
  mediaType?: LinkedInMediaType;
  mediaUrls?: string[];
  linkedinTimestamp?: string;
  estimatedPostDate?: string;
  engagementHistory?: Array<{
    timestamp: string;
    likes: number;
    comments: number;
    reposts: number;
  }>;
  engagementVelocity?: number;
  peakVelocity?: number;
  isTrending?: boolean;
  commentsCollected?: number;
  topComments?: LinkedInPostComment[];
  actionStatus?: LinkedInActionStatus;
  actionNotes?: string;
  actionTicketId?: string;
  actionedAt?: string;
  actionedBy?: string;
  screenshotPath?: string;
  firstSeenAt?: string;
  lastScrapedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Alias for new API naming
export type ScrapedItem = LinkedInPost;

// ============================================
// Session Types
// ============================================

export interface LinkedInSessionResults {
  postsFound: number;
  newPosts: number;
  updatedPosts: number;
  skippedPosts: number;
  commentsCollected: number;
  profilesDiscovered?: number;
  // New API fields
  itemsFound?: number;
  newItems?: number;
  updatedItems?: number;
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
  // New API fields
  platform?: ScrapingPlatform;
  sourceId?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Stats Types (New API Structure)
// ============================================

export interface PlatformStats {
  sources: number;
  items: number;
  lastScrapedAt?: string;
}

export interface LinkedInStats {
  // New API structure
  overview?: {
    totalSources: number;
    totalItems: number;
    totalScrapers: number;
    activeSessions: number;
  };
  byPlatform?: Record<ScrapingPlatform, PlatformStats>;
  recentActivity?: {
    itemsLast24h: number;
    sessionsLast24h: number;
    errorsLast24h: number;
  };
  scraperStatus?: {
    online: number;
    offline: number;
    error: number;
  };
  // Legacy structure (still populated for backwards compat)
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

// Alias for new API naming
export type ScrapingStats = LinkedInStats;

export interface LinkedInTimelineEntry {
  _id: string;
  total: number;
  successful: number;
  failed: number;
  postsFound: number;
  newPosts: number;
  // New API fields
  itemsFound?: number;
  newItems?: number;
}

export interface LinkedInEngagementStats {
  topByVelocity: LinkedInPost[];
  topByTotal: LinkedInPost[];
}

// ============================================
// Connection Code Response
// ============================================

export interface LinkedInConnectionCode {
  code: string;
  expiresAt: string;
  expiresInSeconds: number;
}

// ============================================
// Filter Types
// ============================================

export interface LinkedInProfileFilters {
  clientId?: string;
  profileType?: LinkedInProfileType;
  monitoringEnabled?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  // New API filters
  platform?: ScrapingPlatform;
  sourceType?: SourceType;
  status?: SourceStatus;
  priority?: LinkedInPriority;
}

// Alias for new API naming
export type SourceFilters = LinkedInProfileFilters;

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
  // New API filters
  sourceId?: string;
  platform?: ScrapingPlatform;
  itemType?: ItemType;
  status?: ItemStatus;
}

// Alias for new API naming
export type ItemFilters = LinkedInPostFilters;

export interface LinkedInSessionFilters {
  profileId?: string;
  scraperId?: string;
  status?: LinkedInSessionStatus;
  targetType?: LinkedInTargetType;
  triggerType?: LinkedInTriggerType;
  page?: number;
  limit?: number;
  // New API filters
  sourceId?: string;
  platform?: ScrapingPlatform;
}

// ============================================
// Request DTOs
// ============================================

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
  // New API fields
  platform?: ScrapingPlatform;
  sourceType?: SourceType;
  name?: string;
  scrapeSettings?: ScrapeSettings;
}

// Alias for new API naming
export type CreateSourceDto = AddLinkedInProfileDto;

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
  // New API fields
  name?: string;
  status?: SourceStatus;
  scrapeSettings?: ScrapeSettings;
}

// Alias for new API naming
export type UpdateSourceDto = UpdateLinkedInProfileDto;

export interface UpdateLinkedInScraperSettingsDto {
  scrapingMode?: LinkedInScrapingMode;
  maxPostsPerScrape?: number;
  enableCommentScraping?: boolean;
  enableScreenshots?: boolean;
}

export interface UpdateLinkedInPostActionDto {
  status: LinkedInActionStatus | ItemStatus;
  notes?: string;
  ticketId?: string;
}

// Alias for new API naming
export type UpdateItemActionDto = UpdateLinkedInPostActionDto;

// ============================================
// Response Types
// ============================================

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

// ============================================
// Organization Feature Flag
// ============================================

export interface LinkedInFeatureConfig {
  enabled: boolean;
  enabledAt?: string;
  maxProfiles?: number;
  maxScrapers?: number;
}

// ============================================
// Error Codes
// ============================================

export type LinkedInErrorCode =
  | 'LINKEDIN_FEATURE_DISABLED'
  | 'ORGANIZATION_REQUIRED'
  | 'SCRAPER_NOT_FOUND'
  | 'PROFILE_NOT_FOUND'
  | 'SOURCE_NOT_FOUND'
  | 'POST_NOT_FOUND'
  | 'ITEM_NOT_FOUND'
  | 'MAX_SCRAPERS_REACHED'
  | 'MAX_PROFILES_REACHED'
  | 'MAX_SOURCES_REACHED'
  | 'INVALID_LINKEDIN_URL'
  | 'INVALID_URL'
  | 'PROFILE_ALREADY_EXISTS'
  | 'SOURCE_ALREADY_EXISTS'
  | 'NO_ONLINE_SCRAPER'
  | 'CONNECTION_CODE_EXPIRED'
  | 'CONNECTION_CODE_INVALID';

// ============================================
// Helper Functions for Data Mapping
// ============================================

/**
 * Maps new API scraper response to component-expected format
 */
export function mapScraperResponse(scraper: LinkedInScraper): LinkedInScraper {
  return {
    ...scraper,
    // Map new API fields to legacy field names for component compatibility
    platform: scraper.agentType as any || scraper.platform,
    // Set isOnlineNow based on status field from new API
    isOnlineNow: scraper.isOnlineNow ?? (scraper.status === 'online'),
    cookiesValid: scraper.platformCredentials?.linkedin?.cookiesValid ?? scraper.cookiesValid,
    linkedInAccountEmail: scraper.platformCredentials?.linkedin?.accountEmail ?? scraper.linkedInAccountEmail,
    totalPostsScraped: scraper.stats?.totalItemsScraped ?? scraper.totalPostsScraped,
    totalScrapeCommands: scraper.stats?.totalCommands ?? scraper.totalScrapeCommands,
  };
}

/**
 * Maps new API source response to component-expected format
 */
export function mapSourceResponse(source: LinkedInProfile): LinkedInProfile {
  return {
    ...source,
    // Map new API fields to legacy field names
    displayName: source.name ?? source.displayName,
    headline: source.metadata?.headline ?? source.headline,
    avatarUrl: source.metadata?.avatarUrl ?? source.avatarUrl,
    lastScrapedAt: source.stats?.lastScrapedAt ?? source.lastScrapedAt,
    totalPostsCollected: source.stats?.totalItemsScraped ?? source.totalPostsCollected,
    monitoringEnabled: source.status === 'active' ? true : source.status === 'paused' ? false : source.monitoringEnabled,
  };
}

/**
 * Maps new API item response to component-expected format
 */
export function mapItemResponse(item: LinkedInPost): LinkedInPost {
  const content = typeof item.content === 'object' ? item.content : null;
  const engagement = item.engagement as ItemEngagement;
  
  return {
    ...item,
    // Map new API fields to legacy field names
    postUrl: item.url ?? item.postUrl,
    linkedinUrn: item.platformItemId ?? item.linkedinUrn,
    content: content?.body ?? (item.content as string),
    contentPreview: content?.preview ?? item.contentPreview,
    profileId: item.sourceId ?? item.profileId,
    actionStatus: (item.status as LinkedInActionStatus) ?? item.actionStatus,
    engagement: {
      reactions: engagement?.likes ?? (item.engagement as LinkedInPostEngagement)?.reactions ?? 0,
      comments: engagement?.comments ?? (item.engagement as LinkedInPostEngagement)?.comments ?? 0,
      reposts: engagement?.shares ?? (item.engagement as LinkedInPostEngagement)?.reposts ?? 0,
      views: (item.engagement as LinkedInPostEngagement)?.views,
    },
  };
}

/**
 * Maps new API stats response to component-expected format
 */
export function mapStatsResponse(stats: LinkedInStats): LinkedInStats {
  if (stats.overview) {
    // New API format - map to legacy structure
    const linkedinStats = stats.byPlatform?.linkedin;
    return {
      ...stats,
      scrapers: stats.scrapers ?? {
        total: stats.overview.totalScrapers,
        online: stats.scraperStatus?.online ?? 0,
        offline: stats.scraperStatus?.offline ?? 0,
        withValidCookies: 0,
      },
      profiles: stats.profiles ?? {
        total: linkedinStats?.sources ?? stats.overview.totalSources,
        active: linkedinStats?.sources ?? 0,
        paused: 0,
      },
      posts: stats.posts ?? {
        total: linkedinStats?.items ?? stats.overview.totalItems,
        last24Hours: stats.recentActivity?.itemsLast24h ?? 0,
        last7Days: 0,
        trending: 0,
        pendingAction: 0,
      },
      sessions: stats.sessions ?? {
        last24Hours: stats.recentActivity?.sessionsLast24h ?? 0,
        successful: 0,
        failed: stats.recentActivity?.errorsLast24h ?? 0,
        successRate: 0,
      },
    };
  }
  return stats;
}
