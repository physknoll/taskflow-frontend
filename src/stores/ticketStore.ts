import { create } from 'zustand';
import { ITicket, IClient } from '@/types';

interface TicketFilters {
  client: string | null;
  status: string | null;
  priority: string | null;
  assignedTo: string | null;
  type: string | null;
  search: string;
}

interface TicketState {
  // Selected ticket
  selectedTicket: ITicket | null;
  isDetailOpen: boolean;

  // Create/Edit modal
  isCreateModalOpen: boolean;
  editingTicket: ITicket | null;

  // Filters
  filters: TicketFilters;

  // Selected client context
  selectedClient: IClient | null;

  // Actions
  setSelectedTicket: (ticket: ITicket | null) => void;
  openDetail: (ticket: ITicket) => void;
  closeDetail: () => void;
  openCreateModal: (defaultClient?: IClient) => void;
  closeCreateModal: () => void;
  openEditModal: (ticket: ITicket) => void;
  closeEditModal: () => void;
  setFilters: (filters: Partial<TicketFilters>) => void;
  resetFilters: () => void;
  setSelectedClient: (client: IClient | null) => void;
}

const defaultFilters: TicketFilters = {
  client: null,
  status: null,
  priority: null,
  assignedTo: null,
  type: null,
  search: '',
};

export const useTicketStore = create<TicketState>((set) => ({
  selectedTicket: null,
  isDetailOpen: false,
  isCreateModalOpen: false,
  editingTicket: null,
  filters: defaultFilters,
  selectedClient: null,

  setSelectedTicket: (ticket) => set({ selectedTicket: ticket }),

  openDetail: (ticket) => set({ selectedTicket: ticket, isDetailOpen: true }),

  closeDetail: () => set({ selectedTicket: null, isDetailOpen: false }),

  openCreateModal: (defaultClient) =>
    set({
      isCreateModalOpen: true,
      editingTicket: null,
      selectedClient: defaultClient || null,
    }),

  closeCreateModal: () =>
    set({
      isCreateModalOpen: false,
      editingTicket: null,
    }),

  openEditModal: (ticket) =>
    set({
      isCreateModalOpen: true,
      editingTicket: ticket,
    }),

  closeEditModal: () =>
    set({
      isCreateModalOpen: false,
      editingTicket: null,
    }),

  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),

  resetFilters: () => set({ filters: defaultFilters }),

  setSelectedClient: (client) =>
    set({
      selectedClient: client,
      filters: { ...defaultFilters, client: client?._id || null },
    }),
}));

