'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { useAdminAIAnalytics } from '@/hooks/admin/useAdminAnalytics';
import { DATE_RANGE_PRESETS, CHART_COLORS, CONVERSATION_TYPES } from '@/lib/admin-constants';
import { formatStatus } from '@/lib/utils';
import { ArrowLeft, Bot, MessageSquare, Users, Building2, TrendingUp } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { format, subDays } from 'date-fns';

export default function AIAnalyticsPage() {
  const [dateRange, setDateRange] = useState('30d');
  
  const getDateParams = () => {
    const now = new Date();
    const preset = DATE_RANGE_PRESETS.find((p) => p.value === dateRange);
    if (preset && preset.days > 0) {
      return {
        startDate: subDays(now, preset.days).toISOString(),
        endDate: now.toISOString(),
      };
    }
    return {
      startDate: subDays(now, 30).toISOString(),
      endDate: now.toISOString(),
    };
  };

  const { data, isLoading } = useAdminAIAnalytics(getDateParams());

  // Prepare chart data
  const typeChartData = data?.byType?.map((item) => ({
    name: CONVERSATION_TYPES.find((t) => t.id === item.type)?.label || item.type,
    conversations: item.count,
    messages: item.totalMessages,
  })) || [];

  const channelChartData = data?.byChannel?.map((item) => ({
    name: formatStatus(item.channel),
    value: item.count,
  })) || [];

  const CHANNEL_COLORS = [CHART_COLORS.primary, CHART_COLORS.secondary, CHART_COLORS.success, CHART_COLORS.warning];

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link 
        href="/admin/analytics"
        className="inline-flex items-center gap-2 text-surface-500 hover:text-surface-700 dark:hover:text-surface-300"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Analytics
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">
            AI Usage Analytics
          </h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1">
            AI conversation metrics and insights
          </p>
        </div>
        <div className="w-48">
          <Select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
            {DATE_RANGE_PRESETS.filter((p) => p.days > 0).map((preset) => (
              <option key={preset.value} value={preset.value}>
                {preset.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Summary Stats */}
      {data?.summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-surface-500">Total Conversations</p>
                  <p className="text-3xl font-bold text-surface-900 dark:text-white mt-2">
                    {data.summary.totalConversations.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/30">
                  <MessageSquare className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-surface-500">Completion Rate</p>
                  <p className="text-3xl font-bold text-surface-900 dark:text-white mt-2">
                    {data.summary.completionRate}%
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                  <TrendingUp className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-surface-500">Completed</p>
                  <p className="text-3xl font-bold text-surface-900 dark:text-white mt-2">
                    {data.summary.totalCompleted.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                  <Bot className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-surface-500">Escalated</p>
                  <p className="text-3xl font-bold text-surface-900 dark:text-white mt-2">
                    {data.summary.totalEscalated.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-900/30">
                  <Users className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Daily Usage Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Daily AI Usage</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-80">
              <Skeleton className="h-full w-full" />
            </div>
          ) : data?.dailyUsage && data.dailyUsage.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.dailyUsage}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-surface-200 dark:stroke-surface-700" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => format(new Date(date), 'MMM d')}
                    className="text-surface-500"
                  />
                  <YAxis className="text-surface-500" />
                  <Tooltip 
                    labelFormatter={(date) => format(new Date(date), 'MMMM d, yyyy')}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="conversations" 
                    stroke={CHART_COLORS.primary} 
                    strokeWidth={2}
                    name="Conversations"
                    dot={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="uniqueUsers" 
                    stroke={CHART_COLORS.success} 
                    strokeWidth={2}
                    name="Unique Users"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-surface-400">
              No data available for this period
            </div>
          )}
        </CardContent>
      </Card>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* By Type */}
        <Card>
          <CardHeader>
            <CardTitle>Conversations by Type</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-80">
                <Skeleton className="h-full w-full" />
              </div>
            ) : typeChartData.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={typeChartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-surface-200 dark:stroke-surface-700" />
                    <XAxis type="number" className="text-surface-500" />
                    <YAxis type="category" dataKey="name" width={120} className="text-surface-500" />
                    <Tooltip />
                    <Bar dataKey="conversations" fill={CHART_COLORS.primary} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center text-surface-400">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* By Channel */}
        <Card>
          <CardHeader>
            <CardTitle>Conversations by Channel</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-80 flex items-center justify-center">
                <Skeleton className="h-48 w-48 rounded-full" />
              </div>
            ) : channelChartData.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={channelChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {channelChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHANNEL_COLORS[index % CHANNEL_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center text-surface-400">
                No data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Users & Organizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Users */}
        <Card>
          <CardHeader>
            <CardTitle>Top AI Users</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : data?.topUsers && data.topUsers.length > 0 ? (
              <div className="space-y-3">
                {data.topUsers.map((user, index) => (
                  <div 
                    key={user.userId}
                    className="flex items-center justify-between p-3 rounded-lg bg-surface-50 dark:bg-surface-800"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-surface-400 w-6">
                        {index + 1}
                      </span>
                      <Avatar
                        firstName={user.firstName}
                        lastName={user.lastName}
                        size="sm"
                      />
                      <div>
                        <p className="font-medium text-surface-900 dark:text-white">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-sm text-surface-500">{user.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-surface-900 dark:text-white">
                        {user.conversationCount}
                      </p>
                      <p className="text-sm text-surface-500">conversations</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-surface-500 text-center py-8">No data available</p>
            )}
          </CardContent>
        </Card>

        {/* Top Organizations */}
        <Card>
          <CardHeader>
            <CardTitle>Top Organizations</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : data?.topOrganizations && data.topOrganizations.length > 0 ? (
              <div className="space-y-3">
                {data.topOrganizations.map((org, index) => (
                  <div 
                    key={org.organizationId}
                    className="flex items-center justify-between p-3 rounded-lg bg-surface-50 dark:bg-surface-800"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-surface-400 w-6">
                        {index + 1}
                      </span>
                      <div className="w-10 h-10 rounded-lg bg-surface-200 dark:bg-surface-700 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-surface-500" />
                      </div>
                      <div>
                        <Link 
                          href={`/admin/organizations/${org.organizationId}`}
                          className="font-medium text-surface-900 dark:text-white hover:text-primary-600"
                        >
                          {org.name}
                        </Link>
                        <Badge size="sm" className="mt-1">
                          {org.plan}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-surface-900 dark:text-white">
                        {org.conversationCount}
                      </p>
                      <p className="text-sm text-surface-500">{org.uniqueUsers} users</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-surface-500 text-center py-8">No data available</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
