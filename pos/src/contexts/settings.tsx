import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useAuthCtx } from '@/contexts/auth';
import {
  clearPosDefaultsFromStore,
  posDefaultsAreComplete,
  readPosDefaultsFromStore,
  writePosDefaultsToStore,
  type PosDefaults,
} from '@/lib/pos-defaults-storage';

export type { PosDefaults } from '@/lib/pos-defaults-storage';
export {
  POS_DEFAULTS_STORE_KEY,
  clearPosDefaultsFromStore,
  posDefaultsAreComplete,
  readPosDefaultsFromStore,
  writePosDefaultsToStore,
} from '@/lib/pos-defaults-storage';

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
  const { state } = useAuthCtx();
  const [defaults, setDefaultsState] = useState<PosDefaults | null>(null);
  const [isReady, setIsReady] = useState(false);

  const refresh = useCallback(async () => {
    if (state.status !== 'authenticated') {
      setDefaultsState(null);
      setIsReady(true);
      return;
    }
    setIsReady(false);
    const loaded = await readPosDefaultsFromStore();
    setDefaultsState(loaded);
    setIsReady(true);
  }, [state.status]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const setDefaultsPersist = useCallback(async (next: PosDefaults) => {
    await writePosDefaultsToStore(next);
    setDefaultsState(await readPosDefaultsFromStore());
  }, []);

  const clearDefaults = useCallback(async () => {
    await clearPosDefaultsFromStore();
    setDefaultsState(null);
  }, []);

  const isComplete = useMemo(() => posDefaultsAreComplete(defaults), [defaults]);

  const value = useMemo(
    () => ({
      defaults,
      isReady,
      isComplete,
      setDefaults: setDefaultsPersist,
      clearDefaults,
      refresh,
    }),
    [defaults, isReady, isComplete, setDefaultsPersist, clearDefaults, refresh]
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
