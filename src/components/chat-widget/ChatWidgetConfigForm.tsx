'use client';

import { useState, useEffect } from 'react';
import { Settings, Palette, Shield, MessageSquare, Circle, RectangleHorizontal, Plus, X } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Toggle } from '@/components/ui/Toggle';
import { ColorPicker } from '@/components/ui/ColorPicker';
import { TagInput } from '@/components/ui/TagInput';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  ChatWidgetConfigForm as ConfigFormType,
  ChatWidgetTheme,
  DEFAULT_WIDGET_CONFIG,
  DEFAULT_PILL_MESSAGES,
  WidgetButtonStyle,
} from '@/types/chat-widget';
import { cn } from '@/lib/utils';
import { useKBCategories } from '@/hooks/useClients';

interface ChatWidgetConfigFormProps {
  clientId: string;
  initialConfig?: Partial<ConfigFormType>;
  onConfigChange: (config: ConfigFormType) => void;
  onSave: () => void;
  isSaving: boolean;
  isNewWidget: boolean;
}

/**
 * Form for configuring the chat widget settings
 */
export function ChatWidgetConfigForm({
  clientId,
  initialConfig,
  onConfigChange,
  onSave,
  isSaving,
  isNewWidget,
}: ChatWidgetConfigFormProps) {
  const { data: categories = [] } = useKBCategories(clientId);

  const [config, setConfig] = useState<ConfigFormType>(() => ({
    ...DEFAULT_WIDGET_CONFIG,
    allowedCategories: [],
    ...initialConfig,
  }));

  // Update parent when config changes
  useEffect(() => {
    onConfigChange(config);
  }, [config, onConfigChange]);

  // Sync with initialConfig when it changes (e.g., after fetch)
  useEffect(() => {
    if (initialConfig) {
      setConfig((prev) => ({
        ...prev,
        ...initialConfig,
      }));
    }
  }, [initialConfig]);

  const updateConfig = <K extends keyof ConfigFormType>(
    key: K,
    value: ConfigFormType[K]
  ) => {
    setConfig((prev: ConfigFormType) => ({ ...prev, [key]: value }));
  };

  const updateTheme = <K extends keyof ChatWidgetTheme>(
    key: K,
    value: ChatWidgetTheme[K]
  ) => {
    setConfig((prev: ConfigFormType) => ({
      ...prev,
      theme: { ...prev.theme, [key]: value },
    }));
  };

  const handleButtonStyleChange = (style: WidgetButtonStyle) => {
    setConfig((prev: ConfigFormType) => ({
      ...prev,
      theme: {
        ...prev.theme,
        buttonStyle: style,
        // Reset to default messages when switching to pill if empty
        pillMessages: style === 'pill' && (!prev.theme.pillMessages || prev.theme.pillMessages.length === 0)
          ? DEFAULT_PILL_MESSAGES
          : prev.theme.pillMessages,
      },
    }));
  };

  const addPillMessage = () => {
    if (config.theme.pillMessages.length >= 10) return;
    updateTheme('pillMessages', [...config.theme.pillMessages, '']);
  };

  const removePillMessage = (index: number) => {
    const updated = config.theme.pillMessages.filter((_, i) => i !== index);
    updateTheme('pillMessages', updated.length > 0 ? updated : ['']);
  };

  const updatePillMessage = (index: number, value: string) => {
    const updated = [...config.theme.pillMessages];
    updated[index] = value.slice(0, 50); // Max 50 chars
    updateTheme('pillMessages', updated);
  };

  const toggleCategory = (category: string) => {
    setConfig((prev: ConfigFormType) => {
      const current = prev.allowedCategories;
      const updated = current.includes(category)
        ? current.filter((c: string) => c !== category)
        : [...current, category];
      return { ...prev, allowedCategories: updated };
    });
  };

  return (
    <div className="space-y-6">
      {/* Enable/Disable Toggle */}
      <Card className="p-4">
        <Toggle
          checked={config.isActive}
          onChange={(checked) => updateConfig('isActive', checked)}
          label="Enable Chat Widget"
          description="When enabled, the widget will appear on websites using your embed code"
        />
      </Card>

      {/* Customization */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="h-5 w-5 text-primary-500" />
          <h3 className="font-semibold text-surface-900 dark:text-white">
            Customization
          </h3>
        </div>

        <div className="space-y-4">
          <Input
            label="Bot Name"
            value={config.botName}
            onChange={(e) => updateConfig('botName', e.target.value)}
            placeholder="Assistant"
            maxLength={50}
          />

          <Input
            label="Greeting Message"
            value={config.greeting}
            onChange={(e) => updateConfig('greeting', e.target.value)}
            placeholder="Hi there! How can I help you today?"
            maxLength={500}
          />

          <Input
            label="Input Placeholder"
            value={config.placeholderText}
            onChange={(e) => updateConfig('placeholderText', e.target.value)}
            placeholder="Type your message..."
            maxLength={100}
          />

          <Input
            label="Bot Avatar URL (optional)"
            value={config.botAvatarUrl || ''}
            onChange={(e) => updateConfig('botAvatarUrl', e.target.value || undefined)}
            placeholder="https://example.com/avatar.png"
            type="url"
          />
        </div>
      </Card>

      {/* Knowledge Base Categories */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="h-5 w-5 text-primary-500" />
          <h3 className="font-semibold text-surface-900 dark:text-white">
            Knowledge Base Filter
          </h3>
        </div>

        <p className="text-sm text-surface-500 mb-3">
          {config.allowedCategories.length === 0
            ? 'All categories are included. Select specific categories to limit the knowledge base.'
            : `Widget will only use documents from selected categories.`}
        </p>

        {categories.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const isSelected = config.allowedCategories.includes(category);
              return (
                <Badge
                  key={category}
                  variant={isSelected ? 'primary' : 'secondary'}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? ''
                      : 'hover:bg-surface-200 dark:hover:bg-surface-600'
                  }`}
                  onClick={() => toggleCategory(category)}
                >
                  {category}
                </Badge>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-surface-400">
            No categories found. Add documents to the knowledge base first.
          </p>
        )}
      </Card>

      {/* Theme */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Palette className="h-5 w-5 text-primary-500" />
          <h3 className="font-semibold text-surface-900 dark:text-white">
            Theme
          </h3>
        </div>

        <div className="space-y-4">
          <ColorPicker
            label="Primary Color"
            value={config.theme.primaryColor}
            onChange={(color) => updateTheme('primaryColor', color)}
          />

          <Select
            label="Position"
            value={config.theme.position}
            onChange={(value) =>
              updateTheme('position', value as 'bottom-right' | 'bottom-left')
            }
            options={[
              { value: 'bottom-right', label: 'Bottom Right' },
              { value: 'bottom-left', label: 'Bottom Left' },
            ]}
          />

          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
              Button Size: {config.theme.buttonSize}px
            </label>
            <input
              type="range"
              min={40}
              max={80}
              value={config.theme.buttonSize}
              onChange={(e) => updateTheme('buttonSize', Number(e.target.value))}
              className="w-full accent-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
              Border Radius: {config.theme.borderRadius}px
            </label>
            <input
              type="range"
              min={0}
              max={24}
              value={config.theme.borderRadius}
              onChange={(e) => updateTheme('borderRadius', Number(e.target.value))}
              className="w-full accent-primary-500"
            />
          </div>

          {/* Button Style Selector */}
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
              Button Style
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleButtonStyleChange('circle')}
                className={cn(
                  'p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2',
                  config.theme.buttonStyle === 'circle'
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-surface-200 dark:border-surface-700 hover:border-surface-300 dark:hover:border-surface-600'
                )}
              >
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: config.theme.primaryColor }}
                >
                  <Circle className="h-5 w-5 text-white" />
                </div>
                <span className="text-sm font-medium text-surface-700 dark:text-surface-300">
                  Circle
                </span>
                <span className="text-xs text-surface-500">
                  Classic round button
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleButtonStyleChange('pill')}
                className={cn(
                  'p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2',
                  config.theme.buttonStyle === 'pill'
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-surface-200 dark:border-surface-700 hover:border-surface-300 dark:hover:border-surface-600'
                )}
              >
                <div 
                  className="h-10 px-4 rounded-full flex items-center gap-2"
                  style={{ backgroundColor: config.theme.primaryColor }}
                >
                  <RectangleHorizontal className="h-4 w-4 text-white" />
                  <span className="text-white text-sm font-medium">Help</span>
                </div>
                <span className="text-sm font-medium text-surface-700 dark:text-surface-300">
                  Pill
                </span>
                <span className="text-xs text-surface-500">
                  Animated with messages
                </span>
              </button>
            </div>
          </div>

          {/* Pill Messages (only shown when pill style is selected) */}
          {config.theme.buttonStyle === 'pill' && (
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                Pill Messages
              </label>
              <p className="text-xs text-surface-500 mb-3">
                These messages will type out one by one in the button. Max 10 messages, 50 characters each.
              </p>
              
              <div className="space-y-2">
                {config.theme.pillMessages.map((message, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={message}
                      onChange={(e) => updatePillMessage(index, e.target.value)}
                      placeholder={`Message ${index + 1}`}
                      maxLength={50}
                      className="flex-1"
                    />
                    <span className="text-xs text-surface-400 w-10 text-right">
                      {message.length}/50
                    </span>
                    {config.theme.pillMessages.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removePillMessage(index)}
                        className="text-surface-400 hover:text-red-500"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {config.theme.pillMessages.length < 10 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={addPillMessage}
                  className="mt-2"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Message
                </Button>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Security */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-5 w-5 text-primary-500" />
          <h3 className="font-semibold text-surface-900 dark:text-white">
            Allowed Domains
          </h3>
        </div>

        <p className="text-sm text-surface-500 mb-3">
          {config.allowedDomains.length === 0
            ? 'Widget will work on any domain. Add domains to restrict access.'
            : 'Widget will only work on these domains.'}
        </p>

        <TagInput
          tags={config.allowedDomains}
          onChange={(domains) => updateConfig('allowedDomains', domains)}
          placeholder="example.com, *.mysite.com"
        />

        <p className="text-xs text-surface-400 mt-2">
          Use * for wildcards (e.g., *.example.com matches all subdomains)
        </p>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={onSave} disabled={isSaving}>
          {isSaving
            ? 'Saving...'
            : isNewWidget
            ? 'Create Widget'
            : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}
