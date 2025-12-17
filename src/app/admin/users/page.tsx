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
import { Avatar } from '@/components/ui/Avatar';
import { useAdminUsers, useSuspendUser, useUnsuspendUser, useImpersonateUser } from '@/hooks/admin/useAdminUsers';
import { ACCOUNT_STATUS_COLORS, ORG_ROLE_COLORS, PLATFORM_ROLES } from '@/lib/admin-constants';
import { hasAdminPermission, isSuperAdmin } from '@/lib/admin-permissions';
import { useAdminAuthStore } from '@/stores/adminAuthStore';
import { AdminUserParams, UserAccountStatus } from '@/types/admin';
import { 
  Search, 
  User,
  Building2,
  Shield,
  ChevronLeft, 
  ChevronRight,
  ExternalLink,
  Filter,
  UserX,
  UserCheck,
  Users as UsersIcon,
} from 'lucide-react';
import { format } from 'date-fns';

export default function UsersPage() {
  const router = useRouter();
  const { user: adminUser } = useAdminAuthStore();
  const [params, setParams] = useState<AdminUserParams>({
    page: 1,
    limit: 20,
  });
  const [searchInput, setSearchInput] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading, error } = useAdminUsers(params);
  const suspendMutation = useSuspendUser();
  const unsuspendMutation = useUnsuspendUser();
  const impersonateMutation = useImpersonateUser();

  const handleSearch = () => {
    setParams((prev) => ({ ...prev, search: searchInput, page: 1 }));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleRoleFilter = (role: string) => {
    setParams((prev) => ({ 
      ...prev, 
      role: role === 'all' ? undefined : role as any, 
      page: 1 
    }));
  };

  const handleStatusFilter = (status: string) => {
    setParams((prev) => ({ 
      ...prev, 
      status: status === 'all' ? undefined : status as UserAccountStatus, 
      page: 1 
    }));
  };

  const handlePlatformAdminFilter = (value: string) => {
    setParams((prev) => ({ 
      ...prev, 
      hasPlatformRole: value === 'true' ? true : value === 'false' ? false : undefined, 
      page: 1 
    }));
  };

  const handleSuspend = (id: string) => {
    const reason = prompt('Enter reason for suspension:');
    if (reason) {
      suspendMutation.mutate({ id, reason });
    }
  };

  const handleUnsuspend = (id: string) => {
    unsuspendMutation.mutate(id);
  };

  const handleImpersonate = (id: string) => {
    if (confirm('Are you sure you want to impersonate this user? This will open the main app in a new tab.')) {
      impersonateMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">
            Users
          </h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1">
            Manage all users across organizations
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
                placeholder="Search by name or email..."
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
                  label="Role"
                  value={params.role || 'all'}
                  onChange={(value) => handleRoleFilter(value)}
                  options={[
                    { value: 'all', label: 'All Roles' },
                    { value: 'owner', label: 'Owner' },
                    { value: 'manager', label: 'Manager' },
                    { value: 'employee', label: 'Employee' },
                    { value: 'client_viewer', label: 'Client Viewer' },
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
                    { value: 'suspended', label: 'Suspended' },
                    { value: 'pending_deletion', label: 'Pending Deletion' },
                  ]}
                />
              </div>
              <div className="w-40">
                <Select
                  label="Platform Admin"
                  value={params.hasPlatformRole === undefined ? 'all' : params.hasPlatformRole.toString()}
                  onChange={(value) => handlePlatformAdminFilter(value)}
                  options={[
                    { value: 'all', label: 'All Users' },
                    { value: 'true', label: 'Admins Only' },
                    { value: 'false', label: 'Non-Admins Only' },
                  ]}
                />
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Users Table */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-200 dark:border-surface-700">
                <th className="text-left px-6 py-4 text-sm font-medium text-surface-500 dark:text-surface-400">
                  User
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-surface-500 dark:text-surface-400">
                  Organization
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-surface-500 dark:text-surface-400">
                  Role
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-surface-500 dark:text-surface-400">
                  Status
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-surface-500 dark:text-surface-400">
                  Last Login
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
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div>
                          <Skeleton className="h-4 w-32 mb-1" />
                          <Skeleton className="h-3 w-40" />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-20" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-16" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-8 w-20 ml-auto" /></td>
                  </tr>
                ))
              ) : error ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-surface-500">
                    Failed to load users. Please try again.
                  </td>
                </tr>
              ) : data?.data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-surface-500">
                    No users found.
                  </td>
                </tr>
              ) : (
                data?.data.map((user) => (
                  <tr 
                    key={user._id} 
                    className="border-b border-surface-100 dark:border-surface-800 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar
                          firstName={user.firstName}
                          lastName={user.lastName}
                          src={user.avatar}
                          size="md"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <Link 
                              href={`/admin/users/${user._id}`}
                              className="font-medium text-surface-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400"
                            >
                              {user.firstName} {user.lastName}
                            </Link>
                            {user.platformRole && (
                              <span title={`Platform ${user.platformRole}`}>
                                <Shield className="w-4 h-4 text-primary-500" />
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-surface-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {user.organization ? (
                        <Link
                          href={`/admin/organizations/${user.organization._id}`}
                          className="flex items-center gap-2 text-surface-600 dark:text-surface-400 hover:text-primary-600 dark:hover:text-primary-400"
                        >
                          <Building2 className="w-4 h-4" />
                          {user.organization.name}
                        </Link>
                      ) : (
                        <span className="text-surface-400">No organization</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {user.role ? (
                        <Badge className={ORG_ROLE_COLORS[user.role] || ''}>
                          {user.role.replace('_', ' ')}
                        </Badge>
                      ) : (
                        <span className="text-surface-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {user.accountStatus ? (
                        <Badge className={ACCOUNT_STATUS_COLORS[user.accountStatus] || ''}>
                          {user.accountStatus.replace('_', ' ')}
                        </Badge>
                      ) : (
                        <Badge className="bg-surface-100 text-surface-600">
                          active
                        </Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 text-surface-600 dark:text-surface-400">
                      {user.lastLogin ? format(new Date(user.lastLogin), 'MMM d, yyyy') : 'Never'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {hasAdminPermission(adminUser?.platformRole, 'users:suspend') && (
                          user.accountStatus === 'suspended' ? (
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => handleUnsuspend(user._id)}
                              title="Unsuspend"
                              disabled={unsuspendMutation.isPending}
                            >
                              <UserCheck className="w-4 h-4 text-emerald-500" />
                            </Button>
                          ) : user.accountStatus !== 'pending_deletion' && (
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => handleSuspend(user._id)}
                              title="Suspend"
                              disabled={suspendMutation.isPending}
                            >
                              <UserX className="w-4 h-4 text-surface-500" />
                            </Button>
                          )
                        )}
                        {isSuperAdmin(adminUser?.platformRole) && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleImpersonate(user._id)}
                            title="Impersonate"
                            disabled={impersonateMutation.isPending}
                          >
                            <UsersIcon className="w-4 h-4 text-surface-500" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/admin/users/${user._id}`)}
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
              {data.pagination.total} users
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

