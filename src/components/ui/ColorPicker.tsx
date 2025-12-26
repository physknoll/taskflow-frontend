'use client';

import { cn } from '@/lib/utils';

const PRESET_COLORS = [
  '#EF4444', // Red
  '#F59E0B', // Orange
  '#EAB308', // Yellow
  '#10B981', // Green
  '#3B82F6', // Blue
  '#6366F1', // Indigo
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#6B7280', // Gray
];

interface ColorPickerProps {
  value?: string;
  onChange: (color: string) => void;
  label?: string;
  className?: string;
}

/**
 * Color picker component with preset colors and custom color input.
 */
export function ColorPicker({ value, onChange, label, className }: ColorPickerProps) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
          {label}
        </label>
      )}
      <div className="flex flex-wrap items-center gap-2">
        {PRESET_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onChange(color)}
            className={cn(
              'w-8 h-8 rounded-full transition-all border-2',
              value === color
                ? 'ring-2 ring-offset-2 ring-primary-500 border-white dark:border-surface-800'
                : 'border-transparent hover:scale-110'
            )}
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
        {/* Custom color input */}
        <div className="relative">
          <input
            type="color"
            value={value || '#6366F1'}
            onChange={(e) => onChange(e.target.value)}
            className="w-8 h-8 rounded-full cursor-pointer border-2 border-surface-300 dark:border-surface-600 overflow-hidden"
            title="Custom color"
          />
        </div>
      </div>
    </div>
  );
}

export { PRESET_COLORS };



