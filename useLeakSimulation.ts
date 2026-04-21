import { dataService } from '../services/dataService';
import type { PipeId } from '../types/pipeline';

/**
 * Dev/test controls that forward leak simulation commands to the `DataService` boundary.
 */
export function useLeakSimulation(): {
  simulateLeak: (pipeId: PipeId) => void;
  clearLeak: (pipeId: PipeId) => void;
} {
  return {
    simulateLeak: (pipeId: PipeId) => {
      dataService.simulateLeak(pipeId);
    },
    clearLeak: (pipeId: PipeId) => {
      dataService.clearLeak(pipeId);
    },
  };
}
