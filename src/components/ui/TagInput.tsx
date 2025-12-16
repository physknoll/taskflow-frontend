'use client';

import { useState, KeyboardEvent } from 'react';
import { X, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  inheritedTags?: string[];  // Read-only tags from project (displayed but not editable)
  placeholder?: string;
  disabled?: boolean;
  label?: string;
  className?: string;
}

/**
 * Tag input component with support for inherited (read-only) tags.
 * - Enter key adds a new tag
 * - Tags are normalized to lowercase
 * - Duplicate tags are prevented
 * - Inherited tags are shown in gray and cannot be removed
 */
export function TagInput({
  tags,
  onChange,
  inheritedTags = [],
  placeholder = 'Add a tag...',
  disabled = false,
  label,
  className,
}: TagInputProps) {
  const [input, setInput] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && input.trim()) {
      e.preventDefault();
      const newTag = input.trim().toLowerCase();
      
      // Don't add if it already exists in own tags or inherited tags
      if (!tags.includes(newTag) && !inheritedTags.includes(newTag)) {
        onChange([...tags, newTag]);
      }
      setInput('');
    } else if (e.key === 'Backspace' && !input && tags.length > 0) {
      // Remove last tag on backspace if input is empty
      onChange(tags.slice(0, -1));
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
          {label}
        </label>
      )}
      
      <div
        className={cn(
          'flex flex-wrap items-center gap-2 p-2 min-h-[42px] rounded-lg border transition-colors',
          'border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800',
          'focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent',
          disabled && 'opacity-50 cursor-not-allowed bg-surface-50 dark:bg-surface-900'
        )}
      >
        {/* Own tags (editable) */}
        {tags.map((tag) => (
          <span
            key={`own-${tag}`}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300"
          >
            {tag}
            {!disabled && (
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="hover:text-primary-900 dark:hover:text-primary-100 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </span>
        ))}

        {/* Input field */}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? placeholder : ''}
          disabled={disabled}
          className={cn(
            'flex-1 min-w-[100px] bg-transparent text-sm text-surface-900 dark:text-white',
            'placeholder:text-surface-400 dark:placeholder:text-surface-500',
            'focus:outline-none disabled:cursor-not-allowed'
          )}
        />
      </div>

      {/* Inherited tags (read-only) */}
      {inheritedTags.length > 0 && (
        <div className="mt-2">
          <span className="text-xs text-surface-500 dark:text-surface-400 flex items-center gap-1">
            <Tag className="h-3 w-3" />
            Inherited from project:
          </span>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {inheritedTags.map((tag) => (
              <span
                key={`inherited-${tag}`}
                className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-400"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

