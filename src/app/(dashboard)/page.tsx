'use client';

import { useCallback, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { PanelRightClose, PanelRight } from 'lucide-react';
import { ProactiveChatInterface, ProactiveChatInterfaceHandle } from '@/components/dashboard/ProactiveChatInterface';
import { ContextRail } from '@/components/dashboard/ContextRail';
import { MobileDashboard } from '@/components/dashboard/MobileDashboard';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils';
import type { ResumeConversationResponse } from '@/types';

export default function DashboardPage() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [isRailOpen, setIsRailOpen] = useState(true);
  const chatRef = useRef<ProactiveChatInterfaceHandle>(null);

  const handleTicketClick = useCallback((ticketId: string) => {
    router.push(`/tickets/${ticketId}`);
  }, [router]);

  // Handle resuming a conversation from history - populates the chat without navigating
  const handleResumeConversation = useCallback((result: ResumeConversationResponse) => {
    if (chatRef.current) {
      chatRef.current.loadConversation(result);
    }
  }, []);

  // Mobile layout
  if (isMobile) {
    return <MobileDashboard />;
  }

  // Desktop layout - Split Stream Interface
  // Note: Parent layout has p-6, so we use negative margin to cancel it for full-height
  return (
    <div className="flex h-full -m-6">
      {/* Main Interaction Stream - Fixed to available height */}
      <section className={cn(
        'flex-1 flex flex-col m-4 bg-white dark:bg-surface-800 rounded-2xl shadow-sm border border-surface-200 dark:border-surface-700 overflow-hidden transition-all duration-300 min-h-0',
        isRailOpen ? 'mr-2' : 'mr-4'
      )}>
        <ProactiveChatInterface ref={chatRef} showDailyUpdatePrompt={true} />
      </section>

      {/* Context Rail - Collapsible, independently scrollable */}
      <AnimatePresence>
        {isRailOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="hidden lg:flex flex-col my-4 mr-4 overflow-hidden min-h-0"
          >
            {/* Close button */}
            <div className="flex justify-end mb-2 flex-shrink-0">
              <button
                onClick={() => setIsRailOpen(false)}
                className="p-1.5 rounded-lg hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
                title="Close sidebar"
              >
                <PanelRightClose className="w-4 h-4 text-surface-500" />
              </button>
            </div>
            
            {/* Scrollable content area */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar min-h-0">
              <ContextRail 
                onTicketClick={handleTicketClick} 
                onResumeConversation={handleResumeConversation}
              />
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Collapsed state - show open button */}
      {!isRailOpen && (
        <div className="hidden lg:flex items-start py-4 pr-4 flex-shrink-0">
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
