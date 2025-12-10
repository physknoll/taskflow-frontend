'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { IProject, ProjectStats } from '@/types';
import { useProject } from '@/hooks/useProjects';
import { useResources } from '@/hooks/useResources';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { ResourceListInline, ResourceUploader } from '@/components/resources';
import { cn, formatDate } from '@/lib/utils';
import {
  X,
  Calendar,
  Users,
  Target,
  Package,
  Link as LinkIcon,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Trash2,
  Archive,
  Paperclip,
} from 'lucide-react';

interface ProjectSidebarProps {
  project: IProject;
  stats?: ProjectStats;
  onClose: () => void;
}

export function ProjectSidebar({ project, stats, onClose }: ProjectSidebarProps) {
  const router = useRouter();
  const { generateBrief, isGeneratingBrief, archiveProject, isArchiving, deleteProject, isDeleting } = useProject(project._id);
  const [expandedSections, setExpandedSections] = useState<string[]>([
    'details',
    'team',
    'progress',
    'resources',
  ]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddResource, setShowAddResource] = useState(false);
  
  // Get clientId for resources
  const clientId = typeof project.client === 'object' ? project.client._id : project.client;
  
  // Resources hook
  const {
    resources,
    isLoading: isLoadingResources,
    uploadFiles,
    addLink,
    addGitResource,
    deleteResource,
    isUploading,
    isAddingLink,
    isAddingGit,
    isDeleting: isDeletingResource,
  } = useResources('Project', project._id, { enabled: !!project._id && !!clientId });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };

  const handleDelete = async () => {
    try {
      await deleteProject();
      setShowDeleteModal(false);
      router.push('/projects');
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleArchive = async () => {
    try {
      await archiveProject();
      router.push('/projects');
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const SectionHeader = ({
    title,
    section,
    icon: Icon,
  }: {
    title: string;
    section: string;
    icon: any;
  }) => (
    <button
      onClick={() => toggleSection(section)}
      className="flex items-center justify-between w-full py-2 text-sm font-medium text-surface-700 dark:text-surface-300 hover:text-surface-900 dark:hover:text-white"
    >
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4" />
        {title}
      </div>
      {expandedSections.includes(section) ? (
        <ChevronDown className="w-4 h-4" />
      ) : (
        <ChevronRight className="w-4 h-4" />
      )}
    </button>
  );

  return (
    <div className="w-80 border-l border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white dark:bg-surface-900 border-b border-surface-200 dark:border-surface-800 px-4 py-3 flex items-center justify-between">
        <h3 className="font-semibold text-surface-900 dark:text-white">
          Project Details
        </h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-surface-100 dark:hover:bg-surface-800 rounded"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Project Info */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: project.color }}
            />
            <span className="text-xs font-medium text-surface-500 dark:text-surface-400">
              {project.projectNumber}
            </span>
            <span
              className={cn(
                'text-xs px-2 py-0.5 rounded-full',
                project.priority === 'critical'
                  ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'
                  : project.priority === 'high'
                  ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300'
                  : 'bg-surface-100 text-surface-700 dark:bg-surface-800 dark:text-surface-300'
              )}
            >
              {project.priority}
            </span>
          </div>
          <h2 className="text-lg font-semibold text-surface-900 dark:text-white">
            {project.name}
          </h2>
          <p className="text-sm text-surface-600 dark:text-surface-400">
            {project.description}
          </p>
        </div>

        {/* Progress Section */}
        <div className="border-t border-surface-200 dark:border-surface-800 pt-4">
          <SectionHeader title="Progress" section="progress" icon={Target} />
          {expandedSections.includes('progress') && (
            <div className="mt-2 space-y-3">
              {/* Progress bar */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-surface-500 dark:text-surface-400">
                    Overall
                  </span>
                  <span className="font-medium text-surface-900 dark:text-white">
                    {project.progress?.percentage || 0}%
                  </span>
                </div>
                <div className="h-2 bg-surface-100 dark:bg-surface-800 rounded-full">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all"
                    style={{ width: `${project.progress?.percentage || 0}%` }}
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-surface-50 dark:bg-surface-800 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-sm font-medium">Completed</span>
                  </div>
                  <span className="text-2xl font-bold text-surface-900 dark:text-white">
                    {project.progress?.completedTickets || 0}
                  </span>
                </div>
                <div className="bg-surface-50 dark:bg-surface-800 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-1">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-medium">Remaining</span>
                  </div>
                  <span className="text-2xl font-bold text-surface-900 dark:text-white">
                    {(project.progress?.totalTickets || 0) -
                      (project.progress?.completedTickets || 0)}
                  </span>
                </div>
              </div>

              {stats?.overdueTickets && stats.overdueTickets > 0 && (
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg p-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {stats.overdueTickets} overdue tickets
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Details Section */}
        <div className="border-t border-surface-200 dark:border-surface-800 pt-4">
          <SectionHeader title="Details" section="details" icon={FileText} />
          {expandedSections.includes('details') && (
            <div className="mt-2 space-y-3">
              {/* Dates */}
              <div className="space-y-2">
                {project.startDate && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-surface-400" />
                    <span className="text-surface-500 dark:text-surface-400">
                      Start:
                    </span>
                    <span className="text-surface-900 dark:text-white">
                      {formatDate(project.startDate)}
                    </span>
                  </div>
                )}
                {project.targetEndDate && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-surface-400" />
                    <span className="text-surface-500 dark:text-surface-400">
                      Target:
                    </span>
                    <span
                      className={cn(
                        'text-surface-900 dark:text-white',
                        new Date(project.targetEndDate) < new Date() &&
                          project.status !== 'completed' &&
                          'text-red-600 dark:text-red-400'
                      )}
                    >
                      {formatDate(project.targetEndDate)}
                    </span>
                  </div>
                )}
              </div>

              {/* Type & Tags */}
              <div>
                <span className="text-xs font-medium text-surface-500 dark:text-surface-400">
                  Type
                </span>
                <p className="text-sm text-surface-900 dark:text-white capitalize">
                  {project.type?.replace('_', ' ')}
                </p>
              </div>

              {project.tags && project.tags.length > 0 && (
                <div>
                  <span className="text-xs font-medium text-surface-500 dark:text-surface-400">
                    Tags
                  </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 text-xs bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Team Section */}
        <div className="border-t border-surface-200 dark:border-surface-800 pt-4">
          <SectionHeader title="Team" section="team" icon={Users} />
          {expandedSections.includes('team') && (
            <div className="mt-2 space-y-3">
              {/* Project Lead */}
              <div>
                <span className="text-xs font-medium text-surface-500 dark:text-surface-400">
                  Project Lead
                </span>
                {typeof project.projectLead === 'object' && project.projectLead && (
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center">
                      {project.projectLead.avatar ? (
                        <img
                          src={project.projectLead.avatar}
                          alt={project.projectLead.firstName}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                          {project.projectLead.firstName?.[0]}
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-surface-900 dark:text-white">
                      {project.projectLead.firstName}{' '}
                      {project.projectLead.lastName}
                    </span>
                  </div>
                )}
              </div>

              {/* Team Members */}
              {project.teamMembers && project.teamMembers.length > 0 && (
                <div>
                  <span className="text-xs font-medium text-surface-500 dark:text-surface-400">
                    Team Members ({project.teamMembers.length})
                  </span>
                  <div className="space-y-2 mt-1">
                    {project.teamMembers.filter(m => m != null).map((member, index) => {
                      const memberId = typeof member === 'string' ? member : member._id;
                      const firstName = typeof member === 'string' ? '' : member.firstName;
                      const lastName = typeof member === 'string' ? '' : member.lastName;
                      return (
                        <div
                          key={memberId || index}
                          className="flex items-center gap-2"
                        >
                          <div className="w-6 h-6 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center">
                            <span className="text-xs font-medium text-surface-600 dark:text-surface-400">
                              {firstName?.[0] || '?'}
                            </span>
                          </div>
                          <span className="text-sm text-surface-700 dark:text-surface-300">
                            {firstName} {lastName}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Objectives & Deliverables */}
        {((project.objectives && project.objectives.length > 0) ||
          (project.deliverables && project.deliverables.length > 0)) && (
          <div className="border-t border-surface-200 dark:border-surface-800 pt-4">
            <SectionHeader title="Goals" section="goals" icon={Target} />
            {expandedSections.includes('goals') && (
              <div className="mt-2 space-y-3">
                {project.objectives && project.objectives.length > 0 && (
                  <div>
                    <span className="text-xs font-medium text-surface-500 dark:text-surface-400">
                      Objectives
                    </span>
                    <ul className="mt-1 space-y-1">
                      {project.objectives.map((obj, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm text-surface-700 dark:text-surface-300"
                        >
                          <span className="text-primary-500 mt-1">•</span>
                          {obj}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {project.deliverables && project.deliverables.length > 0 && (
                  <div>
                    <span className="text-xs font-medium text-surface-500 dark:text-surface-400">
                      Deliverables
                    </span>
                    <ul className="mt-1 space-y-1">
                      {project.deliverables.map((del, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm text-surface-700 dark:text-surface-300"
                        >
                          <Package className="w-3 h-3 text-surface-400 mt-1" />
                          {del}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Resources Section */}
        <div className="border-t border-surface-200 dark:border-surface-800 pt-4">
          <SectionHeader title="Resources" section="resources" icon={Paperclip} />
          {expandedSections.includes('resources') && (
            <div className="mt-2 space-y-3">
              {/* Add resource button */}
              {!showAddResource ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddResource(true)}
                  className="w-full"
                >
                  <LinkIcon className="w-4 h-4 mr-2" />
                  Add Resource
                </Button>
              ) : (
                <div className="space-y-3">
                  <ResourceUploader
                    clientId={clientId}
                    onUploadFiles={async (files, metadata) => {
                      await uploadFiles(files, metadata);
                      setShowAddResource(false);
                    }}
                    onAddLink={async (data) => {
                      await addLink(data);
                      setShowAddResource(false);
                    }}
                    onAddGit={async (data) => {
                      await addGitResource(data);
                      setShowAddResource(false);
                    }}
                    isUploading={isUploading}
                    isAddingLink={isAddingLink}
                    isAddingGit={isAddingGit}
                    compact
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAddResource(false)}
                    className="w-full text-surface-500"
                  >
                    Cancel
                  </Button>
                </div>
              )}

              {/* Resource list */}
              {isLoadingResources ? (
                <div className="space-y-2">
                  <Skeleton variant="rounded" height={40} />
                  <Skeleton variant="rounded" height={40} />
                </div>
              ) : resources.length > 0 ? (
                <ResourceListInline
                  resources={resources}
                  onDelete={deleteResource}
                  maxItems={5}
                />
              ) : (
                // Show legacy external links if no resources
                project.externalLinks && project.externalLinks.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-xs text-surface-400">Legacy links:</p>
                    {project.externalLinks.map((link, i) => (
                      <a
                        key={i}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-2 rounded-lg border border-surface-200 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-800"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-surface-900 dark:text-white">
                            {link.title}
                          </span>
                          <span className="text-xs text-surface-500 dark:text-surface-400 capitalize">
                            {link.type}
                          </span>
                        </div>
                        <ExternalLink className="w-4 h-4 text-surface-400" />
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-surface-400 text-center py-2">
                    No resources attached
                  </p>
                )
              )}
            </div>
          )}
        </div>

        {/* AI Brief */}
        <div className="border-t border-surface-200 dark:border-surface-800 pt-4">
          <SectionHeader title="AI Brief" section="ai-brief" icon={Sparkles} />
          {expandedSections.includes('ai-brief') && (
            <div className="mt-2">
              {project.aiGeneratedBrief ? (
                <div className="prose prose-sm dark:prose-invert max-w-none text-sm text-surface-700 dark:text-surface-300">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: project.aiGeneratedBrief.replace(/\n/g, '<br />'),
                    }}
                  />
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-surface-500 dark:text-surface-400 mb-3">
                    Generate an AI-powered project brief
                  </p>
                  <Button
                    onClick={() => generateBrief()}
                    disabled={isGeneratingBrief}
                    size="sm"
                  >
                    {isGeneratingBrief ? 'Generating...' : 'Generate Brief'}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Danger Zone */}
        <div className="border-t border-surface-200 dark:border-surface-800 pt-4">
          <SectionHeader title="Danger Zone" section="danger" icon={AlertTriangle} />
          {expandedSections.includes('danger') && (
            <div className="mt-2 space-y-3">
              <div className="p-3 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
                <div className="flex items-start gap-3">
                  <Archive className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                      Archive Project
                    </p>
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                      Archive this project to hide it from active views. You can restore it later.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40"
                      onClick={handleArchive}
                      disabled={isArchiving}
                    >
                      {isArchiving ? 'Archiving...' : 'Archive Project'}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
                <div className="flex items-start gap-3">
                  <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-red-800 dark:text-red-300">
                      Delete Project
                    </p>
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                      Permanently delete this project and all associated data. This action cannot be undone.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/40"
                      onClick={() => setShowDeleteModal(true)}
                    >
                      Delete Project
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Project"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-800 dark:text-red-300">
              This action is permanent and cannot be undone.
            </p>
          </div>

          <p className="text-sm text-surface-600 dark:text-surface-400">
            Are you sure you want to delete <span className="font-semibold text-surface-900 dark:text-white">{project.name}</span>? 
            The project will be permanently deleted. Tickets associated with this project will become standalone tickets and will not be deleted.
          </p>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Project'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

