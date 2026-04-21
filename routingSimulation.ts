import { PIPE_IDS } from '../config/pipeline';
import {
  FlowStatus,
  type RoutingMode,
  type SensorId,
  type SensorReading,
  type ValveId,
  type ValveState,
} from '../types/pipeline';
import { VALVE_AFFECTED_PIPES } from './valvePipeMap';
import { getPumpOn, getRoutingModeSnapshot } from './valveStore';

/**
 * Applies valve closure + routing mode multipliers to mock readings (deterministic per tick).
 */
export function applyValveAndRouting(
  readings: Record<SensorId, SensorReading>,
  valves: Record<ValveId, ValveState>,
): Record<SensorId, SensorReading> {
  const mode = getRoutingModeSnapshot();
  const next = {} as Record<SensorId, SensorReading>;

  for (const pipeId of PIPE_IDS) {
    const sensorId = `S${pipeId}` as SensorId;
    const base = readings[sensorId];
    let mult = 1;

    for (const [vid, state] of Object.entries(valves) as [ValveId, ValveState][]) {
      if (!state.isOpen) {
        const affected = VALVE_AFFECTED_PIPES[vid];
        if (affected?.includes(pipeId)) {
          mult *= 0.06;
        }
      }
    }

    mult *= routingBranchMultiplier(pipeId, mode);
    if (!getPumpOn()) {
      mult *= 0.02;
    }

    const flowRate = Math.max(0.2, base.flowRate * mult);
    const pressureKpa = Math.max(
      14,
      Math.min(96, base.pressureKpa * mult + (Math.random() - 0.5) * 0.4),
    );

    next[sensorId] = {
      ...base,
      flowRate,
      pressureKpa,
      status: FlowStatus.NORMAL,
      pressureStatus: FlowStatus.NORMAL,
    };
  }

  return next;
}

function routingBranchMultiplier(pipeId: number, mode: RoutingMode): number {
  if (mode === 'default') {
    return 1;
  }
  if (mode === 'rerouteNorth') {
    if ([1, 2, 3, 4, 6, 8].includes(pipeId)) {
      return 1.12;
    }
    if ([9, 10, 11, 12, 13].includes(pipeId)) {
      return 0.88;
    }
  }
  if (mode === 'rerouteSouth') {
    if ([5, 7, 9, 10, 11, 12, 13].includes(pipeId)) {
      return 1.1;
    }
    if ([1, 2, 3].includes(pipeId)) {
      return 0.9;
    }
  }
  return 1;
}
