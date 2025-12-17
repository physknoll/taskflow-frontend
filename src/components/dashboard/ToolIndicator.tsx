'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  PlusCircle,
  CheckCircle2,
  MessageSquare,
  Send,
  Clock,
  Zap,
  Brain,
  Loader2,
  FileSearch,
  ListChecks,
  Edit3,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ToolIndicatorProps {
  isThinking: boolean;
  currentTool: string | null;
  recentTools: string[];
  className?: string;
}

// Tool name to display info mapping
const TOOL_INFO: Record<string, { label: string; icon: typeof Search; color: string }> = {
  // Thinking state
  agent_thinking: {
    label: 'Thinking',
    icon: Brain,
    color: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300',
  },
  
  // Ticket tools
  create_ticket: {
    label: 'Creating ticket',
    icon: PlusCircle,
    color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  },
  lookup_user_tickets: {
    label: 'Searching tickets',
    icon: Search,
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  },
  update_ticket_status: {
    label: 'Updating status',
    icon: Edit3,
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  },
  add_ticket_comment: {
    label: 'Adding comment',
    icon: MessageSquare,
    color: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
  },
  complete_task: {
    label: 'Completing task',
    icon: CheckCircle2,
    color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  },
  get_ticket_details: {
    label: 'Getting ticket details',
    icon: FileSearch,
    color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
  },
  
  // Task tools
  update_task_status: {
    label: 'Updating task',
    icon: ListChecks,
    color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
  },
  add_task: {
    label: 'Adding task',
    icon: PlusCircle,
    color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
  },
  delete_task: {
    label: 'Removing task',
    icon: Trash2,
    color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  },
  
  // Communication tools
  send_external_message: {
    label: 'Sending message',
    icon: Send,
    color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
  },
  
  // Time/scheduling tools
  log_time: {
    label: 'Logging time',
    icon: Clock,
    color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  },
  
  // Default/unknown
  default: {
    label: 'Processing',
    icon: Zap,
    color: 'bg-surface-100 text-surface-700 dark:bg-surface-700 dark:text-surface-300',
  },
};

function getToolInfo(toolName: string) {
  return TOOL_INFO[toolName] || TOOL_INFO.default;
}

function formatToolName(toolName: string): string {
  const info = TOOL_INFO[toolName];
  if (info) return info.label;
  
  // Fallback: Convert snake_case to Title Case
  return toolName
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function ToolIndicator({ isThinking, currentTool, recentTools, className }: ToolIndicatorProps) {
  // Show thinking indicator
  if (isThinking && !currentTool) {
    const thinkingInfo = TOOL_INFO.agent_thinking;
    const ThinkingIcon = thinkingInfo.icon;
    
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 5 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 5 }}
        className={cn('flex items-center gap-2', className)}
      >
        <div className={cn(
          'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium',
          thinkingInfo.color
        )}>
          <ThinkingIcon className="w-3.5 h-3.5 animate-pulse" />
          <span>{thinkingInfo.label}</span>
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        </div>
      </motion.div>
    );
  }

  // Show current tool being used
  if (currentTool) {
    const toolInfo = getToolInfo(currentTool);
    const ToolIcon = toolInfo.icon;
    
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 5 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 5 }}
        className={cn('flex items-center gap-2', className)}
      >
        <div className={cn(
          'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium',
          toolInfo.color
        )}>
          <ToolIcon className="w-3.5 h-3.5" />
          <span>{formatToolName(currentTool)}</span>
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        </div>
      </motion.div>
    );
  }

  // Show recently completed tools (briefly)
  if (recentTools.length > 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 5 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 5 }}
        className={cn('flex items-center gap-2 flex-wrap', className)}
      >
        {recentTools.map((tool, index) => {
          const toolInfo = getToolInfo(tool);
          const ToolIcon = toolInfo.icon;
          
          return (
            <motion.div
              key={`${tool}-${index}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
                'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
              )}
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>{formatToolName(tool)}</span>
            </motion.div>
          );
        })}
      </motion.div>
    );
  }

  return null;
}

export default ToolIndicator;


