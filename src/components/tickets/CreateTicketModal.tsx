'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { ColorPicker } from '@/components/ui/ColorPicker';
import { AITicketChat } from './AITicketChat';
import { SOPPanel } from '@/components/shared/SOPPanel';
import { SOPChat } from '@/components/projects/SOPChat';
import { useTickets } from '@/hooks/useTickets';
import { useClients } from '@/hooks/useClients';
import { useProjectOptions } from '@/hooks/useProjects';
import { useAI } from '@/hooks/useAI';
import { useAuthStore } from '@/stores/authStore';
import { CreatedTicketInfo, SOP } from '@/types';
import { TICKET_TYPES, TICKET_PRIORITIES } from '@/lib/constants';
import {
  Sparkles,
  Loader2,
  CheckCircle,
  Clock,
  X,
  Bot,
  FileText,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const createTicketSchema = z.object({
  client: z.string().min(1, 'Please select a client'),
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().min(1, 'Description is required'),
  type: z.string().min(1, 'Please select a type'),
  priority: z.string().optional(),
  dueDate: z.string().optional(),
});

type CreateTicketForm = z.infer<typeof createTicketSchema>;

type TabType = 'ai' | 'manual';
type ChatMode = 'ticket' | 'sop';

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultClientId?: string;
  defaultProjectId?: string;
}

export function CreateTicketModal({
  isOpen,
  onClose,
  defaultClientId,
  defaultProjectId,
}: CreateTicketModalProps) {
  const { createTicket, isCreating } = useTickets();
  const { clients, isLoading: clientsLoading } = useClients();
  const { projectOptions, isLoading: projectsLoading } = useProjectOptions();
  const { generateTicketContent, isGeneratingTicket } = useAI();
  const { user } = useAuthStore();

  // Tab state - default to AI
  const [activeTab, setActiveTab] = useState<TabType>('ai');
  
  // Chat mode state - ticket creation or SOP creation
  const [chatMode, setChatMode] = useState<ChatMode>('ticket');
  
  // SOP state
  const [selectedSOPId, setSelectedSOPId] = useState<string | null>(null);
  const [editingSOP, setEditingSOP] = useState<SOP | null>(null);

  // Get client ID for SOP fetching - use first assigned client or default
  const clientIdForSOPs = defaultClientId || user?.assignedClients?.[0] || clients[0]?._id;

  // Manual form state
  const [aiGenerated, setAiGenerated] = useState<any>(null);
  const [selectedTasks, setSelectedTasks] = useState<any[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [selectedColor, setSelectedColor] = useState<string | undefined>(undefined);
  const [selectedProject, setSelectedProject] = useState<string | null>(defaultProjectId || null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateTicketForm>({
    resolver: zodResolver(createTicketSchema),
    defaultValues: {
      client: defaultClientId || '',
      type: 'feature',
      priority: 'medium',
    },
  });

  const watchedClient = watch('client');
  const watchedTitle = watch('title');
  const watchedDescription = watch('description');
  const watchedType = watch('type');

  // Reset tab and chat mode when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setActiveTab('ai');
      setChatMode('ticket');
      setSelectedSOPId(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (defaultClientId) {
      setValue('client', defaultClientId);
    }
  }, [defaultClientId, setValue]);

  useEffect(() => {
    if (defaultProjectId) {
      setSelectedProject(defaultProjectId);
    }
  }, [defaultProjectId]);

  // Handle AI ticket creation
  const handleAITicketCreated = (ticket: CreatedTicketInfo) => {
    // Ticket was created - close the modal
    handleClose();
  };

  // Manual form handlers
  const handleGenerateAI = async () => {
    if (!watchedClient || !watchedTitle || !watchedDescription || !watchedType) {
      return;
    }

    try {
      const generated = await generateTicketContent({
        title: watchedTitle,
        description: watchedDescription,
        type: watchedType,
        clientId: watchedClient,
      });

      setAiGenerated(generated);
      setSelectedTasks(generated.tasks);
      setTags(generated.tags);
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleToggleTask = (taskIndex: number) => {
    if (selectedTasks.includes(aiGenerated.tasks[taskIndex])) {
      setSelectedTasks(selectedTasks.filter((_, i) => i !== taskIndex));
    } else {
      setSelectedTasks([...selectedTasks, aiGenerated.tasks[taskIndex]]);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const onSubmit = async (data: CreateTicketForm) => {
    try {
      await createTicket({
        ...data,
        project: selectedProject,
        tags,
        color: selectedColor,
        generateAIContent: !!aiGenerated,
      } as any);
      handleClose();
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleClose = () => {
    reset();
    setAiGenerated(null);
    setSelectedTasks([]);
    setTags([]);
    setSelectedColor(undefined);
    setSelectedProject(defaultProjectId || null);
    setActiveTab('ai');
    setChatMode('ticket');
    setSelectedSOPId(null);
    setEditingSOP(null);
    onClose();
  };

  // SOP creation handlers
  const handleSOPCreated = (guidelineId: string, guidelineName: string) => {
    // SOP created - switch back to ticket mode and optionally select the new SOP
    setChatMode('ticket');
    setSelectedSOPId(guidelineId);
  };

  const handleCreateNewSOP = () => {
    setChatMode('sop');
  };

  const handleCancelSOPChat = () => {
    setChatMode('ticket');
  };

  const canGenerateAI = Boolean(watchedClient && watchedTitle && watchedDescription && watchedType);

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      title="Create New Ticket" 
      size="full"
      className="!max-w-5xl"
      disableContentScroll={activeTab === 'ai'}
    >
      {/* Tab Selector */}
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

      {/* AI Chat Tab - Two Column Layout with SOP Sidebar */}
      {activeTab === 'ai' && (
        <div className="flex gap-6" style={{ height: 'calc(70vh - 120px)' }}>
          {/* Left Column - Chat Interface */}
          <div className="flex-1 min-w-0 flex flex-col">
            {chatMode === 'ticket' ? (
              <AITicketChat
                onTicketCreated={handleAITicketCreated}
                onCancel={handleClose}
                defaultProjectId={defaultProjectId}
                selectedSOPId={selectedSOPId}
              />
            ) : (
              <SOPChat
                onSOPCreated={handleSOPCreated}
                onCancel={handleCancelSOPChat}
              />
            )}
          </div>

          {/* Right Column - SOP Panel */}
          {chatMode === 'ticket' && (
            <div className="w-64 flex-shrink-0 border-l border-surface-200 dark:border-surface-700 pl-6 flex flex-col">
              <SOPPanel
                clientId={clientIdForSOPs}
                selectedSOPId={selectedSOPId}
                onSelectSOP={setSelectedSOPId}
                onCreateNew={handleCreateNewSOP}
                onEdit={setEditingSOP}
              />
            </div>
          )}
        </div>
      )}

      {/* Manual Form Tab */}
      {activeTab === 'manual' && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {/* Client Selection */}
            <Select
              label="Client"
              options={clients.map((c) => ({ value: c._id, label: c.name }))}
              value={watch('client')}
              onChange={(val) => setValue('client', val)}
              error={errors.client?.message}
              disabled={clientsLoading}
              placeholder="Select a client"
            />

            {/* Type Selection */}
            <Select
              label="Type"
              options={TICKET_TYPES.map((t) => ({ value: t.id, label: `${t.icon} ${t.label}` }))}
              value={watch('type')}
              onChange={(val) => setValue('type', val)}
              error={errors.type?.message}
            />
          </div>

          {/* Project Selection */}
          <Select
            label="Project (Optional)"
            options={[
              { value: '', label: 'No Project (Standalone)' },
              ...projectOptions.map((p) => ({ 
                value: p._id, 
                label: `${p.projectNumber} - ${p.name}` 
              })),
            ]}
            value={selectedProject || ''}
            onChange={(val) => setSelectedProject(val || null)}
            disabled={projectsLoading}
            placeholder="Select a project"
          />

          {/* Title */}
          <Input
            {...register('title')}
            label="Title"
            placeholder="Brief description of the task"
            error={errors.title?.message}
          />

          {/* Description */}
          <Textarea
            {...register('description')}
            label="Description"
            placeholder="Detailed description of what needs to be done..."
            rows={4}
            error={errors.description?.message}
          />

          <div className="grid grid-cols-2 gap-4">
            {/* Priority */}
            <Select
              label="Priority"
              options={TICKET_PRIORITIES.map((p) => ({ value: p.id, label: p.label }))}
              value={watch('priority') || 'medium'}
              onChange={(val) => setValue('priority', val)}
            />

            {/* Due Date */}
            <Input
              {...register('dueDate')}
              type="date"
              label="Due Date"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="pr-1">
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 hover:text-error-500"
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
                Add
              </Button>
            </div>
          </div>

          {/* Color Picker */}
          <ColorPicker
            label="Card Color (Optional)"
            value={selectedColor}
            onChange={setSelectedColor}
          />

          {/* AI Generation Button */}
          <div className="border-t border-[var(--border-default)] pt-6">
            <Button
              type="button"
              variant="gradient"
              onClick={handleGenerateAI}
              disabled={!canGenerateAI || isGeneratingTicket}
              className="w-full"
            >
              {isGeneratingTicket ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              {isGeneratingTicket ? 'Generating...' : 'Generate AI Instructions & Tasks'}
            </Button>
            {!canGenerateAI && (
              <p className="text-xs text-[var(--text-muted)] text-center mt-2">
                Fill in client, title, description, and type to enable AI generation
              </p>
            )}
          </div>

          {/* AI Generated Content */}
          {aiGenerated && (
            <div className="space-y-4 border border-primary-200 dark:border-primary-800 rounded-xl p-4 bg-primary-50/50 dark:bg-primary-900/20">
              <div className="flex items-center gap-2 text-primary-700 dark:text-primary-300">
                <Sparkles className="h-5 w-5" />
                <span className="font-semibold">AI Generated Content</span>
              </div>

              {/* Instructions Preview */}
              <div className="bg-[var(--bg-primary)] rounded-lg p-4">
                <h4 className="font-medium text-[var(--text-primary)] mb-2">Instructions</h4>
                <div className="prose prose-sm dark:prose-invert max-h-40 overflow-y-auto">
                  <ReactMarkdown>{aiGenerated.aiGeneratedInstructions}</ReactMarkdown>
                </div>
              </div>

              {/* Tasks */}
              <div className="bg-[var(--bg-primary)] rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-[var(--text-primary)]">Tasks</h4>
                  <span className="text-sm text-[var(--text-muted)]">
                    {selectedTasks.length} selected
                  </span>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {aiGenerated.tasks.map((task: any, index: number) => (
                    <label
                      key={index}
                      className="flex items-start gap-3 p-2 rounded-lg hover:bg-[var(--bg-tertiary)] cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedTasks.includes(task)}
                        onChange={() => handleToggleTask(index)}
                        className="mt-1 rounded border-[var(--border-default)] text-primary-500 focus:ring-primary-500"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-[var(--text-primary)] text-sm">
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="text-xs text-[var(--text-muted)] mt-0.5">
                            {task.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                        <Clock className="h-3 w-3" />
                        {task.estimatedMinutes}m
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Estimated Time */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--text-secondary)]">Estimated Total</span>
                <span className="font-medium text-[var(--text-primary)]">
                  {aiGenerated.estimatedTotalHours} hours
                </span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-default)]">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isCreating}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Create Ticket
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
