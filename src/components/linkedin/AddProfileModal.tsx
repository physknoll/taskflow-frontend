'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AddLinkedInProfileDto, LinkedInProfileType, LinkedInPriority } from '@/types';
import { cn } from '@/lib/utils';
import { useClients } from '@/hooks/useClients';
import {
  User,
  Building2,
  Hash,
  Target,
  Briefcase,
  Users,
  Clock,
  Tag,
  Plus,
  X,
} from 'lucide-react';

const profileSchema = z.object({
  url: z.string().url('Please enter a valid LinkedIn URL'),
  displayName: z.string().optional(),
  headline: z.string().optional(),
  profileType: z.enum(['own', 'competitor', 'industry', 'prospect']),
  clientId: z.string().optional(),
  intervalMinutes: z.number().min(15, 'Minimum interval is 15 minutes').default(30),
  priority: z.enum(['low', 'normal', 'high']).default('normal'),
  scrapeImmediately: z.boolean().default(true),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface AddProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AddLinkedInProfileDto) => Promise<void>;
  isSubmitting?: boolean;
}

const profileTypes: { value: LinkedInProfileType; label: string; icon: typeof User; description: string }[] = [
  { value: 'own', label: 'Own Profile', icon: User, description: 'Your organization\'s profiles' },
  { value: 'competitor', label: 'Competitor', icon: Target, description: 'Competitor profiles to monitor' },
  { value: 'industry', label: 'Industry', icon: Briefcase, description: 'Industry leaders & influencers' },
  { value: 'prospect', label: 'Prospect', icon: Users, description: 'Potential clients or partners' },
];

const priorities: { value: LinkedInPriority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' },
];

export function AddProfileModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}: AddProfileModalProps) {
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const { clients } = useClients();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      profileType: 'competitor',
      intervalMinutes: 30,
      priority: 'normal',
      scrapeImmediately: true,
    },
  });

  const selectedType = watch('profileType');

  const handleAddTag = () => {
    const trimmed = tagInput.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleClose = () => {
    reset();
    setTags([]);
    setTagInput('');
    onClose();
  };

  const onFormSubmit = async (data: ProfileFormData) => {
    await onSubmit({
      ...data,
      tags,
      activityTypes: ['posts', 'comments', 'reposts', 'articles'],
    });
    handleClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add LinkedIn Profile" size="lg">
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        {/* URL */}
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
            LinkedIn URL *
          </label>
          <Input
            {...register('url')}
            placeholder="https://linkedin.com/in/username or https://linkedin.com/company/name"
            error={errors.url?.message}
          />
          <p className="mt-1 text-xs text-surface-500 dark:text-surface-400">
            Supports personal profiles and company pages
          </p>
        </div>

        {/* Profile Type */}
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
            Profile Type *
          </label>
          <div className="grid grid-cols-2 gap-3">
            {profileTypes.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setValue('profileType', type.value)}
                className={cn(
                  'flex items-start gap-3 p-4 rounded-lg border-2 text-left transition-colors',
                  selectedType === type.value
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-surface-200 dark:border-surface-700 hover:border-surface-300 dark:hover:border-surface-600'
                )}
              >
                <type.icon
                  className={cn(
                    'h-5 w-5 mt-0.5 flex-shrink-0',
                    selectedType === type.value
                      ? 'text-primary-600 dark:text-primary-400'
                      : 'text-surface-400'
                  )}
                />
                <div>
                  <p className="font-medium text-surface-900 dark:text-white">{type.label}</p>
                  <p className="text-xs text-surface-500 dark:text-surface-400">
                    {type.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Display Name & Headline */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            {...register('displayName')}
            label="Display Name (optional)"
            placeholder="John Doe"
          />
          <Input
            {...register('headline')}
            label="Headline (optional)"
            placeholder="CEO at Company"
          />
        </div>

        {/* Client */}
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
            Associated Client (optional)
          </label>
          <select
            {...register('clientId')}
            className="w-full px-4 py-2 rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">No client</option>
            {clients.map((client) => (
              <option key={client._id} value={client._id}>
                {client.name}
              </option>
            ))}
          </select>
        </div>

        {/* Interval & Priority */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
              Scrape Interval
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
              <select
                {...register('intervalMinutes', { valueAsNumber: true })}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value={15}>Every 15 minutes</option>
                <option value={30}>Every 30 minutes</option>
                <option value={60}>Every hour</option>
                <option value={120}>Every 2 hours</option>
                <option value={360}>Every 6 hours</option>
                <option value={720}>Every 12 hours</option>
                <option value={1440}>Daily</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
              Priority
            </label>
            <select
              {...register('priority')}
              className="w-full px-4 py-2 rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {priorities.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
            Tags
          </label>
          <div className="flex gap-2 mb-2">
            <div className="relative flex-1">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Add a tag"
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <Button type="button" variant="outline" onClick={handleAddTag}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-surface-100 dark:bg-surface-700 rounded text-sm"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-error-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Scrape Immediately */}
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            {...register('scrapeImmediately')}
            className="w-4 h-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="text-sm text-surface-700 dark:text-surface-300">
            Start scraping immediately after adding
          </span>
        </label>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-surface-200 dark:border-surface-700">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Add Profile
          </Button>
        </div>
      </form>
    </Modal>
  );
}
