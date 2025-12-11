'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Skeleton';
import { Avatar } from '@/components/ui/Avatar';
import { useAdminAuditLogs } from '@/hooks/admin/useAdminSupport';
import { AUDIT_CATEGORIES, PLATFORM_ROLES } from '@/lib/admin-constants';
import { AdminAuditParams } from '@/types/admin';
import { 
  ArrowLeft,
  ChevronLeft, 
  ChevronRight,
  Filter,
  Clock,
  Shield,
  Building2,
  User,
  CreditCard,
  Settings,
  Headphones,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  organization: Building2,
  user: User,
  billing: CreditCard,
  admin: Shield,
  system: Settings,
  support: Headphones,
};

const CATEGORY_COLORS: Record<string, string> = {
  organization: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  user: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  billing: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  admin: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  system: 'bg-surface-100 text-surface-700 dark:bg-surface-800 dark:text-surface-300',
  support: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
};

export default function AuditLogsPage() {
  const [params, setParams] = useState<AdminAuditParams>({
    page: 1,
    limit: 50,
  });
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading, error } = useAdminAuditLogs(params);

  const handleCategoryFilter = (category: string) => {
    setParams((prev) => ({ ...prev, category: category === 'all' ? undefined : category, page: 1 }));
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
            Admin Audit Logs
          </h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1">
            Track all administrative actions on the platform
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card padding="md">
        <div className="space-y-4">
          <div className="flex gap-3">
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
              <div className="w-48">
                <label className="block text-xs font-medium text-surface-500 mb-1">Category</label>
                <Select
                  value={params.category || 'all'}
                  onChange={(e) => handleCategoryFilter(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  {AUDIT_CATEGORIES.map((category) => (
                    <option key={category.id} value={category.id}>{category.label}</option>
                  ))}
                </Select>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Audit Logs */}
      <Card padding="none">
        <div className="divide-y divide-surface-200 dark:divide-surface-700">
          {isLoading ? (
            Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="p-4">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-64" />
                    <Skeleton className="h-3 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              </div>
            ))
          ) : error ? (
            <div className="p-12 text-center text-surface-500">
              Failed to load audit logs. Please try again.
            </div>
          ) : data?.data.length === 0 ? (
            <div className="p-12 text-center text-surface-500">
              No audit logs found.
            </div>
          ) : (
            data?.data.map((log) => {
              const Icon = CATEGORY_ICONS[log.category] || Clock;
              return (
                <div key={log._id} className="p-4 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
                  <div className="flex items-start gap-4">
                    <Avatar
                      firstName={log.admin?.firstName}
                      lastName={log.admin?.lastName}
                      size="md"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-surface-900 dark:text-white">
                          {log.admin?.firstName} {log.admin?.lastName}
                        </span>
                        {log.admin?.platformRole && (
                          <Badge 
                            size="sm" 
                            className={PLATFORM_ROLES.find(r => r.id === log.admin?.platformRole)?.color}
                          >
                            <Shield className="w-3 h-3 mr-1" />
                            {PLATFORM_ROLES.find(r => r.id === log.admin?.platformRole)?.label}
                          </Badge>
                        )}
                      </div>
                      <p className="text-surface-600 dark:text-surface-400 mt-1">
                        <span className="font-medium">{log.action.replace(/_/g, ' ')}</span>
                        {log.targetName && (
                          <span className="text-surface-500"> on {log.targetName}</span>
                        )}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <Badge size="sm" className={CATEGORY_COLORS[log.category]}>
                          <Icon className="w-3 h-3 mr-1" />
                          {log.category}
                        </Badge>
                        <span className="text-xs text-surface-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                        </span>
                        <span className="text-xs text-surface-400">
                          {format(new Date(log.timestamp), 'MMM d, yyyy h:mm a')}
                        </span>
                      </div>
                      {log.changes && Object.keys(log.changes).length > 0 && (
                        <div className="mt-3 p-3 rounded-lg bg-surface-50 dark:bg-surface-800 text-sm">
                          <p className="font-medium text-surface-600 dark:text-surface-400 mb-2">Changes:</p>
                          <div className="space-y-1">
                            {Object.entries(log.changes).map(([key, value]) => (
                              <div key={key} className="flex items-center gap-2">
                                <span className="text-surface-500">{key}:</span>
                                <span className="text-red-500 line-through">{String(value.old)}</span>
                                <span className="text-surface-400">→</span>
                                <span className="text-emerald-500">{String(value.new)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {log.ipAddress && (
                        <p className="text-xs text-surface-400 mt-2">
                          IP: {log.ipAddress}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {data && data.pagination.pages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-surface-200 dark:border-surface-700">
            <p className="text-sm text-surface-500">
              Showing {((data.pagination.page - 1) * data.pagination.limit) + 1} to{' '}
              {Math.min(data.pagination.page * data.pagination.limit, data.pagination.total)} of{' '}
              {data.pagination.total} logs
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
