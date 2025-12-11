'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Skeleton';
import { Avatar } from '@/components/ui/Avatar';
import { useAdminTickets } from '@/hooks/admin/useAdminSupport';
import { TICKET_STATUSES, TICKET_PRIORITIES } from '@/lib/constants';
import { AdminListParams } from '@/types/admin';
import { 
  ArrowLeft,
  Search,
  Ticket,
  ChevronLeft, 
  ChevronRight,
  Filter,
  Building2,
  Calendar,
} from 'lucide-react';
import { format } from 'date-fns';
import { safeFormatDate } from '@/lib/utils';

interface TicketListParams extends AdminListParams {
  organizationId?: string;
  status?: string;
  priority?: string;
}

export default function TicketsBrowserPage() {
  const [params, setParams] = useState<TicketListParams>({
    page: 1,
    limit: 20,
  });
  const [searchInput, setSearchInput] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading, error } = useAdminTickets(params);

  const handleSearch = () => {
    setParams((prev) => ({ ...prev, search: searchInput, page: 1 }));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleStatusFilter = (status: string) => {
    setParams((prev) => ({ ...prev, status: status === 'all' ? undefined : status, page: 1 }));
  };

  const handlePriorityFilter = (priority: string) => {
    setParams((prev) => ({ ...prev, priority: priority === 'all' ? undefined : priority, page: 1 }));
  };

  const getStatusColor = (status: string) => {
    const statusConfig = TICKET_STATUSES.find((s) => s.id === status);
    return statusConfig?.color || 'bg-surface-100';
  };

  const getPriorityColor = (priority: string) => {
    const priorityConfig = TICKET_PRIORITIES.find((p) => p.id === priority);
    return priorityConfig?.color || 'bg-surface-100 text-surface-600';
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link 
        href="/admin/support"
        className="inline-flex items-center gap-2 text-surface-500 hover:text-surface-700 dark:hover:text-surface-300"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Support
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">
            Tickets Browser
          </h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1">
            Browse all tickets across organizations
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <Card padding="md">
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
              <Input
                placeholder="Search by title or ticket number..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch}>Search</Button>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              leftIcon={<Filter className="h-4 w-4" />}
            >
              Filters
            </Button>
          </div>

          {showFilters && (
            <div className="flex flex-wrap gap-4 pt-4 border-t border-surface-200 dark:border-surface-700">
              <div className="w-40">
                <Select
                  label="Status"
                  value={params.status || 'all'}
                  onChange={(value) => handleStatusFilter(value)}
                  options={[
                    { value: 'all', label: 'All Statuses' },
                    ...TICKET_STATUSES.map((status) => ({ value: status.id, label: status.label }))
                  ]}
                />
              </div>
              <div className="w-40">
                <Select
                  label="Priority"
                  value={params.priority || 'all'}
                  onChange={(value) => handlePriorityFilter(value)}
                  options={[
                    { value: 'all', label: 'All Priorities' },
                    ...TICKET_PRIORITIES.map((priority) => ({ value: priority.id, label: priority.label }))
                  ]}
                />
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Tickets Table */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-200 dark:border-surface-700">
                <th className="text-left px-6 py-4 text-sm font-medium text-surface-500">Ticket</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-surface-500">Organization</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-surface-500">Status</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-surface-500">Priority</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-surface-500">Due Date</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-surface-500">Created</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-surface-100 dark:border-surface-800">
                    <td className="px-6 py-4"><Skeleton className="h-5 w-48" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-32" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-20" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-16" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-24" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-24" /></td>
                  </tr>
                ))
              ) : error ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-surface-500">
                    Failed to load tickets. Please try again.
                  </td>
                </tr>
              ) : data?.data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-surface-500">
                    No tickets found.
                  </td>
                </tr>
              ) : (
                data?.data.map((ticket) => (
                  <tr 
                    key={ticket._id} 
                    className="border-b border-surface-100 dark:border-surface-800 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-surface-900 dark:text-white">
                          {ticket.title}
                        </p>
                        <p className="text-sm text-surface-500 font-mono">
                          {ticket.ticketNumber}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {ticket.organization ? (
                        <Link
                          href={`/admin/organizations/${ticket.organization._id}`}
                          className="flex items-center gap-2 text-surface-600 dark:text-surface-400 hover:text-primary-600"
                        >
                          <Building2 className="w-4 h-4" />
                          {ticket.organization.name}
                        </Link>
                      ) : (
                        <span className="text-surface-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={getStatusColor(ticket.status)}>
                        {TICKET_STATUSES.find((s) => s.id === ticket.status)?.label || ticket.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={getPriorityColor(ticket.priority)}>
                        {ticket.priority}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-surface-600 dark:text-surface-400">
                      {safeFormatDate(ticket.dueDate, (d) => format(d, 'MMM d, yyyy'))}
                    </td>
                    <td className="px-6 py-4 text-surface-600 dark:text-surface-400">
                      {safeFormatDate(ticket.createdAt, (d) => format(d, 'MMM d, yyyy'))}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.pagination.pages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-surface-200 dark:border-surface-700">
            <p className="text-sm text-surface-500">
              Showing {((data.pagination.page - 1) * data.pagination.limit) + 1} to{' '}
              {Math.min(data.pagination.page * data.pagination.limit, data.pagination.total)} of{' '}
              {data.pagination.total} tickets
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={data.pagination.page === 1}
                onClick={() => setParams((prev) => ({ ...prev, page: (prev.page || 1) - 1 }))}
                leftIcon={<ChevronLeft className="w-4 h-4" />}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={data.pagination.page === data.pagination.pages}
                onClick={() => setParams((prev) => ({ ...prev, page: (prev.page || 1) + 1 }))}
                rightIcon={<ChevronRight className="w-4 h-4" />}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
