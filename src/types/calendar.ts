// ============================================
// Calendar Types
// ============================================

import { IUser } from './index';

// Event types from backend
export type CalendarEventType =
  | 'meeting'
  | 'deadline'
  | 'milestone'
  | 'task'
  | 'reminder'
  | 'blocker'
  | 'review'
  | 'standup'
  | 'sprint_event'
  | 'external';

export type CalendarViewType = 'month' | 'week' | 'day' | 'agenda';

export type EventPriority = 'low' | 'medium' | 'high';

export type EventStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

export type CalendarSyncStatus = 'local' | 'synced' | 'pending_sync' | 'sync_error' | 'conflict';

export type MeetingProvider = 'zoom' | 'google_meet' | 'teams' | 'other';

export type AttendeeResponseStatus = 'pending' | 'accepted' | 'declined' | 'tentative';

export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export type RecurrenceEndType = 'never' | 'after_count' | 'on_date';

export type DeleteEventType = 'single' | 'this_and_future' | 'all';

// User reference (populated from backend)
export interface CalendarUserRef {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
}

// Attendee (can be internal user or external email)
export interface CalendarAttendee {
  email: string;
  name?: string;
  userId?: string;
  responseStatus: AttendeeResponseStatus;
  optional: boolean;
}

// Reminder configuration
export interface CalendarReminder {
  type: 'email' | 'push' | 'in_app';
  minutesBefore: number;
}

// Recurrence rule
export interface RecurrenceRule {
  frequency: RecurrenceFrequency;
  interval: number;
  daysOfWeek?: number[]; // 0-6 (Sunday-Saturday)
  dayOfMonth?: number;
  monthOfYear?: number;
  endType: RecurrenceEndType;
  endCount?: number;
  endDate?: Date;
}

// Project reference in calendar event
export interface CalendarProjectRef {
  _id: string;
  name: string;
  color: string;
  projectNumber?: string;
}

// Client reference in calendar event
export interface CalendarClientRef {
  _id: string;
  name: string;
}

// Ticket reference in calendar event
export interface CalendarTicketRef {
  _id: string;
  title: string;
  ticketNumber: string;
  status?: string;
}

// Full CalendarEvent interface (matching backend)
export interface CalendarEvent {
  _id: string;
  organizationId?: string;
  title: string;
  description?: string;
  eventType: CalendarEventType;
  startTime: Date | string;
  endTime: Date | string;
  allDay: boolean;
  timezone: string;
  recurring: boolean;
  recurrenceRule?: RecurrenceRule;
  recurrenceExceptions?: Date[];
  parentEventId?: string;
  projectId?: CalendarProjectRef;
  clientId?: CalendarClientRef;
  ticketIds?: CalendarTicketRef[];
  milestoneId?: string;
  createdBy: CalendarUserRef;
  assignees: CalendarUserRef[];
  attendees: CalendarAttendee[];
  location?: string;
  meetingLink?: string;
  meetingProvider?: MeetingProvider;
  color?: string;
  priority: EventPriority;
  status: EventStatus;
  externalCalendarId?: string;
  externalEventId?: string;
  syncStatus: CalendarSyncStatus;
  lastSyncedAt?: Date | string;
  syncError?: string;
  reminders: CalendarReminder[];
  createdAt: Date | string;
  updatedAt: Date | string;
}

// ============================================
// Aggregated Calendar Data Types
// ============================================

// Ticket deadline from aggregated endpoint
export interface TicketDeadline {
  _id: string;
  type: 'ticket_deadline' | 'ticket_start';
  title: string;
  ticketNumber: string;
  date: Date | string;
  priority: EventPriority;
  status: string;
  projectId?: string;
  projectName?: string;
  projectColor?: string;
  clientId?: string;
  clientName?: string;
  assignees: CalendarUserRef[];
}

// Project deadline from aggregated endpoint
export interface ProjectDeadline {
  _id: string;
  type: 'project_start' | 'project_deadline';
  title: string;
  projectNumber: string;
  date: Date | string;
  priority: EventPriority;
  status: string;
  color: string;
  progress?: number;
  clientId?: string;
  clientName?: string;
}

// Milestone from aggregated endpoint
export interface CalendarMilestone {
  _id: string;
  type: 'milestone';
  title: string;
  description?: string;
  projectId: string;
  projectName: string;
  projectColor: string;
  dueDate: Date | string;
  isCompleted: boolean;
  completedAt?: Date | string;
}

// Aggregated calendar data response
export interface AggregatedCalendarData {
  events: CalendarEvent[];
  ticketDeadlines: TicketDeadline[];
  projectDeadlines: ProjectDeadline[];
  milestones: CalendarMilestone[];
}

// ============================================
// Unified Calendar Item (for rendering)
// ============================================

export type UnifiedCalendarItemType =
  | 'event'
  | 'ticket_deadline'
  | 'ticket_start'
  | 'project_start'
  | 'project_deadline'
  | 'milestone';

export interface UnifiedCalendarItem {
  id: string;
  type: UnifiedCalendarItemType;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  allDay: boolean;
  color: string;
  priority?: EventPriority;
  status?: string;
  eventType?: CalendarEventType;
  projectId?: string;
  projectName?: string;
  projectColor?: string;
  clientId?: string;
  clientName?: string;
  assignees?: CalendarUserRef[];
  ticketNumber?: string;
  projectNumber?: string;
  isCompleted?: boolean;
  syncStatus?: CalendarSyncStatus;
  originalData: CalendarEvent | TicketDeadline | ProjectDeadline | CalendarMilestone;
}

// ============================================
// Calendar Filters
// ============================================

export interface CalendarFilters {
  startDate: string; // ISO8601
  endDate: string; // ISO8601
  projectId?: string;
  clientId?: string;
  assignees?: string[]; // User IDs
  eventTypes?: CalendarEventType[];
  status?: EventStatus[];
  priority?: EventPriority[];
  includeExternal?: boolean;
  includeCompleted?: boolean;
  search?: string;
}

// ============================================
// View-Specific Response Types
// ============================================

export interface MonthViewData extends AggregatedCalendarData {
  year: number;
  month: number;
  startDate: string;
  endDate: string;
}

export interface WeekViewData extends AggregatedCalendarData {
  weekStart: string;
  weekEnd: string;
}

export interface DayViewData extends AggregatedCalendarData {
  date: string;
}

export interface AgendaViewData {
  items: UnifiedCalendarItem[];
  groupedByDate: Record<string, UnifiedCalendarItem[]>;
  startDate: string;
  endDate: string;
}

// ============================================
// Event CRUD DTOs
// ============================================

export interface CreateEventDto {
  title: string;
  description?: string;
  eventType: CalendarEventType;
  startTime: string; // ISO8601
  endTime: string; // ISO8601
  allDay?: boolean;
  timezone?: string;
  projectId?: string;
  clientId?: string;
  ticketIds?: string[];
  assignees?: string[];
  attendees?: Array<{
    email: string;
    name?: string;
    optional?: boolean;
  }>;
  location?: string;
  meetingLink?: string;
  meetingProvider?: MeetingProvider;
  color?: string;
  priority?: EventPriority;
  recurring?: boolean;
  recurrenceRule?: RecurrenceRule;
  reminders?: CalendarReminder[];
}

export interface UpdateEventDto extends Partial<CreateEventDto> {
  status?: EventStatus;
}

// ============================================
// Google Calendar Integration Types
// ============================================

export type SyncDirection = 'two_way' | 'one_way_to_google' | 'one_way_from_google';

export type GoogleConnectionStatus = 'active' | 'token_expired' | 'revoked' | 'error';

export interface GoogleCalendarInfo {
  calendarId: string;
  calendarName: string;
  syncEnabled: boolean;
  color?: string;
  isPrimary: boolean;
}

export interface GoogleCalendarConnectionStatus {
  connected: boolean;
  googleEmail?: string;
  syncEnabled?: boolean;
  syncDirection?: SyncDirection;
  lastSyncAt?: string;
  connectionStatus?: GoogleConnectionStatus;
  calendarsToSync?: GoogleCalendarInfo[];
}

export interface GoogleSyncSettings {
  syncEnabled: boolean;
  syncDirection: SyncDirection;
  defaultCalendarId?: string;
  calendarsToSync: Array<{
    calendarId: string;
    syncEnabled: boolean;
  }>;
}

export interface GoogleSyncResult {
  syncedCalendars: Record<
    string,
    {
      created: number;
      updated: number;
      deleted: number;
    }
  >;
  pushedToGoogle: number;
}

// ============================================
// Calendar Store Types
// ============================================

export interface CalendarFilterState {
  projectIds: string[];
  clientIds: string[];
  assigneeIds: string[];
  eventTypes: CalendarEventType[];
  showCompleted: boolean;
  showExternal: boolean;
}

export interface CreateEventSlot {
  start: Date;
  end: Date;
  allDay?: boolean;
}

