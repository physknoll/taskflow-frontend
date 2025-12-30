'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { ColorPicker } from '@/components/ui/ColorPicker';
import { useTickets } from '@/hooks/useTickets';
import { useClients } from '@/hooks/useClients';
import { useProjectOptions } from '@/hooks/useProjects';
import { useAI } from '@/hooks/useAI';
import { useTicketAgent } from '@/hooks/useTicketAgent';
import { TICKET_TYPES, TICKET_PRIORITIES } from '@/lib/constants';
import {
  Sparkles,
  Loader2,
  CheckCircle,
  Clock,
  X,
  Send,
  Bot,
  PenLine,
  FileText,
  User,
  Calendar,
  Tag,
  ArrowRight,
  ExternalLink,
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

type CreationMode = 'ai' | 'manual';

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultClientId?: string;
  defaultProjectId?: string;
}

export function CreateTicketModal({ isOpen, onClose, defaultClientId, defaultProjectId }: CreateTicketModalProps) {
  const { createTicket, isCreating } = useTickets();
  const { clients, isLoading: clientsLoading } = useClients();
  const { projectOptions, isLoading: projectsLoading } = useProjectOptions();
  const { generateTicketContent, isGeneratingTicket } = useAI();
  const ticketAgent = useTicketAgent();

  const [mode, setMode] = useState<CreationMode>('ai');
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  // Start AI session when modal opens in AI mode
  useEffect(() => {
    if (isOpen && mode === 'ai' && !ticketAgent.sessionId) {
      ticketAgent.startSession(defaultProjectId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, mode, ticketAgent.sessionId, defaultProjectId]);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [ticketAgent.messages, ticketAgent.streamingText]);

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

  // Handle mode switch
  const handleModeSwitch = (newMode: CreationMode) => {
    if (newMode === mode) return;
    
    if (newMode === 'ai' && !ticketAgent.sessionId) {
      ticketAgent.startSession(defaultProjectId);
    }
    setMode(newMode);
  };

  // AI Chat handlers
  const handleSendMessage = async () => {
    if (!messageInput.trim() || ticketAgent.isSending) return;
    
    const message = messageInput;
    setMessageInput('');
    await ticketAgent.sendMessage(message);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleConfirmCreate = () => {
    // Send confirmation message to agent
    ticketAgent.sendMessage('Yes, create it');
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
    setMessageInput('');
    ticketAgent.resetSession();
    onClose();
  };

  const handleViewTicket = () => {
    if (ticketAgent.createdTicket) {
      window.location.href = `/tickets/${ticketAgent.createdTicket.id}`;
    }
    handleClose();
  };

  const canGenerateAI = Boolean(watchedClient && watchedTitle && watchedDescription && watchedType);

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New Ticket" size="xl">
      {/* Mode Toggle */}
      <div className="flex items-center justify-center gap-1 p-1 mb-6 bg-surface-100 dark:bg-surface-800 rounded-lg">
        <button
          type="button"
          onClick={() => handleModeSwitch('ai')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            mode === 'ai'
              ? 'bg-white dark:bg-surface-700 text-primary-600 dark:text-primary-400 shadow-sm'
              : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white'
          }`}
        >
          <Bot className="h-4 w-4" />
          AI Assistant
        </button>
        <button
          type="button"
          onClick={() => handleModeSwitch('manual')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            mode === 'manual'
              ? 'bg-white dark:bg-surface-700 text-primary-600 dark:text-primary-400 shadow-sm'
              : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white'
          }`}
        >
          <PenLine className="h-4 w-4" />
          Manual
        </button>
      </div>

      {mode === 'ai' ? (
        <AIAssistantMode
          ticketAgent={ticketAgent}
          messageInput={messageInput}
          setMessageInput={setMessageInput}
          handleSendMessage={handleSendMessage}
          handleKeyDown={handleKeyDown}
          handleConfirmCreate={handleConfirmCreate}
          handleViewTicket={handleViewTicket}
          handleClose={handleClose}
          messagesEndRef={messagesEndRef}
        />
      ) : (
        <ManualFormMode
          register={register}
          handleSubmit={handleSubmit}
          onSubmit={onSubmit}
          watch={watch}
          setValue={setValue}
          errors={errors}
          clients={clients}
          clientsLoading={clientsLoading}
          projectOptions={projectOptions}
          projectsLoading={projectsLoading}
          selectedProject={selectedProject}
          setSelectedProject={setSelectedProject}
          tags={tags}
          tagInput={tagInput}
          setTagInput={setTagInput}
          handleAddTag={handleAddTag}
          handleRemoveTag={handleRemoveTag}
          selectedColor={selectedColor}
          setSelectedColor={setSelectedColor}
          canGenerateAI={canGenerateAI}
          handleGenerateAI={handleGenerateAI}
          isGeneratingTicket={isGeneratingTicket}
          aiGenerated={aiGenerated}
          selectedTasks={selectedTasks}
          handleToggleTask={handleToggleTask}
          isCreating={isCreating}
          handleClose={handleClose}
        />
      )}
    </Modal>
  );
}

// AI Assistant Mode Component
interface AIAssistantModeProps {
  ticketAgent: ReturnType<typeof useTicketAgent>;
  messageInput: string;
  setMessageInput: (value: string) => void;
  handleSendMessage: () => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  handleConfirmCreate: () => void;
  handleViewTicket: () => void;
  handleClose: () => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

function AIAssistantMode({
  ticketAgent,
  messageInput,
  setMessageInput,
  handleSendMessage,
  handleKeyDown,
  handleConfirmCreate,
  handleViewTicket,
  handleClose,
  messagesEndRef,
}: AIAssistantModeProps) {
  const { messages, draft, showConfirmation, isCreated, createdTicket, isSending, isLoading, streamingText } = ticketAgent;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500 mb-4" />
        <p className="text-surface-600 dark:text-surface-400">Starting AI assistant...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[500px]">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-primary-500 text-white rounded-br-md'
                  : 'bg-surface-100 dark:bg-surface-800 text-surface-900 dark:text-white rounded-bl-md'
              }`}
            >
              {msg.role === 'assistant' ? (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-sm">{msg.content}</p>
              )}
            </div>
          </div>
        ))}

        {/* Streaming text */}
        {streamingText && (
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-2xl px-4 py-3 bg-surface-100 dark:bg-surface-800 text-surface-900 dark:text-white rounded-bl-md">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown>{streamingText}</ReactMarkdown>
              </div>
            </div>
          </div>
        )}

        {/* Typing indicator */}
        {isSending && !streamingText && (
          <div className="flex justify-start">
            <div className="bg-surface-100 dark:bg-surface-800 rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-surface-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-surface-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-surface-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* SOP Badges */}
      {draft.sops && draft.sops.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-4 px-1">
          <span className="text-xs font-medium text-surface-500 dark:text-surface-400">
            <FileText className="h-3 w-3 inline mr-1" />
            Using SOPs:
          </span>
          {draft.sops.map((sop) => (
            <Badge key={sop.id} variant="secondary" size="sm" className="bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
              {sop.name}
            </Badge>
          ))}
        </div>
      )}

      {/* Preview Card */}
      {showConfirmation && draft.title && !isCreated && (
        <div className="mb-4 p-4 border border-primary-200 dark:border-primary-800 rounded-xl bg-primary-50/50 dark:bg-primary-900/20">
          <div className="flex items-center gap-2 text-primary-700 dark:text-primary-300 mb-3">
            <Sparkles className="h-4 w-4" />
            <span className="font-semibold text-sm">Ticket Preview</span>
          </div>
          
          <h3 className="font-semibold text-surface-900 dark:text-white mb-2">{draft.title}</h3>
          
          {draft.description && (
            <p className="text-sm text-surface-600 dark:text-surface-400 mb-3 line-clamp-2">
              {draft.description}
            </p>
          )}
          
          <div className="flex flex-wrap gap-3 text-xs">
            {draft.type && (
              <span className="flex items-center gap-1 text-surface-600 dark:text-surface-400">
                <Tag className="h-3 w-3" />
                {draft.type}
              </span>
            )}
            {draft.priority && (
              <Badge size="sm" className={`priority-${draft.priority}`}>
                {draft.priority}
              </Badge>
            )}
            {draft.assigneeName && (
              <span className="flex items-center gap-1 text-surface-600 dark:text-surface-400">
                <User className="h-3 w-3" />
                {draft.assigneeName}
              </span>
            )}
            {draft.projectName && (
              <span className="flex items-center gap-1 text-surface-600 dark:text-surface-400">
                <FileText className="h-3 w-3" />
                {draft.projectName}
              </span>
            )}
            {draft.dueDate && (
              <span className="flex items-center gap-1 text-surface-600 dark:text-surface-400">
                <Calendar className="h-3 w-3" />
                {new Date(draft.dueDate).toLocaleDateString()}
              </span>
            )}
          </div>

          <div className="flex gap-2 mt-4">
            <Button onClick={handleConfirmCreate} disabled={isSending} className="flex-1">
              <CheckCircle className="h-4 w-4 mr-2" />
              Create Ticket
            </Button>
          </div>
        </div>
      )}

      {/* Success State */}
      {isCreated && createdTicket && (
        <div className="mb-4 p-4 border border-success-200 dark:border-success-800 rounded-xl bg-success-50 dark:bg-success-900/20">
          <div className="flex items-center gap-2 text-success-700 dark:text-success-300 mb-3">
            <CheckCircle className="h-5 w-5" />
            <span className="font-semibold">Ticket Created!</span>
          </div>
          
          <p className="text-sm text-surface-600 dark:text-surface-400 mb-3">
            <span className="font-mono font-medium">{createdTicket.ticketNumber}</span>: {createdTicket.title}
          </p>
          
          <div className="flex gap-2">
            <Button onClick={handleViewTicket} variant="default" className="flex-1">
              <ExternalLink className="h-4 w-4 mr-2" />
              View Ticket
            </Button>
            <Button onClick={handleClose} variant="outline">
              Close
            </Button>
          </div>
        </div>
      )}

      {/* Input Area */}
      {!isCreated && (
        <div className="flex gap-2">
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe the ticket you want to create..."
            disabled={isSending}
            className="flex-1 px-4 py-3 rounded-xl border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!messageInput.trim() || isSending}
            className="px-4"
          >
            {isSending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

// Manual Form Mode Component
interface ManualFormModeProps {
  register: any;
  handleSubmit: any;
  onSubmit: (data: CreateTicketForm) => void;
  watch: any;
  setValue: any;
  errors: any;
  clients: any[];
  clientsLoading: boolean;
  projectOptions: any[];
  projectsLoading: boolean;
  selectedProject: string | null;
  setSelectedProject: (value: string | null) => void;
  tags: string[];
  tagInput: string;
  setTagInput: (value: string) => void;
  handleAddTag: () => void;
  handleRemoveTag: (tag: string) => void;
  selectedColor: string | undefined;
  setSelectedColor: (value: string | undefined) => void;
  canGenerateAI: boolean;
  handleGenerateAI: () => void;
  isGeneratingTicket: boolean;
  aiGenerated: any;
  selectedTasks: any[];
  handleToggleTask: (index: number) => void;
  isCreating: boolean;
  handleClose: () => void;
}

function ManualFormMode({
  register,
  handleSubmit,
  onSubmit,
  watch,
  setValue,
  errors,
  clients,
  clientsLoading,
  projectOptions,
  projectsLoading,
  selectedProject,
  setSelectedProject,
  tags,
  tagInput,
  setTagInput,
  handleAddTag,
  handleRemoveTag,
  selectedColor,
  setSelectedColor,
  canGenerateAI,
  handleGenerateAI,
  isGeneratingTicket,
  aiGenerated,
  selectedTasks,
  handleToggleTask,
  isCreating,
  handleClose,
}: ManualFormModeProps) {
  return (
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
        <div className="space-y-4 border border-primary-200 [data-theme='dark']:border-primary-800 rounded-xl p-4 bg-primary-50/50 [data-theme='dark']:bg-primary-900/20">
          <div className="flex items-center gap-2 text-primary-700 [data-theme='dark']:text-primary-300">
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
  );
}
