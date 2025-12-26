'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Skeleton } from '@/components/ui/Skeleton';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useAdminAdmins, useInviteAdmin, useChangeAdminRole, useRevokeAdmin } from '@/hooks/admin/useAdminAdmins';
import { PLATFORM_ROLES } from '@/lib/admin-constants';
import { useAdminAuthStore } from '@/stores/adminAuthStore';
import { PlatformRole } from '@/types/admin';
import { 
  Shield,
  UserPlus,
  Trash2,
  Edit,
  Calendar,
  Mail,
} from 'lucide-react';
import { format } from 'date-fns';

export default function PlatformAdminsPage() {
  const { user: currentAdmin } = useAdminAuthStore();
  const { data: admins, isLoading, error } = useAdminAdmins();
  const inviteMutation = useInviteAdmin();
  const changeRoleMutation = useChangeAdminRole();
  const revokeMutation = useRevokeAdmin();

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showChangeRoleModal, setShowChangeRoleModal] = useState(false);
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<string | null>(null);
  
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<PlatformRole>('support_admin');
  const [newRole, setNewRole] = useState<PlatformRole>('support_admin');

  const handleInvite = () => {
    if (inviteEmail && inviteRole) {
      inviteMutation.mutate(
        { email: inviteEmail, platformRole: inviteRole },
        {
          onSuccess: () => {
            setShowInviteModal(false);
            setInviteEmail('');
            setInviteRole('support_admin');
          },
        }
      );
    }
  };

  const handleChangeRole = () => {
    if (selectedAdmin && newRole) {
      changeRoleMutation.mutate(
        { id: selectedAdmin, platformRole: newRole },
        {
          onSuccess: () => {
            setShowChangeRoleModal(false);
            setSelectedAdmin(null);
          },
        }
      );
    }
  };

  const handleRevoke = () => {
    if (selectedAdmin) {
      revokeMutation.mutate(selectedAdmin, {
        onSuccess: () => {
          setShowRevokeModal(false);
          setSelectedAdmin(null);
        },
      });
    }
  };

  const openChangeRoleModal = (adminId: string, currentRole: PlatformRole) => {
    setSelectedAdmin(adminId);
    setNewRole(currentRole);
    setShowChangeRoleModal(true);
  };

  const openRevokeModal = (adminId: string) => {
    setSelectedAdmin(adminId);
    setShowRevokeModal(true);
  };

  const getRoleColor = (role: PlatformRole) => {
    return PLATFORM_ROLES.find((r) => r.id === role)?.color || 'bg-surface-100 text-surface-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">
            Platform Admins
          </h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1">
            Manage administrators with platform-wide access
          </p>
        </div>
        <Button
          onClick={() => setShowInviteModal(true)}
          leftIcon={<UserPlus className="w-4 h-4" />}
        >
          Invite Admin
        </Button>
      </div>

      {/* Role Legend */}
      <Card padding="md">
        <div className="flex flex-wrap gap-4">
          {PLATFORM_ROLES.map((role) => (
            <div key={role.id} className="flex items-center gap-2">
              <Badge className={role.color}>{role.label}</Badge>
              <span className="text-sm text-surface-500">{role.description}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Admins List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-32 mb-1" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                </div>
                <Skeleton className="h-6 w-24" />
              </CardContent>
            </Card>
          ))
        ) : error ? (
          <Card className="col-span-full">
            <CardContent>
              <p className="text-surface-500 text-center py-8">
                Failed to load admins. Please try again.
              </p>
            </CardContent>
          </Card>
        ) : admins?.length === 0 ? (
          <Card className="col-span-full">
            <CardContent>
              <p className="text-surface-500 text-center py-8">
                No platform admins found.
              </p>
            </CardContent>
          </Card>
        ) : (
          admins?.map((admin) => (
            <Card key={admin._id} className="relative">
              <CardContent className="space-y-4">
                {/* Admin Info */}
                <div className="flex items-start gap-3">
                  <Avatar
                    firstName={admin.firstName}
                    lastName={admin.lastName}
                    src={admin.avatar}
                    size="lg"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-surface-900 dark:text-white truncate">
                      {admin.firstName} {admin.lastName}
                    </h3>
                    <div className="flex items-center gap-1 text-sm text-surface-500">
                      <Mail className="w-3 h-3" />
                      <span className="truncate">{admin.email}</span>
                    </div>
                  </div>
                </div>

                {/* Role Badge */}
                <Badge className={getRoleColor(admin.platformRole)}>
                  <Shield className="w-3 h-3 mr-1" />
                  {PLATFORM_ROLES.find((r) => r.id === admin.platformRole)?.label}
                </Badge>

                {/* Granted Info */}
                <div className="text-sm text-surface-500 space-y-1">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>
                      Granted {admin.platformRoleGrantedAt 
                        ? format(new Date(admin.platformRoleGrantedAt), 'MMM d, yyyy')
                        : 'Unknown'}
                    </span>
                  </div>
                  {admin.platformRoleGrantedBy && (
                    <div>
                      by {admin.platformRoleGrantedBy.firstName} {admin.platformRoleGrantedBy.lastName}
                    </div>
                  )}
                </div>

                {/* Actions */}
                {admin._id !== currentAdmin?._id && (
                  <div className="flex items-center gap-2 pt-2 border-t border-surface-200 dark:border-surface-700">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openChangeRoleModal(admin._id, admin.platformRole)}
                      leftIcon={<Edit className="w-4 h-4" />}
                    >
                      Change Role
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openRevokeModal(admin._id)}
                      leftIcon={<Trash2 className="w-4 h-4" />}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      Revoke
                    </Button>
                  </div>
                )}
                
                {admin._id === currentAdmin?._id && (
                  <div className="pt-2 border-t border-surface-200 dark:border-surface-700">
                    <span className="text-sm text-surface-400 italic">This is you</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Invite Modal */}
      <Modal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        title="Invite Platform Admin"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-surface-600 dark:text-surface-400">
            The user must already have an account on the platform.
          </p>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
              Email Address
            </label>
            <Input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="admin@example.com"
            />
          </div>
          <div>
            <Select
              label="Platform Role"
              value={inviteRole}
              onChange={(value) => setInviteRole(value as PlatformRole)}
              options={PLATFORM_ROLES.map((role) => ({
                value: role.id,
                label: `${role.label} - ${role.description}`,
              }))}
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowInviteModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleInvite}
              disabled={!inviteEmail}
              isLoading={inviteMutation.isPending}
            >
              Invite Admin
            </Button>
          </div>
        </div>
      </Modal>

      {/* Change Role Modal */}
      <Modal
        isOpen={showChangeRoleModal}
        onClose={() => setShowChangeRoleModal(false)}
        title="Change Platform Role"
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <Select
              label="New Platform Role"
              value={newRole}
              onChange={(value) => setNewRole(value as PlatformRole)}
              options={PLATFORM_ROLES.map((role) => ({
                value: role.id,
                label: `${role.label} - ${role.description}`,
              }))}
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowChangeRoleModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleChangeRole}
              isLoading={changeRoleMutation.isPending}
            >
              Update Role
            </Button>
          </div>
        </div>
      </Modal>

      {/* Revoke Modal */}
      <Modal
        isOpen={showRevokeModal}
        onClose={() => setShowRevokeModal(false)}
        title="Revoke Admin Access"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-surface-600 dark:text-surface-400">
            Are you sure you want to revoke this user&apos;s admin access? They will no longer be able to access the admin panel.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowRevokeModal(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRevoke}
              isLoading={revokeMutation.isPending}
            >
              Revoke Access
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}



