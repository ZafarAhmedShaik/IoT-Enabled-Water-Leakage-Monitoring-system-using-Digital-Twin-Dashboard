/* Settings context exports a hook — same Fast Refresh exception as pipeline context. */
/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  DEFAULT_FLOW_THRESHOLD_LPM,
  FLOW_THRESHOLD_SLIDER_MAX,
  FLOW_THRESHOLD_SLIDER_MIN,
  FLOW_THRESHOLD_SLIDER_STEP,
  POLL_INTERVAL_MS,
} from '../config/pipeline';

export type DisplayFlowUnit = 'lpm' | 'm3h';

export type SettingsContextValue = {
  flowThresholdLpm: number;
  setFlowThresholdLpm: (value: number) => void;
  flowThresholdMin: number;
  flowThresholdMax: number;
  flowThresholdStep: number;
  pollIntervalMs: number;
  setPollIntervalMs: (value: number) => void;
  displayFlowUnit: DisplayFlowUnit;
  setDisplayFlowUnit: (value: DisplayFlowUnit) => void;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

/**
 * Holds user-tunable dashboard parameters — kept in memory only (no `localStorage`).
 */
export function SettingsProvider({ children }: { children: ReactNode }) {
  const [flowThresholdLpm, setFlowThresholdLpm] = useState<number>(
    DEFAULT_FLOW_THRESHOLD_LPM,
  );
  const [pollIntervalMs, setPollIntervalMs] =
    useState<number>(POLL_INTERVAL_MS);
  const [displayFlowUnit, setDisplayFlowUnit] =
    useState<DisplayFlowUnit>('lpm');

  const value = useMemo(
    () => ({
      flowThresholdLpm,
      setFlowThresholdLpm,
      flowThresholdMin: FLOW_THRESHOLD_SLIDER_MIN,
      flowThresholdMax: FLOW_THRESHOLD_SLIDER_MAX,
      flowThresholdStep: FLOW_THRESHOLD_SLIDER_STEP,
      pollIntervalMs,
      setPollIntervalMs,
      displayFlowUnit,
      setDisplayFlowUnit,
    }),
    [flowThresholdLpm, pollIntervalMs, displayFlowUnit],
  );

  return (
    <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
  );
}

/**
 * Access to flow threshold, poll interval, and display unit for controls and data hooks.
 */
export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return ctx;
}
