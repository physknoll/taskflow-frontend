'use client';

import { useState } from 'react';
import { useScrapeSessions, useScrapeSessionDetails, useScrapeSessionItems, useScrapeSessionLogs } from '@/hooks/useScraping';
import { useLinkedInScrapers, useLinkedInProfiles } from '@/hooks/useLinkedIn';
import { scrapingService } from '@/services/scraping.service';
import { SessionsTable } from './SessionsTable';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import type { ScrapeSession, ScrapeSessionStatus, SessionLog, ScrapedItem } from '@/types/scraping';
import {
  Activity,
  RefreshCw,
  X,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  LayoutGrid,
  List,
  Image as ImageIcon,
  ScrollText,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Info,
  Bug,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

const statusOptions: { value: ScrapeSessionStatus | ''; label: string }[] = [
  { value: '', label: 'All Status' },
  { value: 'success', label: 'Success' },
  { value: 'partial', label: 'Partial' },
  { value: 'failed', label: 'Failed' },
  { value: 'timeout', label: 'Timeout' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'pending', label: 'Pending' },
];

const triggerTypeOptions: { value: 'scheduled' | 'manual' | 'retry' | ''; label: string }[] = [
  { value: '', label: 'All Triggers' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'manual', label: 'Manual' },
  { value: 'retry', label: 'Retry' },
];

// Log level styling
const logLevelConfig = {
  info: { icon: Info, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  warn: { icon: AlertTriangle, color: 'text-warning-500', bg: 'bg-warning-50 dark:bg-warning-900/20' },
  error: { icon: XCircle, color: 'text-error-500', bg: 'bg-error-50 dark:bg-error-900/20' },
  debug: { icon: Bug, color: 'text-surface-400', bg: 'bg-surface-50 dark:bg-surface-800' },
};

// Session detail tabs
type DetailTab = 'overview' | 'logs' | 'items' | 'screenshots';

export function SessionsTab() {
  const { scrapers } = useLinkedInScrapers();
  const { profiles } = useLinkedInProfiles({ limit: 100 });

  const [status, setStatus] = useState<ScrapeSessionStatus | ''>('');
  const [triggerType, setTriggerType] = useState<'scheduled' | 'manual' | 'retry' | ''>('');
  const [scraperId, setScraperId] = useState('');
  const [sourceId, setSourceId] = useState('');
  const [selectedSession, setSelectedSession] = useState<ScrapeSession | null>(null);
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');
  const [detailTab, setDetailTab] = useState<DetailTab>('overview');

  const {
    sessions,
    pagination,
    isLoading,
    refetch,
  } = useScrapeSessions({
    status: status || undefined,
    triggerType: triggerType || undefined,
    scraperId: scraperId || undefined,
    sourceId: sourceId || undefined,
    page,
    limit: 20,
  });

  // Fetch session details when a session is selected
  const { data: sessionDetails, isLoading: detailsLoading } = useScrapeSessionDetails(
    selectedSession?._id || ''
  );

  // Fetch session items
  const { data: sessionItemsData, isLoading: itemsLoading } = useScrapeSessionItems(
    selectedSession?._id || '',
    1,
    50
  );

  // Fetch session logs
  const { data: sessionLogs, isLoading: logsLoading } = useScrapeSessionLogs(
    selectedSession?._id || '',
    100
  );

  const clearFilters = () => {
    setStatus('');
    setTriggerType('');
    setScraperId('');
    setSourceId('');
    setPage(1);
  };

  const hasFilters = status || triggerType || scraperId || sourceId;

  const getStatusSummary = () => {
    const successCount = sessions.filter((s) => s.status === 'success').length;
    const failedCount = sessions.filter((s) => s.status === 'failed' || s.status === 'timeout').length;
    const inProgressCount = sessions.filter((s) => s.status === 'in_progress' || s.status === 'pending' || s.status === 'sent').length;
    return { successCount, failedCount, inProgressCount };
  };

  const { successCount, failedCount, inProgressCount } = getStatusSummary();

  const handleViewDetails = (session: ScrapeSession) => {
    setSelectedSession(session);
    setDetailTab('overview');
  };

  const renderLogEntry = (log: SessionLog) => {
    const config = logLevelConfig[log.level] || logLevelConfig.info;
    const LogIcon = config.icon;

    return (
      <div
        key={log._id}
        className={`flex items-start gap-3 p-3 rounded-lg ${config.bg}`}
      >
        <LogIcon className={`h-4 w-4 mt-0.5 flex-shrink-0 ${config.color}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-medium uppercase ${config.color}`}>
              {log.level}
            </span>
            {log.event && (
              <Badge variant="secondary" size="sm">
                {log.event}
              </Badge>
            )}
            <span className="text-xs text-surface-400 ml-auto">
              {format(new Date(log.timestamp), 'HH:mm:ss.SSS')}
            </span>
          </div>
          <p className="text-sm text-surface-700 dark:text-surface-300">
            {log.message}
          </p>
          {log.metadata && Object.keys(log.metadata).length > 0 && (
            <pre className="mt-2 text-xs text-surface-500 bg-surface-100 dark:bg-surface-900 p-2 rounded overflow-x-auto">
              {JSON.stringify(log.metadata, null, 2)}
            </pre>
          )}
        </div>
      </div>
    );
  };

  const renderItemCard = (item: ScrapedItem) => {
    return (
      <div
        key={item._id}
        className="p-4 border border-surface-200 dark:border-surface-700 rounded-lg hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors"
      >
        <div className="flex items-start gap-3">
          {item.screenshotPath && (
            <img
              src={scrapingService.getSessionScreenshotUrl(selectedSession?._id || '', item.screenshotPath)}
              alt="Item screenshot"
              className="w-20 h-14 object-cover rounded border border-surface-200 dark:border-surface-700"
            />
          )}
          <div className="flex-1 min-w-0">
            {item.author && (
              <div className="flex items-center gap-2 mb-1">
                {item.author.avatarUrl && (
                  <img
                    src={item.author.avatarUrl}
                    alt={item.author.name}
                    className="w-5 h-5 rounded-full"
                  />
                )}
                <span className="text-sm font-medium text-surface-900 dark:text-white">
                  {item.author.name}
                </span>
                {item.author.headline && (
                  <span className="text-xs text-surface-500 truncate">
                    • {item.author.headline}
                  </span>
                )}
              </div>
            )}
            <p className="text-sm text-surface-700 dark:text-surface-300 line-clamp-2">
              {item.contentPreview || item.content}
            </p>
            {item.engagement && (
              <div className="flex items-center gap-3 mt-2 text-xs text-surface-500">
                {item.engagement.likes !== undefined && (
                  <span>{item.engagement.likes} likes</span>
                )}
                {item.engagement.comments !== undefined && (
                  <span>{item.engagement.comments} comments</span>
                )}
                {item.engagement.shares !== undefined && (
                  <span>{item.engagement.shares} shares</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Status Summary */}
      <div className="flex items-center gap-6 p-4 bg-surface-50 dark:bg-surface-800 rounded-lg">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-success-500" />
          <span className="font-medium">{successCount}</span>
          <span className="text-sm text-surface-500">Successful</span>
        </div>
        <div className="flex items-center gap-2">
          <XCircle className="h-5 w-5 text-error-500" />
          <span className="font-medium">{failedCount}</span>
          <span className="text-sm text-surface-500">Failed</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary-500" />
          <span className="font-medium">{inProgressCount}</span>
          <span className="text-sm text-surface-500">In Progress</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-surface-800 rounded-lg border border-surface-200 dark:border-surface-700 p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Status */}
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as ScrapeSessionStatus | '');
              setPage(1);
            }}
            className="px-4 py-2 rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Trigger Type */}
          <select
            value={triggerType}
            onChange={(e) => {
              setTriggerType(e.target.value as 'scheduled' | 'manual' | 'retry' | '');
              setPage(1);
            }}
            className="px-4 py-2 rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {triggerTypeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Scraper */}
          <select
            value={scraperId}
            onChange={(e) => {
              setScraperId(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Scrapers</option>
            {scrapers.map((scraper) => (
              <option key={scraper._id} value={scraper._id}>
                {scraper.name}
              </option>
            ))}
          </select>

          {/* Source */}
          <select
            value={sourceId}
            onChange={(e) => {
              setSourceId(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Sources</option>
            {profiles.map((profile) => (
              <option key={profile._id} value={profile._id}>
                {profile.name || profile.displayName}
              </option>
            ))}
          </select>

          {/* Clear Filters */}
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}

          {/* View Toggle */}
          <div className="flex items-center border border-surface-300 dark:border-surface-600 rounded-lg overflow-hidden ml-auto">
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 transition-colors ${
                viewMode === 'table'
                  ? 'bg-primary-500 text-white'
                  : 'bg-white dark:bg-surface-800 text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-700'
              }`}
              title="Table View"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-2 transition-colors ${
                viewMode === 'cards'
                  ? 'bg-primary-500 text-white'
                  : 'bg-white dark:bg-surface-800 text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-700'
              }`}
              title="Card View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>

          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Sessions List */}
      {isLoading ? (
        viewMode === 'table' ? (
          <div className="bg-white dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700 p-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} variant="rounded" height={48} className="mb-2" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} variant="rounded" height={200} />
            ))}
          </div>
        )
      ) : sessions.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-surface-800 rounded-xl">
          <Activity className="h-12 w-12 mx-auto mb-4 text-surface-400" />
          <h3 className="text-lg font-medium text-surface-900 dark:text-white mb-2">
            {hasFilters ? 'No sessions match your filters' : 'No scrape sessions yet'}
          </h3>
          <p className="text-surface-500 dark:text-surface-400 mb-4 max-w-md mx-auto">
            {hasFilters
              ? 'Try adjusting your filters.'
              : 'Sessions will appear here once your scrapers start running.'}
          </p>
        </div>
      ) : viewMode === 'table' ? (
        <SessionsTable sessions={sessions} onViewDetails={handleViewDetails} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map((session) => (
            <div
              key={session._id}
              onClick={() => handleViewDetails(session)}
              className="bg-white dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700 p-4 cursor-pointer hover:border-primary-500 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <Badge
                  variant={
                    session.status === 'success'
                      ? 'success'
                      : session.status === 'failed' || session.status === 'timeout'
                      ? 'danger'
                      : session.status === 'in_progress'
                      ? 'default'
                      : 'secondary'
                  }
                >
                  {session.status.replace('_', ' ')}
                </Badge>
                <span className="text-xs text-surface-500">
                  {formatDistanceToNow(new Date(session.createdAt), { addSuffix: true })}
                </span>
              </div>
              <p className="font-medium text-surface-900 dark:text-white truncate mb-1">
                {session.targetUrl.replace(/https?:\/\/(www\.)?/, '').split('/')[0]}
              </p>
              {session.results && (
                <div className="flex items-center gap-2 text-xs text-surface-500">
                  <span className="text-success-500">+{session.results.newItems} new</span>
                  <span>•</span>
                  <span>{session.results.itemsFound} found</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-surface-600 dark:text-surface-400">
            Page {page} of {pagination.pages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
            disabled={page === pagination.pages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Session Detail Modal */}
      <Modal
        isOpen={!!selectedSession}
        onClose={() => setSelectedSession(null)}
        title="Session Details"
        size="xl"
      >
        {selectedSession && (
          <div className="space-y-6">
            {/* Tabs */}
            <div className="flex items-center border-b border-surface-200 dark:border-surface-700">
              {(['overview', 'logs', 'items', 'screenshots'] as DetailTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setDetailTab(tab)}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    detailTab === tab
                      ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
                  }`}
                >
                  {tab === 'overview' && <FileText className="h-4 w-4 inline mr-2" />}
                  {tab === 'logs' && <ScrollText className="h-4 w-4 inline mr-2" />}
                  {tab === 'items' && <List className="h-4 w-4 inline mr-2" />}
                  {tab === 'screenshots' && <ImageIcon className="h-4 w-4 inline mr-2" />}
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  {tab === 'logs' && sessionLogs && (
                    <Badge variant="secondary" size="sm" className="ml-2">
                      {sessionLogs.length}
                    </Badge>
                  )}
                  {tab === 'items' && sessionItemsData && (
                    <Badge variant="secondary" size="sm" className="ml-2">
                      {sessionItemsData.pagination?.total || sessionItemsData.items?.length || 0}
                    </Badge>
                  )}
                  {tab === 'screenshots' && sessionDetails && (
                    <Badge variant="secondary" size="sm" className="ml-2">
                      {sessionDetails.screenshotCount || 0}
                    </Badge>
                  )}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {detailTab === 'overview' && (
              <div className="space-y-6">
                {/* Overview Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-surface-500">Target</p>
                    <p className="font-medium truncate">{selectedSession.targetUrl}</p>
                  </div>
                  <div>
                    <p className="text-sm text-surface-500">Scraper</p>
                    <p className="font-medium">{selectedSession.scraperName || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-surface-500">Status</p>
                    <Badge
                      variant={
                        selectedSession.status === 'success'
                          ? 'success'
                          : selectedSession.status === 'failed' || selectedSession.status === 'timeout'
                          ? 'danger'
                          : 'default'
                      }
                    >
                      {selectedSession.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-surface-500">Duration</p>
                    <p className="font-medium">
                      {selectedSession.durationMs
                        ? `${(selectedSession.durationMs / 1000).toFixed(1)}s`
                        : 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Timestamps */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-surface-50 dark:bg-surface-700/50 rounded-lg">
                  <div>
                    <p className="text-xs text-surface-500">Created</p>
                    <p className="text-sm font-medium">
                      {format(new Date(selectedSession.createdAt), 'MMM d, h:mm a')}
                    </p>
                  </div>
                  {selectedSession.startedAt && (
                    <div>
                      <p className="text-xs text-surface-500">Started</p>
                      <p className="text-sm font-medium">
                        {format(new Date(selectedSession.startedAt), 'MMM d, h:mm a')}
                      </p>
                    </div>
                  )}
                  {selectedSession.completedAt && (
                    <div>
                      <p className="text-xs text-surface-500">Completed</p>
                      <p className="text-sm font-medium">
                        {format(new Date(selectedSession.completedAt), 'MMM d, h:mm a')}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-surface-500">Trigger</p>
                    <p className="text-sm font-medium capitalize">{selectedSession.triggerType || 'Unknown'}</p>
                  </div>
                </div>

                {/* Results */}
                {selectedSession.results && (
                  <div>
                    <h4 className="font-semibold mb-3">Results</h4>
                    <div className="grid grid-cols-4 gap-4 p-4 bg-success-50 dark:bg-success-900/20 rounded-lg">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-success-700 dark:text-success-400">
                          {selectedSession.results.itemsFound}
                        </p>
                        <p className="text-xs text-success-600 dark:text-success-500">Found</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-success-700 dark:text-success-400">
                          {selectedSession.results.newItems}
                        </p>
                        <p className="text-xs text-success-600 dark:text-success-500">New</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-success-700 dark:text-success-400">
                          {selectedSession.results.updatedItems || 0}
                        </p>
                        <p className="text-xs text-success-600 dark:text-success-500">Updated</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-success-700 dark:text-success-400">
                          {selectedSession.results.commentsCollected || 0}
                        </p>
                        <p className="text-xs text-success-600 dark:text-success-500">Comments</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Error */}
                {selectedSession.error && (
                  <div className="p-4 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-lg">
                    <div className="flex items-start gap-3">
                      <XCircle className="h-5 w-5 text-error-500 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-error-800 dark:text-error-300">
                          {selectedSession.error.code}
                        </p>
                        <p className="text-sm text-error-700 dark:text-error-400">
                          {selectedSession.error.message}
                        </p>
                        <p className="text-xs text-error-600 dark:text-error-500 mt-1">
                          Recoverable: {selectedSession.error.recoverable ? 'Yes' : 'No'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {detailTab === 'logs' && (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {logsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} variant="rounded" height={60} />
                    ))}
                  </div>
                ) : sessionLogs && sessionLogs.length > 0 ? (
                  sessionLogs.map(renderLogEntry)
                ) : (
                  <div className="text-center py-8 text-surface-500">
                    <ScrollText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No logs available for this session</p>
                  </div>
                )}
              </div>
            )}

            {detailTab === 'items' && (
              <div className="space-y-4 max-h-[400px] overflow-y-auto">
                {itemsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} variant="rounded" height={80} />
                    ))}
                  </div>
                ) : sessionItemsData && sessionItemsData.items && sessionItemsData.items.length > 0 ? (
                  sessionItemsData.items.map(renderItemCard)
                ) : (
                  <div className="text-center py-8 text-surface-500">
                    <List className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No items scraped in this session</p>
                  </div>
                )}
              </div>
            )}

            {detailTab === 'screenshots' && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto">
                {detailsLoading ? (
                  <div className="col-span-full space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} variant="rounded" height={120} />
                    ))}
                  </div>
                ) : sessionDetails?.screenshots && sessionDetails.screenshots.length > 0 ? (
                  sessionDetails.screenshots.map((screenshot) => (
                    <div
                      key={screenshot._id}
                      className="relative aspect-video rounded-lg overflow-hidden border border-surface-200 dark:border-surface-700 group cursor-pointer"
                    >
                      <img
                        src={screenshot.url}
                        alt={screenshot.filename}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-sm">View</span>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                        <p className="text-xs text-white truncate">{screenshot.filename}</p>
                      </div>
                    </div>
                  ))
                ) : sessionDetails?.screenshotCount && sessionDetails.screenshotCount > 0 ? (
                  <div className="col-span-full text-center py-8">
                    <ImageIcon className="h-8 w-8 mx-auto mb-2 text-surface-400" />
                    <p className="text-surface-500">
                      {sessionDetails.screenshotCount} screenshots available
                    </p>
                    <p className="text-xs text-surface-400 mt-1">
                      Screenshots are captured during scraping
                    </p>
                  </div>
                ) : (
                  <div className="col-span-full text-center py-8 text-surface-500">
                    <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No screenshots captured for this session</p>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end pt-4 border-t">
              <Button variant="outline" onClick={() => setSelectedSession(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
