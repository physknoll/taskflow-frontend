'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Progress } from '@/components/ui/Progress';
import { Skeleton } from '@/components/ui/Skeleton';
import { usersService } from '@/services/users.service';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
} from 'lucide-react';
import { Dropdown, DropdownItem, DropdownDivider } from '@/components/ui/Dropdown';
import { formatDate } from '@/lib/utils';

const createUserSchema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  role: z.enum(['manager', 'employee']),
});

type CreateUserForm = z.infer<typeof createUserSchema>;

export default function TeamPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['users', { search, role: roleFilter }],
    queryFn: () => usersService.getUsers({ search, role: roleFilter || undefined }),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateUserForm) => usersService.createUser(data),
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
    },
  });

  const users = data?.data || [];

  const onSubmit = (data: CreateUserForm) => {
    createMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Team"
        description="Manage your team members and their access"
        action={
          <Button onClick={() => setCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Member
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex gap-4">
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
                      <Badge
                        variant={user.role === 'owner' ? 'primary' : user.role === 'manager' ? 'info' : 'secondary'}
                        size="sm"
                        className="mt-1 capitalize"
                      >
                        {user.role.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                  <Dropdown
                    trigger={
                      <button className="p-1 rounded hover:bg-surface-100 dark:hover:bg-surface-700">
                        <MoreVertical className="h-4 w-4 text-surface-500" />
                      </button>
                    }
                  >
                    <DropdownItem>View Profile</DropdownItem>
                    <DropdownItem>Edit</DropdownItem>
                    <DropdownDivider />
                    <DropdownItem variant="danger">Deactivate</DropdownItem>
                  </Dropdown>
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
            ]}
            value={watch('role')}
            onChange={(val) => setValue('role', val as 'manager' | 'employee')}
            error={errors.role?.message}
          />

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
    </div>
  );
}

