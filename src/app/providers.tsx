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
            className: 'dark:bg-surface-800 dark:text-white',
            duration: 4000,
            style: {
              background: 'var(--toast-bg)',
              color: 'var(--toast-color)',
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
              toast: 'dark:bg-surface-800 dark:text-white dark:border-surface-700',
              title: 'dark:text-white',
              description: 'dark:text-surface-400',
              actionButton: 'dark:bg-primary-600 dark:text-white',
              cancelButton: 'dark:bg-surface-700 dark:text-surface-300',
              closeButton: 'dark:bg-surface-700 dark:text-surface-300 dark:hover:bg-surface-600',
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
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      root.classList.add(systemTheme);

      // Listen for system theme changes
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        root.classList.remove('light', 'dark');
        root.classList.add(e.matches ? 'dark' : 'light');
      };
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  return <>{children}</>;
}

