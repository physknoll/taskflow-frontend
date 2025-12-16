'use client';

import * as React from 'react';
import { cn, getInitials } from '@/lib/utils';

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  firstName?: string;
  lastName?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showStatus?: boolean;
  status?: 'online' | 'offline' | 'busy' | 'away';
}

const sizeClasses = {
  xs: 'h-6 w-6 text-xs',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
};

const statusClasses = {
  online: 'bg-emerald-500',
  offline: 'bg-surface-400',
  busy: 'bg-red-500',
  away: 'bg-amber-500',
};

const statusSizes = {
  xs: 'h-1.5 w-1.5',
  sm: 'h-2 w-2',
  md: 'h-2.5 w-2.5',
  lg: 'h-3 w-3',
  xl: 'h-4 w-4',
};

export function Avatar({
  src,
  alt,
  firstName,
  lastName,
  size = 'md',
  showStatus,
  status = 'offline',
  className,
  ...props
}: AvatarProps) {
  const [imageError, setImageError] = React.useState(false);
  const initials = getInitials(firstName, lastName);

  // Generate a consistent background color based on initials
  const colors = [
    'bg-primary-500',
    'bg-accent-500',
    'bg-emerald-500',
    'bg-amber-500',
    'bg-violet-500',
    'bg-cyan-500',
    'bg-rose-500',
    'bg-indigo-500',
  ];

  const colorIndex = initials ? (initials.charCodeAt(0) + (initials.charCodeAt(1) || 0)) % colors.length : 0;
  const bgColor = colors[colorIndex];

  return (
    <div className={cn('relative inline-flex', className)} {...props}>
      <div
        className={cn(
          'rounded-full flex items-center justify-center font-medium text-white',
          sizeClasses[size],
          !src || imageError ? bgColor : ''
        )}
      >
        {src && !imageError ? (
          <img
            src={src}
            alt={alt || `${firstName} ${lastName}`}
            className="h-full w-full rounded-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <span>{initials || '?'}</span>
        )}
      </div>
      {showStatus && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full border-2 border-white dark:border-surface-800',
            statusClasses[status],
            statusSizes[size]
          )}
        />
      )}
    </div>
  );
}

interface AvatarGroupProps {
  avatars: Array<{
    src?: string;
    firstName?: string;
    lastName?: string;
  }>;
  max?: number;
  size?: AvatarProps['size'];
}

export function AvatarGroup({ avatars, max = 4, size = 'sm' }: AvatarGroupProps) {
  const displayed = avatars.slice(0, max);
  const remaining = avatars.length - max;

  return (
    <div className="flex -space-x-2">
      {displayed.map((avatar, index) => (
        <Avatar
          key={index}
          src={avatar.src}
          firstName={avatar.firstName}
          lastName={avatar.lastName}
          size={size}
          className="ring-2 ring-white dark:ring-surface-800"
        />
      ))}
      {remaining > 0 && (
        <div
          className={cn(
            'rounded-full flex items-center justify-center bg-surface-200 dark:bg-surface-700 text-surface-600 dark:text-surface-300 font-medium ring-2 ring-white dark:ring-surface-800',
            sizeClasses[size]
          )}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
}



