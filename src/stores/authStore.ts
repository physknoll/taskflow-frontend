import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { IUser } from '@/types';
import { setTokens, clearTokens } from '@/services/api';

interface AuthState {
  user: IUser | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setUser: (user: IUser) => void;
  setTokens: (token: string, refreshToken: string) => void;
  updateUser: (updates: Partial<IUser>) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: true,

      setUser: (user) => {
        set({ user, isAuthenticated: true, isLoading: false });
      },

      setTokens: (token, refreshToken) => {
        setTokens(token, refreshToken);
        set({ token, refreshToken });
      },

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      logout: () => {
        clearTokens();
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'taskflow-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Sync tokens with API service after rehydration
          if (state.token && state.refreshToken) {
            setTokens(state.token, state.refreshToken);
          }
          state.setLoading(false);
        }
      },
    }
  )
);


