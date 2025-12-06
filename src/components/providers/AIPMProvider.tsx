'use client';

import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { useAIPMStore } from '@/stores/aipmStore';
import {
  getSocket,
  AIPM_SOCKET_EVENTS,
  AIPMCheckInStartedData,
  AIPMCheckInMessageData,
  AIPMCheckInCompletedData,
  AIPMSessionFlaggedData,
  AIPMReportGeneratedData,
} from '@/lib/socket';
import { aipmService } from '@/services/aipm.service';
import { ISessionMessage } from '@/types/aipm';
import toast from 'react-hot-toast';

interface AIPMProviderProps {
  children: React.ReactNode;
}

export function AIPMProvider({ children }: AIPMProviderProps) {
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const { 
    openCheckInModal, 
    addMessage, 
    updateSessionStatus, 
    showResult,
    setActiveSession 
  } = useAIPMStore();

  // Handle check-in started event
  const handleCheckInStarted = useCallback(
    async (data: AIPMCheckInStartedData) => {
      console.log('🤖 AIPM Check-in started:', data.sessionId);
      
      try {
        // Fetch the full session data
        const session = await aipmService.getActiveSession();
        
        if (session) {
          setActiveSession(session);
          openCheckInModal(session);
          
          toast.custom((t) => (
            <div className="bg-white dark:bg-surface-800 px-6 py-4 rounded-2xl shadow-2xl border border-primary-200 dark:border-primary-800 flex items-center gap-4">
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-surface-900 dark:text-white">
                  Time for your check-in!
                </p>
                <p className="text-sm text-surface-500">
                  {data.message}
                </p>
              </div>
            </div>
          ), {
            duration: 10000,
            position: 'top-right',
          });
        }
      } catch (error) {
        console.error('Failed to fetch session:', error);
      }
    },
    [setActiveSession, openCheckInModal]
  );

  // Handle new message event
  const handleCheckInMessage = useCallback(
    (data: AIPMCheckInMessageData) => {
      console.log('🤖 AIPM message received:', data.sessionId);
      
      // Add the AI message to the store
      const aiMessage: ISessionMessage = {
        role: 'aipm',
        content: data.message,
        timestamp: new Date().toISOString(),
      };
      addMessage(aiMessage);
      updateSessionStatus(data.status);
    },
    [addMessage, updateSessionStatus]
  );

  // Handle check-in completed event
  const handleCheckInCompleted = useCallback(
    (data: AIPMCheckInCompletedData) => {
      console.log('🤖 AIPM Check-in completed:', data.sessionId);
      
      // Show the result modal
      showResult({
        sessionId: data.sessionId,
        summary: data.summary,
        sentiment: data.sentiment,
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['aipm'] });
    },
    [showResult, queryClient]
  );

  // Handle session flagged event (for managers)
  const handleSessionFlagged = useCallback(
    (data: AIPMSessionFlaggedData) => {
      console.log('⚠️ AIPM Session flagged:', data.sessionId);
      
      // Invalidate flagged sessions query
      queryClient.invalidateQueries({ queryKey: ['aipm', 'sessions', 'flagged'] });
      
      toast.custom((t) => (
        <div className="bg-amber-50 dark:bg-amber-900/80 px-6 py-4 rounded-2xl shadow-2xl border border-amber-200 dark:border-amber-700 flex items-center gap-4">
          <div className="p-2 rounded-xl bg-amber-500">
            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-amber-800 dark:text-amber-200">
              Check-in needs attention
            </p>
            <p className="text-sm text-amber-600 dark:text-amber-300">
              {data.reason || 'A team member may need support'}
            </p>
          </div>
        </div>
      ), {
        duration: 8000,
        position: 'top-right',
      });
    },
    [queryClient]
  );

  // Handle report generated event
  const handleReportGenerated = useCallback(
    (data: AIPMReportGeneratedData) => {
      console.log('📊 AIPM Report generated:', data.reportId);
      
      // Invalidate reports query
      queryClient.invalidateQueries({ queryKey: ['aipm', 'reports'] });
      
      const isDaily = data.type === 'daily_digest';
      
      toast.custom((t) => (
        <div className="bg-white dark:bg-surface-800 px-6 py-4 rounded-2xl shadow-2xl border border-surface-200 dark:border-surface-700 flex items-center gap-4">
          <div className={`p-2 rounded-xl ${isDaily ? 'bg-primary-500' : 'bg-accent-500'}`}>
            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-surface-900 dark:text-white">
              {isDaily ? 'Daily Digest' : 'Weekly Report'} ready
            </p>
            <p className="text-sm text-surface-500">
              {data.title}
            </p>
          </div>
        </div>
      ), {
        duration: 6000,
        position: 'top-right',
      });
    },
    [queryClient]
  );

  // Set up socket listeners
  useEffect(() => {
    if (!isAuthenticated) return;

    const socket = getSocket();
    if (!socket) return;

    // Register event listeners
    socket.on(AIPM_SOCKET_EVENTS.CHECKIN_STARTED, handleCheckInStarted);
    socket.on(AIPM_SOCKET_EVENTS.CHECKIN_MESSAGE, handleCheckInMessage);
    socket.on(AIPM_SOCKET_EVENTS.CHECKIN_COMPLETED, handleCheckInCompleted);
    socket.on(AIPM_SOCKET_EVENTS.SESSION_FLAGGED, handleSessionFlagged);
    socket.on(AIPM_SOCKET_EVENTS.REPORT_GENERATED, handleReportGenerated);

    // Cleanup
    return () => {
      socket.off(AIPM_SOCKET_EVENTS.CHECKIN_STARTED, handleCheckInStarted);
      socket.off(AIPM_SOCKET_EVENTS.CHECKIN_MESSAGE, handleCheckInMessage);
      socket.off(AIPM_SOCKET_EVENTS.CHECKIN_COMPLETED, handleCheckInCompleted);
      socket.off(AIPM_SOCKET_EVENTS.SESSION_FLAGGED, handleSessionFlagged);
      socket.off(AIPM_SOCKET_EVENTS.REPORT_GENERATED, handleReportGenerated);
    };
  }, [
    isAuthenticated,
    handleCheckInStarted,
    handleCheckInMessage,
    handleCheckInCompleted,
    handleSessionFlagged,
    handleReportGenerated,
  ]);

  return <>{children}</>;
}

