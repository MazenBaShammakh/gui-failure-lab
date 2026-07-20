import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Global baseline / faulty switch for the GUI Failure Lab.
 *
 * The whole app renders the same realistic screens; this single flag decides
 * whether each screen shows its correct (baseline) or defective (faulty)
 * variant. It is intentionally NOT part of the URL or navigation — an agent
 * navigates the app like a real user and never has to know the mode exists.
 *
 * Persistence:
 *   - Web:    read/written synchronously to localStorage['gui-lab:mode'] so the
 *             very first render already reflects the persisted mode (no flash).
 *             A harness can also pre-seed that key before load.
 *   - Native: hydrated from AsyncStorage after mount (starts at the default).
 *
 * The mode is flipped from the Settings screen via setMode().
 */

export type FaultMode = 'baseline' | 'faulty';

export const STORAGE_KEY = 'gui-lab:mode';
const DEFAULT_MODE: FaultMode = 'baseline';

function isFaultMode(value: unknown): value is FaultMode {
  return value === 'baseline' || value === 'faulty';
}

function readInitialMode(): FaultMode {
  if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (isFaultMode(stored)) return stored;
  }
  return DEFAULT_MODE;
}

interface FaultModeContextValue {
  mode: FaultMode;
  faultActive: boolean;
  setMode: (mode: FaultMode) => void;
}

const FaultModeContext = createContext<FaultModeContextValue | null>(null);

export function FaultModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<FaultMode>(readInitialMode);

  // Native only: web already read synchronously in readInitialMode().
  useEffect(() => {
    if (Platform.OS === 'web') return;
    let cancelled = false;
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (!cancelled && isFaultMode(stored)) setModeState(stored);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const setMode = useCallback((next: FaultMode) => {
    setModeState(next);
    if (Platform.OS === 'web') {
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // ignore (private mode / unavailable storage)
      }
    } else {
      AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
    }
  }, []);

  const value = useMemo<FaultModeContextValue>(
    () => ({ mode, faultActive: mode === 'faulty', setMode }),
    [mode, setMode],
  );

  return <FaultModeContext.Provider value={value}>{children}</FaultModeContext.Provider>;
}

export function useFaultModeContext(): FaultModeContextValue {
  const ctx = useContext(FaultModeContext);
  if (!ctx) {
    throw new Error('useFaultMode must be used within a FaultModeProvider');
  }
  return ctx;
}

/** Most screens only need the boolean. */
export function useFaultMode(): boolean {
  return useFaultModeContext().faultActive;
}
