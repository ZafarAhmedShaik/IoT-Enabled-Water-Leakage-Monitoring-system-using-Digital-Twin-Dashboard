import { PIPE_IDS } from '../../config/pipeline';
import type { SensorId } from '../../types/pipeline';

export interface SensorSelectorProps {
  selected: readonly SensorId[];
  onChange: (next: readonly SensorId[]) => void;
}

/**
 * Checkbox grid to pick which sensor traces appear on the flow chart.
 */
export function SensorSelector({ selected, onChange }: SensorSelectorProps) {
  const set = new Set(selected);

  function toggle(sensorId: SensorId): void {
    const next = new Set(set);
    if (next.has(sensorId)) {
      next.delete(sensorId);
    } else {
      next.add(sensorId);
    }
    onChange(Array.from(next));
  }

  return (
    <div className="flex shrink-0 flex-wrap gap-x-3 gap-y-1 border-b border-[var(--border-subtle)] px-4 py-1.5">
      {PIPE_IDS.map((pipeId) => {
        const sensorId = `S${pipeId}` as SensorId;
        const checked = set.has(sensorId);
        return (
          <label
            key={sensorId}
            className={`flex cursor-pointer items-center gap-1.5 rounded-md border px-1.5 py-0.5 font-sans text-[11px] transition-colors ${
              checked
                ? 'border-[var(--accent)]/45 bg-[var(--accent-muted)] text-[var(--text-primary)] ring-1 ring-[var(--accent)]/30'
                : 'border-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
            }`}
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={() => toggle(sensorId)}
              className="size-3.5 rounded border-[var(--border-default)] accent-[var(--accent)]"
            />
            <span className="font-mono">{sensorId}</span>
          </label>
        );
      })}
    </div>
  );
}
