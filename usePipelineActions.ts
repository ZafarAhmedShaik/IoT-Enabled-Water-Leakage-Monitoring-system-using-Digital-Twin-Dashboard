import { useCallback } from 'react';
import { usePipelineContext } from '../context/PipelineContext';
import { dataService } from '../services/dataService';
import type {
  PipeId,
  RoutingMode,
  SensorId,
  ValveId,
} from '../types/pipeline';

/**
 * Wraps `DataService` mutations so components do not import the service directly.
 */
export function usePipelineActions() {
  const { dispatch } = usePipelineContext();

  const setValveState = useCallback(
    async (valveId: ValveId, isOpen: boolean) => {
      await dataService.setValveState(valveId, isOpen);
      dispatch({ type: 'SET_VALVE', payload: { valveId, isOpen } });
    },
    [dispatch],
  );

  const setPumpOn = useCallback(
    async (on: boolean) => {
      await dataService.setPumpOn(on);
      const health = await dataService.getSystemHealth();
      dispatch({ type: 'SET_SYSTEM_HEALTH', payload: health });
    },
    [dispatch],
  );

  const setRoutingMode = useCallback(async (mode: RoutingMode) => {
    await dataService.setRoutingMode(mode);
  }, []);

  const isolatePipe = useCallback(
    async (pipeId: PipeId) => {
      await dataService.isolatePipe(pipeId);
      const valves = await dataService.getValveStates();
      for (const v of Object.values(valves)) {
        dispatch({ type: 'SET_VALVE', payload: v });
      }
      const health = await dataService.getSystemHealth();
      dispatch({ type: 'SET_SYSTEM_HEALTH', payload: health });
    },
    [dispatch],
  );

  const applyReroute = useCallback(async () => {
    await dataService.setRoutingMode('rerouteSouth');
  }, []);

  const acknowledgeSensor = useCallback(async (sensorId: SensorId) => {
    await dataService.acknowledgeSensor(sensorId);
  }, []);

  const markReplaceSensor = useCallback(async (sensorId: SensorId) => {
    await dataService.markReplaceSensor(sensorId);
  }, []);

  return {
    setValveState,
    setPumpOn,
    setRoutingMode,
    isolatePipe,
    applyReroute,
    acknowledgeSensor,
    markReplaceSensor,
  };
}
