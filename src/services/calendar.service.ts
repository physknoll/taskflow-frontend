import api from './api';
import {
  CalendarEvent,
  CalendarFilters,
  AggregatedCalendarData,
  MonthViewData,
  WeekViewData,
  DayViewData,
  AgendaViewData,
  CreateEventDto,
  UpdateEventDto,
  DeleteEventType,
  AttendeeResponseStatus,
  GoogleCalendarConnectionStatus,
  GoogleCalendarInfo,
  GoogleSyncSettings,
  GoogleSyncResult,
  ApiResponse,
} from '@/types';

// ============================================
// Calendar Service
// ============================================

// Helper to build query string from filters
function buildQueryParams(filters: Partial<CalendarFilters>): URLSearchParams {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    
    if (Array.isArray(value)) {
      if (value.length > 0) {
        params.append(key, value.join(','));
      }
    } else if (typeof value === 'boolean') {
      params.append(key, value.toString());
    } else {
      params.append(key, String(value));
    }
  });
  
  return params;
}

export const calendarService = {
  // ============================================
  // Aggregated Data (Recommended for views)
  // ============================================

  /**
   * Get aggregated calendar data including events, tickets, projects, and milestones
   * This is the recommended endpoint for calendar views
   */
  async getAggregatedData(filters: CalendarFilters): Promise<AggregatedCalendarData> {
    const params = buildQueryParams(filters);
    const response = await api.get<ApiResponse<AggregatedCalendarData>>(
      `/calendar/aggregated?${params.toString()}`
    );
    return response.data.data;
  },

  // ============================================
  // View-Specific Endpoints
  // ============================================

  /**
   * Get month view data
   */
  async getMonthView(
    year: number,
    month: number,
    filters?: Partial<Omit<CalendarFilters, 'startDate' | 'endDate'>>
  ): Promise<MonthViewData> {
    const params = filters ? buildQueryParams(filters) : new URLSearchParams();
    const response = await api.get<ApiResponse<MonthViewData>>(
      `/calendar/views/month/${year}/${month}?${params.toString()}`
    );
    return response.data.data;
  },

  /**
   * Get week view data
   * @param date - Any date within the desired week (ISO8601)
   */
  async getWeekView(
    date: string,
    filters?: Partial<Omit<CalendarFilters, 'startDate' | 'endDate'>>
  ): Promise<WeekViewData> {
    const params = filters ? buildQueryParams(filters) : new URLSearchParams();
    const response = await api.get<ApiResponse<WeekViewData>>(
      `/calendar/views/week/${date}?${params.toString()}`
    );
    return response.data.data;
  },

  /**
   * Get day view data
   * @param date - The specific date (ISO8601)
   */
  async getDayView(
    date: string,
    filters?: Partial<Omit<CalendarFilters, 'startDate' | 'endDate'>>
  ): Promise<DayViewData> {
    const params = filters ? buildQueryParams(filters) : new URLSearchParams();
    const response = await api.get<ApiResponse<DayViewData>>(
      `/calendar/views/day/${date}?${params.toString()}`
    );
    return response.data.data;
  },

  /**
   * Get agenda view data (chronological list)
   * @param days - Number of days to look ahead (default 14, max 90)
   */
  async getAgendaView(days: number = 14): Promise<AgendaViewData> {
    const response = await api.get<ApiResponse<AgendaViewData>>(
      `/calendar/views/agenda?days=${days}`
    );
    return response.data.data;
  },

  // ============================================
  // Events CRUD
  // ============================================

  /**
   * Get all events with filters
   */
  async getEvents(filters: CalendarFilters): Promise<{ events: CalendarEvent[]; count: number }> {
    const params = buildQueryParams(filters);
    const response = await api.get<{ success: boolean; data: CalendarEvent[]; count: number }>(
      `/calendar/events?${params.toString()}`
    );
    return { events: response.data.data, count: response.data.count };
  },

  /**
   * Get current user's events
   */
  async getMyEvents(filters: {
    startDate: string;
    endDate: string;
    includeCompleted?: boolean;
  }): Promise<CalendarEvent[]> {
    const params = buildQueryParams(filters);
    const response = await api.get<ApiResponse<CalendarEvent[]>>(
      `/calendar/events/my?${params.toString()}`
    );
    return response.data.data;
  },

  /**
   * Get a specific event by ID
   */
  async getEvent(id: string): Promise<CalendarEvent> {
    const response = await api.get<ApiResponse<CalendarEvent>>(`/calendar/events/${id}`);
    return response.data.data;
  },

  /**
   * Create a new calendar event
   */
  async createEvent(data: CreateEventDto): Promise<CalendarEvent> {
    const response = await api.post<ApiResponse<CalendarEvent>>('/calendar/events', data);
    return response.data.data;
  },

  /**
   * Update an existing event
   */
  async updateEvent(id: string, data: UpdateEventDto): Promise<CalendarEvent> {
    const response = await api.patch<ApiResponse<CalendarEvent>>(`/calendar/events/${id}`, data);
    return response.data.data;
  },

  /**
   * Delete an event
   * @param deleteType - For recurring events: 'single', 'this_and_future', or 'all'
   */
  async deleteEvent(id: string, deleteType?: DeleteEventType): Promise<void> {
    const params = deleteType ? `?deleteType=${deleteType}` : '';
    await api.delete(`/calendar/events/${id}${params}`);
  },

  /**
   * Duplicate an event
   * @param startTime - Optional new start time for the duplicated event
   */
  async duplicateEvent(id: string, startTime?: string): Promise<CalendarEvent> {
    const response = await api.post<ApiResponse<CalendarEvent>>(
      `/calendar/events/${id}/duplicate`,
      startTime ? { startTime } : {}
    );
    return response.data.data;
  },

  /**
   * Respond to an event invite
   */
  async respondToEvent(
    id: string,
    response: AttendeeResponseStatus
  ): Promise<CalendarEvent> {
    const res = await api.patch<ApiResponse<CalendarEvent>>(
      `/calendar/events/${id}/respond`,
      { response }
    );
    return res.data.data;
  },

  // ============================================
  // Google Calendar Integration
  // ============================================

  /**
   * Get Google OAuth authorization URL
   */
  async getGoogleAuthUrl(): Promise<{ authUrl: string }> {
    const response = await api.get<ApiResponse<{ authUrl: string }>>('/calendar/google/connect');
    return response.data.data;
  },

  /**
   * Get Google Calendar connection status
   */
  async getGoogleStatus(): Promise<GoogleCalendarConnectionStatus> {
    const response = await api.get<ApiResponse<GoogleCalendarConnectionStatus>>(
      '/calendar/google/status'
    );
    return response.data.data;
  },

  /**
   * List user's Google Calendars
   */
  async getGoogleCalendars(): Promise<GoogleCalendarInfo[]> {
    const response = await api.get<ApiResponse<GoogleCalendarInfo[]>>(
      '/calendar/google/calendars'
    );
    return response.data.data;
  },

  /**
   * Update Google Calendar sync settings
   */
  async updateGoogleSettings(settings: GoogleSyncSettings): Promise<void> {
    await api.patch('/calendar/google/settings', settings);
  },

  /**
   * Trigger manual sync with Google Calendar
   */
  async triggerGoogleSync(): Promise<GoogleSyncResult> {
    const response = await api.post<ApiResponse<GoogleSyncResult>>('/calendar/google/sync');
    return response.data.data;
  },

  /**
   * Disconnect Google Calendar integration
   */
  async disconnectGoogle(): Promise<void> {
    await api.delete('/calendar/google/disconnect');
  },
};

export default calendarService;

