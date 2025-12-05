'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTicket, useTickets } from '@/hooks/useTickets';
import { useClients } from '@/hooks/useClients';
import { useAuthStore } from '@/stores/authStore';
import { ITicketTask, ITicket } from '@/types';
import { IUserMinimal } from '@/services/users.service';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Progress } from '@/components/ui/Progress';
import { Select } from '@/components/ui/Select';
import { Input, Textarea } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { UserTagInput } from '@/components/ui/UserTagInput';
import { TICKET_STATUSES, TICKET_PRIORITIES, TICKET_TYPES } from '@/lib/constants';
import {
  canEditTicket,
  canAssignUsers,
  canDeleteTicket,
  getAssignedUserIds,
} from '@/lib/permissions';
import {
  formatDate,
  formatRelativeTime,
  getTypeIcon,
  getPriorityColor,
  calculateProgress,
  cn,
} from '@/lib/utils';
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Building,
  CheckCircle2,
  Circle,
  Send,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Edit2,
  X,
  Save,
  Trash2,
  Users,
  Lock,
  Plus,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface EditFormData {
  title: string;
  description: string;
  type: string;
  priority: string;
  dueDate: string;
  client: string;
  tags: string[];
}

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = params.id as string;
  
  const { user } = useAuthStore();
  const { ticket, isLoading, error, addComment, isAddingComment } = useTicket(ticketId);
  const { updateTicketStatus, updateTask, addTask, deleteTask, updateTicket, deleteTicket, isUpdating, isAddingTask, isDeletingTask } = useTickets();
  const { clients } = useClients();
  
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showComments, setShowComments] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditFormData>({
    title: '',
    description: '',
    type: '',
    priority: '',
    dueDate: '',
    client: '',
    tags: [],
  });
  const [assignedUsers, setAssignedUsers] = useState<IUserMinimal[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Permission checks
  const assignedUserIds = ticket ? getAssignedUserIds(ticket.assignedTo as any[]) : [];
  const permissionCtx = {
    userRole: user?.role,
    userId: user?._id,
    assignedUserIds,
  };
  
  const userCanEdit = canEditTicket(permissionCtx);
  const userCanAssign = canAssignUsers(user?.role);
  const userCanDelete = canDeleteTicket(user?.role);

  // Initialize edit form when ticket loads
  useEffect(() => {
    if (ticket) {
      setEditForm({
        title: ticket.title || '',
        description: ticket.description || '',
        type: ticket.type || 'other',
        priority: ticket.priority || 'medium',
        dueDate: ticket.dueDate ? new Date(ticket.dueDate).toISOString().split('T')[0] : '',
        client: typeof ticket.client === 'object' ? ticket.client._id : ticket.client || '',
        tags: ticket.tags || [],
      });
      
      // Initialize assigned users for edit mode
      if (Array.isArray(ticket.assignedTo)) {
        const users: IUserMinimal[] = ticket.assignedTo
          .filter((u): u is any => typeof u === 'object' && u !== null)
          .map((u) => ({
            _id: u._id,
            firstName: u.firstName,
            lastName: u.lastName,
            fullName: `${u.firstName} ${u.lastName}`,
            email: u.email,
            avatar: u.avatar,
            role: u.role,
          }));
        setAssignedUsers(users);
      }
    }
  }, [ticket]);

  const handleEditSave = async () => {
    try {
      const updateData: Partial<ITicket> & { assignedTo?: string[] } = {
        title: editForm.title,
        description: editForm.description,
        type: editForm.type as ITicket['type'],
        priority: editForm.priority as ITicket['priority'],
        dueDate: editForm.dueDate ? new Date(editForm.dueDate) : undefined,
        client: editForm.client,
        tags: editForm.tags,
      };
      
      // Only include assignedTo if user has permission
      if (userCanAssign) {
        updateData.assignedTo = assignedUsers.map((u) => u._id);
      }
      
      await updateTicket(ticketId, updateData as any);
      setIsEditMode(false);
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTicket(ticketId);
      router.push('/tickets');
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateTicketStatus(ticketId, newStatus);
      toast.success('Status updated');
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleTaskToggle = async (task: ITicketTask) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    try {
      await updateTask(ticketId, task._id, { status: newStatus });
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return;
    try {
      await addTask(ticketId, { title: newTaskTitle.trim() });
      setNewTaskTitle('');
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(ticketId, taskId);
      setTaskToDelete(null);
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    try {
      setIsSubmitting(true);
      await addComment(newComment);
      setNewComment('');
    } catch (error) {
      // Error handled in hook
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <TicketDetailSkeleton />;
  }

  if (error || !ticket) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h2 className="text-xl font-semibold text-surface-900 dark:text-white mb-2">
          Ticket not found
        </h2>
        <p className="text-surface-500 mb-4">
          The ticket you are looking for does not exist or you do not have access.
        </p>
        <Button onClick={() => router.push('/tickets')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Tickets
        </Button>
      </div>
    );
  }

  const completedTasks = ticket.tasks.filter((t) => t.status === 'completed').length;
  const totalTasks = ticket.tasks.length;
  const progress = calculateProgress(ticket.tasks);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => router.push('/tickets')}
        className="flex items-center gap-2 text-sm text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 mb-4 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Tickets
      </button>

      {/* Main Card */}
      <div className="bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-surface-200 dark:border-surface-700">
          {isEditMode ? (
            /* Edit Mode */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-surface-400">
                  {ticket.ticketNumber}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditMode(false)}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleEditSave}
                    disabled={isUpdating}
                  >
                    <Save className="h-4 w-4 mr-1" />
                    Save Changes
                  </Button>
                </div>
              </div>

              {/* Title */}
              <Input
                label="Title"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                placeholder="Ticket title"
              />

              {/* Description */}
              <Textarea
                label="Description"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                placeholder="Ticket description"
                rows={4}
              />

              {/* Type & Priority Row */}
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Type"
                  options={TICKET_TYPES.map((t) => ({ value: t.id, label: `${t.icon} ${t.label}` }))}
                  value={editForm.type}
                  onChange={(val) => setEditForm({ ...editForm, type: val })}
                />
                <Select
                  label="Priority"
                  options={TICKET_PRIORITIES.map((p) => ({ value: p.id, label: p.label }))}
                  value={editForm.priority}
                  onChange={(val) => setEditForm({ ...editForm, priority: val })}
                />
              </div>

              {/* Client & Due Date Row */}
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Client"
                  options={clients.map((c) => ({ value: c._id, label: c.name }))}
                  value={editForm.client}
                  onChange={(val) => setEditForm({ ...editForm, client: val })}
                />
                <Input
                  label="Due Date"
                  type="date"
                  value={editForm.dueDate}
                  onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
                />
              </div>

              {/* Assigned Users */}
              {userCanAssign ? (
                <UserTagInput
                  label="Assigned To"
                  selectedUsers={assignedUsers}
                  onChange={setAssignedUsers}
                  placeholder="Search and add team members..."
                  clientId={editForm.client || undefined}
                />
              ) : (
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">
                    Assigned To
                  </label>
                  <div className="flex items-center gap-2 p-3 bg-surface-50 dark:bg-surface-900 rounded-lg">
                    <Lock className="h-4 w-4 text-surface-400" />
                    <span className="text-sm text-surface-500">
                      Only managers can change assignments
                    </span>
                  </div>
                  {assignedUsers.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {assignedUsers.map((user) => (
                        <div
                          key={user._id}
                          className="flex items-center gap-1.5 px-2 py-1 bg-surface-100 dark:bg-surface-700 rounded-md text-sm"
                        >
                          <Avatar
                            src={user.avatar}
                            firstName={user.firstName}
                            lastName={user.lastName}
                            size="xs"
                          />
                          <span>{user.fullName}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tags */}
              <Input
                label="Tags"
                value={editForm.tags.join(', ')}
                onChange={(e) => setEditForm({ 
                  ...editForm, 
                  tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                })}
                placeholder="Enter tags separated by commas"
              />

              {/* Danger Zone - Only show if user can delete */}
              {userCanDelete && (
                <div className="pt-4 border-t border-surface-200 dark:border-surface-700">
                  {showDeleteConfirm ? (
                    <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <span className="text-sm text-red-600 dark:text-red-400">
                        Are you sure? This cannot be undone.
                      </span>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowDeleteConfirm(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={handleDelete}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      onClick={() => setShowDeleteConfirm(true)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete Ticket
                    </Button>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* View Mode */
            <>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-mono text-surface-400">
                      {ticket.ticketNumber}
                    </span>
                    <Badge className={getPriorityColor(ticket.priority)} size="sm">
                      {ticket.priority}
                    </Badge>
                  </div>
                  <h1 className="text-xl font-bold text-surface-900 dark:text-white flex items-center gap-2">
                    <span className="text-lg">{getTypeIcon(ticket.type)}</span>
                    {ticket.title}
                  </h1>
                </div>
                
                <div className="flex items-center gap-2">
                  {/* Edit Button - Only show if user can edit */}
                  {userCanEdit && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditMode(true)}
                    >
                      <Edit2 className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  )}
                  
                  {/* Status Selector - Disabled if user can't edit */}
                  <div className="w-40">
                    <Select
                      options={TICKET_STATUSES.map((s) => ({ value: s.id, label: s.label }))}
                      value={ticket.status}
                      onChange={handleStatusChange}
                      disabled={!userCanEdit}
                    />
                  </div>
                </div>
              </div>

              {/* Description - Compact */}
              {ticket.description && (
                <p className="mt-4 text-sm text-surface-600 dark:text-surface-400 leading-relaxed line-clamp-3">
                  {ticket.description}
                </p>
              )}

              {/* Meta Info Row */}
              <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-surface-500">
                {typeof ticket.client === 'object' && (
                  <div className="flex items-center gap-1.5">
                    <Building className="h-4 w-4" />
                    <span>{ticket.client.name}</span>
                  </div>
                )}
                {ticket.dueDate && (
                  <div className={cn(
                    'flex items-center gap-1.5',
                    new Date(ticket.dueDate) < new Date() && 'text-red-500'
                  )}>
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(ticket.dueDate)}</span>
                  </div>
                )}
                {Array.isArray(ticket.assignedTo) && ticket.assignedTo.length > 0 && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <div className="flex -space-x-2">
                      {ticket.assignedTo.slice(0, 3).map((user: any) => (
                        <Avatar
                          key={user._id}
                          src={user.avatar}
                          firstName={user.firstName}
                          lastName={user.lastName}
                          size="xs"
                          className="ring-2 ring-white dark:ring-surface-800"
                        />
                      ))}
                    </div>
                    {ticket.assignedTo.length > 0 && (
                      <span className="text-surface-600 dark:text-surface-400">
                        {typeof ticket.assignedTo[0] === 'string' ? ticket.assignedTo[0] : ticket.assignedTo[0].firstName}
                        {ticket.assignedTo.length > 1 && ` +${ticket.assignedTo.length - 1}`}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Checklist Section - Main Focus */}
        <div className="p-6">
          {/* Progress Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-surface-900 dark:text-white uppercase tracking-wide">
              Checklist
            </h2>
            {totalTasks > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-surface-500">
                  {completedTasks} of {totalTasks} complete
                </span>
                <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                  {progress}%
                </span>
              </div>
            )}
          </div>
          
          {/* Progress Bar */}
          {totalTasks > 0 && (
            <Progress value={progress} size="md" className="mb-6" />
          )}
          
          {/* Task List */}
          {totalTasks > 0 ? (
            <div className="space-y-1 mb-4">
              {ticket.tasks.map((task) => (
                <div
                  key={task._id}
                  className={cn(
                    'group w-full flex items-start gap-3 p-4 rounded-xl text-left transition-all',
                    task.status === 'completed'
                      ? 'bg-green-50 dark:bg-green-900/10'
                      : 'bg-surface-50 dark:bg-surface-900'
                  )}
                >
                  {/* Checkbox Button */}
                  <button
                    onClick={() => handleTaskToggle(task)}
                    className={cn(
                      'flex-shrink-0 mt-0.5 transition-colors',
                      task.status === 'completed'
                        ? 'text-green-500 hover:text-green-600'
                        : 'text-surface-300 dark:text-surface-600 hover:text-surface-400'
                    )}
                  >
                    {task.status === 'completed' ? (
                      <CheckCircle2 className="h-6 w-6" />
                    ) : (
                      <Circle className="h-6 w-6" />
                    )}
                  </button>
                  
                  {/* Task Content */}
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      'font-medium',
                      task.status === 'completed'
                        ? 'text-surface-500 line-through'
                        : 'text-surface-900 dark:text-white'
                    )}>
                      {task.title}
                    </p>
                    {task.description && (
                      <p className={cn(
                        'text-sm mt-1',
                        task.status === 'completed'
                          ? 'text-surface-400 line-through'
                          : 'text-surface-500 dark:text-surface-400'
                      )}>
                        {task.description}
                      </p>
                    )}
                    {/* Show attachment badge if required */}
                    {task.requiresAttachment && !task.attachmentId && (
                      <span className="inline-flex items-center gap-1 mt-2 text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                        📎 Needs upload
                      </span>
                    )}
                  </div>
                  
                  {/* Time Estimate */}
                  {task.estimatedMinutes && (
                    <div className={cn(
                      'flex items-center gap-1 text-xs px-2 py-1 rounded-full',
                      task.status === 'completed'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                        : 'bg-surface-100 dark:bg-surface-800 text-surface-500'
                    )}>
                      <Clock className="h-3 w-3" />
                      {task.estimatedMinutes}m
                    </div>
                  )}
                  
                  {/* Delete Button - Show on hover or if confirming */}
                  {userCanEdit && (
                    <div className="flex-shrink-0">
                      {taskToDelete === task._id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setTaskToDelete(null)}
                            className="p-1.5 text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 rounded-lg hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task._id)}
                            disabled={isDeletingTask}
                            className="p-1.5 text-red-500 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                          >
                            {isDeletingTask ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setTaskToDelete(task._id);
                          }}
                          className="p-1.5 opacity-0 group-hover:opacity-100 text-surface-400 hover:text-red-500 rounded-lg hover:bg-surface-200 dark:hover:bg-surface-700 transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-surface-400 mb-4">
              <CheckCircle2 className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No tasks yet. Add one below!</p>
            </div>
          )}

          {/* Add Task Input */}
          {userCanEdit && (
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Add a new task..."
                  className="w-full px-4 py-3 pl-10 rounded-xl border border-surface-300 dark:border-surface-600 bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-white placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white dark:focus:bg-surface-800 transition-all"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAddTask();
                    }
                  }}
                />
                <Plus className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
              </div>
              <Button
                onClick={handleAddTask}
                disabled={!newTaskTitle.trim() || isAddingTask}
                className="px-4"
              >
                {isAddingTask ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Comments Section - Collapsible */}
        <div className="border-t border-surface-200 dark:border-surface-700">
          <button
            onClick={() => setShowComments(!showComments)}
            className="w-full flex items-center justify-between p-4 hover:bg-surface-50 dark:hover:bg-surface-700/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-surface-500" />
              <span className="font-medium text-surface-700 dark:text-surface-300">
                Comments
              </span>
              {ticket.comments.length > 0 && (
                <Badge variant="secondary" size="sm">
                  {ticket.comments.length}
                </Badge>
              )}
            </div>
            {showComments ? (
              <ChevronUp className="h-5 w-5 text-surface-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-surface-400" />
            )}
          </button>
          
          {showComments && (
            <div className="px-6 pb-6">
              {/* Add Comment */}
              <div className="flex gap-3 mb-4">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-surface-300 dark:border-surface-600 bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-surface-800"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAddComment();
                    }
                  }}
                />
                <Button
                  onClick={handleAddComment}
                  disabled={!newComment.trim() || isSubmitting || isAddingComment}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>

              {/* Comments List */}
              {ticket.comments.length === 0 ? (
                <p className="text-sm text-surface-400 text-center py-4">
                  No comments yet
                </p>
              ) : (
                <div className="space-y-3">
                  {ticket.comments.map((comment, index) => (
                    <div key={index} className="flex gap-3">
                      <Avatar
                        src={typeof comment.user === 'object' ? comment.user.avatar : undefined}
                        firstName={typeof comment.user === 'object' ? comment.user.firstName : 'U'}
                        lastName={typeof comment.user === 'object' ? comment.user.lastName : ''}
                        size="sm"
                      />
                      <div className="flex-1 bg-surface-50 dark:bg-surface-900 rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-surface-900 dark:text-white">
                            {typeof comment.user === 'object'
                              ? `${comment.user.firstName} ${comment.user.lastName}`
                              : 'Unknown'}
                          </span>
                          <span className="text-xs text-surface-400">
                            {formatRelativeTime(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-surface-600 dark:text-surface-400">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-4 text-xs text-surface-400 text-center">
        Created {formatRelativeTime(ticket.createdAt)} · Updated {formatRelativeTime(ticket.updatedAt)}
      </div>
    </div>
  );
}

function TicketDetailSkeleton() {
  return (
    <div className="max-w-4xl mx-auto">
      <Skeleton variant="text" width={100} className="mb-4" />
      
      <div className="bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 overflow-hidden">
        <div className="p-6 border-b border-surface-200 dark:border-surface-700">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <Skeleton variant="text" width={100} className="mb-2" />
              <Skeleton variant="text" width="70%" height={28} />
            </div>
            <Skeleton variant="rounded" width={160} height={40} />
          </div>
          <Skeleton variant="text" width="90%" className="mt-4" />
          <div className="flex gap-4 mt-4">
            <Skeleton variant="text" width={100} />
            <Skeleton variant="text" width={100} />
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex justify-between mb-4">
            <Skeleton variant="text" width={80} />
            <Skeleton variant="text" width={120} />
          </div>
          <Skeleton variant="rounded" width="100%" height={8} className="mb-6" />
          
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start gap-3 p-4 bg-surface-50 dark:bg-surface-900 rounded-xl mb-2">
              <Skeleton variant="circular" width={24} height={24} />
              <div className="flex-1">
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="text" width="40%" className="mt-1" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
