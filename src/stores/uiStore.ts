import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';
type TicketViewMode = 'board' | 'list' | 'calendar';

interface UIState {
  // Sidebar
  sidebarCollapsed: boolean;
  sidebarOpen: boolean; // For mobile

  // Theme
  theme: Theme;

  // Ticket view
  ticketViewMode: TicketViewMode;

  // Modals
  modals: {
    createTicket: boolean;
    createClient: boolean;
    createUser: boolean;
    aiChat: boolean;
    dailyUpdate: boolean;
  };

  // Actions
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: Theme) => void;
  setTicketViewMode: (mode: TicketViewMode) => void;
  openModal: (modal: keyof UIState['modals']) => void;
  closeModal: (modal: keyof UIState['modals']) => void;
  closeAllModals: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      sidebarOpen: false,
      theme: 'system',
      ticketViewMode: 'board',
      modals: {
        createTicket: false,
        createClient: false,
        createUser: false,
        aiChat: false,
        dailyUpdate: false,
      },

      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      setTheme: (theme) => {
        set({ theme });
        // Apply theme to document using data-theme attribute
        if (typeof document !== 'undefined') {
          const root = document.documentElement;

          if (theme === 'system') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
              ? 'dark'
              : 'light';
            root.setAttribute('data-theme', systemTheme);
          } else {
            root.setAttribute('data-theme', theme);
          }
        }
      },

      setTicketViewMode: (mode) => set({ ticketViewMode: mode }),

      openModal: (modal) =>
        set((state) => ({
          modals: { ...state.modals, [modal]: true },
        })),

      closeModal: (modal) =>
        set((state) => ({
          modals: { ...state.modals, [modal]: false },
        })),

      closeAllModals: () =>
        set({
          modals: {
            createTicket: false,
            createClient: false,
            createUser: false,
            aiChat: false,
            dailyUpdate: false,
          },
        }),
    }),
    {
      name: 'taskflow-ui',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        theme: state.theme,
        ticketViewMode: state.ticketViewMode,
      }),
    }
  )
);
