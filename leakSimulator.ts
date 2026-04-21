import type { PipeId } from '../types/pipeline';

const leakingPipes = new Set<PipeId>();

/**
 * Marks a pipe as leaking so the mock generator emits low flow on the next ticks.
 */
export function simulateLeak(pipeId: PipeId): void {
  leakingPipes.add(pipeId);
}

/**
 * Clears the simulated leak for a pipe so flow returns to normal range.
 */
export function clearLeak(pipeId: PipeId): void {
  leakingPipes.delete(pipeId);
}

/**
 * Returns whether the mock is currently simulating a leak on the given pipe.
 */
export function isLeaking(pipeId: PipeId): boolean {
  return leakingPipes.has(pipeId);
}

/**
 * Lists all pipe IDs that are currently in simulated leak mode.
 */
export function getLeakingPipeIds(): readonly PipeId[] {
  return [...leakingPipes].sort((a, b) => a - b);
}
