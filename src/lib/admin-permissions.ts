import { PlatformRole } from '@/types/admin';

/**
 * Admin Permission Definitions
 * Maps permissions to the platform roles that have them
 */
const ADMIN_PERMISSIONS: Record<string, PlatformRole[]> = {
  // Organization Management
  'organizations:view': ['super_admin', 'support_admin', 'billing_admin'],
  'organizations:edit': ['super_admin'],
  'organizations:delete': ['super_admin'],
  'organizations:flag': ['super_admin', 'support_admin'],

  // User Management
  'users:view': ['super_admin', 'support_admin', 'billing_admin'],
  'users:edit': ['super_admin'],
  'users:suspend': ['super_admin'],
  'users:delete': ['super_admin'],
  'users:impersonate': ['super_admin'],

  // Platform Admin Management
  'admin:view': ['super_admin'],
  'admin:manage': ['super_admin'],
  'admin:invite': ['super_admin'],
  'admin:revoke': ['super_admin'],

  // Billing Management
  'billing:view': ['super_admin', 'billing_admin'],
  'billing:edit': ['super_admin', 'billing_admin'],
  'billing:extend_trial': ['super_admin', 'billing_admin'],
  'billing:apply_credit': ['super_admin', 'billing_admin'],
  'billing:refund': ['super_admin', 'billing_admin'],
  'billing:cancel': ['super_admin', 'billing_admin'],

  // Analytics
  'analytics:view': ['super_admin', 'support_admin', 'billing_admin'],
  'analytics:revenue': ['super_admin', 'billing_admin'],
  'analytics:export': ['super_admin', 'billing_admin'],

  // Support Tools
  'support:view': ['super_admin', 'support_admin'],
  'support:conversations': ['super_admin', 'support_admin'],
  'support:activity': ['super_admin', 'support_admin'],
  'support:tickets': ['super_admin', 'support_admin'],
  'support:audit_logs': ['super_admin'],

  // System
  'system:settings': ['super_admin'],
  'system:audit': ['super_admin'],
};

/**
 * Check if a platform role has a specific permission
 */
export function hasAdminPermission(role: PlatformRole | undefined, permission: string): boolean {
  if (!role) return false;
  const allowedRoles = ADMIN_PERMISSIONS[permission] || [];
  return allowedRoles.includes(role);
}

/**
 * Check if a platform role has all specified permissions
 */
export function hasAllAdminPermissions(role: PlatformRole | undefined, permissions: string[]): boolean {
  return permissions.every((p) => hasAdminPermission(role, p));
}

/**
 * Check if a platform role has any of the specified permissions
 */
export function hasAnyAdminPermission(role: PlatformRole | undefined, permissions: string[]): boolean {
  return permissions.some((p) => hasAdminPermission(role, p));
}

/**
 * Get all permissions for a platform role
 */
export function getPermissionsForPlatformRole(role: PlatformRole): string[] {
  return Object.entries(ADMIN_PERMISSIONS)
    .filter(([_, roles]) => roles.includes(role))
    .map(([permission]) => permission);
}

/**
 * Check if user is a super admin
 */
export function isSuperAdmin(role: PlatformRole | undefined): boolean {
  return role === 'super_admin';
}

/**
 * Check if user is a billing admin (or super admin)
 */
export function isBillingAdmin(role: PlatformRole | undefined): boolean {
  return role === 'super_admin' || role === 'billing_admin';
}

/**
 * Check if user is a support admin (or super admin)
 */
export function isSupportAdmin(role: PlatformRole | undefined): boolean {
  return role === 'super_admin' || role === 'support_admin';
}

/**
 * Check if user can manage billing for an organization
 */
export function canManageBilling(role: PlatformRole | undefined): boolean {
  return hasAdminPermission(role, 'billing:edit');
}

/**
 * Check if user can manage users
 */
export function canManageUsers(role: PlatformRole | undefined): boolean {
  return hasAdminPermission(role, 'users:edit');
}

/**
 * Check if user can impersonate users
 */
export function canImpersonateUsers(role: PlatformRole | undefined): boolean {
  return hasAdminPermission(role, 'users:impersonate');
}

/**
 * Check if user can manage platform admins
 */
export function canManageAdmins(role: PlatformRole | undefined): boolean {
  return hasAdminPermission(role, 'admin:manage');
}

/**
 * Get role display info
 */
export function getPlatformRoleInfo(role: PlatformRole): { label: string; description: string } {
  const roleInfo: Record<PlatformRole, { label: string; description: string }> = {
    super_admin: {
      label: 'Super Admin',
      description: 'Full platform access - can manage everything',
    },
    billing_admin: {
      label: 'Billing Admin',
      description: 'Billing management - subscriptions, payments, credits',
    },
    support_admin: {
      label: 'Support Admin',
      description: 'Customer support - view orgs/users, conversations',
    },
  };
  return roleInfo[role];
}



