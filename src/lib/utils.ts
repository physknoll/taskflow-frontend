import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const then = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (diffInSeconds < 0) {
    const absDiff = Math.abs(diffInSeconds);
    if (absDiff < 60) return 'in a moment';
    if (absDiff < 3600) return `in ${Math.floor(absDiff / 60)}m`;
    if (absDiff < 86400) return `in ${Math.floor(absDiff / 3600)}h`;
    if (absDiff < 604800) return `in ${Math.floor(absDiff / 86400)}d`;
    return formatDate(date);
  }

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

  return formatDate(date);
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function getInitials(firstName?: string, lastName?: string): string {
  return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function calculateProgress(tasks: Array<{ status: string }>): number {
  if (tasks.length === 0) return 0;
  const completed = tasks.filter((t) => t.status === 'completed').length;
  return Math.round((completed / tasks.length) * 100);
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) return `${hours}h`;
  return `${hours}h ${remainingMinutes}m`;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    backlog: 'bg-surface-200 text-surface-700 dark:bg-surface-700 dark:text-surface-300',
    todo: 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300',
    in_progress: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
    in_review: 'bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300',
    approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
    completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
    archived: 'bg-surface-200 text-surface-500 dark:bg-surface-800 dark:text-surface-500',
    pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
    rejected: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
    needs_revision: 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300',
  };
  return colors[status] || colors.backlog;
}

export function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    low: 'bg-surface-200 text-surface-600 dark:bg-surface-700 dark:text-surface-400',
    medium: 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300',
    high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300',
    urgent: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
  };
  return colors[priority] || colors.medium;
}

export function getTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    feature: '✨',
    bug: '🐛',
    content: '📝',
    design: '🎨',
    maintenance: '🔧',
    other: '📋',
  };
  return icons[type] || icons.other;
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export function isOverdue(dueDate?: Date | string): boolean {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date();
}

export function isDueSoon(dueDate?: Date | string, daysThreshold = 2): boolean {
  if (!dueDate) return false;
  const due = new Date(dueDate);
  const now = new Date();
  const threshold = new Date(now.getTime() + daysThreshold * 24 * 60 * 60 * 1000);
  return due > now && due <= threshold;
}

/**
 * Format a status string by replacing underscores with spaces
 * Safely handles null/undefined values
 */
export function formatStatus(status?: string | null, fallback = '-'): string {
  if (!status) return fallback;
  return status.replace(/_/g, ' ');
}

/**
 * Safely check if a date value is valid
 */
export function isValidDate(dateValue: string | Date | undefined | null): boolean {
  if (!dateValue) return false;
  const date = new Date(dateValue);
  return !isNaN(date.getTime());
}

/**
 * Safely format a date, returning fallback if invalid
 */
export function safeFormatDate(
  dateValue: string | Date | undefined | null,
  formatFn: (date: Date) => string,
  fallback = '-'
): string {
  if (!dateValue) return fallback;
  const date = new Date(dateValue);
  if (isNaN(date.getTime())) return fallback;
  return formatFn(date);
}


