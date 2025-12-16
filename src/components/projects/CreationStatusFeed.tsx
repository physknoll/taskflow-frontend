'use client';

import { useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { CreationStatusMessage } from '@/hooks/useProjectAgent';
import {
  CheckCircle2,
  Loader2,
  AlertCircle,
  Info,
  Sparkles,
} from 'lucide-react';

interface CreationStatusFeedProps {
  messages: CreationStatusMessage[];
}

function formatTime(timestamp: string): string {
  try {
    return format(new Date(timestamp), 'h:mm:ss a');
  } catch {
    return '';
  }
}

function StatusIcon({ type }: { type: CreationStatusMessage['type'] }) {
  switch (type) {
    case 'success':
      return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />;
    case 'error':
      return <AlertCircle className="w-3.5 h-3.5 text-red-500" />;
    case 'progress':
      return <Loader2 className="w-3.5 h-3.5 text-primary-500 animate-spin" />;
    case 'info':
    default:
      return <Sparkles className="w-3.5 h-3.5 text-amber-500" />;
  }
}

function StatusPill({ message }: { message: CreationStatusMessage }) {
  const bgColors: Record<CreationStatusMessage['type'], string> = {
    info: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
    success: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
    error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    progress: 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800',
  };

  return (
    <div
      className={`flex items-start gap-2 px-3 py-2 rounded-lg border ${bgColors[message.type]} animate-in fade-in slide-in-from-bottom-2 duration-300`}
    >
      <div className="flex-shrink-0 mt-0.5">
        <StatusIcon type={message.type} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-surface-700 dark:text-surface-300 break-words">
          {message.message}
        </p>
        {message.progress && (
          <div className="mt-1.5">
            <div className="h-1.5 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-500 rounded-full transition-all duration-300"
                style={{
                  width: `${(message.progress.current / message.progress.total) * 100}%`,
                }}
              />
            </div>
            <p className="text-xs text-surface-500 mt-0.5">
              {message.progress.current} of {message.progress.total}
            </p>
          </div>
        )}
      </div>
      <span className="flex-shrink-0 text-xs text-surface-400 dark:text-surface-500 whitespace-nowrap">
        {formatTime(message.timestamp)}
      </span>
    </div>
  );
}

export function CreationStatusFeed({ messages }: CreationStatusFeedProps) {
  const endRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2 py-2">
      <div className="flex items-center gap-2 px-1">
        <div className="flex-1 h-px bg-surface-200 dark:bg-surface-700" />
        <span className="text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">
          Creation Progress
        </span>
        <div className="flex-1 h-px bg-surface-200 dark:bg-surface-700" />
      </div>
      <div className="space-y-1.5">
        {messages.map((msg) => (
          <StatusPill key={msg.id} message={msg} />
        ))}
      </div>
      <div ref={endRef} />
    </div>
  );
}

