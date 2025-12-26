'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { useReviews } from '@/hooks/useReviews';
import { hasPermission } from '@/lib/permissions';
import { Avatar } from '@/components/ui/Avatar';
import {
  LayoutDashboard,
  Ticket,
  Users,
  Building2,
  CheckSquare,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  X,
  Sparkles,
  FolderKanban,
  Bot,
  CalendarDays,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard, permission: null },
  { name: 'Calendar', href: '/calendar', icon: CalendarDays, permission: null },
  { name: 'Projects', href: '/projects', icon: FolderKanban, permission: null },
  { name: 'Tickets', href: '/tickets', icon: Ticket, permission: null },
  { name: 'Review Queue', href: '/review', icon: CheckSquare, permission: 'reviews.conduct', badge: true },
  { name: 'Team', href: '/team', icon: Users, permission: 'users.view' },
  { name: 'Clients', href: '/clients', icon: Building2, permission: 'clients.view' },
  { name: 'Analytics', href: '/analytics', icon: BarChart3, permission: 'analytics.view_all' },
  { name: 'AI Manager', href: '/ai-manager', icon: Bot, permission: 'aipm.view' },
  { name: 'Settings', href: '/settings', icon: Settings, permission: null },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { sidebarCollapsed, sidebarOpen, toggleSidebar, setSidebarOpen } = useUIStore();
  const { pendingCount } = useReviews();

  const filteredNav = navigation.filter(
    (item) => !item.permission || hasPermission(user?.role, item.permission)
  );

  const handleLogout = () => {
    logout();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-50 flex flex-col bg-[var(--bg-secondary)] border-r border-[var(--border-default)] transition-all duration-300',
          sidebarCollapsed ? 'w-20' : 'w-72',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-[var(--border-default)]">
          {!sidebarCollapsed && (
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-glow">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">
                TaskFlow
              </span>
            </Link>
          )}
          {sidebarCollapsed && (
            <div className="w-full flex justify-center">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-glow">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-[var(--bg-tertiary)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          {filteredNav.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            const showBadge = item.badge && pendingCount > 0;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative',
                  isActive
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 shadow-sm'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'
                )}
              >
                <item.icon
                  className={cn(
                    'h-5 w-5 flex-shrink-0',
                    isActive ? 'text-primary-600 dark:text-primary-400' : 'text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]'
                  )}
                />
                {!sidebarCollapsed && (
                  <>
                    <span className="font-medium">{item.name}</span>
                    {showBadge && (
                      <span className="ml-auto bg-primary-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {pendingCount}
                      </span>
                    )}
                  </>
                )}
                {sidebarCollapsed && showBadge && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-primary-500 rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Collapse toggle */}
        <button
          onClick={toggleSidebar}
          className="hidden lg:flex items-center justify-center h-10 mx-3 mb-2 rounded-lg border border-[var(--border-default)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </button>

        {/* User section */}
        <div className="p-4 border-t border-[var(--border-default)]">
          <div
            className={cn(
              'flex items-center gap-3',
              sidebarCollapsed && 'justify-center'
            )}
          >
            <Avatar
              firstName={user?.firstName}
              lastName={user?.lastName}
              src={user?.avatar}
              size="md"
            />
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-[var(--text-muted)] capitalize">
                  {user?.role?.replace('_', ' ')}
                </p>
              </div>
            )}
            <button
              onClick={handleLogout}
              className={cn(
                'p-2 rounded-lg text-[var(--text-muted)] hover:text-error-500 hover:bg-error-50 dark:hover:bg-error-900/20 transition-colors',
                sidebarCollapsed && 'mt-2'
              )}
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
