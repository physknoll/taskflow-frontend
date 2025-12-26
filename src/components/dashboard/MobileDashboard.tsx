'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, Flame, BarChart2, X } from 'lucide-react';
import { ProactiveChatInterface } from './ProactiveChatInterface';
import { ContextRail } from './ContextRail';
import { useAIPMDashboard } from '@/hooks/useAIPM';
import { cn } from '@/lib/utils';
import { bottomSheetSlide, overlayFade } from '@/lib/animations';

interface MobileDashboardProps {
  className?: string;
}

export function MobileDashboard({ className }: MobileDashboardProps) {
  const [showContextSheet, setShowContextSheet] = useState(false);
  const { streak } = useAIPMDashboard();

  return (
    <div className={cn('h-[calc(100vh-64px)] flex flex-col relative', className)}>
      {/* Main Chat */}
      <div className="flex-1 overflow-hidden">
        <ProactiveChatInterface />
      </div>

      {/* Floating Action Button - Open Context Sheet */}
      <button
        onClick={() => setShowContextSheet(true)}
        className="absolute bottom-20 right-4 p-3 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 transition-colors z-10"
        aria-label="Open dashboard"
      >
        <BarChart2 className="w-5 h-5" />
      </button>

      {/* Floating Streak Badge */}
      {streak && (
        <div className="absolute top-4 right-4 bg-gradient-to-r from-primary-500 to-accent-500 text-white px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5 shadow-lg z-10">
          <Flame className="w-4 h-4" />
          <span>{streak.currentStreak} days</span>
        </div>
      )}

      {/* Bottom Sheet */}
      <AnimatePresence>
        {showContextSheet && (
          <>
            {/* Overlay */}
            <motion.div
              variants={overlayFade}
              initial="initial"
              animate="animate"
              exit="exit"
              className="absolute inset-0 bg-black z-20"
              onClick={() => setShowContextSheet(false)}
            />

            {/* Sheet */}
            <motion.div
              variants={bottomSheetSlide}
              initial="initial"
              animate="animate"
              exit="exit"
              className="absolute bottom-0 left-0 right-0 bg-white dark:bg-surface-800 rounded-t-2xl z-30 max-h-[80vh] flex flex-col shadow-2xl"
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 bg-surface-300 dark:bg-surface-600 rounded-full" />
              </div>

              {/* Header */}
              <div className="px-4 pb-3 border-b border-surface-200 dark:border-surface-700 flex items-center justify-between">
                <h3 className="font-semibold text-surface-900 dark:text-white">
                  Dashboard
                </h3>
                <button
                  onClick={() => setShowContextSheet(false)}
                  className="p-1 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5 text-surface-500" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4">
                <ContextRail
                  onTicketClick={() => setShowContextSheet(false)}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default MobileDashboard;




