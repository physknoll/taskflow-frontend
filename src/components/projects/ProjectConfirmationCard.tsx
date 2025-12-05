'use client';

import { format } from 'date-fns';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ProjectDraft, TicketDraft, ValidationError } from '@/types';
import {
  CheckCircle,
  AlertTriangle,
  Calendar,
  User,
  Users,
  Building2,
  Flag,
  Ticket,
  Clock,
  Loader2,
} from 'lucide-react';

interface ProjectConfirmationCardProps {
  draft: ProjectDraft;
  validationErrors: ValidationError[];
  onConfirm: () => void;
  isConfirming: boolean;
  canConfirm: boolean;
}

const priorityColors: Record<string, string> = {
  low: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  medium: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
  high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300',
  critical: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
  urgent: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
};

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return 'Not set';
  try {
    return format(new Date(dateStr), 'MMM d, yyyy');
  } catch {
    return dateStr;
  }
}

function TicketRow({ ticket, index }: { ticket: TicketDraft; index: number }) {
  const assignees = ticket.assignedTo?.map((a) => a.name).join(', ') || 'Unassigned';
  const hasUnmatchedAssignee = ticket.assignedTo?.some((a) => !a.id);

  return (
    <div className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-surface-50 dark:hover:bg-surface-700/50 transition-colors">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-surface-100 dark:bg-surface-700 flex items-center justify-center text-xs font-medium text-surface-600 dark:text-surface-400">
          {index + 1}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-surface-900 dark:text-white truncate">
            {ticket.title}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-surface-500 dark:text-surface-400 flex items-center gap-1">
              <User className="w-3 h-3" />
              {assignees}
              {hasUnmatchedAssignee && (
                <AlertTriangle className="w-3 h-3 text-amber-500" />
              )}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        {ticket.dueDate && (
          <span className="text-xs text-surface-500 dark:text-surface-400 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(ticket.dueDate)}
          </span>
        )}
        {ticket.priority && (
          <Badge
            variant="secondary"
            className={`text-xs capitalize ${priorityColors[ticket.priority] || ''}`}
          >
            {ticket.priority}
          </Badge>
        )}
      </div>
    </div>
  );
}

export function ProjectConfirmationCard({
  draft,
  validationErrors,
  onConfirm,
  isConfirming,
  canConfirm,
}: ProjectConfirmationCardProps) {
  const hasErrors = validationErrors.length > 0;
  const tickets = draft.tickets || [];

  return (
    <div className="bg-white dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-5 py-4 border-b border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
            style={{ backgroundColor: draft.color || '#6366F1' }}
          >
            {draft.name?.charAt(0) || 'P'}
          </div>
          <div>
            <h3 className="font-semibold text-surface-900 dark:text-white">
              {draft.name || 'Unnamed Project'}
            </h3>
            <p className="text-xs text-surface-500 dark:text-surface-400">
              Project Summary
            </p>
          </div>
        </div>
      </div>

      {/* Project Details */}
      <div className="px-5 py-4 space-y-3">
        <div className="grid grid-cols-2 gap-4">
          {/* Client */}
          <div className="flex items-center gap-2 text-sm">
            <Building2 className="w-4 h-4 text-surface-400" />
            <span className="text-surface-600 dark:text-surface-400">Client:</span>
            <span className="font-medium text-surface-900 dark:text-white">
              {draft.clientName || 'Not selected'}
              {draft.clientName && !draft.client && (
                <AlertTriangle className="w-3 h-3 inline ml-1 text-amber-500" />
              )}
            </span>
          </div>

          {/* Lead */}
          <div className="flex items-center gap-2 text-sm">
            <User className="w-4 h-4 text-surface-400" />
            <span className="text-surface-600 dark:text-surface-400">Lead:</span>
            <span className="font-medium text-surface-900 dark:text-white">
              {draft.projectLeadName || 'Not assigned'}
              {draft.projectLeadName && !draft.projectLead && (
                <AlertTriangle className="w-3 h-3 inline ml-1 text-amber-500" />
              )}
            </span>
          </div>

          {/* Priority */}
          <div className="flex items-center gap-2 text-sm">
            <Flag className="w-4 h-4 text-surface-400" />
            <span className="text-surface-600 dark:text-surface-400">Priority:</span>
            {draft.priority ? (
              <Badge
                variant="secondary"
                className={`text-xs capitalize ${priorityColors[draft.priority] || ''}`}
              >
                {draft.priority}
              </Badge>
            ) : (
              <span className="text-surface-500">Not set</span>
            )}
          </div>

          {/* Due Date */}
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-surface-400" />
            <span className="text-surface-600 dark:text-surface-400">Due:</span>
            <span className="font-medium text-surface-900 dark:text-white">
              {formatDate(draft.targetEndDate)}
            </span>
          </div>
        </div>

        {/* Team Members */}
        {draft.teamMembers && draft.teamMembers.length > 0 && (
          <div className="flex items-start gap-2 text-sm pt-1">
            <Users className="w-4 h-4 text-surface-400 mt-0.5" />
            <span className="text-surface-600 dark:text-surface-400">Team:</span>
            <div className="flex flex-wrap gap-1.5">
              {draft.teamMembers.map((member, i) => (
                <Badge
                  key={i}
                  variant="secondary"
                  className="text-xs"
                >
                  {member.name}
                  {!member.id && (
                    <AlertTriangle className="w-3 h-3 inline ml-1 text-amber-500" />
                  )}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Type */}
        {draft.type && (
          <div className="flex items-center gap-2 text-sm">
            <Ticket className="w-4 h-4 text-surface-400" />
            <span className="text-surface-600 dark:text-surface-400">Type:</span>
            <span className="font-medium text-surface-900 dark:text-white capitalize">
              {draft.type.replace('_', ' ')}
            </span>
          </div>
        )}
      </div>

      {/* Tickets Section */}
      {tickets.length > 0 && (
        <>
          <div className="px-5 py-3 border-t border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50">
            <div className="flex items-center gap-2">
              <Ticket className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              <span className="text-sm font-medium text-surface-900 dark:text-white">
                Tickets to Create ({tickets.length})
              </span>
            </div>
          </div>
          <div className="px-3 py-2 max-h-48 overflow-y-auto">
            {tickets.map((ticket, i) => (
              <TicketRow key={i} ticket={ticket} index={i} />
            ))}
          </div>
        </>
      )}

      {/* Validation Errors */}
      {hasErrors && (
        <div className="px-5 py-3 border-t border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                Some names could not be matched:
              </p>
              <ul className="mt-1 text-xs text-amber-700 dark:text-amber-400 list-disc list-inside">
                {validationErrors.map((err, i) => (
                  <li key={i}>{err.message}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="px-5 py-4 border-t border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50">
        <div className="flex items-center justify-between">
          <p className="text-xs text-surface-500 dark:text-surface-400">
            {canConfirm
              ? 'Everything looks good! Click to create.'
              : 'Please provide more details to continue.'}
          </p>
          <Button
            onClick={onConfirm}
            disabled={!canConfirm || isConfirming}
            isLoading={isConfirming}
            className="min-w-[120px]"
          >
            {isConfirming ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Create Project
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

