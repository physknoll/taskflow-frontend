export { useAuth } from './useAuth';
export { useTickets, useTicket } from './useTickets';
export { useClients, useClient } from './useClients';
export { useReviews, useReview } from './useReviews';
export { useAI } from './useAI';
export { useNotifications } from './useNotifications';
export { useAICheckin, useAICheckinModal } from './useAICheckin';
export { useProjects, useProjectsBoard, useProject, useWorkflowColumns } from './useProjects';
export { useProjectAgent } from './useProjectAgent';
export { useTicketAgent } from './useTicketAgent';
export { useGuidelines, useGuideline } from './useGuidelines';
export { useSOPAgent } from './useSOPAgent';
export {
  useAIPMConfig,
  useAIPMCheckIn,
  useAIPMSessions,
  useAIPMReports,
  useAIPMDashboard,
  useAIPMManagerDashboard,
  useNextCheckIn,
  useFlaggedSessions,
  useLeaderboard,
  useBadges,
} from './useAIPM';

// Resources hooks
export {
  useResources,
  useResource,
  useResourceStats,
  useResourceSearch,
  useProviders,
  useResourceAIContext,
  resourceKeys,
} from './useResources';

// Dashboard-specific hooks
export { useAIPMSocket, AIPM_DASHBOARD_EVENTS } from './useAIPMSocket';
export { useAIPMSession } from './useAIPMSession';

// Conversations hooks
export {
  useConversations,
  useConversation,
  useConversationSearch,
  useConversationsForTicket,
  useConversationsForProject,
  useConversationStats,
  useConversationActions,
  useConversationHistory,
  conversationKeys,
} from './useConversations';

export {
  useMediaQuery,
  useIsMobile,
  useIsTablet,
  useIsDesktop,
  useIsLargeDesktop,
  useIsTouchDevice,
  usePrefersReducedMotion,
  usePrefersDarkMode,
  useBreakpoint,
  breakpoints,
} from './useMediaQuery';

// Integrations hooks
export { useGoogleChatIntegration, googleChatKeys } from './useGoogleChatIntegration';

// Knowledge Base hooks
export { useKBUpload } from './useKBUpload';

// SOP hooks (Knowledge Base SOPs)
export { useSOPs, useSOP } from './useSOPs';

// Chat Widget hooks
export {
  chatWidgetKeys,
  useChatWidgetConfig,
  useSaveChatWidgetConfig,
  useUpdateChatWidgetConfig,
  useDeleteChatWidgetConfig,
  useRegenerateApiKey,
  useChatWidgetAnalytics,
  useChatWidgetSessions,
  useChatWidgetGeoAnalytics,
} from './useChatWidget';

// Calendar hooks
export { useCalendar, useGoogleCalendar, EVENT_TYPE_COLORS } from './useCalendar';

// Organization hooks
export { useOrganization, useLinkedInFeature, organizationKeys } from './useOrganization';

// LinkedIn Monitoring hooks
export {
  linkedinKeys,
  useLinkedInStats,
  useLinkedInTimeline,
  useLinkedInEngagement,
  useLinkedInScrapers,
  useLinkedInScraper,
  useLinkedInProfiles,
  useLinkedInProfile,
  useLinkedInPosts,
  useLinkedInPost,
  useLinkedInTrendingPosts,
  useLinkedInActionablePosts,
  useLinkedInSessions,
  useLinkedInSession,
  useLinkedInSessionPosts,
} from './useLinkedIn';

// Multi-Platform Scraping hooks
export {
  scrapingKeys,
  useScrapingSchedules,
  useScrapingSchedule,
  useScrapingQueue,
  useScrapingQueueStats,
  useSourceScrape,
  useScrapingStats,
  useScrapingItems,
  // Session hooks
  useScrapeSessions,
  useScrapeSession,
  useScrapeSessionDetails,
  useScrapeSessionLogs,
  useScrapeSessionItems,
  useScrapeSessionScreenshots,
} from './useScraping';

// Real-time Scraping Events (SSE)
export {
  useScrapingEvents,
  type SSEConnectedEvent,
  type SSEScrapeItemEvent,
  type SSEScrapeCompleteEvent,
  type SSEScrapeResultEvent,
  type SSEScraperConnectedEvent,
  type SSEScraperDisconnectedEvent,
  type SSEEventType,
  type ScrapingEventCallbacks,
  type UseScrapingEventsOptions,
  type UseScrapingEventsReturn,
} from './useScrapingEvents';
