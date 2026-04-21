import { PIPE_IDS } from '../config/pipeline';
import type { PipelineEventLogEntry } from '../types/pipeline';

const MAX = 120;
const entries: PipelineEventLogEntry[] = [];

/**
 * Appends a mock timeline entry (alerts, valve ops, routing).
 */
export function pushEvent(entry: Omit<PipelineEventLogEntry, 'id'>): void {
  const id = `evt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  entries.unshift({ ...entry, id });
  while (entries.length > MAX) {
    entries.pop();
  }
}

export function getEventLogSlice(limit: number): PipelineEventLogEntry[] {
  return entries.slice(0, limit);
}

export function seedInitialEvents(): void {
  if (entries.length > 0) {
    return;
  }
  const now = Date.now();
  for (const pipeId of PIPE_IDS.slice(0, 3)) {
    pushEvent({
      kind: 'alert',
      message: `Sensor S${pipeId} calibration verified`,
      timestamp: now - pipeId * 60000,
      pipeId,
    });
  }
  pushEvent({
    kind: 'routing',
    message: 'Routing profile: default (balanced)',
    timestamp: now - 120000,
  });
}

export function clearEventLogForTests(): void {
  entries.length = 0;
}
