'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAdminRevenue } from '@/hooks/admin/useAdminAnalytics';
import { SUBSCRIPTION_PLANS, CHART_COLORS } from '@/lib/admin-constants';
import { ArrowLeft, DollarSign, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
} from 'recharts';

export default function RevenueAnalyticsPage() {
  const { data, isLoading } = useAdminRevenue();

  // Prepare chart data
  const subscriptionsChartData = data ? Object.entries(data.subscriptionsByPlan).map(([plan, count]) => ({
    name: SUBSCRIPTION_PLANS.find((p) => p.id === plan)?.label || plan,
    value: count,
    color: CHART_COLORS[plan as keyof typeof CHART_COLORS] || CHART_COLORS.muted,
  })) : [];

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
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">
          Revenue Metrics
        </h1>
        <p className="text-surface-500 dark:text-surface-400 mt-1">
          Financial performance and subscription analytics
        </p>
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            {isLoading ? (
              <>
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="h-10 w-24" />
              </>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-surface-500">MRR</p>
                  <p className="text-3xl font-bold text-surface-900 dark:text-white mt-2">
                    ${data?.mrr.toLocaleString() ?? '--'}
                  </p>
                  <p className="text-sm text-surface-500 mt-1">Monthly Recurring Revenue</p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                  <DollarSign className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            {isLoading ? (
              <>
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="h-10 w-24" />
              </>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-surface-500">ARR</p>
                  <p className="text-3xl font-bold text-surface-900 dark:text-white mt-2">
                    ${data?.arr.toLocaleString() ?? '--'}
                  </p>
                  <p className="text-sm text-surface-500 mt-1">Annual Recurring Revenue</p>
                </div>
                <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            {isLoading ? (
              <>
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="h-10 w-24" />
              </>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-surface-500">Churn Rate</p>
                  <p className="text-3xl font-bold text-surface-900 dark:text-white mt-2">
                    {data?.churnRate ?? '--'}%
                  </p>
                  <p className="text-sm text-surface-500 mt-1">Monthly churn</p>
                </div>
                <div className="p-3 rounded-xl bg-red-100 dark:bg-red-900/30">
                  <TrendingDown className="w-6 h-6 text-red-600" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            {isLoading ? (
              <>
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="h-10 w-24" />
              </>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-surface-500">ARPU</p>
                  <p className="text-3xl font-bold text-surface-900 dark:text-white mt-2">
                    ${data?.arpu ?? '--'}
                  </p>
                  <p className="text-sm text-surface-500 mt-1">Avg Revenue Per User</p>
                </div>
                <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/30">
                  <Activity className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Subscriptions by Plan */}
      <Card>
        <CardHeader>
          <CardTitle>Subscriptions by Plan</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-80">
              <Skeleton className="h-full w-full" />
            </div>
          ) : subscriptionsChartData.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subscriptionsChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-surface-200 dark:stroke-surface-700" />
                  <XAxis type="number" className="text-surface-500" />
                  <YAxis type="category" dataKey="name" className="text-surface-500" width={100} />
                  <Tooltip />
                  <Bar dataKey="value" name="Subscriptions" radius={[0, 4, 4, 0]}>
                    {subscriptionsChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
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

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Summary</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 rounded-lg bg-surface-50 dark:bg-surface-800">
                <span className="text-surface-600 dark:text-surface-400">Total Active Subscriptions</span>
                <span className="text-xl font-bold text-surface-900 dark:text-white">
                  {data?.totalActiveSubscriptions ?? '--'}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-surface-50 dark:bg-surface-800">
                <span className="text-surface-600 dark:text-surface-400">Monthly Revenue Per Subscription</span>
                <span className="text-xl font-bold text-surface-900 dark:text-white">
                  ${data && data.totalActiveSubscriptions > 0 
                    ? (data.mrr / data.totalActiveSubscriptions).toFixed(2) 
                    : '--'}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

