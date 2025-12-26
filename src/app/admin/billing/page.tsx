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
import { Modal } from '@/components/ui/Modal';
import { useAdminSubscriptions, useExtendTrial, useApplyCredit } from '@/hooks/admin/useBilling';
import { SUBSCRIPTION_STATUS_COLORS, SUBSCRIPTION_PLANS } from '@/lib/admin-constants';
import { formatStatus } from '@/lib/utils';
import { SubscriptionPlan, SubscriptionStatus, AdminListParams } from '@/types/admin';
import { 
  Search, 
  Building2,
  CreditCard,
  Clock,
  ChevronLeft, 
  ChevronRight,
  ExternalLink,
  Filter,
  Calendar,
  DollarSign,
} from 'lucide-react';
import { format } from 'date-fns';

interface BillingListParams extends AdminListParams {
  plan?: SubscriptionPlan;
  status?: SubscriptionStatus;
}

export default function BillingPage() {
  const router = useRouter();
  const [params, setParams] = useState<BillingListParams>({
    page: 1,
    limit: 20,
  });
  const [searchInput, setSearchInput] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Modal states
  const [showExtendTrialModal, setShowExtendTrialModal] = useState(false);
  const [showApplyCreditModal, setShowApplyCreditModal] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [extendDays, setExtendDays] = useState(14);
  const [creditAmount, setCreditAmount] = useState('');
  const [creditReason, setCreditReason] = useState('');

  const { data, isLoading, error } = useAdminSubscriptions(params);
  const extendTrialMutation = useExtendTrial();
  const applyCreditMutation = useApplyCredit();

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

  const openExtendTrialModal = (orgId: string) => {
    setSelectedOrgId(orgId);
    setExtendDays(14);
    setShowExtendTrialModal(true);
  };

  const openApplyCreditModal = (orgId: string) => {
    setSelectedOrgId(orgId);
    setCreditAmount('');
    setCreditReason('');
    setShowApplyCreditModal(true);
  };

  const handleExtendTrial = () => {
    if (selectedOrgId && extendDays > 0) {
      extendTrialMutation.mutate(
        { orgId: selectedOrgId, days: extendDays },
        { onSuccess: () => setShowExtendTrialModal(false) }
      );
    }
  };

  const handleApplyCredit = () => {
    if (selectedOrgId && creditAmount && creditReason) {
      applyCreditMutation.mutate(
        { orgId: selectedOrgId, amount: parseFloat(creditAmount), reason: creditReason },
        { onSuccess: () => setShowApplyCreditModal(false) }
      );
    }
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
            Billing
          </h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1">
            Manage subscriptions and billing operations
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
                placeholder="Search by organization name..."
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
            </div>
          )}
        </div>
      </Card>

      {/* Subscriptions Table */}
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
                  Seats
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-surface-500 dark:text-surface-400">
                  Trial Ends
                </th>
                <th className="text-right px-6 py-4 text-sm font-medium text-surface-500 dark:text-surface-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-surface-100 dark:border-surface-800">
                    <td className="px-6 py-4"><Skeleton className="h-5 w-40" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-20" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-20" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-10" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-24" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-8 w-24 ml-auto" /></td>
                  </tr>
                ))
              ) : error ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-surface-500">
                    Failed to load subscriptions. Please try again.
                  </td>
                </tr>
              ) : data?.data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-surface-500">
                    No subscriptions found.
                  </td>
                </tr>
              ) : (
                data?.data.map((sub) => (
                  <tr 
                    key={sub.organizationId} 
                    className="border-b border-surface-100 dark:border-surface-800 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-surface-100 dark:bg-surface-700 flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-surface-500" />
                        </div>
                        <Link 
                          href={`/admin/organizations/${sub.organizationId}`}
                          className="font-medium text-surface-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400"
                        >
                          {sub.organizationName}
                        </Link>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={getPlanColor(sub.plan)}>
                        {SUBSCRIPTION_PLANS.find((p) => p.id === sub.plan)?.label || sub.plan}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={getStatusColor(sub.status || 'active')}>
                        {formatStatus(sub.status, 'active')}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-surface-600 dark:text-surface-400">
                      {sub.seats}
                    </td>
                    <td className="px-6 py-4 text-surface-600 dark:text-surface-400">
                      {sub.trialEndsAt ? format(new Date(sub.trialEndsAt), 'MMM d, yyyy') : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {sub.status === 'trialing' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openExtendTrialModal(sub.organizationId)}
                            leftIcon={<Clock className="w-4 h-4" />}
                          >
                            Extend
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openApplyCreditModal(sub.organizationId)}
                          leftIcon={<DollarSign className="w-4 h-4" />}
                        >
                          Credit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/admin/billing/${sub.organizationId}`)}
                          rightIcon={<ExternalLink className="w-4 h-4" />}
                        >
                          Details
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
              {data.pagination.total} subscriptions
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

      {/* Extend Trial Modal */}
      <Modal
        isOpen={showExtendTrialModal}
        onClose={() => setShowExtendTrialModal(false)}
        title="Extend Trial"
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
              Number of days to extend
            </label>
            <Input
              type="number"
              min={1}
              max={365}
              value={extendDays}
              onChange={(e) => setExtendDays(parseInt(e.target.value) || 0)}
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowExtendTrialModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleExtendTrial}
              disabled={extendDays <= 0}
              isLoading={extendTrialMutation.isPending}
            >
              Extend Trial
            </Button>
          </div>
        </div>
      </Modal>

      {/* Apply Credit Modal */}
      <Modal
        isOpen={showApplyCreditModal}
        onClose={() => setShowApplyCreditModal(false)}
        title="Apply Credit"
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
              Credit Amount ($)
            </label>
            <Input
              type="number"
              min={0}
              step={0.01}
              value={creditAmount}
              onChange={(e) => setCreditAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
              Reason
            </label>
            <textarea
              value={creditReason}
              onChange={(e) => setCreditReason(e.target.value)}
              className="w-full p-3 border border-surface-300 dark:border-surface-600 rounded-lg bg-white dark:bg-surface-800 text-surface-900 dark:text-white"
              rows={3}
              placeholder="Enter reason for applying credit..."
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowApplyCreditModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleApplyCredit}
              disabled={!creditAmount || !creditReason}
              isLoading={applyCreditMutation.isPending}
            >
              Apply Credit
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}



