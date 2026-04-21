import { useEffect, useRef } from 'react';
import { HISTORY_LENGTH, PIPE_IDS } from '../config/pipeline';
import { usePipelineContext } from '../context/PipelineContext';
import { useSettings } from '../context/SettingsContext';
import { dataService } from '../services/dataService';
import { applyThresholdToReadings } from '../utils/flowStatus';
import { FlowStatus, type SensorHistory, type SensorId } from '../types/pipeline';

/**
 * Polls the `DataService`, keeps history in sync, applies the configurable flow threshold, and raises/clears alerts.
 */
export function usePipelineData(): void {
  const { dispatch, state } = usePipelineContext();
  const { flowThresholdLpm, pollIntervalMs } = useSettings();

  const stateRef = useRef(state);
  const prevStatusRef = useRef<Partial<Record<SensorId, FlowStatus>>>({});

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    if (stateRef.current.lastUpdated === 0) {
      return;
    }
    const updated = applyThresholdToReadings(
      stateRef.current.sensors,
      flowThresholdLpm,
    );
    dispatch({
      type: 'SET_READINGS',
      payload: updated,
    });
    for (const pipeId of PIPE_IDS) {
      const sensorId = `S${pipeId}` as SensorId;
      prevStatusRef.current[sensorId] = updated[sensorId].status;
    }
  }, [flowThresholdLpm, dispatch]);

  useEffect(() => {
    let cancelled = false;

    async function poll(): Promise<void> {
      try {
        const raw = await dataService.getLatestReadings();
        if (cancelled) {
          return;
        }

        const sensors = applyThresholdToReadings(raw, flowThresholdLpm);

        const historyPairs = await Promise.all(
          PIPE_IDS.map(async (pipeId) => {
            const sensorId = `S${pipeId}` as SensorId;
            const history = await dataService.getHistory(
              sensorId,
              HISTORY_LENGTH,
            );
            return [sensorId, history] as const;
          }),
        );
        if (cancelled) {
          return;
        }

        const history = {} as Record<SensorId, SensorHistory>;
        for (const [sensorId, h] of historyPairs) {
          history[sensorId] = h;
        }

        const lastUpdated = Date.now();

        const valveStates = await dataService.getValveStates();
        const systemHealth = await dataService.getSystemHealth();

        dispatch({
          type: 'APPLY_POLL',
          payload: { sensors, history, lastUpdated },
        });

        for (const vs of Object.values(valveStates)) {
          dispatch({ type: 'SET_VALVE', payload: vs });
        }
        dispatch({ type: 'SET_SYSTEM_HEALTH', payload: systemHealth });

        const activePipeIds = new Set(
          stateRef.current.alerts
            .filter((a) => a.resolvedAt === undefined)
            .map((a) => a.pipeId),
        );

        for (const pipeId of PIPE_IDS) {
          const sensorId = `S${pipeId}` as SensorId;
          const prev = prevStatusRef.current[sensorId] ?? FlowStatus.UNKNOWN;
          const next = sensors[sensorId].status;

          if (prev !== FlowStatus.CRITICAL && next === FlowStatus.CRITICAL) {
            if (!activePipeIds.has(pipeId)) {
              activePipeIds.add(pipeId);
              dispatch({
                type: 'ADD_ALERT',
                payload: {
                  id: `leak-${pipeId}-${lastUpdated}`,
                  pipeId,
                  sensorId,
                  severity: 'critical',
                  message: `Low flow: ${sensors[sensorId].flowRate.toFixed(1)} L/min`,
                  triggeredAt: lastUpdated,
                },
              });
            }
          } else if (
            prev === FlowStatus.CRITICAL &&
            next !== FlowStatus.CRITICAL
          ) {
            dispatch({ type: 'RESOLVE_ALERTS_FOR_PIPE', payload: { pipeId } });
            activePipeIds.delete(pipeId);
          }

          prevStatusRef.current[sensorId] = next;
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Data fetch failed';
        dispatch({ type: 'SET_ERROR', payload: message });
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    void poll();
    const timer = window.setInterval(() => void poll(), pollIntervalMs);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [dispatch, flowThresholdLpm, pollIntervalMs]);
}
