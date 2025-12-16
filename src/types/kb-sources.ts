// ============================================
// Knowledge Base Sources Types
// ============================================

// Source Types
export type KBSourceType = 'hubspot_kb' | 'zendesk' | 'confluence' | 'custom_sitemap';
export type SyncStatus = 'success' | 'partial' | 'failed' | 'never';
export type UrlSyncStatus = 'pending' | 'synced' | 'failed' | 'deleted';

// Knowledge Base Source
export interface KnowledgeBaseSource {
  _id: string;
  client: string;
  name: string;
  sourceType: KBSourceType;
  sitemapUrl: string;
  baseUrl?: string;
  category: string;

  // Content extraction settings (advanced)
  contentSelectors?: string[];
  excludeSelectors?: string[];

  // Sync settings
  syncEnabled: boolean;
  syncIntervalHours: number;
  lastSyncAt?: string;
  lastSyncStatus: SyncStatus;
  lastSyncError?: string;
  lastSyncDurationMs?: number;

  // Stats
  totalUrls: number;
  syncedUrls: number;
  failedUrls: number;
  pendingUrls: number;

  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Source with detailed stats (from GET /:sourceId)
export interface KnowledgeBaseSourceWithStats extends KnowledgeBaseSource {
  stats: {
    totalUrls: number;
    syncedUrls: number;
    failedUrls: number;
    pendingUrls: number;
    deletedUrls: number;
    lastSyncAt?: string;
    lastSyncStatus: SyncStatus;
    avgSyncDurationMs?: number;
  };
}

// Synced URL
export interface SyncedUrl {
  _id: string;
  url: string;
  status: UrlSyncStatus;
  lastmod?: string;
  lastSyncedAt?: string;
  lastSyncError?: string;
  title?: string;
  wordCount?: number;
  discoveredAt?: string;
  syncAttempts?: number;
}

// Sync History Entry (for activity feed)
export interface SyncHistoryEntry {
  _id: string;
  source: string;
  syncType: 'scheduled' | 'manual';
  triggeredBy?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  startedAt: string;
  completedAt: string;
  durationMs: number;
  status: 'success' | 'partial' | 'failed';
  errorMessage?: string;
  discoveryStats: {
    totalUrlsInSitemap: number;
    newUrls: number;
    updatedUrls: number;
    deletedUrls: number;
    unchangedUrls: number;
  };
  syncStats: {
    urlsProcessed: number;
    urlsSynced: number;
    urlsFailed: number;
    urlsDeleted: number;
  };
  failedUrls: Array<{ url: string; error: string }>;
  createdAt: string;
}

// ============================================
// Sync Job Types (for async polling-based progress)
// ============================================

// Sync Job Started Response (from POST /sync)
export interface SyncJobStarted {
  jobId: string;
  sourceId: string;
  sourceName: string;
}

// Sync Job Progress (from GET /sync-status/:jobId)
export interface SyncJobProgress {
  phase: 'discovery' | 'syncing' | 'complete' | 'failed';
  message: string;
  // Discovery phase
  totalUrlsInSitemap?: number;
  newUrls?: number;
  updatedUrls?: number;
  deletedUrls?: number;
  // Sync phase
  urlsToProcess?: number;
  urlsProcessed?: number;
  urlsSynced?: number;
  urlsFailed?: number;
  urlsDeleted?: number;
  currentUrl?: string;
  // Completion
  durationMs?: number;
  error?: string;
}

// Sync Job Status (from GET /sync-status/:jobId)
export interface SyncJobStatus {
  id: string;
  state: 'waiting' | 'active' | 'completed' | 'failed';
  progress: SyncJobProgress | null;
  result: SyncJobResult | null;
  failedReason?: string;
}

// Sync Job Result (when state === 'completed')
export interface SyncJobResult {
  sourceId: string;
  sourceName: string;
  success: boolean;

  discovery: {
    totalUrlsInSitemap: number;
    newUrls: number;
    updatedUrls: number;
    deletedUrls: number;
    unchangedUrls: number;
  };

  urlsProcessed: number;
  urlsSynced: number;
  urlsFailed: number;
  urlsDeleted: number;
  durationMs: number;

  errors: Array<{ url: string; error: string }>;
}

// Test Connection Result
export interface TestConnectionResult {
  success: boolean;
  urlCount?: number;
  error?: string;
}

// ============================================
// Input Types
// ============================================

// Create Source Input
export interface CreateKBSourceInput {
  name: string;
  sourceType: KBSourceType;
  sitemapUrl: string;
  baseUrl?: string;
  category: string;
  syncIntervalHours?: number;
  // Advanced options (optional)
  contentSelectors?: string[];
  excludeSelectors?: string[];
}

// Update Source Input
export interface UpdateKBSourceInput {
  name?: string;
  sitemapUrl?: string;
  baseUrl?: string;
  category?: string;
  syncEnabled?: boolean;
  syncIntervalHours?: number;
  contentSelectors?: string[];
  excludeSelectors?: string[];
}

// Create Source Response (includes discovered URLs and sync job)
export interface CreateSourceResponse {
  source: KnowledgeBaseSource;
  discovery: {
    totalUrls: number;
    urls: Array<{ url: string; lastmod?: string }>;
  };
  syncJob: {
    jobId: string;
    message: string;
  };
}

// ============================================
// Filter Types
// ============================================

export interface KBSourcesFilters {
  page?: number;
  limit?: number;
  includeInactive?: boolean;
}

export interface SyncedUrlsFilters {
  page?: number;
  limit?: number;
  status?: UrlSyncStatus;
}

export interface SyncHistoryFilters {
  page?: number;
  limit?: number;
}

// ============================================
// Response Types
// ============================================

export interface PaginatedKBSourcesResponse {
  data: KnowledgeBaseSource[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface PaginatedSyncedUrlsResponse {
  data: SyncedUrl[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface PaginatedSyncHistoryResponse {
  data: SyncHistoryEntry[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// ============================================
// Constants
// ============================================

export const KB_SOURCE_TYPES: Array<{
  value: KBSourceType;
  label: string;
  enabled: boolean;
  description: string;
}> = [
  {
    value: 'hubspot_kb',
    label: 'HubSpot Knowledge Base',
    enabled: true,
    description: 'Sync articles from a HubSpot Knowledge Base sitemap',
  },
  {
    value: 'custom_sitemap',
    label: 'Custom Sitemap',
    enabled: true,
    description: 'Sync pages from any XML sitemap',
  },
  {
    value: 'zendesk',
    label: 'Zendesk',
    enabled: false,
    description: 'Coming soon',
  },
  {
    value: 'confluence',
    label: 'Confluence',
    enabled: false,
    description: 'Coming soon',
  },
];

export const SYNC_INTERVAL_OPTIONS = [
  { value: 2, label: 'Every 2 hours' },
  { value: 4, label: 'Every 4 hours' },
  { value: 6, label: 'Every 6 hours' },
  { value: 12, label: 'Every 12 hours' },
  { value: 24, label: 'Every 24 hours' },
];

