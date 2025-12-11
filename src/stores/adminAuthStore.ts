import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { IAdminUser } from '@/types/admin';
import { setAdminToken, clearAdminToken } from '@/services/admin/api';

interface AdminAuthState {
  user: IAdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  _hasHydrated: boolean;

  setUser: (user: IAdminUser) => void;
  setToken: (token: string) => void;
  updateUser: (updates: Partial<IAdminUser>) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  setHasHydrated: (state: boolean) => void;
}

export const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,
      _hasHydrated: false,

      setUser: (user) => {
        set({ user, isAuthenticated: true, isLoading: false });
      },

      setToken: (token) => {
        setAdminToken(token);
        set({ token });
      },

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      logout: () => {
        clearAdminToken();
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      setLoading: (loading) => set({ isLoading: loading }),
      
      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: 'taskflow-admin-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHasHydrated(true);
          // Sync token with API service after rehydration
          if (state.token) {
            setAdminToken(state.token);
            // Keep isLoading: true if we have token - useAdminAuth will fetch user
          } else {
            // No token = definitely not authenticated
            state.setLoading(false);
          }
        }
      },
    }
  )
);
