'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAdminOrganizations, useFlagOrganization } from '@/hooks/admin/useAdminOrganizations';
import { SUBSCRIPTION_STATUS_COLORS, SUBSCRIPTION_PLANS } from '@/lib/admin-constants';
import { formatStatus } from '@/lib/utils';
import { AdminOrganizationParams, SubscriptionPlan, SubscriptionStatus } from '@/types/admin';
import { 
  Search, 
  Building2, 
  Users, 
  Flag, 
  FlagOff,
  ChevronLeft, 
  ChevronRight,
  ExternalLink,
  Filter,
} from 'lucide-react';
import { format } from 'date-fns';

export default function OrganizationsPage() {
  const router = useRouter();
  const [params, setParams] = useState<AdminOrganizationParams>({
    page: 1,
    limit: 20,
  });
  const [searchInput, setSearchInput] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading, error } = useAdminOrganizations(params);
  const flagMutation = useFlagOrganization();

  const handleSearch = () => {
    setParams((prev) => ({ ...prev, search: searchInput, page: 1 }));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handlePlanFilter = (plan: string) => {
    setParams((prev) => ({ 
      ...prev, 
      plan: plan === 'all' ? undefined : plan as SubscriptionPlan, 
      page: 1 
    }));
  };

  const handleStatusFilter = (status: string) => {
    setParams((prev) => ({ 
      ...prev, 
      status: status === 'all' ? undefined : status as SubscriptionStatus, 
      page: 1 
    }));
  };

  const handleFlaggedFilter = (flagged: string) => {
    setParams((prev) => ({ 
      ...prev, 
      flagged: flagged === 'true' ? true : flagged === 'false' ? false : undefined, 
      page: 1 
    }));
  };

  const handleFlag = (id: string, currentlyFlagged: boolean) => {
    flagMutation.mutate({ id, flag: !currentlyFlagged });
  };

  const getPlanColor = (plan: SubscriptionPlan) => {
    return SUBSCRIPTION_PLANS.find((p) => p.id === plan)?.color || 'bg-surface-100 text-surface-600';
  };

  const getStatusColor = (status: SubscriptionStatus) => {
    return SUBSCRIPTION_STATUS_COLORS[status] || 'bg-surface-100 text-surface-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">
            Organizations
          </h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1">
            Manage all organizations on the platform
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <Card padding="md">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
              <Input
                placeholder="Search by name or slug..."
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

          {/* Filter Row */}
          {showFilters && (
            <div className="flex flex-wrap gap-4 pt-4 border-t border-surface-200 dark:border-surface-700">
              <div className="w-40">
                <Select
                  label="Plan"
                  value={params.plan || 'all'}
                  onChange={(value) => handlePlanFilter(value)}
                  options={[
                    { value: 'all', label: 'All Plans' },
                    ...SUBSCRIPTION_PLANS.map((plan) => ({ value: plan.id, label: plan.label }))
                  ]}
                />
              </div>
              <div className="w-40">
                <Select
                  label="Status"
                  value={params.status || 'all'}
                  onChange={(value) => handleStatusFilter(value)}
                  options={[
                    { value: 'all', label: 'All Statuses' },
                    { value: 'active', label: 'Active' },
                    { value: 'trialing', label: 'Trialing' },
                    { value: 'past_due', label: 'Past Due' },
                    { value: 'canceled', label: 'Canceled' },
                    { value: 'unpaid', label: 'Unpaid' },
                  ]}
                />
              </div>
              <div className="w-40">
                <Select
                  label="Flagged"
                  value={params.flagged === undefined ? 'all' : params.flagged.toString()}
                  onChange={(value) => handleFlaggedFilter(value)}
                  options={[
                    { value: 'all', label: 'All' },
                    { value: 'true', label: 'Flagged Only' },
                    { value: 'false', label: 'Not Flagged' },
                  ]}
                />
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Organizations Table */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-200 dark:border-surface-700">
                <th className="text-left px-6 py-4 text-sm font-medium text-surface-500 dark:text-surface-400">
                  Organization
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-surface-500 dark:text-surface-400">
                  Plan
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-surface-500 dark:text-surface-400">
                  Status
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-surface-500 dark:text-surface-400">
                  Users
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-surface-500 dark:text-surface-400">
                  Created
                </th>
                <th className="text-right px-6 py-4 text-sm font-medium text-surface-500 dark:text-surface-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                // Loading skeletons
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-surface-100 dark:border-surface-800">
                    <td className="px-6 py-4">
                      <Skeleton className="h-5 w-40" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-5 w-20" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-5 w-20" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-5 w-10" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-5 w-24" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-8 w-20 ml-auto" />
                    </td>
                  </tr>
                ))
              ) : error ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-surface-500">
                    Failed to load organizations. Please try again.
                  </td>
                </tr>
              ) : data?.data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-surface-500">
                    No organizations found.
                  </td>
                </tr>
              ) : (
                data?.data.map((org) => (
                  <tr 
                    key={org._id} 
                    className="border-b border-surface-100 dark:border-surface-800 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-surface-100 dark:bg-surface-700 flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-surface-500" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <Link 
                              href={`/admin/organizations/${org._id}`}
                              className="font-medium text-surface-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400"
                            >
                              {org.name}
                            </Link>
                            {org.isFlagged && (
                              <Flag className="w-4 h-4 text-red-500" />
                            )}
                          </div>
                          <p className="text-sm text-surface-500">{org.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={getPlanColor(org.currentPlan)}>
                        {SUBSCRIPTION_PLANS.find((p) => p.id === org.currentPlan)?.label || org.currentPlan}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={getStatusColor(org.subscriptionStatus || 'active')}>
                        {formatStatus(org.subscriptionStatus, 'active')}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-surface-600 dark:text-surface-400">
                        <Users className="w-4 h-4" />
                        <span>{org.userCount}</span>
                        <span className="text-surface-400">
                          ({org.activeUserCount} active)
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-surface-600 dark:text-surface-400">
                      {format(new Date(org.createdAt), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleFlag(org._id, org.isFlagged)}
                          title={org.isFlagged ? 'Unflag' : 'Flag'}
                        >
                          {org.isFlagged ? (
                            <FlagOff className="w-4 h-4 text-surface-500" />
                          ) : (
                            <Flag className="w-4 h-4 text-surface-500" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/admin/organizations/${org._id}`)}
                          rightIcon={<ExternalLink className="w-4 h-4" />}
                        >
                          View
                        </Button>
                      </div>
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
              {data.pagination.total} organizations
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



