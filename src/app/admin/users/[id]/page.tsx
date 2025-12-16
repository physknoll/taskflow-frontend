'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Skeleton } from '@/components/ui/Skeleton';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { useAdminUser, useSuspendUser, useUnsuspendUser, useImpersonateUser, useDeleteUser } from '@/hooks/admin/useAdminUsers';
import { ACCOUNT_STATUS_COLORS, ORG_ROLE_COLORS, PLATFORM_ROLES } from '@/lib/admin-constants';
import { hasAdminPermission, isSuperAdmin } from '@/lib/admin-permissions';
import { useAdminAuthStore } from '@/stores/adminAuthStore';
import { formatStatus, safeFormatDate } from '@/lib/utils';
import { 
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  Clock,
  Calendar,
  Shield,
  UserX,
  UserCheck,
  Users,
  Trash2,
  AlertTriangle,
  MessageSquare,
  Ticket,
  Activity,
  Bot,
  ExternalLink,
} from 'lucide-react';
import { format, formatDistanceToNow, subDays, startOfDay, eachDayOfInterval } from 'date-fns';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

type TabType = 'profile' | 'activity' | 'ai-usage';

// Helper to aggregate data by day for charts
function aggregateByDay(
  items: Array<{ timestamp?: string; createdAt?: string; startedAt?: string; lastMessageAt?: string }> | undefined,
  days: number = 30
): Array<{ date: string; count: number; fullDate: string }> {
  const endDate = new Date();
  const startDate = subDays(endDate, days - 1);
  
  // Create all days in range
  const allDays = eachDayOfInterval({ start: startDate, end: endDate });
  const dayMap = new Map<string, number>();
  
  allDays.forEach(day => {
    dayMap.set(format(day, 'yyyy-MM-dd'), 0);
  });
  
  // Count items per day
  if (items) {
    items.forEach(item => {
      const dateStr = item.timestamp || item.createdAt || item.startedAt || item.lastMessageAt;
      if (dateStr) {
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
          const dayKey = format(startOfDay(date), 'yyyy-MM-dd');
          if (dayMap.has(dayKey)) {
            dayMap.set(dayKey, (dayMap.get(dayKey) || 0) + 1);
          }
        }
      }
    });
  }
  
  // Convert to array
  return Array.from(dayMap.entries()).map(([key, count]) => ({
    date: format(new Date(key), 'MMM d'),
    fullDate: key,
    count,
  }));
}

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user: adminUser } = useAdminAuthStore();
  const userId = params.id as string;

  const { data: user, isLoading, error } = useAdminUser(userId);
  const suspendMutation = useSuspendUser();
  const unsuspendMutation = useUnsuspendUser();
  const impersonateMutation = useImpersonateUser();
  const deleteMutation = useDeleteUser();

  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');
  const [deleteConfirmEmail, setDeleteConfirmEmail] = useState('');

  const handleSuspend = () => {
    if (user && suspendReason) {
      suspendMutation.mutate(
        { id: user._id, reason: suspendReason },
        { onSuccess: () => setShowSuspendModal(false) }
      );
    }
  };

  const handleUnsuspend = () => {
    if (user) {
      unsuspendMutation.mutate(user._id);
    }
  };

  const handleImpersonate = () => {
    if (user) {
      impersonateMutation.mutate(user._id);
    }
  };

  const handleDelete = () => {
    if (user && deleteConfirmEmail === user.email) {
      deleteMutation.mutate(
        { id: user._id, confirmEmail: user.email },
        { onSuccess: () => router.push('/admin/users') }
      );
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile' },
    { id: 'activity', label: 'Activity' },
    { id: 'ai-usage', label: 'AI Usage' },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardContent className="space-y-4">
            <Skeleton className="h-6 w-64" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-32" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="text-center py-12">
        <p className="text-surface-500">User not found or failed to load.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/admin/users')}>
          Back to Users
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link 
        href="/admin/users"
        className="inline-flex items-center gap-2 text-surface-500 hover:text-surface-700 dark:hover:text-surface-300"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Users
      </Link>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="flex items-start gap-4">
          <Avatar
            firstName={user.firstName}
            lastName={user.lastName}
            src={user.avatar}
            size="xl"
          />
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-surface-900 dark:text-white">
                {user.firstName} {user.lastName}
              </h1>
              {user.platformRole && (
                <Badge className={PLATFORM_ROLES.find(r => r.id === user.platformRole)?.color}>
                  <Shield className="w-3 h-3 mr-1" />
                  {PLATFORM_ROLES.find(r => r.id === user.platformRole)?.label}
                </Badge>
              )}
            </div>
            <p className="text-surface-500 mt-1">{user.email}</p>
            <div className="flex items-center gap-3 mt-2">
              {user.role && (
                <Badge className={ORG_ROLE_COLORS[user.role] || ''}>
                  {formatStatus(user.role)}
                </Badge>
              )}
              <Badge className={ACCOUNT_STATUS_COLORS[user.accountStatus || 'active'] || ''}>
                {formatStatus(user.accountStatus, 'active')}
              </Badge>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {hasAdminPermission(adminUser?.platformRole, 'users:suspend') && (
            user.accountStatus === 'suspended' ? (
              <Button
                variant="outline"
                onClick={handleUnsuspend}
                leftIcon={<UserCheck className="w-4 h-4" />}
                isLoading={unsuspendMutation.isPending}
              >
                Unsuspend
              </Button>
            ) : (
              <Button
                variant="warning"
                onClick={() => setShowSuspendModal(true)}
                leftIcon={<UserX className="w-4 h-4" />}
              >
                Suspend
              </Button>
            )
          )}
          {isSuperAdmin(adminUser?.platformRole) && (
            <>
              <Button
                variant="outline"
                onClick={handleImpersonate}
                leftIcon={<Users className="w-4 h-4" />}
                isLoading={impersonateMutation.isPending}
              >
                Impersonate
              </Button>
              <Button
                variant="destructive"
                onClick={() => setShowDeleteModal(true)}
                leftIcon={<Trash2 className="w-4 h-4" />}
              >
                Delete
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Organization Link */}
      {user.organization && (
        <Card padding="sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-surface-100 dark:bg-surface-800">
                <Building2 className="w-5 h-5 text-surface-500" />
              </div>
              <div>
                <p className="text-sm text-surface-500">Organization</p>
                <Link
                  href={`/admin/organizations/${user.organization._id}`}
                  className="font-medium text-surface-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400"
                >
                  {user.organization.name}
                </Link>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/admin/organizations/${user.organization!._id}`)}
            >
              View Organization
            </Button>
          </div>
        </Card>
      )}

      {/* Tabs */}
      <div className="border-b border-surface-200 dark:border-surface-700">
        <nav className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contact Info */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-surface-400" />
                  <div>
                    <p className="text-sm text-surface-500">Email</p>
                    <p className="font-medium text-surface-900 dark:text-white">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-surface-400" />
                  <div>
                    <p className="text-sm text-surface-500">Phone</p>
                    <p className="font-medium text-surface-900 dark:text-white">
                      {user.phone || 'Not provided'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-surface-400" />
                  <div>
                    <p className="text-sm text-surface-500">Timezone</p>
                    <p className="font-medium text-surface-900 dark:text-white">{user.timezone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-surface-400" />
                  <div>
                    <p className="text-sm text-surface-500">Last Login</p>
                    <p className="font-medium text-surface-900 dark:text-white">
                      {user.lastLogin ? format(new Date(user.lastLogin), 'MMM d, yyyy h:mm a') : 'Never'}
                    </p>
                  </div>
                </div>
              </div>
              
              {user.jobTitle && (
                <div>
                  <p className="text-sm text-surface-500">Job Title</p>
                  <p className="font-medium text-surface-900 dark:text-white">{user.jobTitle}</p>
                </div>
              )}
              
              {user.department && (
                <div>
                  <p className="text-sm text-surface-500">Department</p>
                  <p className="font-medium text-surface-900 dark:text-white">{user.department}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {user.stats ? (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Ticket className="w-4 h-4 text-surface-500" />
                      <span className="text-surface-600 dark:text-surface-400">Tickets Completed</span>
                    </div>
                    <span className="font-semibold text-surface-900 dark:text-white">
                      {user.stats.totalTicketsCompleted}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-surface-500" />
                      <span className="text-surface-600 dark:text-surface-400">Avg Completion Time</span>
                    </div>
                    <span className="font-semibold text-surface-900 dark:text-white">
                      {user.stats.averageCompletionTime}h
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-surface-500" />
                      <span className="text-surface-600 dark:text-surface-400">Review Pass Rate</span>
                    </div>
                    <span className="font-semibold text-surface-900 dark:text-white">
                      {user.stats.reviewPassRate}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-surface-500" />
                      <span className="text-surface-600 dark:text-surface-400">Current Streak</span>
                    </div>
                    <span className="font-semibold text-surface-900 dark:text-white">
                      {user.stats.currentStreak} days
                    </span>
                  </div>
                </>
              ) : (
                <p className="text-surface-500 text-center py-4">No stats available</p>
              )}
            </CardContent>
          </Card>

          {/* Account Info */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Account Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-surface-500">Account Created</p>
                  <p className="font-medium text-surface-900 dark:text-white">
                    {format(new Date(user.createdAt), 'MMMM d, yyyy')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-surface-500">Account Status</p>
                  <Badge className={ACCOUNT_STATUS_COLORS[user.accountStatus || 'active'] || ''}>
                    {formatStatus(user.accountStatus, 'active')}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-surface-500">Organization Role</p>
                  <Badge className={ORG_ROLE_COLORS[user.role] || ''}>
                    {formatStatus(user.role, '-')}
                  </Badge>
                </div>
                {user.platformRole && (
                  <div>
                    <p className="text-sm text-surface-500">Platform Role</p>
                    <Badge className={PLATFORM_ROLES.find(r => r.id === user.platformRole)?.color}>
                      {PLATFORM_ROLES.find(r => r.id === user.platformRole)?.label}
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="space-y-6">
          {/* Activity Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Activity Over Time</span>
                <span className="text-sm font-normal text-surface-500">Last 30 days</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const chartData = aggregateByDay(user.recentActivity, 30);
                const totalActivity = chartData.reduce((sum, d) => sum + d.count, 0);
                
                if (totalActivity === 0) {
                  return (
                    <div className="h-48 flex items-center justify-center text-surface-500">
                      No activity data to display
                    </div>
                  );
                }
                
                return (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="activityGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 12, fill: '#9ca3af' }}
                          tickLine={false}
                          axisLine={{ stroke: '#374151', opacity: 0.3 }}
                          interval="preserveStartEnd"
                        />
                        <YAxis 
                          tick={{ fontSize: 12, fill: '#9ca3af' }}
                          tickLine={false}
                          axisLine={{ stroke: '#374151', opacity: 0.3 }}
                          allowDecimals={false}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1f2937', 
                            border: 'none', 
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)'
                          }}
                          labelStyle={{ color: '#f3f4f6' }}
                          itemStyle={{ color: '#a78bfa' }}
                          formatter={(value: number) => [`${value} activities`, 'Count']}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="count" 
                          stroke="#8b5cf6" 
                          strokeWidth={2}
                          fill="url(#activityGradient)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                );
              })()}
            </CardContent>
          </Card>

          {/* Activity List */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {!user.recentActivity || user.recentActivity.length === 0 ? (
                <p className="text-surface-500 text-center py-8">
                  No recent activity found
                </p>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {user.recentActivity.map((activity: any, index: number) => (
                    <div 
                      key={activity._id || index} 
                      className="flex items-start gap-4 p-4 rounded-lg bg-surface-50 dark:bg-surface-800/50"
                    >
                      <div className="p-2 rounded-full bg-primary-100 dark:bg-primary-900/30">
                        <Activity className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-surface-900 dark:text-white">
                          <span className="font-medium">{activity.action || activity.type || 'Activity'}</span>
                          {activity.entityType && (
                            <span className="text-surface-500"> on {activity.entityType}</span>
                          )}
                        </p>
                        {activity.description && (
                          <p className="text-sm text-surface-500 mt-1">{activity.description}</p>
                        )}
                        {activity.metadata?.ticketTitle && (
                          <p className="text-sm text-surface-600 dark:text-surface-400 mt-1">
                            Ticket: {activity.metadata.ticketTitle}
                          </p>
                        )}
                        {activity.metadata?.projectName && (
                          <p className="text-sm text-surface-600 dark:text-surface-400 mt-1">
                            Project: {activity.metadata.projectName}
                          </p>
                        )}
                        <p className="text-xs text-surface-400 mt-2">
                          {safeFormatDate(
                            activity.timestamp || activity.createdAt,
                            (d) => formatDistanceToNow(d, { addSuffix: true }),
                            'Unknown time'
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'ai-usage' && (
        <div className="space-y-6">
          {/* AI Usage Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>AI Conversations Over Time</span>
                <span className="text-sm font-normal text-surface-500">Last 30 days</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const chartData = aggregateByDay(user.recentConversations, 30);
                const totalConversations = chartData.reduce((sum, d) => sum + d.count, 0);
                const totalMessages = user.recentConversations?.reduce(
                  (sum: number, c: any) => sum + (c.messageCount || 0), 0
                ) || 0;
                
                if (totalConversations === 0) {
                  return (
                    <div className="h-48 flex items-center justify-center text-surface-500">
                      No AI usage data to display
                    </div>
                  );
                }
                
                return (
                  <>
                    {/* Summary Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="p-4 rounded-lg bg-violet-50 dark:bg-violet-900/20">
                        <p className="text-sm text-violet-600 dark:text-violet-400">Total Conversations</p>
                        <p className="text-2xl font-bold text-violet-700 dark:text-violet-300">
                          {user.recentConversations?.length || 0}
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-primary-50 dark:bg-primary-900/20">
                        <p className="text-sm text-primary-600 dark:text-primary-400">Total Messages</p>
                        <p className="text-2xl font-bold text-primary-700 dark:text-primary-300">
                          {totalMessages}
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                        <p className="text-sm text-emerald-600 dark:text-emerald-400">Avg Messages/Conv</p>
                        <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                          {user.recentConversations?.length 
                            ? Math.round(totalMessages / user.recentConversations.length) 
                            : 0}
                        </p>
                      </div>
                    </div>
                    
                    {/* Bar Chart */}
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                          <XAxis 
                            dataKey="date" 
                            tick={{ fontSize: 12, fill: '#9ca3af' }}
                            tickLine={false}
                            axisLine={{ stroke: '#374151', opacity: 0.3 }}
                            interval="preserveStartEnd"
                          />
                          <YAxis 
                            tick={{ fontSize: 12, fill: '#9ca3af' }}
                            tickLine={false}
                            axisLine={{ stroke: '#374151', opacity: 0.3 }}
                            allowDecimals={false}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#1f2937', 
                              border: 'none', 
                              borderRadius: '8px',
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)'
                            }}
                            labelStyle={{ color: '#f3f4f6' }}
                            itemStyle={{ color: '#a78bfa' }}
                            formatter={(value: number) => [`${value} conversations`, 'Count']}
                          />
                          <Bar 
                            dataKey="count" 
                            fill="#8b5cf6" 
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </>
                );
              })()}
            </CardContent>
          </Card>

          {/* Conversations List */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Conversations</CardTitle>
            </CardHeader>
            <CardContent>
              {!user.recentConversations || user.recentConversations.length === 0 ? (
                <p className="text-surface-500 text-center py-8">
                  No AI conversations found
                </p>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {user.recentConversations.map((conversation: any, index: number) => (
                    <div 
                      key={conversation._id || conversation.conversationId || index} 
                      className="p-4 rounded-lg bg-surface-50 dark:bg-surface-800/50 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-full bg-violet-100 dark:bg-violet-900/30">
                            <Bot className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                          </div>
                          <div>
                            <p className="font-medium text-surface-900 dark:text-white">
                              {conversation.title || conversation.type || 'AI Conversation'}
                            </p>
                            <div className="flex items-center gap-3 mt-1">
                              {conversation.status && (
                                <Badge size="sm" className={
                                  conversation.status === 'completed' 
                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                    : conversation.status === 'active'
                                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                                    : 'bg-surface-100 text-surface-600'
                                }>
                                  {conversation.status}
                                </Badge>
                              )}
                              {conversation.messageCount !== undefined && (
                                <span className="text-xs text-surface-500 flex items-center gap-1">
                                  <MessageSquare className="w-3 h-3" />
                                  {conversation.messageCount} messages
                                </span>
                              )}
                              {conversation.channel && (
                                <span className="text-xs text-surface-500 capitalize">
                                  {formatStatus(conversation.channel)}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-surface-400 mt-2">
                              {safeFormatDate(
                                conversation.lastMessageAt || conversation.startedAt || conversation.createdAt,
                                (d) => formatDistanceToNow(d, { addSuffix: true }),
                                'Unknown time'
                              )}
                            </p>
                          </div>
                        </div>
                        {conversation._id && (
                          <Link
                            href={`/admin/support/conversations/${conversation._id}`}
                            className="text-primary-600 hover:text-primary-700 dark:text-primary-400"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Suspend Modal */}
      <Modal
        isOpen={showSuspendModal}
        onClose={() => setShowSuspendModal(false)}
        title="Suspend User"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-surface-600 dark:text-surface-400">
            Suspending this user will prevent them from logging in and accessing the platform.
          </p>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
              Reason for suspension
            </label>
            <textarea
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              className="w-full p-3 border border-surface-300 dark:border-surface-600 rounded-lg bg-white dark:bg-surface-800 text-surface-900 dark:text-white"
              rows={3}
              placeholder="Enter reason for suspending this user..."
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowSuspendModal(false)}>
              Cancel
            </Button>
            <Button
              variant="warning"
              onClick={handleSuspend}
              disabled={!suspendReason}
              isLoading={suspendMutation.isPending}
            >
              Suspend User
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete User"
        size="sm"
      >
        <div className="space-y-4">
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-medium text-red-700 dark:text-red-300">
                  This action cannot be undone
                </p>
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                  This will permanently delete the user account and all associated data.
                </p>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
              Type <span className="font-mono font-bold">{user.email}</span> to confirm
            </label>
            <Input
              value={deleteConfirmEmail}
              onChange={(e) => setDeleteConfirmEmail(e.target.value)}
              placeholder="User email"
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteConfirmEmail !== user.email}
              isLoading={deleteMutation.isPending}
            >
              Delete User
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

