'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAdminAuthStore } from '@/stores/adminAuthStore';
import { useAdminOverview } from '@/hooks/admin/useAdminAnalytics';
import { 
  Building2, 
  Users, 
  MessageSquare, 
  Ticket, 
  DollarSign,
} from 'lucide-react';

function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  loading,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-8 w-16 mb-1" />
          <Skeleton className="h-3 w-32" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-surface-500 dark:text-surface-400">
              {title}
            </p>
            <p className="text-3xl font-bold text-surface-900 dark:text-white mt-2">
              {value}
            </p>
            {subtitle && (
              <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">
                {subtitle}
              </p>
            )}
          </div>
          <div className="p-3 rounded-xl bg-surface-100 dark:bg-surface-800">
            <Icon className="w-6 h-6 text-surface-600 dark:text-surface-400" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboardPage() {
  const { user } = useAdminAuthStore();
  const { data: overview, isLoading: overviewLoading } = useAdminOverview();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-surface-500 dark:text-surface-400 mt-1">
          Welcome back, {user?.firstName}! Here&apos;s what&apos;s happening on the platform.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Organizations"
          value={overview?.organizations.total ?? '--'}
          subtitle={`${overview?.organizations.active ?? '--'} active, ${overview?.organizations.trialing ?? '--'} trialing`}
          icon={Building2}
          loading={overviewLoading}
        />
        <StatCard
          title="Total Users"
          value={overview?.users.total ?? '--'}
          subtitle={`${overview?.users.newThisMonth ?? '--'} new this month`}
          icon={Users}
          loading={overviewLoading}
        />
        <StatCard
          title="AI Conversations"
          value={overview?.ai.conversationsThisMonth ?? '--'}
          subtitle="This month"
          icon={MessageSquare}
          loading={overviewLoading}
        />
        <StatCard
          title="Tickets"
          value={overview?.tickets.total ?? '--'}
          subtitle={`${overview?.tickets.completedThisMonth ?? '--'} completed this month`}
          icon={Ticket}
          loading={overviewLoading}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Organizations by Plan */}
        <Card>
          <CardHeader>
            <CardTitle>Organizations by Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-surface-400">
              <p>Chart will be rendered after analytics service is connected</p>
            </div>
          </CardContent>
        </Card>

        {/* User Growth */}
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-surface-400">
              <p>Chart will be rendered after analytics service is connected</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <button className="w-full p-3 text-left rounded-lg bg-surface-50 dark:bg-surface-800 hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                  <Building2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                <span className="font-medium text-surface-900 dark:text-white">
                  View Flagged Organizations
                </span>
              </div>
            </button>
            <button className="w-full p-3 text-left rounded-lg bg-surface-50 dark:bg-surface-800 hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="font-medium text-surface-900 dark:text-white">
                  View Suspended Users
                </span>
              </div>
            </button>
            <button className="w-full p-3 text-left rounded-lg bg-surface-50 dark:bg-surface-800 hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                  <DollarSign className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
                <span className="font-medium text-surface-900 dark:text-white">
                  View Past Due Subscriptions
                </span>
              </div>
            </button>
          </CardContent>
        </Card>

        {/* Recent Admin Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Admin Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center py-8 text-surface-400">
                <p>Recent admin actions will appear here</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
