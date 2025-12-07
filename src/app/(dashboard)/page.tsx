'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ProactiveChatInterface } from '@/components/dashboard/ProactiveChatInterface';
import { ContextRail } from '@/components/dashboard/ContextRail';
import { MobileDashboard } from '@/components/dashboard/MobileDashboard';
import { useIsMobile } from '@/hooks/useMediaQuery';

export default function DashboardPage() {
  const router = useRouter();
  const isMobile = useIsMobile();

  const handleTicketClick = useCallback((ticketId: string) => {
    router.push(`/tickets/${ticketId}`);
  }, [router]);

  // Mobile layout
  if (isMobile) {
    return <MobileDashboard />;
  }

  // Desktop layout - Split Stream Interface
  return (
    <div className="flex h-[calc(100vh-64px)] gap-6 p-6 bg-surface-50 dark:bg-surface-900">
      {/* Main Interaction Stream (60%) */}
      <section className="flex-1 flex flex-col bg-white dark:bg-surface-800 rounded-2xl shadow-sm border border-surface-200 dark:border-surface-700 overflow-hidden lg:max-w-[60%]">
        <ProactiveChatInterface showDailyUpdatePrompt={true} />
      </section>

      {/* Context Rail (40%) - Hidden on smaller screens */}
      <aside className="hidden lg:flex w-96 xl:w-[400px] flex-col">
        <ContextRail onTicketClick={handleTicketClick} />
      </aside>
    </div>
  );
}
