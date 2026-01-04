'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Skeleton } from '@/components/ui/Skeleton';
import { Modal, ConfirmModal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Toggle } from '@/components/ui/Toggle';
import { useAdminOrganization, useFlagOrganization, useDeleteOrganization, useOrganizationFeatures, useUpdateLinkedInFeature } from '@/hooks/admin/useAdminOrganizations';
import { SUBSCRIPTION_STATUS_COLORS, SUBSCRIPTION_PLANS, ORG_ROLE_COLORS, ACCOUNT_STATUS_COLORS } from '@/lib/admin-constants';
import { hasAdminPermission, isSuperAdmin } from '@/lib/admin-permissions';
import { useAdminAuthStore } from '@/stores/adminAuthStore';
import { formatStatus } from '@/lib/utils';
import { SubscriptionPlan, SubscriptionStatus } from '@/types/admin';
import { 
  ArrowLeft,
  Building2,
  Users,
  Ticket,
  FolderKanban,
  Flag,
  FlagOff,
  Trash2,
  Edit,
  Calendar,
  CreditCard,
  Globe,
  AlertTriangle,
  Linkedin,
} from 'lucide-react';
import { format } from 'date-fns';

type TabType = 'overview' | 'users' | 'activity' | 'billing';

export default function OrganizationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAdminAuthStore();
  const orgId = params.id as string;

  const { data: org, isLoading, error } = useAdminOrganization(orgId);
  const { data: featuresData, isLoading: featuresLoading } = useOrganizationFeatures(orgId);
  const flagMutation = useFlagOrganization();
  const deleteMutation = useDeleteOrganization();
  const linkedInMutation = useUpdateLinkedInFeature();

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [linkedInMaxProfiles, setLinkedInMaxProfiles] = useState<number>(50);
  const [linkedInMaxScrapers, setLinkedInMaxScrapers] = useState<number>(5);

  // Sync local state with fetched features data
  useEffect(() => {
    if (featuresData?.features?.linkedInMonitoring) {
      const linkedIn = featuresData.features.linkedInMonitoring;
      if (linkedIn.maxProfiles) setLinkedInMaxProfiles(linkedIn.maxProfiles);
      if (linkedIn.maxScrapers) setLinkedInMaxScrapers(linkedIn.maxScrapers);
    }
  }, [featuresData]);

  const linkedInFeature = featuresData?.features?.linkedInMonitoring;

  const handleLinkedInToggle = (enabled: boolean) => {
    linkedInMutation.mutate({
      id: orgId,
      data: {
        enabled,
        maxProfiles: linkedInMaxProfiles,
        maxScrapers: linkedInMaxScrapers,
      },
    });
  };

  const handleLinkedInLimitsUpdate = () => {
    if (linkedInFeature?.enabled) {
      linkedInMutation.mutate({
        id: orgId,
        data: {
          enabled: true,
          maxProfiles: linkedInMaxProfiles,
          maxScrapers: linkedInMaxScrapers,
        },
      });
    }
  };

  const [showFlagModal, setShowFlagModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [flagReason, setFlagReason] = useState('');
  const [deleteConfirmName, setDeleteConfirmName] = useState('');

  const getPlanColor = (plan: SubscriptionPlan) => {
    return SUBSCRIPTION_PLANS.find((p) => p.id === plan)?.color || 'bg-surface-100 text-surface-600';
  };

  const getStatusColor = (status: SubscriptionStatus) => {
    return SUBSCRIPTION_STATUS_COLORS[status] || 'bg-surface-100 text-surface-600';
  };

  const handleFlag = () => {
    if (org) {
      flagMutation.mutate(
        { id: org._id, flag: !org.isFlagged, reason: flagReason },
        { onSuccess: () => setShowFlagModal(false) }
      );
    }
  };

  const handleDelete = () => {
    if (org && deleteConfirmName === org.name) {
      deleteMutation.mutate(
        { id: org._id, confirmName: org.name },
        { onSuccess: () => router.push('/admin/organizations') }
      );
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'users', label: 'Users' },
    { id: 'activity', label: 'Activity' },
    { id: 'billing', label: 'Billing', permission: 'billing:view' },
  ];

  const filteredTabs = tabs.filter(
    (tab) => !tab.permission || hasAdminPermission(user?.platformRole, tab.permission)
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardContent className="space-y-4">
            <Skeleton className="h-6 w-64" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-32" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !org) {
    return (
      <div className="text-center py-12">
        <p className="text-surface-500">Organization not found or failed to load.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/admin/organizations')}>
          Back to Organizations
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link 
        href="/admin/organizations"
        className="inline-flex items-center gap-2 text-surface-500 hover:text-surface-700 dark:hover:text-surface-300"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Organizations
      </Link>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center">
            <Building2 className="w-8 h-8 text-surface-500" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-surface-900 dark:text-white">
                {org.name}
              </h1>
              {org.isFlagged && (
                <Badge variant="danger" className="flex items-center gap-1">
                  <Flag className="w-3 h-3" />
                  Flagged
                </Badge>
              )}
            </div>
            <p className="text-surface-500 mt-1">{org.slug}</p>
            <div className="flex items-center gap-3 mt-2">
              <Badge className={getPlanColor(org.currentPlan)}>
                {SUBSCRIPTION_PLANS.find((p) => p.id === org.currentPlan)?.label}
              </Badge>
              <Badge className={getStatusColor(org.subscriptionStatus || 'active')}>
                {formatStatus(org.subscriptionStatus, 'active')}
              </Badge>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFlagModal(true)}
            leftIcon={org.isFlagged ? <FlagOff className="w-4 h-4" /> : <Flag className="w-4 h-4" />}
          >
            {org.isFlagged ? 'Unflag' : 'Flag'}
          </Button>
          {isSuperAdmin(user?.platformRole) && (
            <Button
              variant="destructive"
              onClick={() => setShowDeleteModal(true)}
              leftIcon={<Trash2 className="w-4 h-4" />}
            >
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-surface-200 dark:border-surface-700">
        <nav className="flex gap-6">
          {filteredTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Info Card */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Organization Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-surface-500">Industry</p>
                  <p className="font-medium text-surface-900 dark:text-white">
                    {org.industry || 'Not specified'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-surface-500">Size</p>
                  <p className="font-medium text-surface-900 dark:text-white">
                    {org.size || 'Not specified'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-surface-500">Created</p>
                  <p className="font-medium text-surface-900 dark:text-white">
                    {format(new Date(org.createdAt), 'MMMM d, yyyy')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-surface-500">Seats</p>
                  <p className="font-medium text-surface-900 dark:text-white">
                    {org.seatCount}
                  </p>
                </div>
              </div>
              
              {org.trialEndsAt && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                      Trial ends {format(new Date(org.trialEndsAt), 'MMMM d, yyyy')}
                    </p>
                  </div>
                </div>
              )}

              {org.isFlagged && org.flagReason && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-700 dark:text-red-300">
                        Flag Reason
                      </p>
                      <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                        {org.flagReason}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-surface-500" />
                  <span className="text-surface-600 dark:text-surface-400">Users</span>
                </div>
                <span className="font-semibold text-surface-900 dark:text-white">
                  {org.stats.userCount} ({org.stats.activeUserCount} active)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-surface-500" />
                  <span className="text-surface-600 dark:text-surface-400">Tickets</span>
                </div>
                <span className="font-semibold text-surface-900 dark:text-white">
                  {org.stats.ticketCount} ({org.stats.completedTickets} completed)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FolderKanban className="w-4 h-4 text-surface-500" />
                  <span className="text-surface-600 dark:text-surface-400">Projects</span>
                </div>
                <span className="font-semibold text-surface-900 dark:text-white">
                  {org.stats.projectCount}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Feature Flags Card */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Feature Flags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* LinkedIn Monitoring Toggle */}
              <div className="flex items-center justify-between p-4 bg-surface-50 dark:bg-surface-800 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Linkedin className="w-5 h-5 text-blue-600" />
                    <h4 className="font-medium text-surface-900 dark:text-white">LinkedIn Monitoring</h4>
                  </div>
                  <p className="text-sm text-surface-500 mt-1">
                    Allow this organization to monitor LinkedIn profiles and competitors
                  </p>
                  {linkedInFeature?.enabled && linkedInFeature?.enabledAt && (
                    <p className="text-xs text-surface-400 mt-1">
                      Enabled on {format(new Date(linkedInFeature.enabledAt), 'MMMM d, yyyy')}
                    </p>
                  )}
                </div>
                
                <Toggle
                  checked={linkedInFeature?.enabled ?? false}
                  onChange={handleLinkedInToggle}
                  disabled={linkedInMutation.isPending || featuresLoading}
                />
              </div>
              
              {/* Settings (shown when enabled) */}
              {linkedInFeature?.enabled && (
                <div className="ml-4 pl-4 border-l-2 border-blue-200 dark:border-blue-800 space-y-4">
                  <div className="flex items-center gap-4">
                    <label className="text-sm font-medium text-surface-700 dark:text-surface-300 w-32">
                      Max Profiles:
                    </label>
                    <input
                      type="number"
                      value={linkedInMaxProfiles}
                      onChange={(e) => setLinkedInMaxProfiles(parseInt(e.target.value) || 50)}
                      onBlur={handleLinkedInLimitsUpdate}
                      className="w-24 px-3 py-1.5 border border-surface-300 dark:border-surface-600 rounded-lg bg-white dark:bg-surface-800 text-surface-900 dark:text-white text-sm"
                      min={1}
                      max={500}
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="text-sm font-medium text-surface-700 dark:text-surface-300 w-32">
                      Max Scrapers:
                    </label>
                    <input
                      type="number"
                      value={linkedInMaxScrapers}
                      onChange={(e) => setLinkedInMaxScrapers(parseInt(e.target.value) || 5)}
                      onBlur={handleLinkedInLimitsUpdate}
                      className="w-24 px-3 py-1.5 border border-surface-300 dark:border-surface-600 rounded-lg bg-white dark:bg-surface-800 text-surface-900 dark:text-white text-sm"
                      min={1}
                      max={20}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'users' && (
        <Card>
          <CardHeader>
            <CardTitle>Users ({org.users.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {org.users.map((user) => (
                <div 
                  key={user._id}
                  className="flex items-center justify-between p-3 rounded-lg bg-surface-50 dark:bg-surface-800"
                >
                  <div className="flex items-center gap-3">
                    <Avatar
                      firstName={user.firstName}
                      lastName={user.lastName}
                      src={user.avatar}
                      size="md"
                    />
                    <div>
                      <p className="font-medium text-surface-900 dark:text-white">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-sm text-surface-500">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={ORG_ROLE_COLORS[user.role] || ''}>
                      {formatStatus(user.role)}
                    </Badge>
                    <Badge className={ACCOUNT_STATUS_COLORS[user.accountStatus || 'active'] || ''}>
                      {formatStatus(user.accountStatus, 'active')}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/admin/users/${user._id}`)}
                    >
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'activity' && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-surface-500 text-center py-8">
              Activity timeline will be displayed here
            </p>
          </CardContent>
        </Card>
      )}

      {activeTab === 'billing' && (
        <Card>
          <CardHeader>
            <CardTitle>Billing Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-surface-500">Current Plan</p>
                <p className="font-medium text-surface-900 dark:text-white">
                  {SUBSCRIPTION_PLANS.find((p) => p.id === org.currentPlan)?.label}
                </p>
              </div>
              <div>
                <p className="text-sm text-surface-500">Subscription Status</p>
                <Badge className={getStatusColor(org.subscriptionStatus || 'active')}>
                  {formatStatus(org.subscriptionStatus, 'active')}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-surface-500">Stripe Customer ID</p>
                <p className="font-mono text-sm text-surface-900 dark:text-white">
                  {org.stripeCustomerId || 'Not connected'}
                </p>
              </div>
              <div>
                <p className="text-sm text-surface-500">Seats</p>
                <p className="font-medium text-surface-900 dark:text-white">
                  {org.seatCount}
                </p>
              </div>
            </div>
            
            <div className="pt-4 border-t border-surface-200 dark:border-surface-700">
              <p className="text-sm text-surface-500 mb-3">Billing Actions</p>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm">
                  <CreditCard className="w-4 h-4 mr-2" />
                  View in Stripe
                </Button>
                <Button variant="outline" size="sm">
                  Extend Trial
                </Button>
                <Button variant="outline" size="sm">
                  Apply Credit
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Flag Modal */}
      <Modal
        isOpen={showFlagModal}
        onClose={() => setShowFlagModal(false)}
        title={org.isFlagged ? 'Unflag Organization' : 'Flag Organization'}
        size="sm"
      >
        <div className="space-y-4">
          {!org.isFlagged && (
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                Reason for flagging
              </label>
              <textarea
                value={flagReason}
                onChange={(e) => setFlagReason(e.target.value)}
                className="w-full p-3 border border-surface-300 dark:border-surface-600 rounded-lg bg-white dark:bg-surface-800 text-surface-900 dark:text-white"
                rows={3}
                placeholder="Enter reason for flagging this organization..."
              />
            </div>
          )}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowFlagModal(false)}>
              Cancel
            </Button>
            <Button
              variant={org.isFlagged ? 'default' : 'warning'}
              onClick={handleFlag}
              isLoading={flagMutation.isPending}
            >
              {org.isFlagged ? 'Unflag' : 'Flag Organization'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Organization"
        size="sm"
      >
        <div className="space-y-4">
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-medium text-red-700 dark:text-red-300">
                  This action cannot be undone
                </p>
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                  This will permanently delete the organization, all its users, projects, tickets, and data.
                </p>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
              Type <span className="font-mono font-bold">{org.name}</span> to confirm
            </label>
            <Input
              value={deleteConfirmName}
              onChange={(e) => setDeleteConfirmName(e.target.value)}
              placeholder="Organization name"
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteConfirmName !== org.name}
              isLoading={deleteMutation.isPending}
            >
              Delete Organization
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}



