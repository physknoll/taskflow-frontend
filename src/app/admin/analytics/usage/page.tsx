'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAdminUsage } from '@/hooks/admin/useAdminAnalytics';
import { DATE_RANGE_PRESETS, CHART_COLORS } from '@/lib/admin-constants';
import { ArrowLeft, Activity, Users, Ticket, MessageSquare } from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import { format, subDays } from 'date-fns';

export default function UsageAnalyticsPage() {
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

  const { data, isLoading } = useAdminUsage(getDateParams());

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
            Usage Analytics
          </h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1">
            Platform activity over time
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

      {/* AI Usage Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            AI Conversations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-80">
              <Skeleton className="h-full w-full" />
            </div>
          ) : data?.aiUsage && data.aiUsage.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.aiUsage}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-surface-200 dark:stroke-surface-700" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => format(new Date(date), 'MMM d')}
                    className="text-surface-500"
                  />
                  <YAxis className="text-surface-500" />
                  <Tooltip 
                    labelFormatter={(date) => format(new Date(date), 'MMMM d, yyyy')}
                    contentStyle={{ 
                      backgroundColor: 'var(--surface-800)', 
                      border: 'none', 
                      borderRadius: '8px',
                      color: 'white',
                    }}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="conversations" 
                    stroke={CHART_COLORS.primary} 
                    fill={CHART_COLORS.primary}
                    fillOpacity={0.2}
                    name="Conversations"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="messages" 
                    stroke={CHART_COLORS.secondary} 
                    fill={CHART_COLORS.secondary}
                    fillOpacity={0.2}
                    name="Messages"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-surface-400">
              No data available for this period
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tickets Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="w-5 h-5" />
            Ticket Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-80">
              <Skeleton className="h-full w-full" />
            </div>
          ) : data?.ticketActivity && data.ticketActivity.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.ticketActivity}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-surface-200 dark:stroke-surface-700" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => format(new Date(date), 'MMM d')}
                    className="text-surface-500"
                  />
                  <YAxis className="text-surface-500" />
                  <Tooltip 
                    labelFormatter={(date) => format(new Date(date), 'MMMM d, yyyy')}
                    contentStyle={{ 
                      backgroundColor: 'var(--surface-800)', 
                      border: 'none', 
                      borderRadius: '8px',
                      color: 'white',
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="created" 
                    stroke={CHART_COLORS.info} 
                    strokeWidth={2}
                    name="Created"
                    dot={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="completed" 
                    stroke={CHART_COLORS.success} 
                    strokeWidth={2}
                    name="Completed"
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

      {/* New Users & Organizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              New Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-64">
                <Skeleton className="h-full w-full" />
              </div>
            ) : data?.newUsers && data.newUsers.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.newUsers}>
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
                    <Area 
                      type="monotone" 
                      dataKey="count" 
                      stroke={CHART_COLORS.info} 
                      fill={CHART_COLORS.info}
                      fillOpacity={0.2}
                      name="New Users"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-surface-400">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              New Organizations
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-64">
                <Skeleton className="h-full w-full" />
              </div>
            ) : data?.newOrganizations && data.newOrganizations.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.newOrganizations}>
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
                    <Area 
                      type="monotone" 
                      dataKey="count" 
                      stroke={CHART_COLORS.success} 
                      fill={CHART_COLORS.success}
                      fillOpacity={0.2}
                      name="New Organizations"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-surface-400">
                No data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
