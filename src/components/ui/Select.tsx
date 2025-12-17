'use client';

import * as React from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
  /** When true, dropdown opens upward instead of downward */
  openUpward?: boolean;
}

export function Select({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  label,
  error,
  disabled,
  className,
  openUpward = false,
}: SelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    onChange?.(optionValue);
    setIsOpen(false);
  };

  return (
    <div className={cn('w-full', className)} ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={cn(
            'flex h-10 w-full items-center justify-between rounded-lg border px-4 py-2 text-sm transition-all duration-200',
            'bg-[var(--bg-secondary)] text-[var(--text-primary)]',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error
              ? 'border-error-500 focus:ring-error-500'
              : 'border-[var(--border-default)]',
            isOpen && 'ring-2 ring-primary-500 border-transparent'
          )}
        >
          <span className={cn(!selectedOption && 'text-[var(--text-muted)]')}>
            {selectedOption ? (
              <span className="flex items-center gap-2">
                {selectedOption.icon}
                {selectedOption.label}
              </span>
            ) : (
              placeholder
            )}
          </span>
          <ChevronDown
            className={cn(
              'h-4 w-4 text-[var(--text-muted)] transition-transform duration-200',
              isOpen && 'rotate-180'
            )}
          />
        </button>

        {isOpen && (
          <div className={cn(
            "absolute z-50 w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-primary)] shadow-lg animate-fade-in",
            openUpward ? "bottom-full mb-1" : "top-full mt-1"
          )}>
            <div className="max-h-60 overflow-auto py-1">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => !option.disabled && handleSelect(option.value)}
                  disabled={option.disabled}
                  className={cn(
                    'flex w-full items-center justify-between px-4 py-2 text-sm transition-colors',
                    'hover:bg-[var(--bg-tertiary)]',
                    option.disabled && 'opacity-50 cursor-not-allowed',
                    value === option.value && 'bg-primary-100 text-primary-700 [data-theme="dark"]:bg-primary-900/30 [data-theme="dark"]:text-primary-300'
                  )}
                >
                  <span className="flex items-center gap-2">
                    {option.icon}
                    {option.label}
                  </span>
                  {value === option.value && <Check className="h-4 w-4" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      {error && <p className="mt-1.5 text-sm text-error-500">{error}</p>}
    </div>
  );
}
