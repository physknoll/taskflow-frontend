'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { AIProjectChat } from './AIProjectChat';
import { SOPChat } from './SOPChat';
import { GuidelinesPanel } from './GuidelinesPanel';
import { GuidelineEditorModal } from './GuidelineEditorModal';
import { useProjects } from '@/hooks/useProjects';
import { useClients } from '@/hooks/useClients';
import { usersService } from '@/services/users.service';
import { IProject, ITicket, Guideline, CreatedProject, CreatedTicket } from '@/types';
import {
  PROJECT_TYPES,
  PROJECT_PRIORITIES,
  PROJECT_COLORS,
} from '@/lib/constants';
import {
  Plus,
  X,
  Sparkles,
  Loader2,
  CheckCircle,
  Target,
  Package,
  FileText,
  Bot,
} from 'lucide-react';

const createProjectSchema = z.object({
  client: z.string().min(1, 'Please select a client'),
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().min(1, 'Description is required'),
  projectLead: z.string().min(1, 'Please select a project lead'),
  type: z.string().optional(),
  priority: z.string().optional(),
  startDate: z.string().optional(),
  targetEndDate: z.string().optional(),
});

type CreateProjectForm = z.infer<typeof createProjectSchema>;

type TabType = 'ai' | 'manual';
type ChatMode = 'project' | 'sop';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultClientId?: string;
  editingProject?: IProject | null;
}

export function CreateProjectModal({
  isOpen,
  onClose,
  defaultClientId,
  editingProject,
}: CreateProjectModalProps) {
  const { createProject, isCreating, updateProject, isUpdating } = useProjects();
  const { clients, isLoading: clientsLoading } = useClients();

  // Tab state - default to AI for new projects, manual for editing
  const [activeTab, setActiveTab] = useState<TabType>(editingProject ? 'manual' : 'ai');
  
  // Chat mode state - project creation or SOP creation
  const [chatMode, setChatMode] = useState<ChatMode>('project');
  
  // Guidelines state
  const [selectedGuidelineId, setSelectedGuidelineId] = useState<string | null>(null);
  const [editingGuideline, setEditingGuideline] = useState<Guideline | null>(null);

  // Fetch users for project lead and team members
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['users', { isActive: true }],
    queryFn: () => usersService.getUsers({ isActive: true, limit: 100 }),
    enabled: isOpen,
  });

  const users = usersData?.data || [];

  const [objectives, setObjectives] = useState<string[]>([]);
  const [objectiveInput, setObjectiveInput] = useState('');
  const [deliverables, setDeliverables] = useState<string[]>([]);
  const [deliverableInput, setDeliverableInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [selectedColor, setSelectedColor] = useState<string>(PROJECT_COLORS[0]);
  const [generateAIBrief, setGenerateAIBrief] = useState(false);
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateProjectForm>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      client: defaultClientId || '',
      type: 'other',
      priority: 'medium',
    },
  });

  // Reset tab and chat mode when modal opens/closes or editingProject changes
  useEffect(() => {
    if (isOpen) {
      setActiveTab(editingProject ? 'manual' : 'ai');
      setChatMode('project');
      setSelectedGuidelineId(null);
    }
  }, [isOpen, editingProject]);

  // Populate form when editing
  useEffect(() => {
    if (editingProject) {
      setValue('name', editingProject.name);
      setValue('description', editingProject.description);
      setValue(
        'client',
        typeof editingProject.client === 'string'
          ? editingProject.client
          : editingProject.client._id
      );
      const projectLead = editingProject.projectLead;
      setValue('projectLead', typeof projectLead === 'string' ? projectLead : projectLead?._id || '');
      setValue('type', editingProject.type || 'other');
      setValue('priority', editingProject.priority || 'medium');
      setValue(
        'startDate',
        editingProject.startDate
          ? new Date(editingProject.startDate).toISOString().split('T')[0]
          : ''
      );
      setValue(
        'targetEndDate',
        editingProject.targetEndDate
          ? new Date(editingProject.targetEndDate).toISOString().split('T')[0]
          : ''
      );
      setObjectives(editingProject.objectives || []);
      setDeliverables(editingProject.deliverables || []);
      setTags(editingProject.tags || []);
      setSelectedColor(editingProject.color || PROJECT_COLORS[0]);
      setSelectedTeamMembers(
        editingProject.teamMembers?.filter(m => m != null).map((m) => 
          typeof m === 'string' ? m : m._id
        ) || []
      );
    }
  }, [editingProject, setValue]);

  useEffect(() => {
    if (defaultClientId) {
      setValue('client', defaultClientId);
    }
  }, [defaultClientId, setValue]);

  const handleAddObjective = () => {
    if (objectiveInput.trim() && !objectives.includes(objectiveInput.trim())) {
      setObjectives([...objectives, objectiveInput.trim()]);
      setObjectiveInput('');
    }
  };

  const handleRemoveObjective = (obj: string) => {
    setObjectives(objectives.filter((o) => o !== obj));
  };

  const handleAddDeliverable = () => {
    if (
      deliverableInput.trim() &&
      !deliverables.includes(deliverableInput.trim())
    ) {
      setDeliverables([...deliverables, deliverableInput.trim()]);
      setDeliverableInput('');
    }
  };

  const handleRemoveDeliverable = (del: string) => {
    setDeliverables(deliverables.filter((d) => d !== del));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim().toLowerCase()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const onSubmit = async (data: CreateProjectForm) => {
    try {
      const projectData = {
        ...data,
        teamMembers: selectedTeamMembers,
        objectives,
        deliverables,
        tags,
        color: selectedColor,
        generateAIBrief,
      };

      if (editingProject) {
        await updateProject(editingProject._id, projectData as any);
      } else {
        await createProject(projectData as any);
      }
      handleClose();
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleClose = () => {
    reset();
    setObjectives([]);
    setDeliverables([]);
    setTags([]);
    setSelectedTeamMembers([]);
    setSelectedColor(PROJECT_COLORS[0]);
    setGenerateAIBrief(false);
    setActiveTab('ai');
    setChatMode('project');
    setSelectedGuidelineId(null);
    setEditingGuideline(null);
    onClose();
  };

  const handleAIProjectCreated = (project: CreatedProject, tickets: CreatedTicket[]) => {
    // Project created via AI - just close the modal
    // The queries are already invalidated in the hook
    handleClose();
  };

  const handleSOPCreated = (guidelineId: string, guidelineName: string) => {
    // SOP created - switch back to project mode and optionally select the new guideline
    setChatMode('project');
    setSelectedGuidelineId(guidelineId);
  };

  const handleCreateNewSOP = () => {
    setChatMode('sop');
  };

  const handleCancelSOPChat = () => {
    setChatMode('project');
  };

  const isLoading = isCreating || isUpdating;
  const isEditing = !!editingProject;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title={editingProject ? 'Edit Project' : 'Create New Project'}
        size="full"
        className="!max-w-5xl"
        disableContentScroll={activeTab === 'ai' && !isEditing}
      >
        {/* Tab Selector - Only show for new projects - FIXED at top */}
        {!isEditing && (
          <div className="flex gap-2 mb-4 p-1 bg-surface-100 dark:bg-surface-700 rounded-lg flex-shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('ai')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all ${
                activeTab === 'ai'
                  ? 'bg-white dark:bg-surface-800 text-surface-900 dark:text-white shadow-sm'
                  : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white'
              }`}
            >
              <Bot className="w-4 h-4" />
              <span>AI Chat</span>
              <Badge variant="secondary" className="text-xs bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300">
                Recommended
              </Badge>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('manual')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all ${
                activeTab === 'manual'
                  ? 'bg-white dark:bg-surface-800 text-surface-900 dark:text-white shadow-sm'
                  : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Manual Form</span>
            </button>
          </div>
        )}

        {/* AI Chat Tab - Two Column Layout with fixed height */}
        {activeTab === 'ai' && !isEditing && (
          <div className="flex gap-6" style={{ height: 'calc(70vh - 120px)' }}>
            {/* Left Column - Chat Interface */}
            <div className="flex-1 min-w-0 flex flex-col">
              {chatMode === 'project' ? (
                <AIProjectChat
                  onProjectCreated={handleAIProjectCreated}
                  onCancel={handleClose}
                  selectedGuidelineId={selectedGuidelineId}
                />
              ) : (
                <SOPChat
                  onSOPCreated={handleSOPCreated}
                  onCancel={handleCancelSOPChat}
                />
              )}
            </div>

            {/* Right Column - Guidelines Panel */}
            {chatMode === 'project' && (
              <div className="w-64 flex-shrink-0 border-l border-surface-200 dark:border-surface-700 pl-6 flex flex-col">
                <GuidelinesPanel
                  selectedGuidelineId={selectedGuidelineId}
                  onSelectGuideline={setSelectedGuidelineId}
                  onCreateNew={handleCreateNewSOP}
                  onEdit={setEditingGuideline}
                />
              </div>
            )}
          </div>
        )}

        {/* Manual Form Tab */}
        {(activeTab === 'manual' || isEditing) && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Client & Type Row */}
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Client"
                options={clients.map((c) => ({ value: c._id, label: c.name }))}
                value={watch('client')}
                onChange={(val) => setValue('client', val)}
                error={errors.client?.message}
                disabled={clientsLoading}
                placeholder="Select a client"
              />

              <Select
                label="Type"
                options={PROJECT_TYPES.map((t) => ({
                  value: t.id,
                  label: `${t.icon} ${t.label}`,
                }))}
                value={watch('type') || 'other'}
                onChange={(val) => setValue('type', val)}
              />
            </div>

            {/* Name */}
            <Input
              {...register('name')}
              label="Project Name"
              placeholder="Q4 Marketing Campaign"
              error={errors.name?.message}
            />

            {/* Description */}
            <Textarea
              {...register('description')}
              label="Description"
              placeholder="Brief overview of the project goals and scope..."
              rows={3}
              error={errors.description?.message}
            />

            {/* Priority & Project Lead Row */}
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Priority"
                options={PROJECT_PRIORITIES.map((p) => ({
                  value: p.id,
                  label: p.label,
                }))}
                value={watch('priority') || 'medium'}
                onChange={(val) => setValue('priority', val)}
              />

              <Select
                label="Project Lead"
                options={users.map((u) => ({
                  value: u._id,
                  label: `${u.firstName} ${u.lastName}`,
                }))}
                value={watch('projectLead')}
                onChange={(val) => setValue('projectLead', val)}
                error={errors.projectLead?.message}
                placeholder="Select project lead"
                disabled={usersLoading}
              />
            </div>

            {/* Team Members */}
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                Team Members
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedTeamMembers.map((userId) => {
                  const user = users.find((u) => u._id === userId);
                  return user ? (
                    <Badge key={userId} variant="secondary" className="pr-1">
                      {user.firstName} {user.lastName}
                      <button
                        type="button"
                        onClick={() => setSelectedTeamMembers(selectedTeamMembers.filter((id) => id !== userId))}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ) : null;
                })}
              </div>
              <Select
                options={users
                  .filter((u) => !selectedTeamMembers.includes(u._id))
                  .map((u) => ({
                    value: u._id,
                    label: `${u.firstName} ${u.lastName}`,
                  }))}
                value=""
                onChange={(val) => {
                  if (val && !selectedTeamMembers.includes(val)) {
                    setSelectedTeamMembers([...selectedTeamMembers, val]);
                  }
                }}
                placeholder="Add team member"
                disabled={usersLoading}
              />
            </div>

            {/* Dates Row */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                {...register('startDate')}
                type="date"
                label="Start Date"
              />

              <Input
                {...register('targetEndDate')}
                type="date"
                label="Target End Date"
              />
            </div>

            {/* Color Selection */}
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                Project Color
              </label>
              <div className="flex flex-wrap gap-2">
                {PROJECT_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`w-8 h-8 rounded-full transition-all ${
                      selectedColor === color
                        ? 'ring-2 ring-offset-2 ring-primary-500'
                        : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Objectives */}
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                <Target className="w-4 h-4 inline mr-1" />
                Objectives
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {objectives.map((obj) => (
                  <Badge key={obj} variant="secondary" className="pr-1">
                    {obj}
                    <button
                      type="button"
                      onClick={() => handleRemoveObjective(obj)}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={objectiveInput}
                  onChange={(e) => setObjectiveInput(e.target.value)}
                  placeholder="Add an objective"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddObjective();
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={handleAddObjective}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Deliverables */}
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                <Package className="w-4 h-4 inline mr-1" />
                Deliverables
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {deliverables.map((del) => (
                  <Badge key={del} variant="secondary" className="pr-1">
                    {del}
                    <button
                      type="button"
                      onClick={() => handleRemoveDeliverable(del)}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={deliverableInput}
                  onChange={(e) => setDeliverableInput(e.target.value)}
                  placeholder="Add a deliverable"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddDeliverable();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddDeliverable}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="pr-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add a tag"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={handleAddTag}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* AI Brief Toggle */}
            {!editingProject && (
              <div className="border-t border-surface-200 dark:border-surface-700 pt-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={generateAIBrief}
                    onChange={(e) => setGenerateAIBrief(e.target.checked)}
                    className="rounded border-surface-300 text-primary-600 focus:ring-primary-500"
                  />
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary-500" />
                    <span className="text-sm font-medium text-surface-700 dark:text-surface-300">
                      Generate AI Project Brief
                    </span>
                  </div>
                </label>
                <p className="mt-1 ml-7 text-xs text-surface-500 dark:text-surface-400">
                  AI will create a comprehensive project brief based on your inputs
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-surface-200 dark:border-surface-700">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isLoading}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                {editingProject ? 'Update Project' : 'Create Project'}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Guideline Editor Modal */}
      <GuidelineEditorModal
        isOpen={!!editingGuideline}
        onClose={() => setEditingGuideline(null)}
        guideline={editingGuideline}
      />
    </>
  );
}
