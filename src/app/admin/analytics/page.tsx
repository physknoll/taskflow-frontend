'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAdminOverview, useAdminRevenue } from '@/hooks/admin/useAdminAnalytics';
import { SUBSCRIPTION_PLANS, CHART_COLORS } from '@/lib/admin-constants';
import { hasAdminPermission } from '@/lib/admin-permissions';
import { useAdminAuthStore } from '@/stores/adminAuthStore';
import { 
  Building2, 
  Users, 
  MessageSquare, 
  Ticket, 
  TrendingUp, 
  DollarSign,
  ArrowUpRight,
  Activity,
  Bot,
  BarChart3,
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';

function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend,
  trendValue,
  loading,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  trend?: 'up' | 'down';
  trendValue?: string;
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
            {trend && trendValue && (
              <div className="flex items-center gap-1 mt-2">
                <ArrowUpRight className={`w-4 h-4 ${trend === 'up' ? 'text-emerald-500' : 'text-red-500'}`} />
                <span className={trend === 'up' ? 'text-emerald-500' : 'text-red-500'}>
                  {trendValue}
                </span>
              </div>
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

export default function AnalyticsPage() {
  const { user } = useAdminAuthStore();
  const { data: overview, isLoading: overviewLoading } = useAdminOverview();
  const { data: revenue, isLoading: revenueLoading } = useAdminRevenue();

  const canViewRevenue = hasAdminPermission(user?.platformRole, 'analytics:revenue');

  // Prepare pie chart data for organizations by plan
  const planChartData = overview ? Object.entries(overview.organizations.byPlan).map(([plan, count]) => ({
    name: SUBSCRIPTION_PLANS.find((p) => p.id === plan)?.label || plan,
    value: count,
    color: CHART_COLORS[plan as keyof typeof CHART_COLORS] || CHART_COLORS.muted,
  })) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">
          Analytics
        </h1>
        <p className="text-surface-500 dark:text-surface-400 mt-1">
          Platform-wide metrics and insights
        </p>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/admin/analytics/usage" className="block">
          <Card hover className="h-full">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Activity className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-surface-900 dark:text-white">Usage</p>
                <p className="text-sm text-surface-500">Activity over time</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/analytics/growth" className="block">
          <Card hover className="h-full">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="font-medium text-surface-900 dark:text-white">Growth</p>
                <p className="text-sm text-surface-500">User & org growth</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        {canViewRevenue && (
          <Link href="/admin/analytics/revenue" className="block">
            <Card hover className="h-full">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                  <DollarSign className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-medium text-surface-900 dark:text-white">Revenue</p>
                  <p className="text-sm text-surface-500">MRR, ARR, Churn</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        )}
        <Link href="/admin/analytics/ai" className="block">
          <Card hover className="h-full">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <Bot className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-surface-900 dark:text-white">AI Usage</p>
                <p className="text-sm text-surface-500">Conversations & more</p>
              </div>
            </CardContent>
          </Card>
        </Link>
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

      {/* Revenue Stats (if permitted) */}
      {canViewRevenue && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="MRR"
            value={revenue ? `$${revenue.mrr.toLocaleString()}` : '--'}
            icon={DollarSign}
            loading={revenueLoading}
          />
          <StatCard
            title="ARR"
            value={revenue ? `$${revenue.arr.toLocaleString()}` : '--'}
            icon={TrendingUp}
            loading={revenueLoading}
          />
          <StatCard
            title="Churn Rate"
            value={revenue ? `${revenue.churnRate}%` : '--'}
            icon={Activity}
            loading={revenueLoading}
          />
          <StatCard
            title="ARPU"
            value={revenue ? `$${revenue.arpu}` : '--'}
            subtitle="Average revenue per user"
            icon={DollarSign}
            loading={revenueLoading}
          />
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Organizations by Plan */}
        <Card>
          <CardHeader>
            <CardTitle>Organizations by Plan</CardTitle>
          </CardHeader>
          <CardContent>
            {overviewLoading ? (
              <div className="h-64 flex items-center justify-center">
                <Skeleton className="h-48 w-48 rounded-full" />
              </div>
            ) : planChartData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={planChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {planChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-surface-400">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Platform Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {overviewLoading ? (
              <>
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </>
            ) : (
              <>
                <div className="flex items-center justify-between p-3 rounded-lg bg-surface-50 dark:bg-surface-800">
                  <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-surface-500" />
                    <span className="text-surface-600 dark:text-surface-400">Active Organizations</span>
                  </div>
                  <span className="font-semibold text-surface-900 dark:text-white">
                    {overview?.organizations.active ?? '--'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-surface-50 dark:bg-surface-800">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-surface-500" />
                    <span className="text-surface-600 dark:text-surface-400">Active Users This Week</span>
                  </div>
                  <span className="font-semibold text-surface-900 dark:text-white">
                    {overview?.users.activeThisWeek ?? '--'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-surface-50 dark:bg-surface-800">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-5 h-5 text-surface-500" />
                    <span className="text-surface-600 dark:text-surface-400">Total AI Conversations</span>
                  </div>
                  <span className="font-semibold text-surface-900 dark:text-white">
                    {overview?.ai.totalConversations ?? '--'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-surface-50 dark:bg-surface-800">
                  <div className="flex items-center gap-3">
                    <Ticket className="w-5 h-5 text-surface-500" />
                    <span className="text-surface-600 dark:text-surface-400">Tickets Created This Month</span>
                  </div>
                  <span className="font-semibold text-surface-900 dark:text-white">
                    {overview?.tickets.createdThisMonth ?? '--'}
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

