'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface CodeInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  onComplete?: (value: string) => void;
}

const CodeInput = React.forwardRef<HTMLDivElement, CodeInputProps>(
  (
    {
      length = 6,
      value,
      onChange,
      error,
      disabled = false,
      autoFocus = true,
      onComplete,
    },
    ref
  ) => {
    const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

    // Split value into array of characters
    const valueArray = value.split('').slice(0, length);

    // Focus first input on mount if autoFocus is true
    React.useEffect(() => {
      if (autoFocus && inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    }, [autoFocus]);

    // Handle complete callback
    React.useEffect(() => {
      if (value.length === length && onComplete) {
        onComplete(value);
      }
    }, [value, length, onComplete]);

    const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      
      // Only allow digits
      if (inputValue && !/^\d*$/.test(inputValue)) {
        return;
      }

      // Handle single digit input
      if (inputValue.length <= 1) {
        const newValue = valueArray.slice();
        newValue[index] = inputValue;
        onChange(newValue.join(''));

        // Auto-advance to next input
        if (inputValue && index < length - 1) {
          inputRefs.current[index + 1]?.focus();
        }
      }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      // Handle backspace
      if (e.key === 'Backspace') {
        e.preventDefault();
        const newValue = valueArray.slice();
        
        if (valueArray[index]) {
          // Clear current input
          newValue[index] = '';
          onChange(newValue.join(''));
        } else if (index > 0) {
          // Move to previous input and clear it
          newValue[index - 1] = '';
          onChange(newValue.join(''));
          inputRefs.current[index - 1]?.focus();
        }
      }

      // Handle left arrow
      if (e.key === 'ArrowLeft' && index > 0) {
        e.preventDefault();
        inputRefs.current[index - 1]?.focus();
      }

      // Handle right arrow
      if (e.key === 'ArrowRight' && index < length - 1) {
        e.preventDefault();
        inputRefs.current[index + 1]?.focus();
      }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const pastedData = e.clipboardData.getData('text');
      
      // Extract only digits
      const digits = pastedData.replace(/\D/g, '').slice(0, length);
      
      if (digits) {
        onChange(digits);
        
        // Focus the appropriate input
        const focusIndex = Math.min(digits.length, length - 1);
        inputRefs.current[focusIndex]?.focus();
      }
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      e.target.select();
    };

    return (
      <div ref={ref} className="w-full">
        <div className="flex gap-2 sm:gap-3 justify-center">
          {Array.from({ length }).map((_, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={1}
              value={valueArray[index] || ''}
              onChange={(e) => handleChange(index, e)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              onFocus={handleFocus}
              disabled={disabled}
              aria-label={`Digit ${index + 1} of ${length}`}
              className={cn(
                'w-10 h-12 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-semibold rounded-lg border-2 transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-surface-100',
                'dark:bg-surface-800 dark:text-white',
                error
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-surface-300 dark:border-surface-600',
                valueArray[index] && 'border-primary-500 dark:border-primary-400'
              )}
            />
          ))}
        </div>
        {error && (
          <p className="mt-3 text-sm text-red-600 dark:text-red-400 text-center">
            {error}
          </p>
        )}
      </div>
    );
  }
);

CodeInput.displayName = 'CodeInput';

export { CodeInput };

