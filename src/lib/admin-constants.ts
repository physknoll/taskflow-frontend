// ============================================
// Admin Panel Constants
// ============================================

// API Configuration
export const ADMIN_API_URL = process.env.NEXT_PUBLIC_ADMIN_API_URL || 'http://localhost:5001/api/v1/admin';

// Platform Roles
export const PLATFORM_ROLES = [
  { 
    id: 'super_admin', 
    label: 'Super Admin', 
    description: 'Full platform access - can manage everything',
    color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300',
  },
  { 
    id: 'billing_admin', 
    label: 'Billing Admin', 
    description: 'Billing management access - subscriptions, payments, credits',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
  },
  { 
    id: 'support_admin', 
    label: 'Support Admin', 
    description: 'Customer support access - view-only orgs/users, conversations',
    color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300',
  },
] as const;

// Subscription Status Colors
export const SUBSCRIPTION_STATUS_COLORS = {
  active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
  trialing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
  past_due: 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300',
  canceled: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
  unpaid: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
} as const;

// Subscription Plans
export const SUBSCRIPTION_PLANS = [
  { id: 'free', label: 'Free', color: 'bg-surface-100 text-surface-700 dark:bg-surface-800 dark:text-surface-300' },
  { id: 'starter', label: 'Starter', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' },
  { id: 'professional', label: 'Professional', color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300' },
  { id: 'enterprise', label: 'Enterprise', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300' },
] as const;

// User Account Status Colors
export const ACCOUNT_STATUS_COLORS = {
  active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
  suspended: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
  pending_deletion: 'bg-surface-100 text-surface-600 dark:bg-surface-800 dark:text-surface-400',
} as const;

// Organization Role Colors
export const ORG_ROLE_COLORS = {
  owner: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
  manager: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
  employee: 'bg-surface-100 text-surface-700 dark:bg-surface-800 dark:text-surface-300',
  client_viewer: 'bg-surface-100 text-surface-600 dark:bg-surface-800 dark:text-surface-400',
} as const;

// Conversation Status Colors
export const CONVERSATION_STATUS_COLORS = {
  active: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
  completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
  abandoned: 'bg-surface-100 text-surface-600 dark:bg-surface-800 dark:text-surface-400',
  escalated: 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300',
} as const;

// Admin Navigation Items
export const ADMIN_NAVIGATION = [
  { 
    name: 'Dashboard', 
    href: '/admin/dashboard', 
    icon: 'LayoutDashboard',
    permission: null,
  },
  { 
    name: 'Organizations', 
    href: '/admin/organizations', 
    icon: 'Building2',
    permission: 'organizations:view',
  },
  { 
    name: 'Users', 
    href: '/admin/users', 
    icon: 'Users',
    permission: 'users:view',
  },
  { 
    name: 'Platform Admins', 
    href: '/admin/admins', 
    icon: 'Shield',
    permission: 'admin:manage',
  },
  { 
    name: 'Billing', 
    href: '/admin/billing', 
    icon: 'CreditCard',
    permission: 'billing:view',
  },
  { 
    name: 'Analytics', 
    href: '/admin/analytics', 
    icon: 'BarChart3',
    permission: null,
  },
  { 
    name: 'Support', 
    href: '/admin/support', 
    icon: 'HeadphonesIcon',
    permission: 'support:view',
    children: [
      { name: 'Conversations', href: '/admin/support/conversations' },
      { name: 'Activity Logs', href: '/admin/support/activity' },
      { name: 'Tickets', href: '/admin/support/tickets' },
      { name: 'Audit Logs', href: '/admin/support/audit-logs' },
    ],
  },
] as const;

// Analytics Navigation
export const ANALYTICS_NAVIGATION = [
  { name: 'Overview', href: '/admin/analytics', icon: 'LayoutDashboard' },
  { name: 'Usage', href: '/admin/analytics/usage', icon: 'Activity' },
  { name: 'Growth', href: '/admin/analytics/growth', icon: 'TrendingUp' },
  { name: 'Revenue', href: '/admin/analytics/revenue', icon: 'DollarSign' },
  { name: 'AI Usage', href: '/admin/analytics/ai', icon: 'Bot' },
] as const;

// Date Range Presets
export const DATE_RANGE_PRESETS = [
  { label: 'Today', value: 'today', days: 0 },
  { label: 'Yesterday', value: 'yesterday', days: 1 },
  { label: 'Last 7 days', value: '7d', days: 7 },
  { label: 'Last 30 days', value: '30d', days: 30 },
  { label: 'This month', value: 'this_month', days: -1 }, // Special handling
  { label: 'Last month', value: 'last_month', days: -2 }, // Special handling
  { label: 'Last 3 months', value: '90d', days: 90 },
  { label: 'Custom range', value: 'custom', days: -3 }, // Special handling
] as const;

// Pagination
export const ADMIN_DEFAULT_PAGE_SIZE = 20;
export const ADMIN_PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// Chart Colors
export const CHART_COLORS = {
  primary: '#5c7cfa',
  secondary: '#f06595',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',
  muted: '#9CA3AF',
  // Plan colors for charts
  free: '#9CA3AF',
  starter: '#3B82F6',
  professional: '#8B5CF6',
  enterprise: '#F59E0B',
} as const;

// Audit Log Categories
export const AUDIT_CATEGORIES = [
  { id: 'organization', label: 'Organization', icon: 'Building2' },
  { id: 'user', label: 'User', icon: 'User' },
  { id: 'billing', label: 'Billing', icon: 'CreditCard' },
  { id: 'admin', label: 'Admin', icon: 'Shield' },
  { id: 'system', label: 'System', icon: 'Settings' },
  { id: 'support', label: 'Support', icon: 'HeadphonesIcon' },
] as const;

// Conversation Types
export const CONVERSATION_TYPES = [
  { id: 'daily_checkin', label: 'Daily Check-in' },
  { id: 'scheduled_checkin', label: 'Scheduled Check-in' },
  { id: 'dashboard_chat', label: 'Dashboard Chat' },
  { id: 'project_creation', label: 'Project Creation' },
  { id: 'knowledge_base', label: 'Knowledge Base' },
  { id: 'sop_creation', label: 'SOP Creation' },
  { id: 'blocker_resolution', label: 'Blocker Resolution' },
  { id: 'ticket_discussion', label: 'Ticket Discussion' },
  { id: 'general', label: 'General' },
] as const;

// Conversation Channels
export const CONVERSATION_CHANNELS = [
  { id: 'web_app', label: 'Web App' },
  { id: 'google_chat', label: 'Google Chat' },
  { id: 'slack', label: 'Slack' },
  { id: 'email', label: 'Email' },
  { id: 'sms', label: 'SMS' },
  { id: 'api', label: 'API' },
] as const;
