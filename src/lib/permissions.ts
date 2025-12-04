const PERMISSIONS: Record<string, string[]> = {
  // User Management
  'users.view': ['owner', 'manager'],
  'users.create': ['owner'],
  'users.edit': ['owner'],
  'users.delete': ['owner'],
  'users.assign_clients': ['owner', 'manager'],

  // Client Management
  'clients.view': ['owner', 'manager', 'employee'],
  'clients.create': ['owner', 'manager'],
  'clients.edit': ['owner', 'manager'],
  'clients.delete': ['owner'],
  'clients.manage_contacts': ['owner', 'manager'],
  'clients.manage_knowledge_base': ['owner', 'manager'],

  // Ticket Management
  'tickets.view_all': ['owner', 'manager'],
  'tickets.view_assigned': ['owner', 'manager', 'employee'],
  'tickets.create': ['owner', 'manager', 'employee'],
  'tickets.edit': ['owner', 'manager', 'employee'],
  'tickets.delete': ['owner', 'manager'],
  'tickets.assign': ['owner', 'manager'],
  'tickets.change_status': ['owner', 'manager', 'employee'],
  'tickets.submit_for_review': ['owner', 'manager', 'employee'],

  // Review Management
  'reviews.view_all': ['owner', 'manager'],
  'reviews.view_own': ['owner', 'manager', 'employee'],
  'reviews.conduct': ['owner', 'manager'],
  'reviews.approve': ['owner', 'manager'],
  'reviews.reject': ['owner', 'manager'],

  // Asset Management
  'assets.view': ['owner', 'manager', 'employee', 'client_viewer'],
  'assets.upload': ['owner', 'manager', 'employee'],
  'assets.delete': ['owner', 'manager'],

  // Analytics
  'analytics.view_all': ['owner', 'manager'],
  'analytics.view_own': ['owner', 'manager', 'employee'],
  'analytics.export': ['owner', 'manager'],

  // AI Features
  'ai.use_chat': ['owner', 'manager', 'employee'],
  'ai.configure_prompts': ['owner', 'manager'],
  'ai.view_interactions': ['owner', 'manager'],

  // System Settings
  'settings.view': ['owner', 'manager'],
  'settings.edit': ['owner'],
};

export function hasPermission(role: string | undefined, permission: string): boolean {
  if (!role) return false;
  const allowedRoles = PERMISSIONS[permission] || [];
  return allowedRoles.includes(role);
}

export function checkPermissions(role: string | undefined, permissions: string[]): boolean {
  return permissions.every((p) => hasPermission(role, p));
}

export function getPermissionsForRole(role: string): string[] {
  return Object.entries(PERMISSIONS)
    .filter(([_, roles]) => roles.includes(role))
    .map(([permission]) => permission);
}

export function isOwner(role: string | undefined): boolean {
  return role === 'owner';
}

export function isManager(role: string | undefined): boolean {
  return role === 'owner' || role === 'manager';
}

export function canManageUsers(role: string | undefined): boolean {
  return hasPermission(role, 'users.view');
}

export function canManageClients(role: string | undefined): boolean {
  return hasPermission(role, 'clients.create');
}

export function canConductReviews(role: string | undefined): boolean {
  return hasPermission(role, 'reviews.conduct');
}

// Ticket-specific permission helpers
export interface TicketPermissionContext {
  userRole: string | undefined;
  userId: string | undefined;
  assignedUserIds: string[];
}

/**
 * Check if user can edit a ticket
 * - Owner/Manager: Can edit any ticket
 * - Employee: Can only edit tickets they are assigned to
 */
export function canEditTicket(ctx: TicketPermissionContext): boolean {
  if (!ctx.userRole || !ctx.userId) return false;
  
  // Owner and Manager can edit any ticket
  if (ctx.userRole === 'owner' || ctx.userRole === 'manager') {
    return true;
  }
  
  // Employee can only edit if assigned
  if (ctx.userRole === 'employee') {
    return ctx.assignedUserIds.includes(ctx.userId);
  }
  
  return false;
}

/**
 * Check if user can assign users to tickets
 * - Only Owner and Manager can assign users
 */
export function canAssignUsers(role: string | undefined): boolean {
  return role === 'owner' || role === 'manager';
}

/**
 * Check if user can delete/archive a ticket
 * - Only Owner and Manager can delete
 */
export function canDeleteTicket(role: string | undefined): boolean {
  return role === 'owner' || role === 'manager';
}

/**
 * Check if user can change ticket status
 * - Owner/Manager: Any ticket
 * - Employee: Only assigned tickets
 */
export function canChangeTicketStatus(ctx: TicketPermissionContext): boolean {
  return canEditTicket(ctx);
}

/**
 * Check if user can submit ticket for review
 * - Owner/Manager: Any ticket
 * - Employee: Only assigned tickets
 */
export function canSubmitForReview(ctx: TicketPermissionContext): boolean {
  return canEditTicket(ctx);
}

/**
 * Get assignedTo user IDs from a ticket
 */
export function getAssignedUserIds(assignedTo: any[]): string[] {
  return assignedTo.map((user) => {
    if (typeof user === 'string') return user;
    if (typeof user === 'object' && user._id) return user._id;
    return '';
  }).filter(Boolean);
}

