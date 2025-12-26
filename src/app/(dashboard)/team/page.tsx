'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Progress } from '@/components/ui/Progress';
import { Skeleton } from '@/components/ui/Skeleton';
import { usersService, CreateUserDto, UpdateUserPermissionsDto } from '@/services/users.service';
import { clientsService } from '@/services/clients.service';
import { useAuthStore } from '@/stores/authStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { IUser, IUserPermissions } from '@/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { USER_ROLES } from '@/lib/constants';
import toast from 'react-hot-toast';
import {
  Plus,
  Search,
  Mail,
  Phone,
  Users,
  Star,
  TrendingUp,
  Calendar,
  MoreVertical,
  UserX,
  Trash2,
  RefreshCw,
  AlertTriangle,
  Crown,
  Briefcase,
  UserCircle,
  Eye as EyeIcon,
  Building2,
  Ticket,
  Settings2,
} from 'lucide-react';
import { Dropdown, DropdownItem, DropdownDivider } from '@/components/ui/Dropdown';
import { formatDate, cn } from '@/lib/utils';

const createUserSchema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  role: z.enum(['manager', 'employee', 'client_viewer']),
  clientId: z.string().optional(),
  permissions: z.object({
    canCreateTickets: z.boolean().optional(),
    ticketVisibility: z.enum(['assigned_only', 'all']).optional(),
  }).optional(),
}).refine(
  (data) => data.role !== 'client_viewer' || (data.clientId && data.clientId.length > 0),
  { message: 'Client is required for Client Viewer role', path: ['clientId'] }
);

type CreateUserForm = z.infer<typeof createUserSchema>;

// Toggle component for permission settings
function PermissionToggle({
  label,
  description,
  checked,
  onChange,
  disabled = false,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="font-medium text-surface-900 dark:text-white text-sm">{label}</p>
        <p className="text-xs text-surface-500 dark:text-surface-400">{description}</p>
      </div>
      <button
        type="button"
        onClick={onChange}
        disabled={disabled}
        className={cn(
          'relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
          checked ? 'bg-primary-600' : 'bg-surface-300 dark:bg-surface-600',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <span
          className={cn(
            'inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform',
            checked ? 'translate-x-5' : 'translate-x-1'
          )}
        />
      </button>
    </div>
  );
}

// Role configuration for display
const roleConfig: Record<string, { label: string; variant: 'primary' | 'success' | 'info' | 'secondary'; icon: React.ComponentType<{ className?: string }> }> = {
  owner: { label: 'Owner', variant: 'primary', icon: Crown },
  manager: { label: 'Manager', variant: 'success', icon: Briefcase },
  employee: { label: 'Team Member', variant: 'info', icon: UserCircle },
  client_viewer: { label: 'Client', variant: 'secondary', icon: EyeIcon },
};

export default function TeamPage() {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuthStore();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [deactivateModalOpen, setDeactivateModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Check if current user is owner (can manage users)
  const isOwner = currentUser?.role === 'owner';

  const { data, isLoading } = useQuery({
    queryKey: ['users', { search, role: roleFilter }],
    queryFn: () => usersService.getUsers({ search, role: roleFilter || undefined }),
  });

  // Fetch clients for the client_viewer role dropdown
  const { data: clientsData } = useQuery({
    queryKey: ['clients'],
    queryFn: () => clientsService.getClients({ isActive: true }),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateUserDto) => usersService.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User created successfully');
      setCreateModalOpen(false);
      reset();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create user');
    },
  });

  const updatePermissionsMutation = useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: UpdateUserPermissionsDto }) =>
      usersService.updateUserPermissions(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User updated successfully');
      setEditModalOpen(false);
      setSelectedUser(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update user');
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: (userId: string) => usersService.deactivateUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User deactivated successfully');
      setDeactivateModalOpen(false);
      setSelectedUser(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to deactivate user');
    },
  });

  const reactivateMutation = useMutation({
    mutationFn: (userId: string) => usersService.reactivateUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User reactivated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to reactivate user');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (userId: string) => usersService.permanentlyDeleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User permanently deleted');
      setDeleteModalOpen(false);
      setSelectedUser(null);
      setDeleteConfirmText('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    },
  });

  const handleDeactivateClick = (user: IUser) => {
    setSelectedUser(user);
    setDeactivateModalOpen(true);
  };

  const handleDeleteClick = (user: IUser) => {
    setSelectedUser(user);
    setDeleteModalOpen(true);
    setDeleteConfirmText('');
  };

  const handlePermanentDelete = () => {
    if (deleteConfirmText !== 'DELETE' || !selectedUser) return;
    deleteMutation.mutate(selectedUser._id);
  };

  const handleEditClick = (user: IUser) => {
    setSelectedUser(user);
    setEditModalOpen(true);
  };

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateUserForm>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      role: 'employee',
      permissions: {
        canCreateTickets: false,
        ticketVisibility: 'assigned_only',
      },
    },
  });

  // Watch role to conditionally show fields
  const watchedRole = watch('role');
  const watchedPermissions = watch('permissions');
  const clients = clientsData?.data || [];

  const users = data?.data || [];

  const onSubmit = (data: CreateUserForm) => {
    // Build the create user payload
    const payload: CreateUserDto = {
      email: data.email,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
    };

    // Add clientId for client_viewer role
    if (data.role === 'client_viewer' && data.clientId) {
      payload.clientId = data.clientId;
      payload.permissions = {
        canCreateTickets: data.permissions?.canCreateTickets ?? false,
      };
    }

    // Add ticketVisibility for employee role
    if (data.role === 'employee') {
      payload.permissions = {
        ticketVisibility: data.permissions?.ticketVisibility ?? 'assigned_only',
      };
    }

    createMutation.mutate(payload);
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
            <input
              type="text"
              placeholder="Search team members..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <Select
            options={[
              { value: '', label: 'All roles' },
              ...USER_ROLES.map((r) => ({ value: r.id, label: r.label })),
            ]}
            value={roleFilter}
            onChange={setRoleFilter}
          />
        </div>
        <Button onClick={() => setCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Member
        </Button>
      </div>

      {/* Team Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <Skeleton variant="circular" width={64} height={64} />
                  <div className="flex-1">
                    <Skeleton variant="text" width="60%" />
                    <Skeleton variant="text" width="40%" className="mt-1" />
                  </div>
                </div>
                <Skeleton variant="rounded" height={60} />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : users.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-surface-400" />
            <h3 className="text-lg font-medium text-surface-900 dark:text-white mb-2">
              No team members found
            </h3>
            <p className="text-surface-500 dark:text-surface-400 mb-4">
              {search ? 'Try adjusting your search' : 'Add your first team member to get started'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => (
            <Card key={user._id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <Avatar
                      firstName={user.firstName}
                      lastName={user.lastName}
                      src={user.avatar}
                      size="lg"
                      showStatus
                      status={user.isActive ? 'online' : 'offline'}
                    />
                    <div>
                      <h3 className="font-semibold text-surface-900 dark:text-white">
                        {user.firstName} {user.lastName}
                      </h3>
                      <p className="text-sm text-surface-500 dark:text-surface-400">
                        {user.jobTitle || user.role}
                      </p>
                      <div className="flex flex-wrap items-center gap-1 mt-1">
                        {user.role && roleConfig[user.role] && (
                          <Badge 
                            variant={roleConfig[user.role].variant} 
                            size="sm"
                            className="flex items-center gap-1 w-fit"
                          >
                            {(() => {
                              const RoleIcon = roleConfig[user.role].icon;
                              return <RoleIcon className="h-3 w-3" />;
                            })()}
                            {roleConfig[user.role].label}
                          </Badge>
                        )}
                        {!user.isActive && (
                          <Badge variant="warning" size="sm">
                            Inactive
                          </Badge>
                        )}
                        {/* Permission indicators */}
                        {user.role === 'client_viewer' && user.permissions?.canCreateTickets && (
                          <Badge variant="info" size="sm" className="flex items-center gap-1">
                            <Ticket className="h-3 w-3" />
                            Can Create
                          </Badge>
                        )}
                        {user.role === 'employee' && user.permissions?.ticketVisibility === 'all' && (
                          <Badge variant="info" size="sm" className="flex items-center gap-1">
                            <EyeIcon className="h-3 w-3" />
                            All Tickets
                          </Badge>
                        )}
                      </div>
                      {/* Client association for client_viewer */}
                      {user.role === 'client_viewer' && (user.client || user.clientId) && (
                        <div className="flex items-center gap-1.5 mt-2 text-xs text-surface-500 dark:text-surface-400">
                          <Building2 className="h-3 w-3" />
                          <span>
                            {typeof user.client === 'object' && user.client?.name
                              ? user.client.name
                              : clients.find((c) => c._id === user.clientId)?.name || 'Unknown Client'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  {isOwner && user._id !== currentUser?._id && user.role !== 'owner' && (
                    <Dropdown
                      trigger={
                        <button className="p-1 rounded hover:bg-surface-100 dark:hover:bg-surface-700">
                          <MoreVertical className="h-4 w-4 text-surface-500" />
                        </button>
                      }
                    >
                      <DropdownItem>View Profile</DropdownItem>
                      <DropdownItem onClick={() => handleEditClick(user)}>
                        <Settings2 className="h-4 w-4 mr-2" />
                        Edit Settings
                      </DropdownItem>
                      <DropdownDivider />
                      {user.isActive ? (
                        <DropdownItem 
                          variant="danger" 
                          onClick={() => handleDeactivateClick(user)}
                        >
                          <UserX className="h-4 w-4 mr-2" />
                          Deactivate
                        </DropdownItem>
                      ) : (
                        <DropdownItem 
                          onClick={() => reactivateMutation.mutate(user._id)}
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Reactivate
                        </DropdownItem>
                      )}
                      <DropdownItem 
                        variant="danger" 
                        onClick={() => handleDeleteClick(user)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Permanently
                      </DropdownItem>
                    </Dropdown>
                  )}
                </div>

                {/* Contact Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-400">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{user.email}</span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-400">
                      <Phone className="h-4 w-4" />
                      <span>{user.phone}</span>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-surface-200 dark:border-surface-700">
                  <div className="text-center">
                    <p className="text-lg font-semibold text-surface-900 dark:text-white">
                      {user.stats?.totalTicketsCompleted || 0}
                    </p>
                    <p className="text-xs text-surface-500 dark:text-surface-400">Completed</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-surface-900 dark:text-white">
                      {user.stats?.reviewPassRate || 100}%
                    </p>
                    <p className="text-xs text-surface-500 dark:text-surface-400">Pass Rate</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-surface-900 dark:text-white">
                      {user.stats?.currentStreak || 0}
                    </p>
                    <p className="text-xs text-surface-500 dark:text-surface-400">Streak</p>
                  </div>
                </div>

                {/* Review Pass Rate Progress */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-surface-500 dark:text-surface-400">Review Pass Rate</span>
                    <span className="font-medium text-surface-700 dark:text-surface-300">
                      {user.stats?.reviewPassRate || 100}%
                    </span>
                  </div>
                  <Progress 
                    value={user.stats?.reviewPassRate || 100} 
                    size="sm" 
                    variant={(user.stats?.reviewPassRate || 100) >= 80 ? 'success' : 'warning'} 
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create User Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => {
          setCreateModalOpen(false);
          reset();
        }}
        title="Add Team Member"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Input
              {...register('firstName')}
              label="First Name"
              placeholder="John"
              error={errors.firstName?.message}
            />
            <Input
              {...register('lastName')}
              label="Last Name"
              placeholder="Smith"
              error={errors.lastName?.message}
            />
          </div>

          <Input
            {...register('email')}
            type="email"
            label="Email"
            placeholder="john@example.com"
            error={errors.email?.message}
          />

          <Input
            {...register('password')}
            type="password"
            label="Password"
            placeholder="••••••••"
            error={errors.password?.message}
            helperText="At least 8 characters"
          />

          <Select
            label="Role"
            options={[
              { value: 'employee', label: 'Employee' },
              { value: 'manager', label: 'Manager' },
              { value: 'client_viewer', label: 'Client Viewer' },
            ]}
            value={watchedRole}
            onChange={(val) => {
              setValue('role', val as 'manager' | 'employee' | 'client_viewer');
              // Reset permissions when role changes
              if (val === 'client_viewer') {
                setValue('permissions', { canCreateTickets: false });
                setValue('clientId', '');
              } else if (val === 'employee') {
                setValue('permissions', { ticketVisibility: 'assigned_only' });
                setValue('clientId', undefined);
              } else {
                setValue('permissions', undefined);
                setValue('clientId', undefined);
              }
            }}
            error={errors.role?.message}
          />

          {/* Client Selector - Only for client_viewer role */}
          {watchedRole === 'client_viewer' && (
            <div>
              <Select
                label="Client"
                options={[
                  { value: '', label: 'Select a client...' },
                  ...clients.map((client) => ({
                    value: client._id,
                    label: client.name,
                  })),
                ]}
                value={watch('clientId') || ''}
                onChange={(val) => setValue('clientId', val)}
                error={errors.clientId?.message}
              />
              <p className="text-xs text-surface-500 dark:text-surface-400 mt-1">
                This user will only have access to this client&apos;s projects and tickets.
              </p>
            </div>
          )}

          {/* Permission Settings */}
          {(watchedRole === 'client_viewer' || watchedRole === 'employee') && (
            <div className="border border-surface-200 dark:border-surface-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Settings2 className="h-4 w-4 text-surface-500" />
                <h4 className="font-medium text-surface-900 dark:text-white text-sm">
                  Permission Settings
                </h4>
              </div>

              {/* Client Viewer Permissions */}
              {watchedRole === 'client_viewer' && (
                <PermissionToggle
                  label="Allow ticket creation"
                  description="Enable this user to create new tickets for their client"
                  checked={watchedPermissions?.canCreateTickets ?? false}
                  onChange={() =>
                    setValue('permissions.canCreateTickets', !watchedPermissions?.canCreateTickets)
                  }
                />
              )}

              {/* Employee Permissions */}
              {watchedRole === 'employee' && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">
                    Ticket Visibility
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 p-3 border border-surface-200 dark:border-surface-700 rounded-lg cursor-pointer hover:bg-surface-50 dark:hover:bg-surface-800">
                      <input
                        type="radio"
                        name="ticketVisibility"
                        checked={watchedPermissions?.ticketVisibility === 'assigned_only'}
                        onChange={() => setValue('permissions.ticketVisibility', 'assigned_only')}
                        className="text-primary-600 focus:ring-primary-500"
                      />
                      <div>
                        <p className="font-medium text-surface-900 dark:text-white text-sm">
                          Assigned only
                        </p>
                        <p className="text-xs text-surface-500 dark:text-surface-400">
                          Can only see tickets assigned to them
                        </p>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 p-3 border border-surface-200 dark:border-surface-700 rounded-lg cursor-pointer hover:bg-surface-50 dark:hover:bg-surface-800">
                      <input
                        type="radio"
                        name="ticketVisibility"
                        checked={watchedPermissions?.ticketVisibility === 'all'}
                        onChange={() => setValue('permissions.ticketVisibility', 'all')}
                        className="text-primary-600 focus:ring-primary-500"
                      />
                      <div>
                        <p className="font-medium text-surface-900 dark:text-white text-sm">
                          All tickets
                        </p>
                        <p className="text-xs text-surface-500 dark:text-surface-400">
                          Can see all tickets in the organization
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-surface-200 dark:border-surface-700">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setCreateModalOpen(false);
                reset();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={createMutation.isPending}>
              Create User
            </Button>
          </div>
        </form>
      </Modal>

      {/* Deactivate User Modal */}
      <Modal
        isOpen={deactivateModalOpen}
        onClose={() => {
          setDeactivateModalOpen(false);
          setSelectedUser(null);
        }}
        title="Deactivate User"
      >
        <div className="space-y-6">
          <div className="flex items-start gap-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <UserX className="h-6 w-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-amber-800 dark:text-amber-300">
                Deactivate this user?
              </h4>
              <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                <strong>{selectedUser?.firstName} {selectedUser?.lastName}</strong> will no longer be able to access the system.
                Their data will be preserved and you can reactivate them later.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-surface-200 dark:border-surface-700">
            <Button
              variant="outline"
              onClick={() => {
                setDeactivateModalOpen(false);
                setSelectedUser(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="warning"
              onClick={() => selectedUser && deactivateMutation.mutate(selectedUser._id)}
              isLoading={deactivateMutation.isPending}
            >
              <UserX className="h-4 w-4 mr-2" />
              Deactivate User
            </Button>
          </div>
        </div>
      </Modal>

      {/* Permanently Delete User Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedUser(null);
          setDeleteConfirmText('');
        }}
        title="Permanently Delete User"
      >
        <div className="space-y-6">
          <div className="flex items-start gap-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-red-800 dark:text-red-300">
                This action is irreversible
              </h4>
              <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                <strong>{selectedUser?.firstName} {selectedUser?.lastName}</strong>&apos;s account and all associated data will be permanently deleted.
                This cannot be undone.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
              Type <span className="font-bold text-red-600 dark:text-red-400">DELETE</span> to confirm
            </label>
            <Input
              type="text"
              placeholder="Type DELETE"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-surface-200 dark:border-surface-700">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteModalOpen(false);
                setSelectedUser(null);
                setDeleteConfirmText('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handlePermanentDelete}
              isLoading={deleteMutation.isPending}
              disabled={deleteConfirmText !== 'DELETE'}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Permanently
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit User Modal */}
      <EditUserModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        clients={clients}
        onSave={(data) => {
          if (selectedUser) {
            updatePermissionsMutation.mutate({ userId: selectedUser._id, data });
          }
        }}
        isSaving={updatePermissionsMutation.isPending}
      />
    </div>
  );
}

// Edit User Modal Component
function EditUserModal({
  isOpen,
  onClose,
  user,
  clients,
  onSave,
  isSaving,
}: {
  isOpen: boolean;
  onClose: () => void;
  user: IUser | null;
  clients: { _id: string; name: string }[];
  onSave: (data: UpdateUserPermissionsDto) => void;
  isSaving: boolean;
}) {
  const [editRole, setEditRole] = useState<'manager' | 'employee' | 'client_viewer'>('employee');
  const [editClientId, setEditClientId] = useState<string>('');
  const [editCanCreateTickets, setEditCanCreateTickets] = useState(false);
  const [editTicketVisibility, setEditTicketVisibility] = useState<'assigned_only' | 'all'>('assigned_only');

  // Reset form when user changes
  useState(() => {
    if (user) {
      setEditRole(user.role === 'owner' ? 'manager' : (user.role as 'manager' | 'employee' | 'client_viewer'));
      setEditClientId(user.clientId || '');
      setEditCanCreateTickets(user.permissions?.canCreateTickets ?? false);
      setEditTicketVisibility(user.permissions?.ticketVisibility ?? 'assigned_only');
    }
  });

  // Update state when modal opens with new user
  if (user && isOpen) {
    const expectedRole = user.role === 'owner' ? 'manager' : (user.role as 'manager' | 'employee' | 'client_viewer');
    if (editRole !== expectedRole && !isSaving) {
      setEditRole(expectedRole);
      setEditClientId(user.clientId || '');
      setEditCanCreateTickets(user.permissions?.canCreateTickets ?? false);
      setEditTicketVisibility(user.permissions?.ticketVisibility ?? 'assigned_only');
    }
  }

  const handleSave = () => {
    const data: UpdateUserPermissionsDto = {
      role: editRole,
    };

    if (editRole === 'client_viewer') {
      data.clientId = editClientId;
      data.permissions = {
        canCreateTickets: editCanCreateTickets,
      };
    } else if (editRole === 'employee') {
      data.permissions = {
        ticketVisibility: editTicketVisibility,
      };
    }

    onSave(data);
  };

  if (!user) return null;

  // Get client name for display
  const clientName = clients.find((c) => c._id === user.clientId)?.name;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit User Settings">
      <div className="space-y-6">
        {/* User Info Header */}
        <div className="flex items-center gap-4 p-4 bg-surface-50 dark:bg-surface-800/50 rounded-lg">
          <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center">
            <span className="text-lg font-semibold text-primary-700 dark:text-primary-300">
              {user.firstName[0]}{user.lastName[0]}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-surface-900 dark:text-white">
              {user.firstName} {user.lastName}
            </h3>
            <p className="text-sm text-surface-500 dark:text-surface-400">{user.email}</p>
          </div>
        </div>

        {/* Role Selection */}
        <div>
          <Select
            label="Role"
            options={[
              { value: 'employee', label: 'Employee' },
              { value: 'manager', label: 'Manager' },
              { value: 'client_viewer', label: 'Client Viewer' },
            ]}
            value={editRole}
            onChange={(val) => {
              setEditRole(val as 'manager' | 'employee' | 'client_viewer');
              // Reset permissions when role changes
              if (val === 'client_viewer') {
                setEditCanCreateTickets(false);
              } else if (val === 'employee') {
                setEditTicketVisibility('assigned_only');
              }
            }}
          />
        </div>

        {/* Client Selector - Only for client_viewer role */}
        {editRole === 'client_viewer' && (
          <div>
            <Select
              label="Client"
              options={[
                { value: '', label: 'Select a client...' },
                ...clients.map((client) => ({
                  value: client._id,
                  label: client.name,
                })),
              ]}
              value={editClientId}
              onChange={setEditClientId}
            />
            {user.clientId && editClientId !== user.clientId && editClientId && (
              <div className="mt-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  <AlertTriangle className="h-3 w-3 inline mr-1" />
                  Changing the client will update which tickets/projects this user can access.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Current Client Display for client_viewer */}
        {user.role === 'client_viewer' && clientName && editRole === 'client_viewer' && (
          <div className="flex items-center gap-2 text-sm">
            <Building2 className="h-4 w-4 text-surface-500" />
            <span className="text-surface-600 dark:text-surface-400">
              Currently assigned to: <span className="font-medium text-surface-900 dark:text-white">{clientName}</span>
            </span>
          </div>
        )}

        {/* Permission Settings */}
        {(editRole === 'client_viewer' || editRole === 'employee') && (
          <div className="border border-surface-200 dark:border-surface-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Settings2 className="h-4 w-4 text-surface-500" />
              <h4 className="font-medium text-surface-900 dark:text-white text-sm">
                Permission Settings
              </h4>
            </div>

            {/* Client Viewer Permissions */}
            {editRole === 'client_viewer' && (
              <PermissionToggle
                label="Allow ticket creation"
                description="Enable this user to create new tickets for their client"
                checked={editCanCreateTickets}
                onChange={() => setEditCanCreateTickets(!editCanCreateTickets)}
              />
            )}

            {/* Employee Permissions */}
            {editRole === 'employee' && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">
                  Ticket Visibility
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 border border-surface-200 dark:border-surface-700 rounded-lg cursor-pointer hover:bg-surface-50 dark:hover:bg-surface-800">
                    <input
                      type="radio"
                      name="editTicketVisibility"
                      checked={editTicketVisibility === 'assigned_only'}
                      onChange={() => setEditTicketVisibility('assigned_only')}
                      className="text-primary-600 focus:ring-primary-500"
                    />
                    <div>
                      <p className="font-medium text-surface-900 dark:text-white text-sm">
                        Assigned only
                      </p>
                      <p className="text-xs text-surface-500 dark:text-surface-400">
                        Can only see tickets assigned to them
                      </p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-3 border border-surface-200 dark:border-surface-700 rounded-lg cursor-pointer hover:bg-surface-50 dark:hover:bg-surface-800">
                    <input
                      type="radio"
                      name="editTicketVisibility"
                      checked={editTicketVisibility === 'all'}
                      onChange={() => setEditTicketVisibility('all')}
                      className="text-primary-600 focus:ring-primary-500"
                    />
                    <div>
                      <p className="font-medium text-surface-900 dark:text-white text-sm">
                        All tickets
                      </p>
                      <p className="text-xs text-surface-500 dark:text-surface-400">
                        Can see all tickets in the organization
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-surface-200 dark:border-surface-700">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            isLoading={isSaving}
            disabled={editRole === 'client_viewer' && !editClientId}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </Modal>
  );
}


