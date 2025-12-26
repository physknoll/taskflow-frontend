'use client';

import React from 'react';

interface LinkifiedTextProps {
  text: string;
  className?: string;
}

// URL regex pattern - matches http:// and https:// URLs
const urlRegex = /(https?:\/\/[^\s<>"{}|\\^`[\]]+)/g;

/**
 * Converts plain text to text with clickable links.
 * URLs are automatically detected and rendered as blue, clickable links.
 */
export function LinkifiedText({ text, className }: LinkifiedTextProps) {
  if (!text) return null;

  const parts = text.split(urlRegex);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (urlRegex.test(part)) {
          // Reset regex lastIndex since we're using global flag
          urlRegex.lastIndex = 0;
          return (
            <a
              key={index}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 dark:text-primary-400 hover:underline break-all"
              onClick={(e) => e.stopPropagation()}
            >
              {part}
            </a>
          );
        }
        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </span>
  );
}



