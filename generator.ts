import { HISTORY_LENGTH, PIPE_IDS } from '../config/pipeline';
import {
  FlowStatus,
  type SensorHistory,
  type SensorId,
  type SensorReading,
} from '../types/pipeline';
import { seedInitialEvents } from './eventLog';
import { isLeaking } from './leakSimulator';
import { applyValveAndRouting } from './routingSimulation';
import {
  getValveStatesSnapshot,
  incrementWaterSaved,
  tickFilterMock,
} from './valveStore';

/**
 * Returns a random normal operating flow (L/min) with small jitter (mock-only randomness).
 */
function nextNormalFlowLpm(): number {
  const base = 7 + Math.random() * 5;
  const jitter = (Math.random() - 0.5) * 0.6;
  return Math.round((base + jitter) * 10) / 10;
}

/**
 * Returns a random leak-range flow (L/min) for simulated pipe failures.
 */
function nextLeakFlowLpm(): number {
  return Math.round((0.5 + Math.random() * 2) * 10) / 10;
}

const historyStore: Record<SensorId, SensorReading[]> = {} as Record<
  SensorId,
  SensorReading[]
>;

function ensureStore(): void {
  for (const pipeId of PIPE_IDS) {
    const sensorId = `S${pipeId}` as SensorId;
    if (!historyStore[sensorId]) {
      historyStore[sensorId] = [];
    }
  }
}

ensureStore();

let seeded = false;

/**
 * Advances the simulation by one tick: updates all sensors, trims per-sensor history.
 */
export function tick(): Record<SensorId, SensorReading> {
  if (!seeded) {
    seedInitialEvents();
    seeded = true;
  }

  const now = Date.now();
  tickFilterMock(now);

  const raw = {} as Record<SensorId, SensorReading>;

  for (const pipeId of PIPE_IDS) {
    const sensorId = `S${pipeId}` as SensorId;
    const flowRate = isLeaking(pipeId)
      ? nextLeakFlowLpm()
      : nextNormalFlowLpm();
    const pressureKpa = Math.round(
      Math.max(
        16,
        Math.min(
          94,
          46 + flowRate * 2.1 + (Math.random() - 0.5) * 5,
        ),
      ) * 10,
    ) / 10;

    const reading: SensorReading = {
      sensorId,
      pipeId,
      flowRate,
      pressureKpa,
      status: FlowStatus.NORMAL,
      pressureStatus: FlowStatus.NORMAL,
      timestamp: now,
    };
    raw[sensorId] = reading;
  }

  const valves = getValveStatesSnapshot();
  const readings = applyValveAndRouting(raw, valves);

  for (const pipeId of PIPE_IDS) {
    const sensorId = `S${pipeId}` as SensorId;
    const reading = readings[sensorId];
    const list = historyStore[sensorId];
    list.push(reading);
    while (list.length > HISTORY_LENGTH) {
      list.shift();
    }
  }

  const leaking = PIPE_IDS.some((p) => isLeaking(p));
  if (!leaking) {
    incrementWaterSaved(0.035);
  }

  return readings;
}

/**
 * Returns up to `limit` most recent stored readings for a sensor (oldest → newest).
 */
export function getHistory(sensorId: SensorId, limit: number): SensorHistory {
  const readings = historyStore[sensorId] ?? [];
  const slice = readings.slice(-limit);
  return { sensorId, readings: slice };
}
