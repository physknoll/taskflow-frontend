// ============================================
// Multi-Platform Scraping Schedule Types
// ============================================

// Platform Types
export type ScrapingPlatform = 'linkedin' | 'reddit' | 'website';
export type ScrapingPriority = 'low' | 'normal' | 'high';
export type ScheduleRunStatus = 'never' | 'success' | 'partial' | 'failed';
export type QueuedCommandStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'expired' | 'cancelled';

// ============================================
// Retry Settings
// ============================================

export interface ScrapeRetrySettings {
  maxRetries: number;
  retryDelayMinutes: number;
  exponentialBackoff: boolean;
  retryOnReconnect: boolean;
}

// ============================================
// Platform-Specific Settings
// ============================================

export interface LinkedInTargetSettings {
  maxPosts: number;
  activityTypes: ('posts' | 'comments' | 'reposts' | 'articles')[];
  enableComments?: boolean;
  enableScreenshots?: boolean;
  scrapingMode?: 'conservative' | 'balanced' | 'aggressive';
}

export interface RedditTargetSettings {
  subreddit: string;
  sortBy: 'hot' | 'new' | 'top' | 'rising';
  timeRange: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all';
  maxPosts: number;
  includeComments?: boolean;
  maxCommentsPerPost?: number;
}

export interface WebsiteTargetSettings {
  selectors: {
    articleList?: string;
    title?: string;
    content?: string;
    date?: string;
    author?: string;
    link?: string;
  };
  waitForSelector?: string;
  scrollDepth?: number;
  maxPages?: number;
  followPagination?: boolean;
  paginationSelector?: string;
}

export type ScrapeTargetSettings = 
  | LinkedInTargetSettings 
  | RedditTargetSettings 
  | WebsiteTargetSettings;

// ============================================
// Schedule Types
// ============================================

export interface ScrapeSchedule {
  _id: string;
  organizationId: string;
  name: string;
  description?: string;
  cronExpression: string;
  timezone: string;
  enabled: boolean;
  retrySettings: ScrapeRetrySettings;
  nextRunAt?: string;
  lastRunAt?: string;
  lastRunStatus: ScheduleRunStatus;
  totalRuns: number;
  targetCount?: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Target Types
// ============================================

export interface ScrapeTarget {
  _id: string;
  scheduleId: string;
  organizationId: string;
  platform: ScrapingPlatform;
  url: string;
  targetName: string;
  linkedInProfileId?: string;
  settings: ScrapeTargetSettings;
  priority: ScrapingPriority;
  enabled: boolean;
  lastScrapedAt?: string;
  consecutiveFailures: number;
  totalScrapes: number;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Command Queue Types
// ============================================

export interface QueuedCommand {
  _id: string;
  organizationId: string;
  platform: ScrapingPlatform;
  status: QueuedCommandStatus;
  retryCount: number;
  maxRetries: number;
  nextRetryAt?: string;
  queuedAt: string;
  startedAt?: string;
  completedAt?: string;
  error?: string;
  targetId: {
    _id: string;
    targetName: string;
    url: string;
  };
  scheduleId: {
    _id: string;
    name: string;
  };
}

export interface QueueStatus {
  pending: number;
  inProgress: number;
  failed: number;
  byPlatform: Record<ScrapingPlatform, number>;
}

export interface QueueStats {
  pending: number;
  inProgress: number;
  failed: number;
  byPlatform: Record<ScrapingPlatform, number>;
  recentFailed: QueuedCommand[];
  oldestPendingAt?: string;
}

// ============================================
// Filter Types
// ============================================

export interface ScrapeScheduleFilters {
  enabled?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface QueueFilters {
  platform?: ScrapingPlatform;
  status?: QueuedCommandStatus;
  limit?: number;
}

// ============================================
// Request DTOs
// ============================================

export interface CreateScrapeTargetDto {
  platform: ScrapingPlatform;
  url: string;
  targetName: string;
  linkedInProfileId?: string;
  settings: ScrapeTargetSettings;
  priority?: ScrapingPriority;
}

export interface CreateScrapeScheduleDto {
  name: string;
  description?: string;
  cronExpression: string;
  timezone?: string;
  retrySettings?: Partial<ScrapeRetrySettings>;
  targets?: CreateScrapeTargetDto[];
}

export interface UpdateScrapeScheduleDto {
  name?: string;
  description?: string;
  cronExpression?: string;
  timezone?: string;
  enabled?: boolean;
  retrySettings?: Partial<ScrapeRetrySettings>;
}

export interface UpdateScrapeTargetDto {
  targetName?: string;
  settings?: Partial<ScrapeTargetSettings>;
  priority?: ScrapingPriority;
  enabled?: boolean;
}

// ============================================
// Response Types
// ============================================

export interface ScrapeScheduleWithTargets {
  schedule: ScrapeSchedule;
  targets: ScrapeTarget[];
}

export interface CreateScheduleResponse {
  schedule: ScrapeSchedule;
  targets: ScrapeTarget[];
}

export interface TriggerScheduleResponse {
  scheduleId: string;
  scheduleName: string;
  targetsProcessed: number;
  commandsSent: number;
  commandsQueued: number;
  errors: string[];
}

export interface QueueResponse {
  status: QueueStatus;
  commands: QueuedCommand[];
}

// ============================================
// Cron Presets
// ============================================

export interface CronPreset {
  label: string;
  expression: string;
  description: string;
}

export const CRON_PRESETS: CronPreset[] = [
  { label: 'Every hour', expression: '0 * * * *', description: 'At minute 0 of every hour' },
  { label: 'Every 4 hours', expression: '0 */4 * * *', description: 'At minute 0 past every 4th hour' },
  { label: 'Daily at 9am', expression: '0 9 * * *', description: 'At 9:00 AM every day' },
  { label: 'Weekdays at 9am', expression: '0 9 * * 1-5', description: 'At 9:00 AM Monday through Friday' },
  { label: 'Twice daily (9am & 5pm)', expression: '0 9,17 * * *', description: 'At 9:00 AM and 5:00 PM' },
  { label: 'Every Monday at 9am', expression: '0 9 * * 1', description: 'At 9:00 AM every Monday' },
  { label: 'First of month', expression: '0 0 1 * *', description: 'At midnight on the 1st of each month' },
];

// ============================================
// Platform Helpers
// ============================================

export const PLATFORM_LABELS: Record<ScrapingPlatform, string> = {
  linkedin: 'LinkedIn',
  reddit: 'Reddit',
  website: 'Website',
};

export const PLATFORM_COLORS: Record<ScrapingPlatform, string> = {
  linkedin: '#0A66C2',
  reddit: '#FF4500',
  website: '#6B7280',
};

export const DEFAULT_RETRY_SETTINGS: ScrapeRetrySettings = {
  maxRetries: 5,
  retryDelayMinutes: 60,
  exponentialBackoff: true,
  retryOnReconnect: true,
};

export const DEFAULT_LINKEDIN_SETTINGS: LinkedInTargetSettings = {
  maxPosts: 20,
  activityTypes: ['posts', 'articles'],
  enableComments: true,
  scrapingMode: 'balanced',
};

export const DEFAULT_REDDIT_SETTINGS: RedditTargetSettings = {
  subreddit: '',
  sortBy: 'hot',
  timeRange: 'day',
  maxPosts: 25,
  includeComments: true,
  maxCommentsPerPost: 10,
};

export const DEFAULT_WEBSITE_SETTINGS: WebsiteTargetSettings = {
  selectors: {},
  scrollDepth: 3,
  maxPages: 5,
  followPagination: false,
};
