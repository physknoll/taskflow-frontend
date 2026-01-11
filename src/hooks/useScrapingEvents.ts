'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { API_URL } from '@/lib/constants';
import { getTokens } from '@/services/api';

// ============================================
// SSE Event Types
// ============================================

export interface SSEConnectedEvent {
  timestamp: string;
}

export interface SSEScrapeItemEvent {
  commandId: string;
  sourceId: string;
  sourceName: string;
  itemIndex: number;
  totalExpected: number;
  item: {
    externalId: string;
    authorName: string;
    contentPreview: string;
    reactions?: number;
    comments?: number;
  };
  scrapedAt: string;
}

export interface SSEScrapeCompleteEvent {
  commandId: string;
  sourceId: string;
  sourceName: string;
  stats: {
    itemsFound: number;
    newItems: number;
    updatedItems?: number;
    skippedItems?: number;
  };
  completedAt: string;
}

export interface SSEScrapeResultEvent {
  commandId: string;
  sourceId: string;
  sourceName: string;
  itemsCount: number;
}

export interface SSEScraperConnectedEvent {
  scraperId: string;
  scraperName: string;
  supportedPlatforms: string[];
  connectedAt: string;
}

export interface SSEScraperDisconnectedEvent {
  scraperId: string;
  disconnectedAt: string;
}

export interface SSEHeartbeatEvent {
  timestamp: string;
}

export type SSEEventType = 
  | 'connected'
  | 'scrape:item'
  | 'scrape:complete'
  | 'scrape:result'
  | 'scraper:connected'
  | 'scraper:disconnected'
  | 'heartbeat';

export interface ScrapingEventCallbacks {
  onConnected?: (data: SSEConnectedEvent) => void;
  onScrapeItem?: (data: SSEScrapeItemEvent) => void;
  onScrapeComplete?: (data: SSEScrapeCompleteEvent) => void;
  onScrapeResult?: (data: SSEScrapeResultEvent) => void;
  onScraperConnected?: (data: SSEScraperConnectedEvent) => void;
  onScraperDisconnected?: (data: SSEScraperDisconnectedEvent) => void;
  onHeartbeat?: (data: SSEHeartbeatEvent) => void;
  onError?: (error: Event) => void;
}

export interface UseScrapingEventsOptions {
  enabled?: boolean;
  callbacks?: ScrapingEventCallbacks;
  /** Auto-invalidate queries on events (default: true) */
  autoInvalidate?: boolean;
}

export interface UseScrapingEventsReturn {
  isConnected: boolean;
  lastEvent: { type: SSEEventType; data: unknown; timestamp: Date } | null;
  reconnect: () => void;
}

// ============================================
// useScrapingEvents Hook
// ============================================

export function useScrapingEvents(
  options: UseScrapingEventsOptions = {}
): UseScrapingEventsReturn {
  const { enabled = true, callbacks, autoInvalidate = true } = options;
  
  const queryClient = useQueryClient();
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<{ type: SSEEventType; data: unknown; timestamp: Date } | null>(null);

  const connect = useCallback(() => {
    // Clean up existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    // Clear any pending reconnect
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    // Get the access token for authorization
    const { accessToken } = getTokens();
    
    // Build SSE URL with token as query param (SSE doesn't support custom headers)
    const sseUrl = new URL(`${API_URL}/scraping/events`);
    if (accessToken) {
      sseUrl.searchParams.set('token', accessToken);
    }

    const eventSource = new EventSource(sseUrl.toString(), {
      withCredentials: true,
    });
    
    eventSourceRef.current = eventSource;

    // Connection established
    eventSource.addEventListener('connected', (e) => {
      try {
        const data: SSEConnectedEvent = JSON.parse(e.data);
        console.log('🔌 SSE connected:', data);
        setIsConnected(true);
        setLastEvent({ type: 'connected', data, timestamp: new Date() });
        callbacks?.onConnected?.(data);
      } catch (err) {
        console.error('Error parsing connected event:', err);
      }
    });

    // Individual item scraped (real-time!)
    eventSource.addEventListener('scrape:item', (e) => {
      try {
        const data: SSEScrapeItemEvent = JSON.parse(e.data);
        console.log('📦 New item:', data.item.authorName, '-', data.itemIndex + 1, '/', data.totalExpected);
        setLastEvent({ type: 'scrape:item', data, timestamp: new Date() });
        callbacks?.onScrapeItem?.(data);

        if (autoInvalidate) {
          // Invalidate items/posts queries
          queryClient.invalidateQueries({ queryKey: ['items'] });
          queryClient.invalidateQueries({ queryKey: ['scraping', 'items'] });
        }
      } catch (err) {
        console.error('Error parsing scrape:item event:', err);
      }
    });

    // Scrape session completed
    eventSource.addEventListener('scrape:complete', (e) => {
      try {
        const data: SSEScrapeCompleteEvent = JSON.parse(e.data);
        console.log('✅ Scrape complete:', data.sourceName, '-', data.stats.itemsFound, 'items');
        setLastEvent({ type: 'scrape:complete', data, timestamp: new Date() });
        callbacks?.onScrapeComplete?.(data);

        if (autoInvalidate) {
          queryClient.invalidateQueries({ queryKey: ['items'] });
          queryClient.invalidateQueries({ queryKey: ['stats'] });
          queryClient.invalidateQueries({ queryKey: ['scraping', 'items'] });
          queryClient.invalidateQueries({ queryKey: ['scraping', 'stats'] });
          queryClient.invalidateQueries({ queryKey: ['scraping', 'sessions'] });
        }
      } catch (err) {
        console.error('Error parsing scrape:complete event:', err);
      }
    });

    // Batch result (legacy mode)
    eventSource.addEventListener('scrape:result', (e) => {
      try {
        const data: SSEScrapeResultEvent = JSON.parse(e.data);
        console.log('📊 Batch result:', data.sourceName, '-', data.itemsCount, 'items');
        setLastEvent({ type: 'scrape:result', data, timestamp: new Date() });
        callbacks?.onScrapeResult?.(data);

        if (autoInvalidate) {
          queryClient.invalidateQueries({ queryKey: ['items'] });
          queryClient.invalidateQueries({ queryKey: ['stats'] });
          queryClient.invalidateQueries({ queryKey: ['scraping', 'items'] });
          queryClient.invalidateQueries({ queryKey: ['scraping', 'stats'] });
        }
      } catch (err) {
        console.error('Error parsing scrape:result event:', err);
      }
    });

    // Scraper connected
    eventSource.addEventListener('scraper:connected', (e) => {
      try {
        const data: SSEScraperConnectedEvent = JSON.parse(e.data);
        console.log('🟢 Scraper online:', data.scraperName);
        setLastEvent({ type: 'scraper:connected', data, timestamp: new Date() });
        callbacks?.onScraperConnected?.(data);

        if (autoInvalidate) {
          queryClient.invalidateQueries({ queryKey: ['scrapers'] });
          queryClient.invalidateQueries({ queryKey: ['stats'] });
          queryClient.invalidateQueries({ queryKey: ['scraping', 'scrapers'] });
          queryClient.invalidateQueries({ queryKey: ['scraping', 'stats'] });
        }
      } catch (err) {
        console.error('Error parsing scraper:connected event:', err);
      }
    });

    // Scraper disconnected
    eventSource.addEventListener('scraper:disconnected', (e) => {
      try {
        const data: SSEScraperDisconnectedEvent = JSON.parse(e.data);
        console.log('🔴 Scraper offline:', data.scraperId);
        setLastEvent({ type: 'scraper:disconnected', data, timestamp: new Date() });
        callbacks?.onScraperDisconnected?.(data);

        if (autoInvalidate) {
          queryClient.invalidateQueries({ queryKey: ['scrapers'] });
          queryClient.invalidateQueries({ queryKey: ['stats'] });
          queryClient.invalidateQueries({ queryKey: ['scraping', 'scrapers'] });
          queryClient.invalidateQueries({ queryKey: ['scraping', 'stats'] });
        }
      } catch (err) {
        console.error('Error parsing scraper:disconnected event:', err);
      }
    });

    // Heartbeat (keep-alive)
    eventSource.addEventListener('heartbeat', (e) => {
      try {
        const data: SSEHeartbeatEvent = JSON.parse(e.data);
        setLastEvent({ type: 'heartbeat', data, timestamp: new Date() });
        callbacks?.onHeartbeat?.(data);
      } catch {
        // Heartbeat might be empty
      }
    });

    // Handle open
    eventSource.onopen = () => {
      setIsConnected(true);
    };

    // Handle errors
    eventSource.onerror = (e) => {
      console.error('SSE error:', e);
      setIsConnected(false);
      callbacks?.onError?.(e);
      
      // EventSource will auto-reconnect, but we track the state
    };

  }, [queryClient, callbacks, autoInvalidate]);

  const reconnect = useCallback(() => {
    connect();
  }, [connect]);

  useEffect(() => {
    if (!enabled) {
      // Clean up if disabled
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      setIsConnected(false);
      return;
    }

    connect();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      setIsConnected(false);
    };
  }, [enabled, connect]);

  return {
    isConnected,
    lastEvent,
    reconnect,
  };
}
