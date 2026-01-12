'use client';

import { useState, useEffect, useRef } from 'react';
import { ChatWidgetTheme, DEFAULT_PILL_MESSAGES } from '@/types/chat-widget';
import { MessageCircle, X, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WidgetPreviewProps {
  greeting: string;
  placeholderText: string;
  botName: string;
  botAvatarUrl?: string;
  theme: ChatWidgetTheme;
  isActive: boolean;
}

/**
 * Live preview component showing how the widget will look on client websites
 */
export function WidgetPreview({
  greeting,
  placeholderText,
  botName,
  botAvatarUrl,
  theme,
  isActive,
}: WidgetPreviewProps) {
  const isRight = theme.position === 'bottom-right';

  if (!isActive) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px] bg-surface-100 dark:bg-surface-800 rounded-xl border-2 border-dashed border-surface-300 dark:border-surface-600">
        <div className="text-center text-surface-500">
          <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium">Widget Disabled</p>
          <p className="text-sm mt-1">Enable the widget to see the preview</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative bg-gradient-to-br from-surface-100 to-surface-200 dark:from-surface-800 dark:to-surface-900 rounded-xl p-6 min-h-[400px] overflow-hidden"
      style={
        {
          '--widget-primary': theme.primaryColor,
          '--widget-radius': `${theme.borderRadius}px`,
          '--widget-button-size': `${theme.buttonSize}px`,
        } as React.CSSProperties
      }
    >
      {/* Simulated website content */}
      <div className="absolute inset-0 p-4 opacity-30">
        <div className="h-4 w-24 bg-surface-400 rounded mb-3" />
        <div className="h-3 w-full bg-surface-300 rounded mb-2" />
        <div className="h-3 w-3/4 bg-surface-300 rounded mb-2" />
        <div className="h-3 w-5/6 bg-surface-300 rounded mb-4" />
        <div className="h-20 w-full bg-surface-300 rounded mb-4" />
        <div className="h-3 w-full bg-surface-300 rounded mb-2" />
        <div className="h-3 w-2/3 bg-surface-300 rounded" />
      </div>

      {/* Widget Chat Panel */}
      <div
        className={cn(
          'absolute bottom-20 w-80 bg-white dark:bg-surface-800 shadow-2xl overflow-hidden',
          isRight ? 'right-4' : 'left-4'
        )}
        style={{ borderRadius: 'var(--widget-radius)' }}
      >
        {/* Header */}
        <div
          className="px-4 py-3 flex items-center justify-between text-white"
          style={{ backgroundColor: 'var(--widget-primary)' }}
        >
          <div className="flex items-center gap-3">
            {botAvatarUrl ? (
              <img
                src={botAvatarUrl}
                alt={botName}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
              >
                {botName.charAt(0)}
              </div>
            )}
            <div>
              <p className="font-medium text-sm">{botName}</p>
              <p className="text-xs opacity-80">Online</p>
            </div>
          </div>
          <button className="p-1 hover:bg-white/10 rounded">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="p-4 h-48 overflow-y-auto bg-surface-50 dark:bg-surface-900">
          {/* Bot greeting */}
          <div className="flex gap-2 mb-4">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
              style={{ backgroundColor: 'var(--widget-primary)' }}
            >
              {botName.charAt(0)}
            </div>
            <div
              className="bg-white dark:bg-surface-800 px-3 py-2 shadow-sm max-w-[80%] text-sm text-surface-700 dark:text-surface-300"
              style={{ borderRadius: 'var(--widget-radius)' }}
            >
              {greeting}
            </div>
          </div>
        </div>

        {/* Input */}
        <div className="p-3 border-t border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder={placeholderText}
              disabled
              className="flex-1 px-3 py-2 text-sm bg-surface-100 dark:bg-surface-700 rounded-lg text-surface-500 cursor-not-allowed"
            />
            <button
              className="p-2 rounded-lg text-white"
              style={{ backgroundColor: 'var(--widget-primary)' }}
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Widget Button */}
      <div
        className={cn(
          'absolute bottom-4',
          isRight ? 'right-4' : 'left-4'
        )}
      >
        {theme.buttonStyle === 'pill' ? (
          <PillButton theme={theme} />
        ) : (
          <button
            className="flex items-center justify-center text-white shadow-lg transition-transform hover:scale-105"
            style={{
              backgroundColor: 'var(--widget-primary)',
              width: 'var(--widget-button-size)',
              height: 'var(--widget-button-size)',
              borderRadius: '50%',
              background: `linear-gradient(165deg, 
                color-mix(in srgb, ${theme.primaryColor} 100%, white 18%) 0%,
                ${theme.primaryColor} 45%,
                color-mix(in srgb, ${theme.primaryColor} 100%, black 12%) 100%)`,
              boxShadow: `
                0 6px 20px rgba(0, 0, 0, 0.28),
                0 2px 6px rgba(0, 0, 0, 0.15),
                inset 0 1px 1px rgba(255, 255, 255, 0.25)`,
            }}
          >
            <MessageCircle className="h-6 w-6" />
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Animated pill button with typewriter effect
 */
function PillButton({ theme }: { theme: ChatWidgetTheme }) {
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const animationRef = useRef<{
    charIndex: number;
    messageIndex: number;
    interval: NodeJS.Timeout | null;
    timeout: NodeJS.Timeout | null;
  }>({ charIndex: 0, messageIndex: 0, interval: null, timeout: null });

  const messages = theme.pillMessages?.length > 0 
    ? theme.pillMessages.filter(m => m.trim().length > 0)
    : DEFAULT_PILL_MESSAGES;

  useEffect(() => {
    // Clear any existing animations
    if (animationRef.current.interval) {
      clearInterval(animationRef.current.interval);
    }
    if (animationRef.current.timeout) {
      clearTimeout(animationRef.current.timeout);
    }

    // Reset state
    animationRef.current = { charIndex: 0, messageIndex: 0, interval: null, timeout: null };
    setDisplayText('');
    setIsTyping(true);

    // Start animation after initial delay
    animationRef.current.timeout = setTimeout(() => {
      startTyping();
    }, 500);

    return () => {
      if (animationRef.current.interval) {
        clearInterval(animationRef.current.interval);
      }
      if (animationRef.current.timeout) {
        clearTimeout(animationRef.current.timeout);
      }
    };
  }, [theme.pillMessages, theme.buttonStyle]);

  const startTyping = () => {
    const ref = animationRef.current;
    
    ref.interval = setInterval(() => {
      const currentMessage = messages[ref.messageIndex];
      
      if (ref.charIndex < currentMessage.length) {
        setDisplayText(currentMessage.substring(0, ref.charIndex + 1));
        ref.charIndex++;
      } else {
        // Pause at end of message
        clearInterval(ref.interval!);
        
        // Move to next message after pause
        ref.timeout = setTimeout(() => {
          if (ref.messageIndex < messages.length - 1) {
            ref.messageIndex++;
            ref.charIndex = 0;
            setDisplayText('');
            startTyping();
          } else {
            // Loop back to first message
            ref.messageIndex = 0;
            ref.charIndex = 0;
            setDisplayText('');
            startTyping();
          }
        }, 2000);
      }
    }, 50);
  };

  return (
    <button
      className="flex items-center text-white shadow-lg transition-transform hover:scale-105"
      style={{
        height: theme.buttonSize,
        minWidth: theme.buttonSize,
        borderRadius: theme.buttonSize / 2,
        padding: '0 20px 0 16px',
        gap: 12,
        background: `linear-gradient(165deg, 
          color-mix(in srgb, ${theme.primaryColor} 100%, white 18%) 0%,
          ${theme.primaryColor} 45%,
          color-mix(in srgb, ${theme.primaryColor} 100%, black 12%) 100%)`,
        border: `1px solid color-mix(in srgb, ${theme.primaryColor} 75%, black)`,
        boxShadow: `
          0 6px 20px rgba(0, 0, 0, 0.28),
          0 2px 6px rgba(0, 0, 0, 0.15),
          inset 0 1px 1px rgba(255, 255, 255, 0.25)`,
      }}
    >
      <MessageCircle className="h-6 w-6 flex-shrink-0" />
      <span 
        className="text-sm font-medium whitespace-nowrap"
        style={{ textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}
      >
        {displayText}
      </span>
      {isTyping && displayText.length < (messages[animationRef.current.messageIndex]?.length || 0) && (
        <span 
          className="w-0.5 h-4 bg-white animate-pulse"
          style={{ marginLeft: -8 }}
        />
      )}
    </button>
  );
}
