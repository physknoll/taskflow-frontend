'use client';

import { Menu, Bell, Search } from 'lucide-react';
import { useAdminAuthStore } from '@/stores/adminAuthStore';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { PLATFORM_ROLES } from '@/lib/admin-constants';

interface AdminHeaderProps {
  onMenuClick: () => void;
}

export function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const { user } = useAdminAuthStore();

  const roleConfig = PLATFORM_ROLES.find((r) => r.id === user?.platformRole);

  return (
    <header className="h-16 bg-white dark:bg-surface-800 border-b border-surface-200 dark:border-surface-700 flex items-center justify-between px-4 lg:px-6">
      {/* Left side */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
        >
          <Menu className="h-5 w-5 text-surface-600 dark:text-surface-300" />
        </button>

        {/* Search */}
        <div className="hidden md:flex items-center gap-2 bg-surface-100 dark:bg-surface-700 rounded-lg px-3 py-2 w-64 lg:w-80">
          <Search className="h-4 w-4 text-surface-400" />
          <input
            type="text"
            placeholder="Search organizations, users..."
            className="bg-transparent border-none outline-none text-sm text-surface-900 dark:text-white placeholder-surface-400 w-full"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Role Badge */}
        {roleConfig && (
          <Badge className={roleConfig.color}>
            {roleConfig.label}
          </Badge>
        )}

        {/* Notifications */}
        <button className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors relative">
          <Bell className="h-5 w-5 text-surface-600 dark:text-surface-300" />
          {/* Notification dot */}
          {/* <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" /> */}
        </button>

        {/* User avatar - mobile only */}
        <div className="lg:hidden">
          <Avatar
            firstName={user?.firstName}
            lastName={user?.lastName}
            src={user?.avatar}
            size="sm"
          />
        </div>
      </div>
    </header>
  );
}
