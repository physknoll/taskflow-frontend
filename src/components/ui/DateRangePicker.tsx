'use client';

import * as React from 'react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from './Button';
import { Calendar, ChevronDown } from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth, subMonths } from 'date-fns';

interface DateRange {
  start: Date;
  end: Date;
}

interface Preset {
  label: string;
  value: string;
  getRange: () => DateRange;
}

const presets: Preset[] = [
  {
    label: 'Today',
    value: 'today',
    getRange: () => {
      const today = new Date();
      return { start: today, end: today };
    },
  },
  {
    label: 'Yesterday',
    value: 'yesterday',
    getRange: () => {
      const yesterday = subDays(new Date(), 1);
      return { start: yesterday, end: yesterday };
    },
  },
  {
    label: 'Last 7 days',
    value: '7d',
    getRange: () => ({
      start: subDays(new Date(), 7),
      end: new Date(),
    }),
  },
  {
    label: 'Last 30 days',
    value: '30d',
    getRange: () => ({
      start: subDays(new Date(), 30),
      end: new Date(),
    }),
  },
  {
    label: 'This month',
    value: 'this_month',
    getRange: () => ({
      start: startOfMonth(new Date()),
      end: new Date(),
    }),
  },
  {
    label: 'Last month',
    value: 'last_month',
    getRange: () => {
      const lastMonth = subMonths(new Date(), 1);
      return {
        start: startOfMonth(lastMonth),
        end: endOfMonth(lastMonth),
      };
    },
  },
  {
    label: 'Last 3 months',
    value: '90d',
    getRange: () => ({
      start: subDays(new Date(), 90),
      end: new Date(),
    }),
  },
];

interface DateRangePickerProps {
  value?: string;
  onChange?: (value: string, range: DateRange) => void;
  className?: string;
}

export function DateRangePicker({
  value = '30d',
  onChange,
  className,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const selectedPreset = presets.find((p) => p.value === value) || presets[3];

  const handleSelect = (preset: Preset) => {
    onChange?.(preset.value, preset.getRange());
    setIsOpen(false);
  };

  return (
    <div className={cn('relative', className)}>
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="justify-between w-full"
      >
        <span className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          {selectedPreset.label}
        </span>
        <ChevronDown className={cn('w-4 h-4 transition-transform', isOpen && 'rotate-180')} />
      </Button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute top-full left-0 mt-2 w-full bg-[var(--bg-primary)] rounded-lg shadow-lg border border-[var(--border-default)] z-50 py-2">
            {presets.map((preset) => (
              <button
                key={preset.value}
                onClick={() => handleSelect(preset)}
                className={cn(
                  'w-full px-4 py-2 text-left text-sm transition-colors',
                  preset.value === value
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                    : 'text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
                )}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
