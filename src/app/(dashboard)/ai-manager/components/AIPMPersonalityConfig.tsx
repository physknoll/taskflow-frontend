'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Textarea } from '@/components/ui/Input';
import { IAIPMConfig, UpdateAIPMConfigDto, PersonalityMode } from '@/types/aipm';
import { cn } from '@/lib/utils';
import {
  Brain,
  Heart,
  Scale,
  Target,
  Sparkles,
  MessageSquare,
} from 'lucide-react';

interface PersonalityOption {
  id: PersonalityMode;
  name: string;
  emoji: string;
  icon: typeof Heart;
  description: string;
  traits: string[];
  color: string;
  gradient: string;
}

const PERSONALITY_OPTIONS: PersonalityOption[] = [
  {
    id: 'supportive',
    name: 'Supportive',
    emoji: '🤗',
    icon: Heart,
    description: 'Encouraging and empathetic',
    traits: [
      'Celebrates progress and wins',
      'Acknowledges challenges with empathy',
      'Focuses on positive reinforcement',
      'Less pressure on deadlines',
    ],
    color: 'emerald',
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    id: 'balanced',
    name: 'Balanced',
    emoji: '⚖️',
    icon: Scale,
    description: 'Professional and friendly',
    traits: [
      'Mix of encouragement and accountability',
      'Clear but friendly communication',
      'Balanced focus on progress and deadlines',
      'Constructive feedback approach',
    ],
    color: 'primary',
    gradient: 'from-primary-500 to-accent-500',
  },
  {
    id: 'deadline_focused',
    name: 'Deadline Focused',
    emoji: '🎯',
    icon: Target,
    description: 'Results-oriented and direct',
    traits: [
      'Prioritizes deadline awareness',
      'Direct and efficient communication',
      'Focuses on blockers and solutions',
      'Clear accountability expectations',
    ],
    color: 'amber',
    gradient: 'from-amber-500 to-orange-500',
  },
];

interface AIPMPersonalityConfigProps {
  config: IAIPMConfig;
  updateConfig: (updates: UpdateAIPMConfigDto) => Promise<IAIPMConfig>;
  isUpdating: boolean;
  disabled?: boolean;
}

export default function AIPMPersonalityConfig({
  config,
  updateConfig,
  isUpdating,
  disabled,
}: AIPMPersonalityConfigProps) {
  const { personalityMode, customInstructions } = config;

  const handlePersonalityChange = (mode: PersonalityMode) => {
    if (disabled || isUpdating) return;
    updateConfig({ personalityMode: mode });
  };

  const handleCustomInstructionsChange = (instructions: string) => {
    updateConfig({ customInstructions: instructions });
  };

  return (
    <div className="space-y-6">
      {/* Personality Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary-500" />
            AI Personality Mode
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-surface-600 dark:text-surface-400 mb-6">
            Choose how the AI Project Manager communicates with your team. This affects tone, 
            emphasis, and overall communication style during check-ins.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PERSONALITY_OPTIONS.map((option) => {
              const isSelected = personalityMode === option.id;
              const Icon = option.icon;

              return (
                <button
                  key={option.id}
                  onClick={() => handlePersonalityChange(option.id)}
                  disabled={disabled || isUpdating}
                  className={cn(
                    'relative p-6 rounded-2xl border-2 text-left transition-all duration-300',
                    isSelected
                      ? 'border-transparent shadow-xl'
                      : 'border-surface-200 dark:border-surface-700 hover:border-surface-300 dark:hover:border-surface-600',
                    (disabled || isUpdating) && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  {/* Selected gradient background */}
                  {isSelected && (
                    <div className={cn(
                      'absolute inset-0 rounded-2xl bg-gradient-to-br opacity-10',
                      option.gradient
                    )} />
                  )}

                  {/* Content */}
                  <div className="relative z-10">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className={cn(
                        'p-2.5 rounded-xl transition-all',
                        isSelected
                          ? `bg-gradient-to-br ${option.gradient} shadow-lg`
                          : 'bg-surface-100 dark:bg-surface-800'
                      )}>
                        <Icon className={cn(
                          'h-5 w-5',
                          isSelected ? 'text-white' : 'text-surface-500'
                        )} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{option.emoji}</span>
                          <h3 className={cn(
                            'font-semibold',
                            isSelected 
                              ? 'text-surface-900 dark:text-white' 
                              : 'text-surface-700 dark:text-surface-300'
                          )}>
                            {option.name}
                          </h3>
                        </div>
                        <p className="text-sm text-surface-500 dark:text-surface-400">
                          {option.description}
                        </p>
                      </div>
                    </div>

                    {/* Traits */}
                    <ul className="space-y-2">
                      {option.traits.map((trait, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-sm text-surface-600 dark:text-surface-400"
                        >
                          <span className={cn(
                            'w-1.5 h-1.5 rounded-full mt-1.5 shrink-0',
                            isSelected 
                              ? `bg-${option.color}-500` 
                              : 'bg-surface-300 dark:bg-surface-600'
                          )} />
                          {trait}
                        </li>
                      ))}
                    </ul>

                    {/* Selected indicator */}
                    {isSelected && (
                      <div className={cn(
                        'absolute top-4 right-4 w-6 h-6 rounded-full flex items-center justify-center',
                        `bg-gradient-to-br ${option.gradient}`
                      )}>
                        <Sparkles className="h-3.5 w-3.5 text-white" />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Custom Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-accent-500" />
            Custom Instructions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-surface-600 dark:text-surface-400 mb-4">
            Add additional instructions for the AI to follow during check-ins. These will be 
            combined with the personality mode you selected.
          </p>

          <Textarea
            value={customInstructions || ''}
            onChange={(e) => handleCustomInstructionsChange(e.target.value)}
            placeholder="e.g., Always ask about client feedback. Remind team about Friday standups. Focus on blockers for the product team..."
            rows={4}
            maxLength={2000}
            disabled={disabled}
            className="resize-none"
          />

          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-surface-500">
              These instructions are appended to the AI's base personality.
            </p>
            <p className="text-xs text-surface-500">
              {customInstructions?.length || 0} / 2000
            </p>
          </div>

          {/* Example prompts */}
          <div className="mt-4 p-4 rounded-xl bg-surface-50 dark:bg-surface-900/50">
            <p className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
              Example instructions:
            </p>
            <ul className="text-sm text-surface-500 dark:text-surface-400 space-y-1">
              <li>• "Always ask about any blockers that need escalation"</li>
              <li>• "Remind the design team about asset delivery deadlines"</li>
              <li>• "Be extra encouraging with new team members"</li>
              <li>• "Focus on code review status for engineering tasks"</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

