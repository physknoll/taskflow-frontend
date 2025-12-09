'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { PanelRightClose, PanelRight } from 'lucide-react';
import { ProactiveChatInterface } from '@/components/dashboard/ProactiveChatInterface';
import { ContextRail } from '@/components/dashboard/ContextRail';
import { MobileDashboard } from '@/components/dashboard/MobileDashboard';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [isRailOpen, setIsRailOpen] = useState(true);

  const handleTicketClick = useCallback((ticketId: string) => {
    router.push(`/tickets/${ticketId}`);
  }, [router]);

  // Mobile layout
  if (isMobile) {
    return <MobileDashboard />;
  }

  // Desktop layout - Split Stream Interface
  return (
    <div className="flex h-[calc(100vh-64px)] bg-surface-50 dark:bg-surface-900">
      {/* Main Interaction Stream - Fixed height, no scroll on container */}
      <section className={cn(
        'flex-1 flex flex-col m-4 mr-2 bg-white dark:bg-surface-800 rounded-2xl shadow-sm border border-surface-200 dark:border-surface-700 overflow-hidden transition-all duration-300',
        !isRailOpen && 'mr-4'
      )}>
        <ProactiveChatInterface showDailyUpdatePrompt={true} />
      </section>

      {/* Context Rail Toggle Button - Always visible */}
      <button
        onClick={() => setIsRailOpen(!isRailOpen)}
        className={cn(
          'absolute right-4 top-20 z-20 p-2 rounded-lg bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 shadow-sm hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors',
          isRailOpen && 'lg:hidden'
        )}
        title={isRailOpen ? 'Close sidebar' : 'Open sidebar'}
      >
        {isRailOpen ? (
          <PanelRightClose className="w-5 h-5 text-surface-600 dark:text-surface-400" />
        ) : (
          <PanelRight className="w-5 h-5 text-surface-600 dark:text-surface-400" />
        )}
      </button>

      {/* Context Rail - Collapsible, independently scrollable */}
      <AnimatePresence>
        {isRailOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 'auto', opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="hidden lg:flex flex-col m-4 ml-2 w-80 xl:w-[340px] overflow-hidden"
          >
            {/* Close button for desktop */}
            <div className="flex justify-end mb-2">
              <button
                onClick={() => setIsRailOpen(false)}
                className="p-1.5 rounded-lg hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
                title="Close sidebar"
              >
                <PanelRightClose className="w-4 h-4 text-surface-500" />
              </button>
            </div>
            
            {/* Scrollable content area */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden pr-1 custom-scrollbar">
              <ContextRail onTicketClick={handleTicketClick} />
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Collapsed state indicator */}
      {!isRailOpen && (
        <div className="hidden lg:flex items-start pt-4 pr-4">
          <button
            onClick={() => setIsRailOpen(true)}
            className="p-2 rounded-lg bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 shadow-sm hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors"
            title="Open sidebar"
          >
            <PanelRight className="w-5 h-5 text-surface-600 dark:text-surface-400" />
          </button>
        </div>
      )}
    </div>
  );
}
