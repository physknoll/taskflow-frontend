'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface DropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: 'left' | 'right';
  className?: string;
}

export function Dropdown({ trigger, children, align = 'right', className }: DropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>
      {isOpen && (
        <div
          className={cn(
            'absolute z-50 mt-2 min-w-[200px] rounded-lg border border-[var(--border-default)] bg-[var(--bg-primary)] py-1 shadow-lg animate-fade-in',
            align === 'right' ? 'right-0' : 'left-0',
            className
          )}
        >
          {React.Children.map(children, (child) => {
            if (React.isValidElement(child)) {
              return React.cloneElement(child as React.ReactElement<{ onClick?: () => void }>, {
                onClick: () => {
                  (child.props as any).onClick?.();
                  setIsOpen(false);
                },
              });
            }
            return child;
          })}
        </div>
      )}
    </div>
  );
}

interface DropdownItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
  variant?: 'default' | 'danger';
}

export function DropdownItem({
  icon,
  variant = 'default',
  children,
  className,
  ...props
}: DropdownItemProps) {
  return (
    <button
      className={cn(
        'flex w-full items-center gap-2 px-4 py-2 text-sm transition-colors',
        variant === 'default'
          ? 'text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
          : 'text-error-500 hover:bg-error-50 [data-theme="dark"]:hover:bg-error-900/20',
        className
      )}
      {...props}
    >
      {icon && <span className="w-4 h-4">{icon}</span>}
      {children}
    </button>
  );
}

export function DropdownDivider() {
  return <div className="my-1 border-t border-[var(--border-default)]" />;
}

export function DropdownLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-4 py-2 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
      {children}
    </div>
  );
}
