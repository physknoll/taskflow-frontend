'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { cn, formatRelativeTime } from '@/lib/utils';
import { useUIStore } from '@/stores/uiStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { useNotifications } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/Button';
import { Dropdown, DropdownItem, DropdownDivider, DropdownLabel } from '@/components/ui/Dropdown';
import {
  Menu,
  Bell,
  Search,
  Plus,
  Sun,
  Moon,
  Monitor,
  Check,
  CheckCheck,
  Ticket,
  MessageCircle,
  AlertTriangle,
  Bot,
} from 'lucide-react';
import Link from 'next/link';

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/tickets': 'Tickets',
  '/clients': 'Clients',
  '/review': 'Review Queue',
  '/team': 'Team',
  '/analytics': 'Analytics',
  '/ai-assistant': 'AI Assistant',
  '/settings': 'Settings',
};

const notificationIcons: Record<string, React.ElementType> = {
  ticket_assigned: Ticket,
  ticket_updated: Ticket,
  ticket_comment: MessageCircle,
  review_requested: Check,
  review_completed: CheckCheck,
  ai_checkin: Bot,
  ai_reminder: Bot,
  due_date_approaching: AlertTriangle,
  due_date_passed: AlertTriangle,
  default: Bell,
};

// Normalize URLs from backend that might not match frontend routes
const normalizeActionUrl = (url: string | undefined): string => {
  if (!url) return '#';
  // Map /dashboard to / since dashboard is at root
  if (url === '/dashboard') return '/';
  return url;
};

export function Header() {
  const pathname = usePathname();
  const { setSidebarOpen, openModal, theme, setTheme } = useUIStore();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [searchOpen, setSearchOpen] = useState(false);

  // Get current page title
  const getPageTitle = () => {
    for (const [path, title] of Object.entries(pageTitles)) {
      if (path === pathname || (path !== '/' && pathname.startsWith(path))) {
        return title;
      }
    }
    return 'TaskFlow AI';
  };

  return (
    <header className="h-16 bg-white dark:bg-surface-900 border-b border-surface-200 dark:border-surface-800 flex items-center justify-between px-4 lg:px-6">
      {/* Left side */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800"
        >
          <Menu className="h-5 w-5 text-surface-600 dark:text-surface-400" />
        </button>
        <h1 className="text-xl font-bold text-surface-900 dark:text-white">
          {getPageTitle()}
        </h1>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSearchOpen(!searchOpen)}
          className="text-surface-600 dark:text-surface-400"
        >
          <Search className="h-5 w-5" />
        </Button>

        {/* Quick create */}
        <Dropdown
          trigger={
            <Button variant="ghost" size="icon" className="text-surface-600 dark:text-surface-400">
              <Plus className="h-5 w-5" />
            </Button>
          }
        >
          <DropdownLabel>Quick Create</DropdownLabel>
          <DropdownItem icon={<Ticket className="h-4 w-4" />} onClick={() => openModal('createTicket')}>
            New Ticket
          </DropdownItem>
          <DropdownItem icon={<MessageCircle className="h-4 w-4" />} onClick={() => openModal('dailyUpdate')}>
            Daily Update
          </DropdownItem>
        </Dropdown>

        {/* Theme toggle */}
        <Dropdown
          trigger={
            <Button variant="ghost" size="icon" className="text-surface-600 dark:text-surface-400">
              {theme === 'dark' ? (
                <Moon className="h-5 w-5" />
              ) : theme === 'light' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Monitor className="h-5 w-5" />
              )}
            </Button>
          }
        >
          <DropdownLabel>Theme</DropdownLabel>
          <DropdownItem icon={<Sun className="h-4 w-4" />} onClick={() => setTheme('light')}>
            Light
          </DropdownItem>
          <DropdownItem icon={<Moon className="h-4 w-4" />} onClick={() => setTheme('dark')}>
            Dark
          </DropdownItem>
          <DropdownItem icon={<Monitor className="h-4 w-4" />} onClick={() => setTheme('system')}>
            System
          </DropdownItem>
        </Dropdown>

        {/* Notifications */}
        <Dropdown
          trigger={
            <button className="relative p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-600 dark:text-surface-400">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-accent-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          }
          className="w-80"
        >
          <div className="px-4 py-3 border-b border-surface-200 dark:border-surface-700 flex items-center justify-between">
            <span className="font-semibold text-surface-900 dark:text-white">Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead()}
                className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-surface-500 dark:text-surface-400">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              notifications.slice(0, 5).map((notification) => {
                const Icon = notificationIcons[notification.type] || notificationIcons.default;
                return (
                  <Link
                    key={notification._id}
                    href={normalizeActionUrl(notification.actionUrl)}
                    onClick={() => !notification.isRead && markAsRead(notification._id)}
                    className={cn(
                      'block px-4 py-3 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors',
                      !notification.isRead && 'bg-primary-50/50 dark:bg-primary-900/20'
                    )}
                  >
                    <div className="flex gap-3">
                      <div
                        className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                          notification.isRead
                            ? 'bg-surface-100 dark:bg-surface-700 text-surface-500'
                            : 'bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400'
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            'text-sm',
                            notification.isRead
                              ? 'text-surface-600 dark:text-surface-400'
                              : 'text-surface-900 dark:text-white font-medium'
                          )}
                        >
                          {notification.title}
                        </p>
                        <p className="text-xs text-surface-500 dark:text-surface-500 truncate">
                          {notification.message}
                        </p>
                        <p className="text-xs text-surface-400 dark:text-surface-600 mt-1">
                          {formatRelativeTime(notification.createdAt)}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <div className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0 mt-2" />
                      )}
                    </div>
                  </Link>
                );
              })
            )}
          </div>
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-surface-200 dark:border-surface-700">
              <Link
                href="/settings/notifications"
                className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
              >
                View all notifications
              </Link>
            </div>
          )}
        </Dropdown>
      </div>
    </header>
  );
}

