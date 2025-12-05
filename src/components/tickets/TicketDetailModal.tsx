'use client';

import { useState } from 'react';
import { ITicket, ITicketTask } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar, AvatarGroup } from '@/components/ui/Avatar';
import { Progress } from '@/components/ui/Progress';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useTicket, useTickets } from '@/hooks/useTickets';
import { TICKET_STATUSES, TICKET_PRIORITIES } from '@/lib/constants';
import {
  formatDate,
  formatRelativeTime,
  getTypeIcon,
  getPriorityColor,
  calculateProgress,
  cn,
} from '@/lib/utils';
import {
  Calendar,
  CheckSquare,
  MessageCircle,
  Paperclip,
  Clock,
  User,
  Building,
  Tag,
  Edit2,
  Trash2,
  Send,
  CheckCircle2,
  Circle,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface TicketDetailModalProps {
  ticket: ITicket | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TicketDetailModal({ ticket, isOpen, onClose }: TicketDetailModalProps) {
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { updateTicketStatus, updateTask } = useTickets();
  const { addComment, isAddingComment } = useTicket(ticket?._id || '');

  if (!ticket) return null;

  const completedTasks = ticket.tasks.filter((t) => t.status === 'completed').length;
  const totalTasks = ticket.tasks.length;
  const progress = calculateProgress(ticket.tasks);

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateTicketStatus(ticket._id, newStatus);
      toast.success('Status updated');
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleTaskToggle = async (task: ITicketTask) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    try {
      await updateTask(ticket._id, task._id, { status: newStatus });
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    try {
      setIsSubmitting(true);
      await addComment(newComment);
      setNewComment('');
    } catch (error) {
      // Error is handled in the hook
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      size="xl"
    >
      <div className="max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-mono text-surface-500 dark:text-surface-400">
                {ticket.ticketNumber}
              </span>
              <Badge className={getPriorityColor(ticket.priority)} size="sm">
                {ticket.priority}
              </Badge>
            </div>
            <h2 className="text-xl font-semibold text-surface-900 dark:text-white flex items-center gap-2">
              <span>{getTypeIcon(ticket.type)}</span>
              {ticket.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-surface-500" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div>
              <h3 className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                Description
              </h3>
              <div className="prose prose-sm dark:prose-invert max-w-none text-surface-600 dark:text-surface-400">
                {ticket.description || 'No description provided'}
              </div>
            </div>

            {/* AI Instructions */}
            {ticket.aiGeneratedInstructions && (
              <div>
                <h3 className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-2 flex items-center gap-2">
                  <span className="text-primary-500">✨</span> AI Instructions
                </h3>
                <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-4 text-sm text-surface-700 dark:text-surface-300 whitespace-pre-wrap">
                  {ticket.aiGeneratedInstructions}
                </div>
              </div>
            )}

            {/* Tasks */}
            {totalTasks > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-surface-700 dark:text-surface-300">
                    Tasks ({completedTasks}/{totalTasks})
                  </h3>
                  <span className="text-sm text-surface-500">{progress}%</span>
                </div>
                <Progress value={progress} size="sm" className="mb-4" />
                <div className="space-y-2">
                  {ticket.tasks.map((task) => (
                    <div
                      key={task._id}
                      className="flex items-start gap-3 p-3 bg-surface-50 dark:bg-surface-800 rounded-lg"
                    >
                      <button
                        onClick={() => handleTaskToggle(task)}
                        className={cn(
                          'mt-0.5 flex-shrink-0 transition-colors',
                          task.status === 'completed'
                            ? 'text-green-500'
                            : 'text-surface-400 hover:text-surface-600'
                        )}
                      >
                        {task.status === 'completed' ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : (
                          <Circle className="h-5 w-5" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            'text-sm font-medium',
                            task.status === 'completed'
                              ? 'text-surface-500 line-through'
                              : 'text-surface-900 dark:text-white'
                          )}
                        >
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="text-xs text-surface-500 mt-1">
                            {task.description}
                          </p>
                        )}
                        {task.estimatedMinutes && (
                          <p className="text-xs text-surface-400 mt-1 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {task.estimatedMinutes} min
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Comments */}
            <div>
              <h3 className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-3">
                Comments ({ticket.comments.length})
              </h3>
              
              {/* Add Comment */}
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 px-3 py-2 rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                  size="sm"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>

              {/* Comments List */}
              <div className="space-y-4">
                {ticket.comments.length === 0 ? (
                  <p className="text-sm text-surface-400 text-center py-4">
                    No comments yet
                  </p>
                ) : (
                  ticket.comments.map((comment, index) => (
                    <div key={index} className="flex gap-3">
                      <Avatar
                        src={typeof comment.user === 'object' ? comment.user.avatar : undefined}
                        firstName={typeof comment.user === 'object' ? comment.user.firstName : 'U'}
                        lastName={typeof comment.user === 'object' ? comment.user.lastName : ''}
                        size="sm"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-surface-900 dark:text-white">
                            {typeof comment.user === 'object'
                              ? `${comment.user.firstName} ${comment.user.lastName}`
                              : 'Unknown'}
                          </span>
                          <span className="text-xs text-surface-400">
                            {formatRelativeTime(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-surface-600 dark:text-surface-400 mt-1">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <div>
              <label className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-2 block">
                Status
              </label>
              <Select
                options={TICKET_STATUSES.map((s) => ({ value: s.id, label: s.label }))}
                value={ticket.status}
                onChange={handleStatusChange}
              />
            </div>

            {/* Client */}
            <div>
              <label className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-2 flex items-center gap-2">
                <Building className="h-4 w-4" /> Client
              </label>
              <p className="text-surface-900 dark:text-white">
                {typeof ticket.client === 'object' ? ticket.client.name : 'Unknown'}
              </p>
            </div>

            {/* Assigned To */}
            <div>
              <label className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-2 flex items-center gap-2">
                <User className="h-4 w-4" /> Assigned To
              </label>
              {Array.isArray(ticket.assignedTo) && ticket.assignedTo.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {ticket.assignedTo.map((user: any) => (
                    <div
                      key={user._id}
                      className="flex items-center gap-2 bg-surface-100 dark:bg-surface-800 rounded-full px-3 py-1"
                    >
                      <Avatar
                        src={user.avatar}
                        firstName={user.firstName}
                        lastName={user.lastName}
                        size="xs"
                      />
                      <span className="text-sm text-surface-700 dark:text-surface-300">
                        {user.firstName}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-surface-400 text-sm">Unassigned</p>
              )}
            </div>

            {/* Due Date */}
            <div>
              <label className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4" /> Due Date
              </label>
              <p className="text-surface-900 dark:text-white">
                {ticket.dueDate ? formatDate(ticket.dueDate) : 'No due date'}
              </p>
            </div>

            {/* Tags */}
            {ticket.tags.length > 0 && (
              <div>
                <label className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-2 flex items-center gap-2">
                  <Tag className="h-4 w-4" /> Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {ticket.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" size="sm">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Timestamps */}
            <div className="pt-4 border-t border-surface-200 dark:border-surface-700 text-xs text-surface-400 space-y-1">
              <p>Created {formatRelativeTime(ticket.createdAt)}</p>
              <p>Updated {formatRelativeTime(ticket.updatedAt)}</p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

