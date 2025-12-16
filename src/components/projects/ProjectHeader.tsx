'use client';

import { IProject } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/utils';
import {
  ArrowLeft,
  Settings,
  MoreHorizontal,
  Calendar,
  Users,
  ChevronDown,
  Sidebar,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PROJECT_STATUSES, PROJECT_PRIORITIES } from '@/lib/constants';

interface ProjectHeaderProps {
  project: IProject;
  onToggleSidebar: () => void;
  onOpenSettings?: () => void;
}

export function ProjectHeader({
  project,
  onToggleSidebar,
  onOpenSettings,
}: ProjectHeaderProps) {
  const router = useRouter();

  const statusConfig = PROJECT_STATUSES.find((s) => s.id === project.status);
  const priorityConfig = PROJECT_PRIORITIES.find((p) => p.id === project.priority);

  // Get client name safely
  const clientName = typeof project.client === 'string' 
    ? 'Client' 
    : project.client?.name || 'Client';

  return (
    <div className="bg-white dark:bg-surface-900 border-b border-surface-200 dark:border-surface-800 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left section */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/projects')}
            className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-surface-600 dark:text-surface-400" />
          </button>

          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: project.color }}
            >
              <span className="text-white text-lg font-bold">
                {project.name.charAt(0)}
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-surface-900 dark:text-white">
                  {project.name}
                </h1>
                <span className="text-sm text-surface-500 dark:text-surface-400">
                  {project.projectNumber}
                </span>
              </div>
              <p className="text-sm text-surface-500 dark:text-surface-400">
                {clientName}
              </p>
            </div>
          </div>
        </div>

        {/* Center section - Status & Priority */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'px-3 py-1.5 rounded-full text-sm font-medium',
                statusConfig?.color || 'bg-surface-100 text-surface-700'
              )}
            >
              {statusConfig?.label || project.status}
            </span>

            <span
              className={cn(
                'px-3 py-1.5 rounded-full text-sm font-medium',
                priorityConfig?.color || 'bg-surface-100 text-surface-700'
              )}
            >
              {priorityConfig?.label || project.priority}
            </span>
          </div>

          {project.targetEndDate && (
            <div className="flex items-center gap-1.5 text-sm text-surface-600 dark:text-surface-400">
              <Calendar className="w-4 h-4" />
              <span>Due {formatDate(project.targetEndDate)}</span>
            </div>
          )}

          {project.teamMembers && (
            <div className="flex items-center gap-1.5 text-sm text-surface-600 dark:text-surface-400">
              <Users className="w-4 h-4" />
              <span>{project.teamMembers.length} members</span>
            </div>
          )}
        </div>

        {/* Right section - Actions */}
        <div className="flex items-center gap-2">
          {onOpenSettings && (
            <Button variant="outline" size="sm" onClick={onOpenSettings}>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          )}

          <Button variant="outline" size="sm" onClick={onToggleSidebar}>
            <Sidebar className="w-4 h-4" />
          </Button>

          <Button variant="ghost" size="sm">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}



