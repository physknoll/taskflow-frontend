import { CalendarEventType } from '@/types/calendar';

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

// Event type labels
export const EVENT_TYPE_LABELS: Record<CalendarEventType, string> = {
  meeting: 'Meeting',
  deadline: 'Deadline',
  milestone: 'Milestone',
  task: 'Task',
  reminder: 'Reminder',
  blocker: 'Blocker',
  review: 'Review',
  standup: 'Standup',
  sprint_event: 'Sprint Event',
  external: 'External',
};

// Event type icons (lucide-react icon names)
export const EVENT_TYPE_ICONS: Record<CalendarEventType, string> = {
  meeting: 'Users',
  deadline: 'AlertCircle',
  milestone: 'Flag',
  task: 'CheckSquare',
  reminder: 'Bell',
  blocker: 'Ban',
  review: 'Eye',
  standup: 'Coffee',
  sprint_event: 'Zap',
  external: 'ExternalLink',
};

// Priority colors
export const PRIORITY_COLORS = {
  low: '#34A853',
  medium: '#FBBC04',
  high: '#EA4335',
};

// Status colors
export const STATUS_COLORS = {
  scheduled: '#4285F4',
  in_progress: '#FBBC04',
  completed: '#34A853',
  cancelled: '#9E9E9E',
};

// Calendar view options
export const VIEW_OPTIONS = [
  { id: 'month', label: 'Month', icon: 'LayoutGrid' },
  { id: 'week', label: 'Week', icon: 'Columns' },
  { id: 'day', label: 'Day', icon: 'CalendarDays' },
  { id: 'agenda', label: 'Agenda', icon: 'List' },
] as const;

// Reminder options (minutes before)
export const REMINDER_OPTIONS = [
  { value: '5', label: '5 minutes before' },
  { value: '10', label: '10 minutes before' },
  { value: '15', label: '15 minutes before' },
  { value: '30', label: '30 minutes before' },
  { value: '60', label: '1 hour before' },
  { value: '120', label: '2 hours before' },
  { value: '1440', label: '1 day before' },
  { value: '2880', label: '2 days before' },
];

// Recurrence frequency options
export const RECURRENCE_OPTIONS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

// Days of week
export const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday', short: 'Sun' },
  { value: 1, label: 'Monday', short: 'Mon' },
  { value: 2, label: 'Tuesday', short: 'Tue' },
  { value: 3, label: 'Wednesday', short: 'Wed' },
  { value: 4, label: 'Thursday', short: 'Thu' },
  { value: 5, label: 'Friday', short: 'Fri' },
  { value: 6, label: 'Saturday', short: 'Sat' },
];

// Meeting provider options
export const MEETING_PROVIDERS = [
  { value: 'google_meet', label: 'Google Meet', icon: '🎥' },
  { value: 'zoom', label: 'Zoom', icon: '📹' },
  { value: 'teams', label: 'Microsoft Teams', icon: '💼' },
  { value: 'other', label: 'Other', icon: '🔗' },
];

// All event types for filter
export const ALL_EVENT_TYPES: CalendarEventType[] = [
  'meeting',
  'deadline',
  'milestone',
  'task',
  'reminder',
  'blocker',
  'review',
  'standup',
  'sprint_event',
  'external',
];

