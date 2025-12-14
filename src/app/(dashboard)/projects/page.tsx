'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProjectsBoard, useProjects } from '@/hooks/useProjects';
import { useClients } from '@/hooks/useClients';
import { useProjectStore } from '@/stores/projectStore';
import { ProjectBoard, CreateProjectModal } from '@/components/projects';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { IProject } from '@/types';
import {
  Plus,
  LayoutGrid,
  List,
  Filter,
  Search,
  Settings,
  FolderKanban,
} from 'lucide-react';

export default function ProjectsPage() {
  const router = useRouter();
  const { filters, setFilters, viewMode, setViewMode } = useProjectStore();
  const { clients } = useClients();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<IProject | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { board, isLoading, updateProjectStatus } = useProjectsBoard(
    filters.client || undefined
  );

  const { projects, isLoading: isListLoading } = useProjects({
    client: filters.client || undefined,
    status: filters.status || undefined,
    priority: filters.priority || undefined,
    projectLead: filters.projectLead || undefined,
    type: filters.type || undefined,
    isArchived: filters.isArchived,
    search: searchQuery || undefined,
  });

  const handleProjectClick = (project: IProject) => {
    router.push(`/projects/${project._id}`);
  };

  const handleProjectEdit = (project: IProject) => {
    setEditingProject(project);
  };

  const handleStatusChange = async (projectId: string, newStatus: string) => {
    await updateProjectStatus(projectId, newStatus);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Page Header */}
      <PageHeader
        title="Projects"
        description="Manage and track all your projects"
        icon={FolderKanban}
        actions={
          <div className="flex items-center gap-3">
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </div>
        }
      />

      {/* Filters & Controls */}
      <div className="px-6 py-4 border-b border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900">
        <div className="flex items-center justify-between gap-4">
          {/* Left side - Filters */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
              <Input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64"
              />
            </div>

            {/* Client Filter */}
            <Select
              options={[
                { value: '', label: 'All Clients' },
                ...clients.map((c) => ({ value: c._id, label: c.name })),
              ]}
              value={filters.client || ''}
              onChange={(val) => setFilters({ client: val || null })}
              placeholder="Filter by client"
            />

            {/* Status Filter */}
            <Select
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'planning', label: 'Planning' },
                { value: 'in_progress', label: 'In Progress' },
                { value: 'review', label: 'Review' },
                { value: 'completed', label: 'Completed' },
              ]}
              value={filters.status || ''}
              onChange={(val) => setFilters({ status: val || null })}
              placeholder="Filter by status"
            />

            {/* Priority Filter */}
            <Select
              options={[
                { value: '', label: 'All Priorities' },
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
                { value: 'critical', label: 'Critical' },
              ]}
              value={filters.priority || ''}
              onChange={(val) => setFilters({ priority: val || null })}
              placeholder="Filter by priority"
            />
          </div>

          {/* Right side - View toggle */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-surface-100 dark:bg-surface-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode('board')}
                className={`p-2 rounded ${
                  viewMode === 'board'
                    ? 'bg-white dark:bg-surface-700 shadow-sm'
                    : 'text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-surface-700 shadow-sm'
                    : 'text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-h-0 overflow-auto p-6">
        {viewMode === 'board' ? (
          <ProjectBoard
            board={board}
            projects={projects}
            isLoading={isLoading || isListLoading}
            onStatusChange={handleStatusChange}
            onProjectClick={handleProjectClick}
            onProjectEdit={handleProjectEdit}
          />
        ) : (
          <ProjectListView
            projects={projects}
            isLoading={isListLoading}
            onProjectClick={handleProjectClick}
          />
        )}
      </div>

      {/* Create/Edit Project Modal */}
      <CreateProjectModal
        isOpen={isCreateModalOpen || !!editingProject}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingProject(null);
        }}
        editingProject={editingProject}
      />
    </div>
  );
}

// List View Component
function ProjectListView({
  projects,
  isLoading,
  onProjectClick,
}: {
  projects: IProject[];
  isLoading: boolean;
  onProjectClick: (project: IProject) => void;
}) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-surface-500 dark:text-surface-400">
        <FolderKanban className="w-12 h-12 mb-4 opacity-50" />
        <p className="text-lg font-medium">No projects found</p>
        <p className="text-sm">Create a new project to get started</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800 overflow-hidden">
      <table className="w-full">
        <thead className="bg-surface-50 dark:bg-surface-800">
          <tr>
            <th className="text-left px-6 py-3 text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">
              Project
            </th>
            <th className="text-left px-6 py-3 text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">
              Client
            </th>
            <th className="text-left px-6 py-3 text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">
              Status
            </th>
            <th className="text-left px-6 py-3 text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">
              Priority
            </th>
            <th className="text-left px-6 py-3 text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">
              Progress
            </th>
            <th className="text-left px-6 py-3 text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">
              Team
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
          {projects.map((project) => {
            const clientName =
              typeof project.client === 'string'
                ? 'Client'
                : project.client?.name || 'Client';

            return (
              <tr
                key={project._id}
                onClick={() => onProjectClick(project)}
                className="hover:bg-surface-50 dark:hover:bg-surface-800 cursor-pointer"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                      style={{ backgroundColor: project.color }}
                    >
                      {project.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-surface-900 dark:text-white">
                        {project.name}
                      </p>
                      <p className="text-sm text-surface-500 dark:text-surface-400">
                        {project.projectNumber}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-surface-600 dark:text-surface-400">
                  {clientName}
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 text-xs rounded-full bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 capitalize">
                    {project.status?.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 text-xs rounded-full capitalize ${
                      project.priority === 'critical'
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'
                        : project.priority === 'high'
                        ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300'
                        : 'bg-surface-100 text-surface-700 dark:bg-surface-800 dark:text-surface-300'
                    }`}
                  >
                    {project.priority}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 bg-surface-100 dark:bg-surface-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{
                          width: `${project.progress?.percentage || 0}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-surface-500 dark:text-surface-400">
                      {project.progress?.percentage || 0}%
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex -space-x-2">
                    {project.teamMembers?.filter(m => m != null).slice(0, 3).map((member, index) => {
                      const memberId = typeof member === 'string' ? member : member._id;
                      const memberName = typeof member === 'string' ? '' : `${member.firstName} ${member.lastName}`;
                      const memberInitial = typeof member === 'string' ? '?' : member.firstName?.[0];
                      return (
                        <div
                          key={memberId || index}
                          className="w-6 h-6 rounded-full bg-surface-200 dark:bg-surface-600 border-2 border-white dark:border-surface-900 flex items-center justify-center"
                          title={memberName}
                        >
                          <span className="text-xs font-medium text-surface-600 dark:text-surface-300">
                            {memberInitial}
                          </span>
                        </div>
                      );
                    })}
                    {project.teamMembers && project.teamMembers.length > 3 && (
                      <div className="w-6 h-6 rounded-full bg-surface-100 dark:bg-surface-700 border-2 border-white dark:border-surface-900 flex items-center justify-center">
                        <span className="text-xs text-surface-500">
                          +{project.teamMembers.length - 3}
                        </span>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

