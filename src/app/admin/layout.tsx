'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAdminAuthStore } from '@/stores/adminAuthStore';
import { useAdminAuth } from '@/hooks/admin/useAdminAuth';
import { AdminSidebar } from '@/components/admin/layout/AdminSidebar';
import { AdminHeader } from '@/components/admin/layout/AdminHeader';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, _hasHydrated } = useAdminAuthStore();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Initialize auth (will fetch user if token exists)
  useAdminAuth();

  // Check if we're on the login page
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    // Only redirect after hydration is complete
    if (_hasHydrated && !isLoading && !isAuthenticated && !isLoginPage) {
      // Redirect to admin login if not authenticated
      router.push('/admin/login');
    }
  }, [isAuthenticated, isLoading, isLoginPage, router, _hasHydrated]);

  // Wait for hydration before showing anything
  if (!_hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-surface-400">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  // For login page, render without layout
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Show loading while checking auth (only after hydration)
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-surface-400">Verifying credentials...</p>
        </div>
      </div>
    );
  }

  // If not authenticated and not loading, don't render anything (redirect will happen)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen bg-surface-50 dark:bg-surface-900">
      <AdminSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
