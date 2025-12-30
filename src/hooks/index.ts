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

// Calendar hooks
export { useCalendar, useGoogleCalendar, EVENT_TYPE_COLORS } from './useCalendar';

