import { useState } from 'react';
import { PIPE_IDS } from '../../config/pipeline';
import { useLeakSimulation } from '../../hooks/useLeakSimulation';
import type { PipeId } from '../../types/pipeline';

/**
 * Dev panel to force/clear mock leaks per pipe (calls `DataService` via `useLeakSimulation`).
 */
export function LeakSimulator() {
  const { simulateLeak, clearLeak } = useLeakSimulation();
  const [active, setActive] = useState<Set<PipeId>>(() => new Set());

  function toggle(pipeId: PipeId, leaking: boolean): void {
    if (leaking) {
      simulateLeak(pipeId);
      setActive((prev) => new Set(prev).add(pipeId));
    } else {
      clearLeak(pipeId);
      setActive((prev) => {
        const next = new Set(prev);
        next.delete(pipeId);
        return next;
      });
    }
  }

  return (
    <div className="border-t border-[var(--border-default)] bg-[var(--bg-elevated)] p-3 px-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="font-mono text-[10px] uppercase tracking-wide text-[var(--text-muted)]">
          Leak simulator
        </span>
        <span className="rounded-sm bg-[var(--status-warning-bg)] px-1.5 py-0.5 font-mono text-[9px] font-medium uppercase text-[var(--status-warning)]">
          Dev
        </span>
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {PIPE_IDS.map((pipeId) => {
          const on = active.has(pipeId);
          return (
            <button
              key={pipeId}
              type="button"
              aria-pressed={on}
              aria-label={`Toggle leak on pipe ${pipeId}`}
              className={`h-7 rounded-sm border font-mono text-[10px] transition-colors ${
                on
                  ? 'border-[var(--status-critical)] bg-[var(--status-critical-bg)] text-[var(--status-critical)]'
                  : 'border-[var(--border-default)] bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:bg-[var(--border-subtle)]'
              }`}
              onClick={() => toggle(pipeId, !on)}
            >
              {`P${pipeId.toString().padStart(2, '0')}`}
            </button>
          );
        })}
      </div>
    </div>
  );
}
