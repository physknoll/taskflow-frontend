'use client';

import { useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { calendarService } from '@/services/calendar.service';
import { useCalendarStore } from '@/stores/calendarStore';
import {
  CalendarEvent,
  CalendarEventType,
  AggregatedCalendarData,
  UnifiedCalendarItem,
  TicketDeadline,
  ProjectDeadline,
  CalendarMilestone,
  CalendarFilters,
  CreateEventDto,
  UpdateEventDto,
  DeleteEventType,
  AttendeeResponseStatus,
  GoogleCalendarConnectionStatus,
  GoogleSyncSettings,
} from '@/types/calendar';

// Event type colors (matching backend spec)
export const EVENT_TYPE_COLORS: Record<CalendarEventType, string> = {
  meeting: '#4285F4',
  deadline: '#EA4335',
  milestone: '#FBBC04',
  task: '#34A853',
  reminder: '#9334E6',
  blocker: '#FF6D01',
  review: '#00ACC1',
  standup: '#00C853',
  sprint_event: '#7C4DFF',
  external: '#607D8B',
};

// Default colors for non-event items
const ITEM_TYPE_COLORS = {
  ticket_deadline: '#EA4335',
  ticket_start: '#34A853',
  project_start: '#4285F4',
  project_deadline: '#EA4335',
  milestone: '#FBBC04',
};

// Normalize aggregated data into unified calendar items
function normalizeCalendarData(data: AggregatedCalendarData): UnifiedCalendarItem[] {
  const items: UnifiedCalendarItem[] = [];

  // Normalize events
  data.events.forEach((event) => {
    items.push({
      id: event._id,
      type: 'event',
      title: event.title,
      description: event.description,
      start: new Date(event.startTime),
      end: new Date(event.endTime),
      allDay: event.allDay,
      color: event.color || EVENT_TYPE_COLORS[event.eventType] || '#4285F4',
      priority: event.priority,
      status: event.status,
      eventType: event.eventType,
      projectId: event.projectId?._id,
      projectName: event.projectId?.name,
      projectColor: event.projectId?.color,
      clientId: event.clientId?._id,
      clientName: event.clientId?.name,
      assignees: event.assignees,
      syncStatus: event.syncStatus,
      originalData: event,
    });
  });

  // Normalize ticket deadlines
  data.ticketDeadlines.forEach((ticket) => {
    const date = new Date(ticket.date);
    items.push({
      id: `ticket-${ticket._id}-${ticket.type}`,
      type: ticket.type,
      title: `${ticket.ticketNumber}: ${ticket.title}`,
      start: date,
      end: date,
      allDay: true,
      color: ticket.projectColor || ITEM_TYPE_COLORS[ticket.type],
      priority: ticket.priority,
      status: ticket.status,
      projectId: ticket.projectId,
      projectName: ticket.projectName,
      projectColor: ticket.projectColor,
      clientId: ticket.clientId,
      clientName: ticket.clientName,
      assignees: ticket.assignees,
      ticketNumber: ticket.ticketNumber,
      originalData: ticket,
    });
  });

  // Normalize project deadlines
  data.projectDeadlines.forEach((project) => {
    const date = new Date(project.date);
    items.push({
      id: `project-${project._id}-${project.type}`,
      type: project.type,
      title: project.title,
      start: date,
      end: date,
      allDay: true,
      color: project.color || ITEM_TYPE_COLORS[project.type],
      priority: project.priority,
      status: project.status,
      projectId: project._id,
      projectName: project.title,
      projectColor: project.color,
      clientId: project.clientId,
      clientName: project.clientName,
      projectNumber: project.projectNumber,
      originalData: project,
    });
  });

  // Normalize milestones
  data.milestones.forEach((milestone) => {
    const date = new Date(milestone.dueDate);
    items.push({
      id: `milestone-${milestone._id}`,
      type: 'milestone',
      title: `🎯 ${milestone.title}`,
      description: milestone.description,
      start: date,
      end: date,
      allDay: true,
      color: milestone.projectColor || ITEM_TYPE_COLORS.milestone,
      projectId: milestone.projectId,
      projectName: milestone.projectName,
      projectColor: milestone.projectColor,
      isCompleted: milestone.isCompleted,
      originalData: milestone,
    });
  });

  // Sort by start date
  items.sort((a, b) => a.start.getTime() - b.start.getTime());

  return items;
}

// Filter items based on calendar filters
function filterItems(
  items: UnifiedCalendarItem[],
  filters: {
    projectIds: string[];
    clientIds: string[];
    assigneeIds: string[];
    eventTypes: CalendarEventType[];
    showCompleted: boolean;
    showExternal: boolean;
  }
): UnifiedCalendarItem[] {
  return items.filter((item) => {
    // Filter by project
    if (filters.projectIds.length > 0 && item.projectId) {
      if (!filters.projectIds.includes(item.projectId)) return false;
    }

    // Filter by client
    if (filters.clientIds.length > 0 && item.clientId) {
      if (!filters.clientIds.includes(item.clientId)) return false;
    }

    // Filter by assignee
    if (filters.assigneeIds.length > 0 && item.assignees) {
      const hasAssignee = item.assignees.some((a) =>
        filters.assigneeIds.includes(a._id)
      );
      if (!hasAssignee) return false;
    }

    // Filter by event type (only for events)
    if (filters.eventTypes.length > 0 && item.type === 'event' && item.eventType) {
      if (!filters.eventTypes.includes(item.eventType)) return false;
    }

    // Filter completed items
    if (!filters.showCompleted) {
      if (item.status === 'completed' || item.isCompleted) return false;
    }

    // Filter external calendar items
    if (!filters.showExternal && item.eventType === 'external') {
      return false;
    }

    return true;
  });
}

interface UseCalendarOptions {
  projectId?: string; // For scoped calendar views
  clientId?: string;
  scope?: 'all' | 'tickets' | 'project';
  enabled?: boolean;
}

export function useCalendar(options: UseCalendarOptions = {}) {
  const queryClient = useQueryClient();
  const {
    selectedDate,
    viewType,
    filters,
    getDateRange,
    setIsLoading,
  } = useCalendarStore();

  const { start, end } = getDateRange();

  // Build query filters
  const queryFilters: CalendarFilters = useMemo(() => {
    const baseFilters: CalendarFilters = {
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      includeExternal: filters.showExternal,
      includeCompleted: filters.showCompleted,
    };

    // Add scope-specific filters
    if (options.projectId) {
      baseFilters.projectId = options.projectId;
    }
    if (options.clientId) {
      baseFilters.clientId = options.clientId;
    }
    if (filters.projectIds.length > 0) {
      baseFilters.projectId = filters.projectIds[0]; // API only supports single project
    }
    if (filters.clientIds.length > 0) {
      baseFilters.clientId = filters.clientIds[0]; // API only supports single client
    }
    if (filters.assigneeIds.length > 0) {
      baseFilters.assignees = filters.assigneeIds;
    }
    if (filters.eventTypes.length > 0) {
      baseFilters.eventTypes = filters.eventTypes;
    }

    return baseFilters;
  }, [start, end, filters, options.projectId, options.clientId]);

  // Fetch aggregated calendar data
  const {
    data: aggregatedData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['calendar', 'aggregated', queryFilters],
    queryFn: () => calendarService.getAggregatedData(queryFilters),
    enabled: options.enabled !== false,
    staleTime: 30000, // 30 seconds
  });

  // Normalize and filter items
  const items = useMemo(() => {
    if (!aggregatedData) return [];

    let normalized = normalizeCalendarData(aggregatedData);

    // Apply scope filtering
    if (options.scope === 'tickets') {
      normalized = normalized.filter(
        (item) =>
          item.type === 'ticket_deadline' ||
          item.type === 'ticket_start' ||
          (item.type === 'event' && item.eventType === 'deadline')
      );
    } else if (options.scope === 'project') {
      normalized = normalized.filter(
        (item) =>
          item.type === 'project_start' ||
          item.type === 'project_deadline' ||
          item.type === 'milestone' ||
          item.projectId
      );
    }

    // Apply client-side filters
    return filterItems(normalized, filters);
  }, [aggregatedData, filters, options.scope]);

  // Create event mutation
  const createEventMutation = useMutation({
    mutationFn: (data: CreateEventDto) => calendarService.createEvent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
    },
  });

  // Update event mutation
  const updateEventMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEventDto }) =>
      calendarService.updateEvent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
    },
  });

  // Delete event mutation
  const deleteEventMutation = useMutation({
    mutationFn: ({ id, deleteType }: { id: string; deleteType?: DeleteEventType }) =>
      calendarService.deleteEvent(id, deleteType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
    },
  });

  // Respond to event mutation
  const respondToEventMutation = useMutation({
    mutationFn: ({ id, response }: { id: string; response: AttendeeResponseStatus }) =>
      calendarService.respondToEvent(id, response),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
    },
  });

  // Reschedule event (for drag and drop)
  const rescheduleEvent = useCallback(
    async (eventId: string, newStart: Date, newEnd: Date) => {
      await updateEventMutation.mutateAsync({
        id: eventId,
        data: {
          startTime: newStart.toISOString(),
          endTime: newEnd.toISOString(),
        },
      });
    },
    [updateEventMutation]
  );

  return {
    // Data
    items,
    aggregatedData,

    // State
    isLoading,
    isError,
    error,
    selectedDate,
    viewType,

    // Actions
    refetch,
    createEvent: createEventMutation.mutateAsync,
    updateEvent: updateEventMutation.mutateAsync,
    deleteEvent: deleteEventMutation.mutateAsync,
    respondToEvent: respondToEventMutation.mutateAsync,
    rescheduleEvent,

    // Mutation states
    isCreating: createEventMutation.isPending,
    isUpdating: updateEventMutation.isPending,
    isDeleting: deleteEventMutation.isPending,
  };
}

// Hook for Google Calendar integration
export function useGoogleCalendar() {
  const queryClient = useQueryClient();

  // Get connection status
  const {
    data: connectionStatus,
    isLoading: isLoadingStatus,
    refetch: refetchStatus,
  } = useQuery({
    queryKey: ['google-calendar', 'status'],
    queryFn: () => calendarService.getGoogleStatus(),
    staleTime: 60000, // 1 minute
  });

  // Get available calendars
  const {
    data: calendars,
    isLoading: isLoadingCalendars,
  } = useQuery({
    queryKey: ['google-calendar', 'calendars'],
    queryFn: () => calendarService.getGoogleCalendars(),
    enabled: connectionStatus?.connected === true,
  });

  // Connect mutation (gets OAuth URL)
  const connectMutation = useMutation({
    mutationFn: () => calendarService.getGoogleAuthUrl(),
    onSuccess: (data) => {
      // Redirect to Google OAuth
      if (typeof window !== 'undefined') {
        window.location.href = data.authUrl;
      }
    },
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: (settings: GoogleSyncSettings) =>
      calendarService.updateGoogleSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['google-calendar'] });
    },
  });

  // Sync mutation
  const syncMutation = useMutation({
    mutationFn: () => calendarService.triggerGoogleSync(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
      queryClient.invalidateQueries({ queryKey: ['google-calendar', 'status'] });
    },
  });

  // Disconnect mutation
  const disconnectMutation = useMutation({
    mutationFn: () => calendarService.disconnectGoogle(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['google-calendar'] });
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
    },
  });

  return {
    // Status
    connectionStatus,
    isConnected: connectionStatus?.connected === true,
    isLoadingStatus,

    // Calendars
    calendars,
    isLoadingCalendars,

    // Actions
    connect: connectMutation.mutate,
    updateSettings: updateSettingsMutation.mutateAsync,
    sync: syncMutation.mutate,
    disconnect: disconnectMutation.mutate,
    refetchStatus,

    // Mutation states
    isConnecting: connectMutation.isPending,
    isUpdatingSettings: updateSettingsMutation.isPending,
    isSyncing: syncMutation.isPending,
    isDisconnecting: disconnectMutation.isPending,
    syncResult: syncMutation.data,
  };
}

export default useCalendar;

