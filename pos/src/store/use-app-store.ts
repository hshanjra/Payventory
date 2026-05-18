import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { secureStorage } from './secure-storage';
import { PosDefaults } from '@/lib/pos-defaults-storage';

export interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  status: 'loading' | 'unauthenticated' | 'authenticated';
  user: User | null;
  userEmail: string | null;
  apiKey: string | null;
  isAppLocked: boolean;
  hasAppLockSetup: boolean;
}

interface SettingsState {
  posDefaults: PosDefaults | null;
}

interface AppState extends AuthState, SettingsState {
  draftOrderId: string | null;
  medusaUrl: string | null;

  // Auth Actions
  setAuth: (auth: Partial<AuthState>) => void;
  login: (user: User, apiKey: string, userEmail: string, hasAppLockSetup: boolean) => void;
  logout: () => void;
  setAppLocked: (isLocked: boolean) => void;
  setHasAppLockSetup: (hasSetup: boolean) => void;

  // Settings Actions
  setPosDefaults: (defaults: PosDefaults | null) => void;

  // Misc Actions
  setDraftOrderId: (id: string | null) => void;
  setMedusaUrl: (url: string | null) => void;
  reset: () => void;
}

const initialState: AuthState & SettingsState & { draftOrderId: string | null; medusaUrl: string | null } = {
  status: 'loading',
  user: null,
  userEmail: null,
  apiKey: null,
  isAppLocked: false,
  hasAppLockSetup: false,
  posDefaults: null,
  draftOrderId: null,
  medusaUrl: process.env.EXPO_PUBLIC_MEDUSA_URL || null,
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      ...initialState,

      setAuth: (auth) => set((state) => ({ ...state, ...auth })),
      
      login: (user, apiKey, userEmail, hasAppLockSetup) =>
        set({
          status: 'authenticated',
          user,
          apiKey,
          userEmail,
          hasAppLockSetup,
          isAppLocked: false,
        }),

      logout: () =>
        set({
          status: 'unauthenticated',
          user: null,
          apiKey: null,
          isAppLocked: false,
          posDefaults: null,
          draftOrderId: null,
        }),

      setAppLocked: (isAppLocked) => set({ isAppLocked }),
      
      setHasAppLockSetup: (hasAppLockSetup) => set({ hasAppLockSetup }),

      setPosDefaults: (posDefaults) => set({ posDefaults }),

      setDraftOrderId: (draftOrderId) => set({ draftOrderId }),

      setMedusaUrl: (medusaUrl) => set({ medusaUrl }),

      reset: () => set(initialState),
    }),
    {
      name: 'app-state',
      storage: createJSONStorage(() => secureStorage),
      // Only persist these fields
      partialize: (state) => ({
        user: state.user,
        userEmail: state.userEmail,
        apiKey: state.apiKey,
        hasAppLockSetup: state.hasAppLockSetup,
        posDefaults: state.posDefaults,
        draftOrderId: state.draftOrderId,
        medusaUrl: state.medusaUrl,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // After rehydration, determine the status
          if (state.apiKey && state.user) {
            state.status = 'authenticated';
            // If they have app lock setup, lock it by default on app start
            if (state.hasAppLockSetup) {
              state.isAppLocked = true;
            }
          } else {
            state.status = 'unauthenticated';
          }
        }
      },
    }
  )
);
