import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { PIPE_IDS } from '../config/pipeline';
import type { SensorId } from '../types/pipeline';

export interface ChartSensorSelectionContextValue {
  readonly selectedSensors: readonly SensorId[];
  setSelectedSensors: (next: readonly SensorId[]) => void;
  /** Toggle whether a sensor trace is selected (flow chart + canvas highlight). */
  toggleSensor: (sensorId: SensorId) => void;
  isSensorSelected: (sensorId: SensorId) => boolean;
}

const ChartSensorSelectionContext =
  createContext<ChartSensorSelectionContextValue | null>(null);

const defaultSelected = PIPE_IDS.map((id) => `S${id}` as SensorId);

/**
 * Holds which sensors are selected for the flow chart; the pipeline canvas uses the same set for highlights.
 */
export function ChartSensorSelectionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [selectedSensors, setSelectedSensors] =
    useState<readonly SensorId[]>(defaultSelected);

  const toggleSensor = useCallback((sensorId: SensorId) => {
    setSelectedSensors((prev) => {
      const set = new Set(prev);
      if (set.has(sensorId)) {
        set.delete(sensorId);
      } else {
        set.add(sensorId);
      }
      return Array.from(set);
    });
  }, []);

  const isSensorSelected = useCallback(
    (sensorId: SensorId) => selectedSensors.includes(sensorId),
    [selectedSensors],
  );

  const value = useMemo(
    (): ChartSensorSelectionContextValue => ({
      selectedSensors,
      setSelectedSensors,
      toggleSensor,
      isSensorSelected,
    }),
    [selectedSensors, toggleSensor, isSensorSelected],
  );

  return (
    <ChartSensorSelectionContext.Provider value={value}>
      {children}
    </ChartSensorSelectionContext.Provider>
  );
}

/**
 * Access flow-chart sensor selection (must be inside `ChartSensorSelectionProvider`).
 */
export function useChartSensorSelection(): ChartSensorSelectionContextValue {
  const ctx = useContext(ChartSensorSelectionContext);
  if (!ctx) {
    throw new Error(
      'useChartSensorSelection must be used within ChartSensorSelectionProvider',
    );
  }
  return ctx;
}
