'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAdminGrowth } from '@/hooks/admin/useAdminAnalytics';
import { DATE_RANGE_PRESETS, CHART_COLORS } from '@/lib/admin-constants';
import { ArrowLeft, TrendingUp, Users, Building2, ArrowUpRight } from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { format, subDays } from 'date-fns';

export default function GrowthAnalyticsPage() {
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

  const { data, isLoading } = useAdminGrowth(getDateParams());

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
            Growth Metrics
          </h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1">
            User and organization growth over time
          </p>
        </div>
        <div className="w-48">
          <Select 
            value={dateRange} 
            onChange={(value) => setDateRange(value)}
            options={DATE_RANGE_PRESETS.filter((p) => p.days > 0).map((preset) => ({
              value: preset.value,
              label: preset.label,
            }))}
          />
        </div>
      </div>

      {/* Conversion Stats */}
      {data?.trialConversion && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-surface-500">Trials Started</p>
                  <p className="text-3xl font-bold text-surface-900 dark:text-white mt-2">
                    {data.trialConversion.trialsStarted}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-surface-500">Trials Converted</p>
                  <p className="text-3xl font-bold text-surface-900 dark:text-white mt-2">
                    {data.trialConversion.trialsConverted}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                  <ArrowUpRight className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-surface-500">Conversion Rate</p>
                  <p className="text-3xl font-bold text-surface-900 dark:text-white mt-2">
                    {data.trialConversion.conversionRate}%
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/30">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Organization Growth */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Organization Growth
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-80">
              <Skeleton className="h-full w-full" />
            </div>
          ) : data?.organizations && data.organizations.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.organizations}>
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
                    dataKey="count" 
                    stroke={CHART_COLORS.primary} 
                    strokeWidth={2}
                    name="New Organizations"
                    dot={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="cumulative" 
                    stroke={CHART_COLORS.success} 
                    strokeWidth={2}
                    name="Total Organizations"
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

      {/* User Growth */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            User Growth
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-80">
              <Skeleton className="h-full w-full" />
            </div>
          ) : data?.users && data.users.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.users}>
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
                    dataKey="count" 
                    stroke={CHART_COLORS.info} 
                    strokeWidth={2}
                    name="New Users"
                    dot={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="cumulative" 
                    stroke={CHART_COLORS.secondary} 
                    strokeWidth={2}
                    name="Total Users"
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
    </div>
  );
}

