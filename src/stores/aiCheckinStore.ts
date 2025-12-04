import { create } from 'zustand';
import { INotification, IAICheckinProcessingResult, IAICheckinResponse } from '@/types';
import { aiService } from '@/services/ai.service';
import toast from 'react-hot-toast';

interface AICheckinState {
  // Current check-in being displayed
  currentCheckin: INotification | null;
  isModalOpen: boolean;
  isSubmitting: boolean;
  
  // Processing result after submission
  processingResult: IAICheckinProcessingResult | null;
  showResultModal: boolean;
  
  // Track which check-in IDs we've already shown to prevent loops
  shownCheckinIds: Set<string>;
  
  // Actions
  setCurrentCheckin: (checkin: INotification | null) => void;
  openModal: (checkin: INotification) => void;
  closeModal: () => void;
  setSubmitting: (submitting: boolean) => void;
  setProcessingResult: (result: IAICheckinProcessingResult | null) => void;
  showResult: (result: IAICheckinProcessingResult) => void;
  hideResult: () => void;
  reset: () => void;
  
  // Async actions
  submitResponses: (responses: IAICheckinResponse[]) => Promise<void>;
  dismissCheckin: () => Promise<void>;
}

export const useAICheckinStore = create<AICheckinState>((set, get) => ({
  currentCheckin: null,
  isModalOpen: false,
  isSubmitting: false,
  processingResult: null,
  showResultModal: false,
  shownCheckinIds: new Set(),

  setCurrentCheckin: (checkin) => set({ currentCheckin: checkin }),

  openModal: (checkin) => {
    const { shownCheckinIds } = get();
    // Add to shown IDs to prevent re-showing
    const newShownIds = new Set(shownCheckinIds);
    newShownIds.add(checkin._id);
    
    set({ 
      currentCheckin: checkin, 
      isModalOpen: true,
      processingResult: null,
      shownCheckinIds: newShownIds,
    });
  },

  closeModal: () => set({ 
    isModalOpen: false,
  }),

  setSubmitting: (submitting) => set({ isSubmitting: submitting }),

  setProcessingResult: (result) => set({ processingResult: result }),

  showResult: (result) => set({ 
    processingResult: result, 
    showResultModal: true,
    isModalOpen: false,
    isSubmitting: false,
  }),

  hideResult: () => set({ 
    showResultModal: false,
    processingResult: null,
    currentCheckin: null,
  }),

  reset: () => set({
    currentCheckin: null,
    isModalOpen: false,
    isSubmitting: false,
    processingResult: null,
    showResultModal: false,
  }),

  submitResponses: async (responses: IAICheckinResponse[]) => {
    const { currentCheckin, showResult, setSubmitting } = get();
    if (!currentCheckin) return;
    
    setSubmitting(true);
    try {
      const result = await aiService.respondToCheckin(currentCheckin._id, responses);
      showResult(result);
      toast.success(`AI updated ${result.ticketsUpdated} ticket${result.ticketsUpdated !== 1 ? 's' : ''}!`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit check-in');
      setSubmitting(false);
    }
  },

  dismissCheckin: async () => {
    const { currentCheckin, closeModal, reset } = get();
    if (!currentCheckin) return;
    
    if (currentCheckin.isBlocking) {
      toast.error('This check-in requires a response');
      return;
    }
    
    try {
      await aiService.dismissCheckin(currentCheckin._id);
      closeModal();
      reset();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to dismiss check-in');
    }
  },
}));

