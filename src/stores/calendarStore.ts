import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  CalendarViewType,
  CalendarEventType,
  CalendarEvent,
  CalendarFilterState,
  CreateEventSlot,
} from '@/types/calendar';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  startOfDay,
  endOfDay,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
} from 'date-fns';

// Default filter state
const defaultFilters: CalendarFilterState = {
  projectIds: [],
  clientIds: [],
  assigneeIds: [],
  eventTypes: [],
  showCompleted: false,
  showExternal: true,
};

interface CalendarState {
  // View state
  selectedDate: Date;
  viewType: CalendarViewType;

  // Filters
  filters: CalendarFilterState;

  // Modal state
  selectedEvent: CalendarEvent | null;
  isEventModalOpen: boolean;
  isCreating: boolean;
  createEventSlot: CreateEventSlot | null;

  // Filter panel
  isFilterPanelOpen: boolean;

  // Loading state (managed by hooks, but tracked here for UI)
  isLoading: boolean;

  // Actions
  setSelectedDate: (date: Date) => void;
  setViewType: (view: CalendarViewType) => void;
  navigateNext: () => void;
  navigatePrev: () => void;
  navigateToday: () => void;
  setFilters: (filters: Partial<CalendarFilterState>) => void;
  resetFilters: () => void;
  toggleFilterPanel: () => void;
  setFilterPanelOpen: (open: boolean) => void;

  // Event modal actions
  openEventModal: (event?: CalendarEvent, slot?: CreateEventSlot) => void;
  closeEventModal: () => void;
  setSelectedEvent: (event: CalendarEvent | null) => void;

  // Loading
  setIsLoading: (loading: boolean) => void;

  // Helper to get date range for current view
  getDateRange: () => { start: Date; end: Date };
}

export const useCalendarStore = create<CalendarState>()(
  persist(
    (set, get) => ({
      // Initial state
      selectedDate: new Date(),
      viewType: 'month',
      filters: defaultFilters,
      selectedEvent: null,
      isEventModalOpen: false,
      isCreating: false,
      createEventSlot: null,
      isFilterPanelOpen: false,
      isLoading: false,

      // Set selected date
      setSelectedDate: (date: Date) => set({ selectedDate: date }),

      // Set view type
      setViewType: (view: CalendarViewType) => set({ viewType: view }),

      // Navigate to next period based on view type
      navigateNext: () => {
        const { viewType, selectedDate } = get();
        let newDate: Date;

        switch (viewType) {
          case 'month':
            newDate = addMonths(selectedDate, 1);
            break;
          case 'week':
            newDate = addWeeks(selectedDate, 1);
            break;
          case 'day':
          case 'agenda':
            newDate = addDays(selectedDate, 1);
            break;
          default:
            newDate = addMonths(selectedDate, 1);
        }

        set({ selectedDate: newDate });
      },

      // Navigate to previous period based on view type
      navigatePrev: () => {
        const { viewType, selectedDate } = get();
        let newDate: Date;

        switch (viewType) {
          case 'month':
            newDate = subMonths(selectedDate, 1);
            break;
          case 'week':
            newDate = subWeeks(selectedDate, 1);
            break;
          case 'day':
          case 'agenda':
            newDate = subDays(selectedDate, 1);
            break;
          default:
            newDate = subMonths(selectedDate, 1);
        }

        set({ selectedDate: newDate });
      },

      // Navigate to today
      navigateToday: () => set({ selectedDate: new Date() }),

      // Update filters
      setFilters: (newFilters: Partial<CalendarFilterState>) =>
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        })),

      // Reset filters to default
      resetFilters: () => set({ filters: defaultFilters }),

      // Toggle filter panel
      toggleFilterPanel: () =>
        set((state) => ({ isFilterPanelOpen: !state.isFilterPanelOpen })),

      // Set filter panel open state
      setFilterPanelOpen: (open: boolean) => set({ isFilterPanelOpen: open }),

      // Open event modal
      openEventModal: (event?: CalendarEvent, slot?: CreateEventSlot) => {
        set({
          isEventModalOpen: true,
          selectedEvent: event || null,
          isCreating: !event,
          createEventSlot: slot || null,
        });
      },

      // Close event modal
      closeEventModal: () =>
        set({
          isEventModalOpen: false,
          selectedEvent: null,
          isCreating: false,
          createEventSlot: null,
        }),

      // Set selected event (for preview/detail without modal)
      setSelectedEvent: (event: CalendarEvent | null) =>
        set({ selectedEvent: event }),

      // Set loading state
      setIsLoading: (loading: boolean) => set({ isLoading: loading }),

      // Get date range for current view
      getDateRange: () => {
        const { viewType, selectedDate } = get();
        let start: Date;
        let end: Date;

        switch (viewType) {
          case 'month':
            // Include days from prev/next month that appear in the grid
            start = startOfWeek(startOfMonth(selectedDate), { weekStartsOn: 0 });
            end = endOfWeek(endOfMonth(selectedDate), { weekStartsOn: 0 });
            break;
          case 'week':
            start = startOfWeek(selectedDate, { weekStartsOn: 0 });
            end = endOfWeek(selectedDate, { weekStartsOn: 0 });
            break;
          case 'day':
            start = startOfDay(selectedDate);
            end = endOfDay(selectedDate);
            break;
          case 'agenda':
            // Agenda shows 14 days by default
            start = startOfDay(selectedDate);
            end = endOfDay(addDays(selectedDate, 14));
            break;
          default:
            start = startOfMonth(selectedDate);
            end = endOfMonth(selectedDate);
        }

        return { start, end };
      },
    }),
    {
      name: 'taskflow-calendar',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist view preferences, not modal state
        viewType: state.viewType,
        filters: state.filters,
      }),
      // Handle date serialization
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Reset selectedDate to today on rehydration
          state.selectedDate = new Date();
        }
      },
    }
  )
);

// Selector hooks for common patterns
export const useCalendarView = () =>
  useCalendarStore((state) => ({
    selectedDate: state.selectedDate,
    viewType: state.viewType,
    setSelectedDate: state.setSelectedDate,
    setViewType: state.setViewType,
    navigateNext: state.navigateNext,
    navigatePrev: state.navigatePrev,
    navigateToday: state.navigateToday,
    getDateRange: state.getDateRange,
  }));

export const useCalendarFilters = () =>
  useCalendarStore((state) => ({
    filters: state.filters,
    setFilters: state.setFilters,
    resetFilters: state.resetFilters,
    isFilterPanelOpen: state.isFilterPanelOpen,
    toggleFilterPanel: state.toggleFilterPanel,
    setFilterPanelOpen: state.setFilterPanelOpen,
  }));

export const useCalendarEventModal = () =>
  useCalendarStore((state) => ({
    isEventModalOpen: state.isEventModalOpen,
    selectedEvent: state.selectedEvent,
    isCreating: state.isCreating,
    createEventSlot: state.createEventSlot,
    openEventModal: state.openEventModal,
    closeEventModal: state.closeEventModal,
    setSelectedEvent: state.setSelectedEvent,
  }));

