import { create } from 'zustand';
import { ICheckInSession, ISessionMessage, SessionStatus, IAIPMCheckInCompletedPayload } from '@/types/aipm';

interface AIPMState {
  // Active check-in session
  activeSession: ICheckInSession | null;
  isCheckInModalOpen: boolean;
  isSendingMessage: boolean;

  // Check-in result modal
  checkInResult: IAIPMCheckInCompletedPayload | null;
  showResultModal: boolean;

  // Actions
  setActiveSession: (session: ICheckInSession | null) => void;
  openCheckInModal: (session: ICheckInSession) => void;
  closeCheckInModal: () => void;
  setSendingMessage: (sending: boolean) => void;
  
  // Add message to active session (optimistic update)
  addMessage: (message: ISessionMessage) => void;
  updateSessionStatus: (status: SessionStatus) => void;
  
  // Result modal
  showResult: (result: IAIPMCheckInCompletedPayload) => void;
  hideResult: () => void;
  
  // Reset state
  reset: () => void;
}

const initialState = {
  activeSession: null,
  isCheckInModalOpen: false,
  isSendingMessage: false,
  checkInResult: null,
  showResultModal: false,
};

export const useAIPMStore = create<AIPMState>((set, get) => ({
  ...initialState,

  setActiveSession: (session) => set({ activeSession: session }),

  openCheckInModal: (session) => set({ 
    activeSession: session, 
    isCheckInModalOpen: true 
  }),

  closeCheckInModal: () => set({ 
    isCheckInModalOpen: false 
  }),

  setSendingMessage: (sending) => set({ isSendingMessage: sending }),

  addMessage: (message) => {
    const { activeSession } = get();
    if (!activeSession) return;
    
    set({
      activeSession: {
        ...activeSession,
        messages: [...activeSession.messages, message],
      },
    });
  },

  updateSessionStatus: (status) => {
    const { activeSession } = get();
    if (!activeSession) return;
    
    set({
      activeSession: {
        ...activeSession,
        status,
      },
    });
  },

  showResult: (result) => set({ 
    checkInResult: result, 
    showResultModal: true,
    isCheckInModalOpen: false,
  }),

  hideResult: () => set({ 
    checkInResult: null, 
    showResultModal: false,
    activeSession: null,
  }),

  reset: () => set(initialState),
}));

