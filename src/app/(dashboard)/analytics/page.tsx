'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Progress } from '@/components/ui/Progress';
import { Skeleton } from '@/components/ui/Skeleton';
import { useTickets } from '@/hooks/useTickets';
import { useClients } from '@/hooks/useClients';
import { TICKET_STATUSES, TICKET_PRIORITIES } from '@/lib/constants';
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  Users,
  Ticket,
  Target,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';

const COLORS = ['#5c7cfa', '#f06595', '#37b24d', '#fab005', '#e64980', '#15aabf'];

export default function AnalyticsPage() {
  const { tickets, isLoading: ticketsLoading } = useTickets({});
  const { clients, isLoading: clientsLoading } = useClients();
  const [timeRange, setTimeRange] = useState('7d');

  // Calculate stats
  const totalTickets = tickets.length;
  const completedTickets = tickets.filter(t => t.status === 'completed').length;
  const inProgressTickets = tickets.filter(t => t.status === 'in_progress').length;
  const overdueTickets = tickets.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed').length;

  // Tickets by status
  const ticketsByStatus = TICKET_STATUSES.map(status => ({
    name: status.label,
    value: tickets.filter(t => t.status === status.id).length,
  }));

  // Tickets by priority
  const ticketsByPriority = TICKET_PRIORITIES.map(priority => ({
    name: priority.label,
    value: tickets.filter(t => t.priority === priority.id).length,
  }));

  // Tickets by client
  const ticketsByClient = clients.slice(0, 5).map(client => ({
    name: client.name,
    tickets: tickets.filter(t => 
      (typeof t.client === 'object' && t.client._id === client._id) || t.client === client._id
    ).length,
  }));

  // Completion rate
  const completionRate = totalTickets > 0 ? Math.round((completedTickets / totalTickets) * 100) : 0;

  const isLoading = ticketsLoading || clientsLoading;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Track performance and project metrics"
        action={
          <Select
            options={[
              { value: '7d', label: 'Last 7 days' },
              { value: '30d', label: 'Last 30 days' },
              { value: '90d', label: 'Last 90 days' },
            ]}
            value={timeRange}
            onChange={setTimeRange}
          />
        }
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Tickets"
          value={isLoading ? '...' : totalTickets}
          icon={<Ticket className="h-6 w-6" />}
          color="primary"
        />
        <StatCard
          title="Completed"
          value={isLoading ? '...' : completedTickets}
          icon={<CheckCircle className="h-6 w-6" />}
          color="success"
          subValue={`${completionRate}% completion rate`}
        />
        <StatCard
          title="In Progress"
          value={isLoading ? '...' : inProgressTickets}
          icon={<Clock className="h-6 w-6" />}
          color="warning"
        />
        <StatCard
          title="Overdue"
          value={isLoading ? '...' : overdueTickets}
          icon={<AlertTriangle className="h-6 w-6" />}
          color={overdueTickets > 0 ? 'danger' : 'success'}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tickets by Status */}
        <Card>
          <CardHeader>
            <CardTitle>Tickets by Status</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton variant="rounded" height={300} />
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={ticketsByStatus.filter(s => s.value > 0)}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {ticketsByStatus.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-4 mt-4">
                  {ticketsByStatus.filter(s => s.value > 0).map((status, index) => (
                    <div key={status.name} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-sm text-surface-600 dark:text-surface-400">
                        {status.name}: {status.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tickets by Priority */}
        <Card>
          <CardHeader>
            <CardTitle>Tickets by Priority</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton variant="rounded" height={300} />
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ticketsByPriority}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#5c7cfa" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tickets by Client */}
      <Card>
        <CardHeader>
          <CardTitle>Tickets by Client</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton variant="text" width={120} />
                  <div className="flex-1">
                    <Skeleton variant="rounded" height={24} />
                  </div>
                  <Skeleton variant="text" width={40} />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {ticketsByClient.map((client, index) => (
                <div key={client.name} className="flex items-center gap-4">
                  <div className="w-32 truncate text-sm font-medium text-surface-900 dark:text-white">
                    {client.name}
                  </div>
                  <div className="flex-1">
                    <div 
                      className="h-6 rounded-full" 
                      style={{ 
                        width: `${(client.tickets / Math.max(...ticketsByClient.map(c => c.tickets))) * 100}%`,
                        backgroundColor: COLORS[index % COLORS.length],
                        minWidth: client.tickets > 0 ? '20px' : '0'
                      }}
                    />
                  </div>
                  <div className="w-10 text-right text-sm font-medium text-surface-700 dark:text-surface-300">
                    {client.tickets}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Completion Rate Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Completion Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress 
              value={completionRate} 
              size="lg" 
              variant={completionRate >= 75 ? 'success' : completionRate >= 50 ? 'warning' : 'default'} 
              showLabel 
            />
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-surface-900 dark:text-white">{completedTickets}</p>
                <p className="text-sm text-surface-500 dark:text-surface-400">Completed</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-surface-900 dark:text-white">{inProgressTickets}</p>
                <p className="text-sm text-surface-500 dark:text-surface-400">In Progress</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-surface-900 dark:text-white">{totalTickets - completedTickets - inProgressTickets}</p>
                <p className="text-sm text-surface-500 dark:text-surface-400">Backlog</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'primary' | 'success' | 'warning' | 'danger';
  subValue?: string;
}

function StatCard({ title, value, icon, color, subValue }: StatCardProps) {
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
            {subValue && (
              <p className="text-xs text-surface-500 dark:text-surface-400 mt-2">{subValue}</p>
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


