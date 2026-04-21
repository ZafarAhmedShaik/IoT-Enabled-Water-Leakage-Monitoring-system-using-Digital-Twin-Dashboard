import { PIPE_IDS } from '../config/pipeline';
import type { SensorId, SensorMaintenanceMeta } from '../types/pipeline';

const meta: Record<SensorId, SensorMaintenanceMeta> = {} as Record<
  SensorId,
  SensorMaintenanceMeta
>;

function ensure(): void {
  for (const pipeId of PIPE_IDS) {
    const sensorId = `S${pipeId}` as SensorId;
    if (!meta[sensorId]) {
      meta[sensorId] = {
        reviewedAt: null,
        pendingAction: pipeId === 3 ? 'replace' : 'none',
      };
    }
  }
}

ensure();

export function getMaintenanceSnapshot(): Record<SensorId, SensorMaintenanceMeta> {
  ensure();
  return { ...meta };
}

export function acknowledge(sensorId: SensorId): void {
  ensure();
  meta[sensorId] = {
    ...meta[sensorId],
    reviewedAt: Date.now(),
    pendingAction: 'none',
  };
}

export function markReplace(sensorId: SensorId): void {
  ensure();
  meta[sensorId] = {
    ...meta[sensorId],
    pendingAction: 'replace',
  };
}

export function resetMaintenanceForTests(): void {
  for (const pipeId of PIPE_IDS) {
    const sensorId = `S${pipeId}` as SensorId;
    meta[sensorId] = {
      reviewedAt: null,
      pendingAction: 'none',
    };
  }
  meta['S3' as SensorId].pendingAction = 'replace';
}
