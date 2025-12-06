import { create } from 'zustand';
import { IProject, IClient, ProjectFilters as ProjectFilterValues } from '@/types';

interface ProjectFilters {
  client: string | null;
  status: string | null;
  priority: string | null;
  projectLead: string | null;
  type: string | null;
  search: string;
  isArchived: boolean;
}

interface ProjectState {
  // Selected project
  selectedProject: IProject | null;
  isDetailOpen: boolean;

  // Create/Edit modal
  isCreateModalOpen: boolean;
  editingProject: IProject | null;

  // Column settings modal
  isColumnSettingsOpen: boolean;

  // Filters
  filters: ProjectFilters;

  // Selected client context
  selectedClient: IClient | null;

  // View mode
  viewMode: 'board' | 'list';

  // Actions
  setSelectedProject: (project: IProject | null) => void;
  openDetail: (project: IProject) => void;
  closeDetail: () => void;
  openCreateModal: (defaultClient?: IClient) => void;
  closeCreateModal: () => void;
  openEditModal: (project: IProject) => void;
  closeEditModal: () => void;
  openColumnSettings: () => void;
  closeColumnSettings: () => void;
  setFilters: (filters: Partial<ProjectFilters>) => void;
  resetFilters: () => void;
  setSelectedClient: (client: IClient | null) => void;
  setViewMode: (mode: 'board' | 'list') => void;
}

const defaultFilters: ProjectFilters = {
  client: null,
  status: null,
  priority: null,
  projectLead: null,
  type: null,
  search: '',
  isArchived: false,
};

export const useProjectStore = create<ProjectState>((set) => ({
  selectedProject: null,
  isDetailOpen: false,
  isCreateModalOpen: false,
  editingProject: null,
  isColumnSettingsOpen: false,
  filters: defaultFilters,
  selectedClient: null,
  viewMode: 'board',

  setSelectedProject: (project) => set({ selectedProject: project }),

  openDetail: (project) => set({ selectedProject: project, isDetailOpen: true }),

  closeDetail: () => set({ selectedProject: null, isDetailOpen: false }),

  openCreateModal: (defaultClient) =>
    set({
      isCreateModalOpen: true,
      editingProject: null,
      selectedClient: defaultClient || null,
    }),

  closeCreateModal: () =>
    set({
      isCreateModalOpen: false,
      editingProject: null,
    }),

  openEditModal: (project) =>
    set({
      isCreateModalOpen: true,
      editingProject: project,
    }),

  closeEditModal: () =>
    set({
      isCreateModalOpen: false,
      editingProject: null,
    }),

  openColumnSettings: () => set({ isColumnSettingsOpen: true }),

  closeColumnSettings: () => set({ isColumnSettingsOpen: false }),

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

  setViewMode: (mode) => set({ viewMode: mode }),
}));


