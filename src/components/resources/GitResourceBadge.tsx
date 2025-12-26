'use client';

import { IResourceGit, IResourceProvider, GitPRState } from '@/types';
import { cn } from '@/lib/utils';
import {
  GitBranch,
  GitPullRequest,
  GitCommit,
  ExternalLink,
  Check,
  X,
  Circle,
  Clock,
} from 'lucide-react';

interface GitResourceBadgeProps {
  git: IResourceGit;
  provider: IResourceProvider;
  compact?: boolean;
}

// PR state styling
const prStateStyles: Record<GitPRState, { color: string; bg: string; icon: typeof Check }> = {
  open: {
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-100 dark:bg-green-900/30',
    icon: Circle,
  },
  merged: {
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-100 dark:bg-purple-900/30',
    icon: Check,
  },
  closed: {
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-100 dark:bg-red-900/30',
    icon: X,
  },
  draft: {
    color: 'text-surface-500 dark:text-surface-400',
    bg: 'bg-surface-100 dark:bg-surface-800',
    icon: Clock,
  },
};

// Get GitHub/GitLab icon based on provider
function getProviderIcon(providerName: string) {
  // Return appropriate SVG based on provider
  if (providerName === 'github') {
    return (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
      </svg>
    );
  }
  if (providerName === 'gitlab') {
    return (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.65 14.39L12 22.13 1.35 14.39a.84.84 0 0 1-.3-.94l1.22-3.78 2.44-7.51A.42.42 0 0 1 4.82 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.49h8.1l2.44-7.51A.42.42 0 0 1 18.6 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.51L23 13.45a.84.84 0 0 1-.35.94z" />
      </svg>
    );
  }
  if (providerName === 'bitbucket') {
    return (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M.778 1.213a.768.768 0 0 0-.768.892l3.263 19.81c.084.5.515.868 1.022.873H19.95a.772.772 0 0 0 .77-.646l3.27-20.03a.768.768 0 0 0-.768-.891zM14.52 15.53H9.522L8.17 8.466h7.561z" />
      </svg>
    );
  }
  return <GitBranch className="w-4 h-4" />;
}

// Shorten commit hash
function shortenCommitHash(hash: string): string {
  return hash.substring(0, 7);
}

export function GitResourceBadge({
  git,
  provider,
  compact = false,
}: GitResourceBadgeProps) {
  const handleClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Compact display for lists
  if (compact) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <span className="text-surface-400">{getProviderIcon(provider.name)}</span>
        {git.prState && git.pullRequestUrl ? (
          <button
            onClick={() => handleClick(git.pullRequestUrl!)}
            className={cn(
              'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
              prStateStyles[git.prState].bg,
              prStateStyles[git.prState].color
            )}
          >
            <GitPullRequest className="w-3 h-3" />
            #{git.prNumber}
          </button>
        ) : git.branch ? (
          <span className="inline-flex items-center gap-1 text-surface-600 dark:text-surface-400">
            <GitBranch className="w-3 h-3" />
            {git.branch}
          </span>
        ) : git.commitHash ? (
          <span className="inline-flex items-center gap-1 font-mono text-xs text-surface-500">
            <GitCommit className="w-3 h-3" />
            {shortenCommitHash(git.commitHash)}
          </span>
        ) : (
          <span className="text-surface-500">
            {git.repoOwner}/{git.repoName}
          </span>
        )}
      </div>
    );
  }

  // Full display
  return (
    <div className="space-y-2">
      {/* Repository info */}
      <div className="flex items-center gap-2">
        <span className="text-surface-500">{getProviderIcon(provider.name)}</span>
        <button
          onClick={() => handleClick(git.repoUrl)}
          className="text-sm font-medium text-surface-700 dark:text-surface-300 hover:text-primary-600 dark:hover:text-primary-400 flex items-center gap-1"
        >
          {git.repoOwner && git.repoName ? (
            <>
              <span className="text-surface-500">{git.repoOwner}</span>
              <span>/</span>
              <span>{git.repoName}</span>
            </>
          ) : (
            <span>View Repository</span>
          )}
          <ExternalLink className="w-3 h-3 opacity-50" />
        </button>
      </div>

      {/* PR status */}
      {git.prState && git.pullRequestUrl && (
        <button
          onClick={() => handleClick(git.pullRequestUrl!)}
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-lg w-full text-left transition-colors',
            prStateStyles[git.prState].bg,
            'hover:opacity-80'
          )}
        >
          <GitPullRequest
            className={cn('w-4 h-4', prStateStyles[git.prState].color)}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'text-sm font-medium',
                  prStateStyles[git.prState].color
                )}
              >
                #{git.prNumber}
              </span>
              <span
                className={cn(
                  'text-xs px-1.5 py-0.5 rounded capitalize',
                  prStateStyles[git.prState].bg,
                  prStateStyles[git.prState].color
                )}
              >
                {git.prState}
              </span>
            </div>
            {git.prTitle && (
              <p className="text-sm text-surface-600 dark:text-surface-400 truncate mt-0.5">
                {git.prTitle}
              </p>
            )}
          </div>
          <ExternalLink className="w-4 h-4 text-surface-400 flex-shrink-0" />
        </button>
      )}

      {/* Branch */}
      {git.branch && !git.prState && (
        <div className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-400">
          <GitBranch className="w-4 h-4 text-surface-400" />
          <span className="font-mono">{git.branch}</span>
        </div>
      )}

      {/* Commit hash */}
      {git.commitHash && (
        <div className="flex items-center gap-2 text-sm">
          <GitCommit className="w-4 h-4 text-surface-400" />
          <code className="font-mono text-xs bg-surface-100 dark:bg-surface-800 px-2 py-0.5 rounded">
            {shortenCommitHash(git.commitHash)}
          </code>
        </div>
      )}
    </div>
  );
}




