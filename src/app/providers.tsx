'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { Toaster as SonnerToaster } from 'sonner';
import { useUIStore } from '@/stores/uiStore';
import { SocketProvider, AICheckinProvider } from '@/components/providers';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <SocketProvider>
          <AICheckinProvider>
            {children}
          </AICheckinProvider>
        </SocketProvider>
        {/* React Hot Toast for existing notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            className: '',
            duration: 4000,
            style: {
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-default)',
            },
          }}
        />
        {/* Sonner for gamification and action toasts */}
        <SonnerToaster
          position="top-right"
          offset={60}
          richColors
          closeButton
          toastOptions={{
            classNames: {
              toast: 'bg-[var(--bg-secondary)] text-[var(--text-primary)] border-[var(--border-default)]',
              title: 'text-[var(--text-primary)]',
              description: 'text-[var(--text-secondary)]',
              actionButton: 'bg-primary-500 text-white',
              cancelButton: 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]',
              closeButton: 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]',
            },
          }}
        />
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useUIStore();

  useEffect(() => {
    const root = document.documentElement;

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      root.setAttribute('data-theme', systemTheme);

      // Listen for system theme changes
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        root.setAttribute('data-theme', e.matches ? 'dark' : 'light');
      };
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      root.setAttribute('data-theme', theme);
    }
  }, [theme]);

  return <>{children}</>;
}
