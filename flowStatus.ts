import { THRESHOLDS, PRESSURE_THRESHOLDS_KPA } from '../config/pipeline';
import { FlowStatus, type SensorId, type SensorReading } from '../types/pipeline';

/**
 * Maps flow (L/min) to status using normal/warning bands vs the user “minimum normal” threshold.
 */
export function flowStatusFromThreshold(
  flowLpm: number,
  normalMinLpm: number,
): FlowStatus {
  if (flowLpm >= normalMinLpm) {
    return FlowStatus.NORMAL;
  }
  if (flowLpm >= THRESHOLDS.warning) {
    return FlowStatus.WARNING;
  }
  return FlowStatus.CRITICAL;
}

/**
 * Maps mock pressure (kPa) to status tiers.
 */
export function pressureStatusFromKpa(pressureKpa: number): FlowStatus {
  if (pressureKpa >= PRESSURE_THRESHOLDS_KPA.normal) {
    return FlowStatus.NORMAL;
  }
  if (pressureKpa >= PRESSURE_THRESHOLDS_KPA.warning) {
    return FlowStatus.WARNING;
  }
  return FlowStatus.CRITICAL;
}

/**
 * Re-applies flow + pressure classification after readings change (threshold slider affects flow only).
 */
export function applyThresholdToReadings(
  readings: Record<SensorId, SensorReading>,
  normalMinFlowLpm: number,
): Record<SensorId, SensorReading> {
  const next = {} as Record<SensorId, SensorReading>;
  for (const [key, reading] of Object.entries(readings)) {
    const sensorId = key as SensorId;
    next[sensorId] = {
      ...reading,
      status: flowStatusFromThreshold(reading.flowRate, normalMinFlowLpm),
      pressureStatus: pressureStatusFromKpa(reading.pressureKpa),
    };
  }
  return next;
}
