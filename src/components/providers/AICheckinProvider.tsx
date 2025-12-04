'use client';

import { useEffect, useRef, ReactNode } from 'react';
import { useAICheckin } from '@/hooks/useAICheckin';
import { useAuthStore } from '@/stores/authStore';
import { useAICheckinStore } from '@/stores/aiCheckinStore';
import { AICheckinModal, AICheckinResultModal } from '@/components/ai';

interface AICheckinProviderProps {
  children: ReactNode;
}

export function AICheckinProvider({ children }: AICheckinProviderProps) {
  const { isAuthenticated } = useAuthStore();
  const { pendingCheckins } = useAICheckin();
  const { isModalOpen, showResultModal, openModal, shownCheckinIds } = useAICheckinStore();
  
  // Track if we've already tried to show a check-in this session
  const hasCheckedRef = useRef(false);

  // Check for pending check-ins when authenticated and on page load
  useEffect(() => {
    // Only run once per mount and when we have data
    if (
      !isAuthenticated || 
      isModalOpen || 
      showResultModal || 
      hasCheckedRef.current ||
      pendingCheckins.length === 0
    ) {
      return;
    }

    // Find a check-in that hasn't been shown yet
    const checkinToShow = pendingCheckins.find(
      c => !c.respondedAt && !shownCheckinIds.has(c._id)
    );

    if (checkinToShow) {
      hasCheckedRef.current = true;
      // Small delay to ensure app is mounted
      const timer = setTimeout(() => {
        openModal(checkinToShow);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, pendingCheckins, isModalOpen, showResultModal, openModal, shownCheckinIds]);

  // Reset the check flag when modal closes
  useEffect(() => {
    if (!isModalOpen && !showResultModal) {
      // Reset after a delay to allow for new check-ins via socket
      const timer = setTimeout(() => {
        hasCheckedRef.current = false;
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isModalOpen, showResultModal]);

  return (
    <>
      {children}
      <AICheckinModal />
      <AICheckinResultModal />
    </>
  );
}

