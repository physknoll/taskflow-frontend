// API Configuration
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';
export const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5001';

// Ticket Status Configuration
export const TICKET_STATUSES = [
  { id: 'backlog', label: 'Backlog', color: 'bg-surface-200' },
  { id: 'todo', label: 'To Do', color: 'bg-primary-100' },
  { id: 'in_progress', label: 'In Progress', color: 'bg-amber-100' },
  { id: 'in_review', label: 'In Review', color: 'bg-violet-100' },
  { id: 'completed', label: 'Completed', color: 'bg-emerald-100' },
] as const;

export const TICKET_PRIORITIES = [
  { id: 'low', label: 'Low', color: 'bg-surface-200 text-surface-600' },
  { id: 'medium', label: 'Medium', color: 'bg-primary-100 text-primary-700' },
  { id: 'high', label: 'High', color: 'bg-orange-100 text-orange-700' },
  { id: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-700' },
] as const;

export const TICKET_TYPES = [
  { id: 'feature', label: 'Feature', icon: '✨' },
  { id: 'bug', label: 'Bug', icon: '🐛' },
  { id: 'content', label: 'Content', icon: '📝' },
  { id: 'design', label: 'Design', icon: '🎨' },
  { id: 'maintenance', label: 'Maintenance', icon: '🔧' },
  { id: 'other', label: 'Other', icon: '📋' },
] as const;

// Review Status Configuration
export const REVIEW_STATUSES = [
  { id: 'pending', label: 'Pending', color: 'bg-amber-100 text-amber-700' },
  { id: 'in_progress', label: 'In Progress', color: 'bg-primary-100 text-primary-700' },
  { id: 'approved', label: 'Approved', color: 'bg-emerald-100 text-emerald-700' },
  { id: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-700' },
  { id: 'needs_revision', label: 'Needs Revision', color: 'bg-orange-100 text-orange-700' },
] as const;

// Review Criteria Templates
export const REVIEW_CRITERIA_TEMPLATES = {
  design: [
    { name: 'Visual Quality', weight: 25, description: 'Overall aesthetic and polish' },
    { name: 'Brand Alignment', weight: 25, description: 'Adherence to brand guidelines' },
    { name: 'Technical Execution', weight: 20, description: 'File quality, dimensions, formats' },
    { name: 'Creativity', weight: 15, description: 'Innovation and creative solutions' },
    { name: 'Completeness', weight: 15, description: 'All requirements addressed' },
  ],
  code: [
    { name: 'Functionality', weight: 30, description: 'Code works as expected' },
    { name: 'Code Quality', weight: 25, description: 'Clean, readable, maintainable' },
    { name: 'Performance', weight: 20, description: 'Efficient and optimized' },
    { name: 'Testing', weight: 15, description: 'Adequate test coverage' },
    { name: 'Documentation', weight: 10, description: 'Code comments and docs' },
  ],
  content: [
    { name: 'Accuracy', weight: 30, description: 'Factual correctness' },
    { name: 'Tone & Voice', weight: 25, description: 'Matches brand voice' },
    { name: 'SEO', weight: 20, description: 'Keywords and optimization' },
    { name: 'Engagement', weight: 15, description: 'Compelling and readable' },
    { name: 'Formatting', weight: 10, description: 'Proper structure and formatting' },
  ],
  default: [
    { name: 'Quality', weight: 30, description: 'Overall quality of work' },
    { name: 'Completeness', weight: 25, description: 'All requirements met' },
    { name: 'Accuracy', weight: 25, description: 'Work is accurate and correct' },
    { name: 'Timeliness', weight: 20, description: 'Delivered on time' },
  ],
};

// User Roles
export const USER_ROLES = [
  { id: 'owner', label: 'Owner', description: 'Full system access' },
  { id: 'manager', label: 'Manager', description: 'Manage clients and team' },
  { id: 'employee', label: 'Employee', description: 'Work on assigned tickets' },
  { id: 'client_viewer', label: 'Client Viewer', description: 'View-only access' },
] as const;

// Navigation Items
export const NAVIGATION_ITEMS = [
  { name: 'Dashboard', href: '/', icon: 'LayoutDashboard', permission: null },
  { name: 'Tickets', href: '/tickets', icon: 'Ticket', permission: null },
  { name: 'Clients', href: '/clients', icon: 'Building2', permission: 'clients.view' },
  { name: 'Review Queue', href: '/review', icon: 'CheckSquare', permission: 'reviews.conduct' },
  { name: 'Team', href: '/team', icon: 'Users', permission: 'users.view' },
  { name: 'Analytics', href: '/analytics', icon: 'BarChart3', permission: 'analytics.view_all' },
  { name: 'AI Assistant', href: '/ai-assistant', icon: 'MessageSquare', permission: 'ai.use_chat' },
  { name: 'Settings', href: '/settings', icon: 'Settings', permission: null },
] as const;

// Client Service Types
export const CLIENT_SERVICE_TYPES = [
  { id: 'website', label: 'Website' },
  { id: 'blog', label: 'Blog' },
  { id: 'social_media', label: 'Social Media' },
  { id: 'graphic_design', label: 'Graphic Design' },
  { id: 'video', label: 'Video' },
  { id: 'seo', label: 'SEO' },
  { id: 'other', label: 'Other' },
] as const;

// Notification Types
export const NOTIFICATION_TYPES = [
  { id: 'ticket_assigned', label: 'Ticket Assigned', icon: 'Ticket' },
  { id: 'ticket_updated', label: 'Ticket Updated', icon: 'RefreshCw' },
  { id: 'ticket_comment', label: 'New Comment', icon: 'MessageCircle' },
  { id: 'review_requested', label: 'Review Requested', icon: 'Eye' },
  { id: 'review_completed', label: 'Review Completed', icon: 'CheckCircle' },
  { id: 'review_feedback', label: 'Review Feedback', icon: 'MessageSquare' },
  { id: 'ai_checkin', label: 'AI Check-in', icon: 'Bot' },
  { id: 'ai_reminder', label: 'AI Reminder', icon: 'Bell' },
  { id: 'due_date_approaching', label: 'Due Soon', icon: 'Clock' },
  { id: 'due_date_passed', label: 'Overdue', icon: 'AlertTriangle' },
  { id: 'mention', label: 'Mention', icon: 'AtSign' },
  { id: 'system', label: 'System', icon: 'Info' },
] as const;

// Date Formats
export const DATE_FORMATS = {
  short: 'MMM d',
  medium: 'MMM d, yyyy',
  long: 'MMMM d, yyyy',
  withTime: 'MMM d, yyyy h:mm a',
  timeOnly: 'h:mm a',
} as const;

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// File Upload
export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
export const ALLOWED_FILE_TYPES = {
  image: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
  video: ['video/mp4', 'video/quicktime', 'video/webm'],
  document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  code: ['application/zip', 'application/x-zip-compressed'],
};

