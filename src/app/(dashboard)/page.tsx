'use client';

import { useAuthStore } from '@/stores/authStore';
import { useTickets } from '@/hooks/useTickets';
import { useReviews } from '@/hooks/useReviews';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { Skeleton } from '@/components/ui/Skeleton';
import { ContributionCalendar, StreakCard } from '@/components/dashboard';
import { useUIStore } from '@/stores/uiStore';
import {
  Ticket,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  Plus,
  ArrowRight,
  Calendar,
  Target,
  Activity,
} from 'lucide-react';
import Link from 'next/link';
import { formatRelativeTime, getStatusColor, getPriorityColor, calculateProgress } from '@/lib/utils';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { tickets, isLoading: ticketsLoading } = useTickets({});
  const { pendingCount, isLoading: reviewsLoading } = useReviews();
  const { openModal } = useUIStore();

  // Calculate stats
  const myTickets = tickets.filter(t => 
    Array.isArray(t.assignedTo) && 
    t.assignedTo.some((u: any) => u._id === user?._id || u === user?._id)
  );
  const inProgressTickets = myTickets.filter(t => t.status === 'in_progress');
  const overdueTickets = myTickets.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed');
  const completedThisWeek = myTickets.filter(t => {
    if (t.status !== 'completed' || !t.completedAt) return false;
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return new Date(t.completedAt) > weekAgo;
  });

  const isLoading = ticketsLoading || reviewsLoading;

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">
            Welcome back, {user?.firstName}! 👋
          </h1>
          <p className="text-surface-600 dark:text-surface-400 mt-1">
            Here's what's happening with your projects today.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => openModal('dailyUpdate')}>
            <Clock className="h-4 w-4 mr-2" />
            Log Update
          </Button>
          <Button onClick={() => openModal('createTicket')}>
            <Plus className="h-4 w-4 mr-2" />
            New Ticket
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="My Tickets"
          value={isLoading ? '...' : myTickets.length}
          icon={<Ticket className="h-6 w-6" />}
          color="primary"
          trend={`${inProgressTickets.length} in progress`}
        />
        <StatCard
          title="Completed This Week"
          value={isLoading ? '...' : completedThisWeek.length}
          icon={<CheckCircle className="h-6 w-6" />}
          color="success"
          trend="Keep it up!"
        />
        <StatCard
          title="Pending Reviews"
          value={isLoading ? '...' : pendingCount}
          icon={<Target className="h-6 w-6" />}
          color="warning"
          trend={pendingCount > 0 ? 'Needs attention' : 'All clear'}
        />
        <StatCard
          title="Overdue"
          value={isLoading ? '...' : overdueTickets.length}
          icon={<AlertTriangle className="h-6 w-6" />}
          color={overdueTickets.length > 0 ? 'danger' : 'success'}
          trend={overdueTickets.length > 0 ? 'Action required' : 'On track'}
        />
      </div>

      {/* Activity Section - GitHub Style */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contribution Calendar */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <Activity className="h-5 w-5 text-[#39d353]" />
              <CardTitle>Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ContributionCalendar days={365} />
            </CardContent>
          </Card>
        </div>

        {/* Streak Card */}
        <StreakCard />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity / My Tasks */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>My Active Tickets</CardTitle>
              <Link href="/tickets">
                <Button variant="ghost" size="sm">
                  View all <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-4 p-4 border border-surface-200 dark:border-surface-700 rounded-lg">
                      <Skeleton variant="circular" width={40} height={40} />
                      <div className="flex-1">
                        <Skeleton variant="text" width="60%" />
                        <Skeleton variant="text" width="40%" className="mt-2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : inProgressTickets.length === 0 ? (
                <div className="text-center py-12 text-surface-500 dark:text-surface-400">
                  <Ticket className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No active tickets right now</p>
                  <Button variant="outline" className="mt-4" onClick={() => openModal('createTicket')}>
                    Create your first ticket
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {inProgressTickets.slice(0, 5).map((ticket) => {
                    const progress = calculateProgress(ticket.tasks);
                    return (
                      <Link
                        key={ticket._id}
                        href={`/tickets/${ticket._id}`}
                        className="block p-4 border border-surface-200 dark:border-surface-700 rounded-lg hover:border-primary-300 dark:hover:border-primary-600 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-mono text-surface-500 dark:text-surface-400">
                                {ticket.ticketNumber}
                              </span>
                              <Badge className={getPriorityColor(ticket.priority)} size="sm">
                                {ticket.priority}
                              </Badge>
                            </div>
                            <h4 className="font-medium text-surface-900 dark:text-white truncate">
                              {ticket.title}
                            </h4>
                            {ticket.tasks.length > 0 && (
                              <div className="mt-2">
                                <Progress value={progress} size="sm" variant={progress === 100 ? 'success' : 'default'} />
                                <p className="text-xs text-surface-500 dark:text-surface-400 mt-1">
                                  {ticket.tasks.filter(t => t.status === 'completed').length}/{ticket.tasks.length} tasks
                                </p>
                              </div>
                            )}
                          </div>
                          {ticket.dueDate && (
                            <div className="flex items-center gap-1 text-xs text-surface-500 dark:text-surface-400">
                              <Calendar className="h-3 w-3" />
                              {formatRelativeTime(ticket.dueDate)}
                            </div>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Stats */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" onClick={() => openModal('createTicket')}>
                <Plus className="h-4 w-4 mr-2" />
                Create New Ticket
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => openModal('dailyUpdate')}>
                <Clock className="h-4 w-4 mr-2" />
                Log Daily Update
              </Button>
              <Link href="/ai-assistant" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  AI Assistant
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Your Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-surface-600 dark:text-surface-400">Tickets Completed</span>
                  <span className="font-medium text-surface-900 dark:text-white">
                    {user?.stats?.totalTicketsCompleted || 0}
                  </span>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-surface-600 dark:text-surface-400">Review Pass Rate</span>
                  <span className="font-medium text-surface-900 dark:text-white">
                    {user?.stats?.reviewPassRate || 100}%
                  </span>
                </div>
                <Progress value={user?.stats?.reviewPassRate || 100} size="sm" variant="success" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-surface-600 dark:text-surface-400">Avg Completion Time</span>
                  <span className="font-medium text-surface-900 dark:text-white">
                    {user?.stats?.averageCompletionTime ? `${Math.round(user.stats.averageCompletionTime)}h` : 'N/A'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Overdue Tickets */}
          {overdueTickets.length > 0 && (
            <Card variant="outlined" className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
              <CardHeader>
                <CardTitle className="text-red-700 dark:text-red-300 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Overdue Tickets
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {overdueTickets.slice(0, 3).map((ticket) => (
                  <Link
                    key={ticket._id}
                    href={`/tickets/${ticket._id}`}
                    className="block p-2 rounded-lg bg-white dark:bg-surface-800 text-sm hover:shadow-sm transition-shadow"
                  >
                    <span className="font-medium text-surface-900 dark:text-white">{ticket.title}</span>
                    <span className="text-red-600 dark:text-red-400 text-xs block">
                      Due {formatRelativeTime(ticket.dueDate!)}
                    </span>
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'primary' | 'success' | 'warning' | 'danger';
  trend?: string;
}

function StatCard({ title, value, icon, color, trend }: StatCardProps) {
  const colorStyles = {
    primary: 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300',
    success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
    warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
    danger: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-surface-600 dark:text-surface-400">{title}</p>
            <p className="text-3xl font-bold text-surface-900 dark:text-white mt-1">{value}</p>
            {trend && (
              <p className="text-xs text-surface-500 dark:text-surface-400 mt-2">{trend}</p>
            )}
          </div>
          <div className={`p-3 rounded-xl ${colorStyles[color]}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

