import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';
import {
  posDefaultsAreComplete,
  type PosDefaults,
} from '@/lib/pos-defaults-storage';
import { useAppStore } from '@/store/use-app-store';

export type { PosDefaults } from '@/lib/pos-defaults-storage';

type SettingsContextValue = {
  defaults: PosDefaults | null;
  isReady: boolean;
  isComplete: boolean;
  setDefaults: (next: PosDefaults) => Promise<void>;
  clearDefaults: () => Promise<void>;
  refresh: () => Promise<void>;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const store = useAppStore();

  const refresh = useCallback(async () => {
    // With Zustand persist, "refresh" is mostly handled by rehydration.
    // If we need to re-read from store for some reason, it's already in state.
  }, []);

  const setDefaultsPersist = useCallback(async (next: PosDefaults) => {
    store.setPosDefaults(next);
  }, [store.setPosDefaults]);

  const clearDefaults = useCallback(async () => {
    store.setPosDefaults(null);
  }, [store.setPosDefaults]);

  const isComplete = useMemo(() => posDefaultsAreComplete(store.posDefaults), [store.posDefaults]);

  const value = useMemo(
    () => ({
      defaults: store.posDefaults,
      isReady: store.status !== 'loading',
      isComplete,
      setDefaults: setDefaultsPersist,
      clearDefaults,
      refresh,
    }),
    [store.posDefaults, store.status, isComplete, setDefaultsPersist, clearDefaults, refresh]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function usePosSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error('usePosSettings must be used within SettingsProvider');
  }
  return ctx;
}
