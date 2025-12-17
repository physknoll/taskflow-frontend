'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { className, type, label, error, helperText, leftIcon, rightIcon, id, ...props },
    ref
  ) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-[var(--text-primary)] mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
              {leftIcon}
            </div>
          )}
          <input
            type={type}
            id={inputId}
            className={cn(
              'flex h-10 w-full rounded-lg border px-4 py-2 text-sm transition-all duration-200',
              'bg-[var(--bg-tertiary)] text-[var(--text-primary)]',
              'placeholder:text-[var(--text-muted)]',
              'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
              'disabled:cursor-not-allowed disabled:opacity-50',
              error
                ? 'border-error-500 focus:ring-error-500'
                : 'border-[var(--border-default)]',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              className
            )}
            ref={ref}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="mt-1.5 text-sm text-error-500">{error}</p>}
        {helperText && !error && (
          <p className="mt-1.5 text-sm text-[var(--text-muted)]">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const generatedId = React.useId();
    const textareaId = id || generatedId;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-[var(--text-primary)] mb-1.5"
          >
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          className={cn(
            'flex min-h-[100px] w-full rounded-lg border px-4 py-3 text-sm transition-all duration-200',
            'bg-[var(--bg-tertiary)] text-[var(--text-primary)]',
            'placeholder:text-[var(--text-muted)] resize-none',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error
              ? 'border-error-500 focus:ring-error-500'
              : 'border-[var(--border-default)]',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="mt-1.5 text-sm text-error-500">{error}</p>}
        {helperText && !error && (
          <p className="mt-1.5 text-sm text-[var(--text-muted)]">{helperText}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export { Input, Textarea };
