'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAdminAuthStore } from '@/stores/adminAuthStore';
import { hasAdminPermission } from '@/lib/admin-permissions';
import { Avatar } from '@/components/ui/Avatar';
import {
  LayoutDashboard,
  Building2,
  Users,
  Shield,
  CreditCard,
  BarChart3,
  Headphones,
  ChevronLeft,
  ChevronRight,
  LogOut,
  X,
  ShieldCheck,
  MessageSquare,
  Activity,
  Ticket,
  FileText,
  ChevronDown,
} from 'lucide-react';
import { useState } from 'react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  permission: string | null;
  children?: { name: string; href: string }[];
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard, permission: null },
  { name: 'Organizations', href: '/admin/organizations', icon: Building2, permission: 'organizations:view' },
  { name: 'Users', href: '/admin/users', icon: Users, permission: 'users:view' },
  { name: 'Platform Admins', href: '/admin/admins', icon: Shield, permission: 'admin:manage' },
  { name: 'Billing', href: '/admin/billing', icon: CreditCard, permission: 'billing:view' },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3, permission: null },
  { 
    name: 'Support', 
    href: '/admin/support', 
    icon: Headphones, 
    permission: 'support:view',
    children: [
      { name: 'Conversations', href: '/admin/support/conversations' },
      { name: 'Activity Logs', href: '/admin/support/activity' },
      { name: 'Tickets', href: '/admin/support/tickets' },
      { name: 'Audit Logs', href: '/admin/support/audit-logs' },
    ],
  },
];

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function AdminSidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAdminAuthStore();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const filteredNav = navigation.filter(
    (item) => !item.permission || hasAdminPermission(user?.platformRole, item.permission)
  );

  const handleLogout = () => {
    logout();
    if (typeof window !== 'undefined') {
      window.location.href = '/admin/login';
    }
  };

  const toggleExpanded = (name: string) => {
    setExpandedItems((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const isActive = (href: string) => {
    if (href === '/admin/dashboard') {
      return pathname === '/admin/dashboard' || pathname === '/admin';
    }
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-50 flex flex-col bg-surface-900 text-white transition-all duration-300',
          collapsed ? 'w-20' : 'w-72',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-surface-700">
          {!collapsed && (
            <Link href="/admin/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">Admin Panel</span>
            </Link>
          )}
          {collapsed && (
            <div className="w-full flex justify-center">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
            </div>
          )}
          <button
            onClick={onMobileClose}
            className="lg:hidden p-2 rounded-lg hover:bg-surface-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          {filteredNav.map((item) => {
            const active = isActive(item.href);
            const hasChildren = item.children && item.children.length > 0;
            const isExpanded = expandedItems.includes(item.name) || (hasChildren && active);

            return (
              <div key={item.name}>
                {hasChildren ? (
                  <button
                    onClick={() => toggleExpanded(item.name)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group',
                      active
                        ? 'bg-surface-800 text-white'
                        : 'text-surface-400 hover:bg-surface-800 hover:text-white'
                    )}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    {!collapsed && (
                      <>
                        <span className="font-medium flex-1 text-left">{item.name}</span>
                        <ChevronDown
                          className={cn(
                            'h-4 w-4 transition-transform',
                            isExpanded && 'rotate-180'
                          )}
                        />
                      </>
                    )}
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    onClick={onMobileClose}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group',
                      active
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                        : 'text-surface-400 hover:bg-surface-800 hover:text-white'
                    )}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    {!collapsed && <span className="font-medium">{item.name}</span>}
                  </Link>
                )}

                {/* Children */}
                {hasChildren && isExpanded && !collapsed && (
                  <div className="ml-4 mt-1 space-y-1 border-l border-surface-700 pl-4">
                    {item.children!.map((child) => {
                      const childActive = pathname === child.href;
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={onMobileClose}
                          className={cn(
                            'block px-3 py-2 rounded-lg text-sm transition-colors',
                            childActive
                              ? 'bg-purple-600/20 text-purple-300'
                              : 'text-surface-400 hover:bg-surface-800 hover:text-white'
                          )}
                        >
                          {child.name}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Collapse toggle */}
        <button
          onClick={onToggle}
          className="hidden lg:flex items-center justify-center h-10 mx-3 mb-2 rounded-lg border border-surface-700 text-surface-400 hover:text-white hover:bg-surface-800 transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </button>

        {/* User section */}
        <div className="p-4 border-t border-surface-700">
          <div
            className={cn(
              'flex items-center gap-3',
              collapsed && 'flex-col'
            )}
          >
            <Avatar
              firstName={user?.firstName}
              lastName={user?.lastName}
              src={user?.avatar}
              size="md"
            />
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-surface-400 capitalize">
                  {user?.platformRole?.replace('_', ' ')}
                </p>
              </div>
            )}
            <button
              onClick={handleLogout}
              className={cn(
                'p-2 rounded-lg text-surface-400 hover:text-red-400 hover:bg-red-900/20 transition-colors',
                collapsed && 'mt-2'
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
