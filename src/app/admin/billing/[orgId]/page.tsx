'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { useAdminSubscription, useExtendTrial, useApplyCredit, useAdjustSeats, useCancelSubscription, useProcessRefund } from '@/hooks/admin/useBilling';
import { SUBSCRIPTION_STATUS_COLORS, SUBSCRIPTION_PLANS } from '@/lib/admin-constants';
import { 
  ArrowLeft,
  Building2,
  CreditCard,
  Clock,
  Calendar,
  DollarSign,
  Users,
  ExternalLink,
  XCircle,
  AlertTriangle,
  CheckCircle,
  XOctagon,
} from 'lucide-react';
import { format } from 'date-fns';

export default function SubscriptionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orgId = params.orgId as string;

  const { data: subscription, isLoading, error } = useAdminSubscription(orgId);
  const extendTrialMutation = useExtendTrial();
  const applyCreditMutation = useApplyCredit();
  const adjustSeatsMutation = useAdjustSeats();
  const cancelMutation = useCancelSubscription();
  const refundMutation = useProcessRefund();

  // Modal states
  const [showExtendTrialModal, setShowExtendTrialModal] = useState(false);
  const [showApplyCreditModal, setShowApplyCreditModal] = useState(false);
  const [showAdjustSeatsModal, setShowAdjustSeatsModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);

  // Form states
  const [extendDays, setExtendDays] = useState(14);
  const [creditAmount, setCreditAmount] = useState('');
  const [creditReason, setCreditReason] = useState('');
  const [newSeats, setNewSeats] = useState(0);
  const [cancelImmediately, setCancelImmediately] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');

  const handleExtendTrial = () => {
    if (extendDays > 0) {
      extendTrialMutation.mutate(
        { orgId, days: extendDays },
        { onSuccess: () => setShowExtendTrialModal(false) }
      );
    }
  };

  const handleApplyCredit = () => {
    if (creditAmount && creditReason) {
      applyCreditMutation.mutate(
        { orgId, amount: parseFloat(creditAmount), reason: creditReason },
        { onSuccess: () => setShowApplyCreditModal(false) }
      );
    }
  };

  const handleAdjustSeats = () => {
    if (newSeats > 0) {
      adjustSeatsMutation.mutate(
        { orgId, seats: newSeats },
        { onSuccess: () => setShowAdjustSeatsModal(false) }
      );
    }
  };

  const handleCancel = () => {
    if (cancelReason) {
      cancelMutation.mutate(
        { orgId, immediately: cancelImmediately, reason: cancelReason },
        { onSuccess: () => setShowCancelModal(false) }
      );
    }
  };

  const handleRefund = () => {
    if (refundAmount && refundReason) {
      refundMutation.mutate(
        { orgId, amount: parseFloat(refundAmount), reason: refundReason },
        { onSuccess: () => setShowRefundModal(false) }
      );
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardContent className="space-y-4">
            <Skeleton className="h-6 w-64" />
            <Skeleton className="h-4 w-48" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !subscription) {
    return (
      <div className="text-center py-12">
        <p className="text-surface-500">Subscription not found or failed to load.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/admin/billing')}>
          Back to Billing
        </Button>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    return SUBSCRIPTION_STATUS_COLORS[status as keyof typeof SUBSCRIPTION_STATUS_COLORS] || 'bg-surface-100 text-surface-600';
  };

  const getPlanColor = (plan: string) => {
    return SUBSCRIPTION_PLANS.find((p) => p.id === plan)?.color || 'bg-surface-100 text-surface-600';
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link 
        href="/admin/billing"
        className="inline-flex items-center gap-2 text-surface-500 hover:text-surface-700 dark:hover:text-surface-300"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Billing
      </Link>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center">
            <Building2 className="w-8 h-8 text-surface-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-surface-900 dark:text-white">
              {subscription.organizationName}
            </h1>
            <p className="text-surface-500 mt-1">Subscription Details</p>
            <div className="flex items-center gap-3 mt-2">
              <Badge className={getPlanColor(subscription.plan)}>
                {SUBSCRIPTION_PLANS.find((p) => p.id === subscription.plan)?.label}
              </Badge>
              <Badge className={getStatusColor(subscription.status)}>
                {subscription.status.replace('_', ' ')}
              </Badge>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {subscription.stripeCustomerId && (
            <Button
              variant="outline"
              onClick={() => window.open(`https://dashboard.stripe.com/customers/${subscription.stripeCustomerId}`, '_blank')}
              leftIcon={<ExternalLink className="w-4 h-4" />}
            >
              View in Stripe
            </Button>
          )}
          {subscription.status !== 'canceled' && (
            <Button
              variant="destructive"
              onClick={() => setShowCancelModal(true)}
              leftIcon={<XCircle className="w-4 h-4" />}
            >
              Cancel
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subscription Info */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Subscription Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-surface-400" />
                <div>
                  <p className="text-sm text-surface-500">Plan</p>
                  <p className="font-medium text-surface-900 dark:text-white">
                    {SUBSCRIPTION_PLANS.find((p) => p.id === subscription.plan)?.label}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-surface-400" />
                <div>
                  <p className="text-sm text-surface-500">Seats</p>
                  <p className="font-medium text-surface-900 dark:text-white">
                    {subscription.seats}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-surface-400" />
                <div>
                  <p className="text-sm text-surface-500">Created</p>
                  <p className="font-medium text-surface-900 dark:text-white">
                    {format(new Date(subscription.createdAt), 'MMMM d, yyyy')}
                  </p>
                </div>
              </div>
              {subscription.currentPeriodEnd && (
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-surface-400" />
                  <div>
                    <p className="text-sm text-surface-500">Current Period Ends</p>
                    <p className="font-medium text-surface-900 dark:text-white">
                      {format(new Date(subscription.currentPeriodEnd), 'MMMM d, yyyy')}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {subscription.trialEndsAt && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    Trial ends {format(new Date(subscription.trialEndsAt), 'MMMM d, yyyy')}
                  </p>
                </div>
              </div>
            )}

            {/* Stripe IDs */}
            <div className="pt-4 border-t border-surface-200 dark:border-surface-700">
              <p className="text-sm font-medium text-surface-500 mb-3">Stripe Information</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-surface-400">Customer ID</p>
                  <p className="font-mono text-surface-900 dark:text-white">
                    {subscription.stripeCustomerId || 'Not connected'}
                  </p>
                </div>
                <div>
                  <p className="text-surface-400">Subscription ID</p>
                  <p className="font-mono text-surface-900 dark:text-white">
                    {subscription.stripeSubscriptionId || 'Not connected'}
                  </p>
                </div>
                {subscription.billingEmail && (
                  <div className="col-span-2">
                    <p className="text-surface-400">Billing Email</p>
                    <p className="font-mono text-surface-900 dark:text-white">
                      {subscription.billingEmail}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Billing Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {subscription.status === 'trialing' && (
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setShowExtendTrialModal(true)}
                leftIcon={<Clock className="w-4 h-4" />}
              >
                Extend Trial
              </Button>
            )}
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                setNewSeats(subscription.seats);
                setShowAdjustSeatsModal(true);
              }}
              leftIcon={<Users className="w-4 h-4" />}
            >
              Adjust Seats
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => setShowApplyCreditModal(true)}
              leftIcon={<DollarSign className="w-4 h-4" />}
            >
              Apply Credit
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => setShowRefundModal(true)}
              leftIcon={<DollarSign className="w-4 h-4" />}
            >
              Process Refund
            </Button>
          </CardContent>
        </Card>

        {/* Payment History */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
          </CardHeader>
          <CardContent>
            {subscription.paymentHistory && subscription.paymentHistory.length > 0 ? (
              <div className="space-y-3">
                {subscription.paymentHistory.map((payment) => (
                  <div 
                    key={payment.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-surface-50 dark:bg-surface-800"
                  >
                    <div className="flex items-center gap-3">
                      {payment.status === 'succeeded' ? (
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                      ) : payment.status === 'failed' ? (
                        <XOctagon className="w-5 h-5 text-red-500" />
                      ) : (
                        <Clock className="w-5 h-5 text-amber-500" />
                      )}
                      <div>
                        <p className="font-medium text-surface-900 dark:text-white">
                          ${(payment.amount / 100).toFixed(2)} {payment.currency.toUpperCase()}
                        </p>
                        <p className="text-sm text-surface-500">
                          {payment.description || 'Subscription payment'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={payment.status === 'succeeded' ? 'success' : payment.status === 'failed' ? 'danger' : 'warning'}>
                        {payment.status}
                      </Badge>
                      <p className="text-sm text-surface-500 mt-1">
                        {format(new Date(payment.createdAt), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-surface-500 text-center py-8">
                No payment history available
              </p>
            )}
          </CardContent>
        </Card>
      </div>

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
            <Button onClick={handleExtendTrial} isLoading={extendTrialMutation.isPending}>
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
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowApplyCreditModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleApplyCredit} isLoading={applyCreditMutation.isPending}>
              Apply Credit
            </Button>
          </div>
        </div>
      </Modal>

      {/* Adjust Seats Modal */}
      <Modal
        isOpen={showAdjustSeatsModal}
        onClose={() => setShowAdjustSeatsModal(false)}
        title="Adjust Seats"
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
              Number of seats
            </label>
            <Input
              type="number"
              min={1}
              value={newSeats}
              onChange={(e) => setNewSeats(parseInt(e.target.value) || 0)}
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowAdjustSeatsModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdjustSeats} isLoading={adjustSeatsMutation.isPending}>
              Update Seats
            </Button>
          </div>
        </div>
      </Modal>

      {/* Cancel Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel Subscription"
        size="sm"
      >
        <div className="space-y-4">
          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
              <p className="text-sm text-amber-700 dark:text-amber-300">
                This will cancel the subscription. The organization will lose access based on your selection below.
              </p>
            </div>
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm text-surface-700 dark:text-surface-300">
              <input
                type="checkbox"
                checked={cancelImmediately}
                onChange={(e) => setCancelImmediately(e.target.checked)}
                className="rounded border-surface-300"
              />
              Cancel immediately (otherwise at period end)
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
              Reason
            </label>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full p-3 border border-surface-300 dark:border-surface-600 rounded-lg bg-white dark:bg-surface-800 text-surface-900 dark:text-white"
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowCancelModal(false)}>
              Keep Subscription
            </Button>
            <Button variant="destructive" onClick={handleCancel} isLoading={cancelMutation.isPending}>
              Cancel Subscription
            </Button>
          </div>
        </div>
      </Modal>

      {/* Refund Modal */}
      <Modal
        isOpen={showRefundModal}
        onClose={() => setShowRefundModal(false)}
        title="Process Refund"
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
              Refund Amount ($)
            </label>
            <Input
              type="number"
              min={0}
              step={0.01}
              value={refundAmount}
              onChange={(e) => setRefundAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
              Reason
            </label>
            <textarea
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              className="w-full p-3 border border-surface-300 dark:border-surface-600 rounded-lg bg-white dark:bg-surface-800 text-surface-900 dark:text-white"
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowRefundModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleRefund} isLoading={refundMutation.isPending}>
              Process Refund
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
