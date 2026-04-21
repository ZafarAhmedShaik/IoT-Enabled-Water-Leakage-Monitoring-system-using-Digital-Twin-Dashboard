import type { PipeId, ValveId } from '../types/pipeline';

/**
 * Pipes whose mock flow is reduced when the given valve is closed (simulated isolation).
 */
export const VALVE_AFFECTED_PIPES: Record<ValveId, readonly PipeId[]> = {
  VB: [3],
  VC: [13],
  VJ1: [1, 2, 6],
  VJ2: [2, 3, 8],
  VJ3: [4, 5, 9],
  VJ4: [5, 6, 7, 10],
  VJ5: [7, 8, 12],
  VJ7: [10, 11],
  VJ8: [12, 13],
};

/**
 * Valves closed when “isolating” a pipe in the event-detail flow (mock heuristic).
 */
export const ISOLATION_VALVES_BY_PIPE: Partial<Record<PipeId, readonly ValveId[]>> = {
  1: ['VJ1'],
  2: ['VJ1', 'VJ2'],
  3: ['VJ2', 'VB'],
  4: ['VJ3'],
  5: ['VJ3', 'VJ4'],
  6: ['VJ1', 'VJ4'],
  7: ['VJ4', 'VJ5'],
  8: ['VJ2', 'VJ5'],
  9: ['VJ3'],
  10: ['VJ4', 'VJ7'],
  11: ['VJ7', 'VJ8'],
  12: ['VJ8'],
  13: ['VC', 'VJ8'],
};
