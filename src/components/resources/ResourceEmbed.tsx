'use client';

import { useState } from 'react';
import { IResource } from '@/types';
import { cn } from '@/lib/utils';
import { Loader2, AlertCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ResourceEmbedProps {
  resource: IResource;
  aspectRatio?: 'video' | 'square' | 'portrait' | 'auto';
  className?: string;
  maxHeight?: string;
}

// Aspect ratio classes
const aspectRatioClasses = {
  video: 'aspect-video',
  square: 'aspect-square',
  portrait: 'aspect-[3/4]',
  auto: '',
};

export function ResourceEmbed({
  resource,
  aspectRatio = 'video',
  className,
  maxHeight = '500px',
}: ResourceEmbedProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Check if resource can be embedded
  if (
    resource.resourceType !== 'link' ||
    resource.link?.embedType !== 'iframe' ||
    !resource.link?.embedUrl
  ) {
    return null;
  }

  const embedUrl = resource.link.embedUrl;

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const handleOpenExternal = () => {
    window.open(resource.link?.url, '_blank', 'noopener,noreferrer');
  };

  if (hasError) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center p-8 rounded-xl',
          'bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700',
          aspectRatioClasses[aspectRatio],
          className
        )}
        style={{ maxHeight }}
      >
        <AlertCircle className="w-8 h-8 text-surface-400 mb-3" />
        <p className="text-sm text-surface-500 dark:text-surface-400 text-center mb-4">
          Unable to load embed preview
        </p>
        <Button variant="outline" size="sm" onClick={handleOpenExternal}>
          <ExternalLink className="w-4 h-4 mr-2" />
          Open in new tab
        </Button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative w-full overflow-hidden rounded-xl',
        'bg-surface-100 dark:bg-surface-900',
        aspectRatioClasses[aspectRatio],
        className
      )}
      style={{ maxHeight }}
    >
      {/* Loading spinner */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-surface-100 dark:bg-surface-900">
          <Loader2 className="w-8 h-8 text-surface-400 animate-spin" />
        </div>
      )}

      {/* Iframe */}
      <iframe
        src={embedUrl}
        className={cn(
          'w-full h-full border-0',
          isLoading && 'opacity-0'
        )}
        onLoad={handleLoad}
        onError={handleError}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        sandbox="allow-scripts allow-same-origin allow-popups allow-presentation"
      />
    </div>
  );
}

// Wrapper component for modal/full-screen embeds
interface ResourceEmbedModalProps {
  resource: IResource;
  onClose: () => void;
}

export function ResourceEmbedFullscreen({
  resource,
  onClose,
}: ResourceEmbedModalProps) {
  if (
    resource.resourceType !== 'link' ||
    resource.link?.embedType !== 'iframe' ||
    !resource.link?.embedUrl
  ) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      {/* Embed container */}
      <div className="w-full max-w-6xl max-h-[90vh] aspect-video">
        <iframe
          src={resource.link.embedUrl}
          className="w-full h-full rounded-xl border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
        />
      </div>

      {/* Resource info */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {resource.provider.faviconUrl && (
            <img
              src={resource.provider.faviconUrl}
              alt={resource.provider.name}
              className="w-6 h-6"
            />
          )}
          <div>
            <p className="text-white font-medium">{resource.displayName}</p>
            <p className="text-white/60 text-sm capitalize">
              {resource.provider.name}
            </p>
          </div>
        </div>
        <button
          onClick={() =>
            window.open(resource.link?.url, '_blank', 'noopener,noreferrer')
          }
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Open original
        </button>
      </div>
    </div>
  );
}

