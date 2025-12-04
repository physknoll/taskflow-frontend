'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { usersService, IUserMinimal } from '@/services/users.service';
import { Avatar } from './Avatar';
import { cn } from '@/lib/utils';
import { X, Search, Loader2 } from 'lucide-react';

interface UserTagInputProps {
  selectedUsers: IUserMinimal[];
  onChange: (users: IUserMinimal[]) => void;
  placeholder?: string;
  disabled?: boolean;
  clientId?: string;
  label?: string;
  className?: string;
}

export function UserTagInput({
  selectedUsers,
  onChange,
  placeholder = 'Search users...',
  disabled = false,
  clientId,
  label,
  className,
}: UserTagInputProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced search query
  const [debouncedQuery, setDebouncedQuery] = useState('');
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Search for users
  const { data: suggestions = [], isLoading } = useQuery({
    queryKey: ['users', 'search', debouncedQuery, clientId],
    queryFn: () => usersService.searchAssignableUsers(debouncedQuery, { clientId, limit: 10 }),
    enabled: debouncedQuery.length >= 1,
  });

  // Filter out already selected users
  const filteredSuggestions = suggestions.filter(
    (user) => !selectedUsers.find((s) => s._id === user._id)
  );

  // Handle adding a user
  const addUser = useCallback((user: IUserMinimal) => {
    onChange([...selectedUsers, user]);
    setQuery('');
    setIsOpen(false);
    inputRef.current?.focus();
  }, [selectedUsers, onChange]);

  // Handle removing a user
  const removeUser = useCallback((userId: string) => {
    onChange(selectedUsers.filter((u) => u._id !== userId));
  }, [selectedUsers, onChange]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((i) => Math.min(i + 1, filteredSuggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && isOpen && filteredSuggestions[highlightedIndex]) {
      e.preventDefault();
      addUser(filteredSuggestions[highlightedIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'Backspace' && query === '' && selectedUsers.length > 0) {
      removeUser(selectedUsers[selectedUsers.length - 1]._id);
    }
  }, [filteredSuggestions, highlightedIndex, isOpen, query, selectedUsers, addUser, removeUser]);

  // Reset highlight when suggestions change
  useEffect(() => {
    setHighlightedIndex(0);
  }, [filteredSuggestions]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300';
      case 'manager':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300';
      case 'employee':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300';
      default:
        return 'bg-surface-100 text-surface-600 dark:bg-surface-700 dark:text-surface-300';
    }
  };

  return (
    <div className={cn('space-y-1.5', className)} ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">
          {label}
        </label>
      )}
      
      <div
        className={cn(
          'relative min-h-[42px] flex flex-wrap items-center gap-1.5 p-2 rounded-lg border transition-colors',
          'bg-white dark:bg-surface-800',
          disabled
            ? 'border-surface-200 dark:border-surface-700 opacity-60 cursor-not-allowed'
            : 'border-surface-300 dark:border-surface-600 focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500'
        )}
      >
        {/* Selected Users */}
        {selectedUsers.map((user) => (
          <div
            key={user._id}
            className="flex items-center gap-1.5 px-2 py-1 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-md text-sm"
          >
            <Avatar
              src={user.avatar}
              firstName={user.firstName}
              lastName={user.lastName}
              size="xs"
            />
            <span className="font-medium">{user.fullName || `${user.firstName} ${user.lastName}`}</span>
            {!disabled && (
              <button
                type="button"
                onClick={() => removeUser(user._id)}
                className="ml-0.5 p-0.5 rounded hover:bg-primary-100 dark:hover:bg-primary-800 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        ))}

        {/* Search Input */}
        <div className="flex-1 min-w-[120px] flex items-center gap-2">
          <Search className="h-4 w-4 text-surface-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => query.length >= 1 && setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={selectedUsers.length === 0 ? placeholder : ''}
            disabled={disabled}
            className="flex-1 bg-transparent text-sm text-surface-900 dark:text-white placeholder:text-surface-400 focus:outline-none disabled:cursor-not-allowed"
          />
          {isLoading && <Loader2 className="h-4 w-4 text-surface-400 animate-spin" />}
        </div>

        {/* Suggestions Dropdown */}
        {isOpen && query.length >= 1 && (
          <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg shadow-lg overflow-hidden">
            {filteredSuggestions.length === 0 ? (
              <div className="px-4 py-3 text-sm text-surface-500 dark:text-surface-400">
                {isLoading ? 'Searching...' : 'No users found'}
              </div>
            ) : (
              <ul className="max-h-60 overflow-y-auto">
                {filteredSuggestions.map((user, index) => (
                  <li
                    key={user._id}
                    onClick={() => addUser(user)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors',
                      index === highlightedIndex
                        ? 'bg-primary-50 dark:bg-primary-900/30'
                        : 'hover:bg-surface-50 dark:hover:bg-surface-700/50'
                    )}
                  >
                    <Avatar
                      src={user.avatar}
                      firstName={user.firstName}
                      lastName={user.lastName}
                      size="sm"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-surface-900 dark:text-white truncate">
                        {user.fullName || `${user.firstName} ${user.lastName}`}
                      </p>
                      <p className="text-xs text-surface-500 dark:text-surface-400 truncate">
                        {user.email}
                      </p>
                    </div>
                    <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', getRoleBadgeColor(user.role))}>
                      {user.role}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

