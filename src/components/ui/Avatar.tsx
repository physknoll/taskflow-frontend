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
  online: 'bg-success-500',
  offline: 'bg-surface-400',
  busy: 'bg-error-500',
  away: 'bg-warning-500',
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

  // Use orange gradient for avatar fallback
  const colors = [
    'bg-gradient-to-br from-primary-400 to-primary-600',
    'bg-gradient-to-br from-success-400 to-success-600',
    'bg-gradient-to-br from-warning-400 to-warning-600',
    'bg-gradient-to-br from-info-400 to-info-600',
    'bg-gradient-to-br from-error-400 to-error-600',
    'bg-gradient-to-br from-violet-400 to-violet-600',
    'bg-gradient-to-br from-cyan-400 to-cyan-600',
    'bg-gradient-to-br from-rose-400 to-rose-600',
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
            'absolute bottom-0 right-0 rounded-full border-2 border-[var(--bg-primary)]',
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
          className="ring-2 ring-[var(--bg-primary)]"
        />
      ))}
      {remaining > 0 && (
        <div
          className={cn(
            'rounded-full flex items-center justify-center bg-[var(--bg-tertiary)] text-[var(--text-secondary)] font-medium ring-2 ring-[var(--bg-primary)]',
            sizeClasses[size]
          )}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
}
