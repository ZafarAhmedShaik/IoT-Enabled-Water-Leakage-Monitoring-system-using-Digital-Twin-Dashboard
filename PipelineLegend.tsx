import { Diamond } from 'lucide-react';

/**
 * Map legend: valve (blue circle) and IoT sensor (diamond), aligned with the reference dashboard.
 */
export function PipelineLegend() {
  return (
    <div
      className="pointer-events-none absolute right-4 top-4 z-10 rounded-lg border border-[var(--border-default)] bg-[var(--bg-elevated)]/90 px-3 py-2 shadow-lg backdrop-blur-sm"
      role="note"
      aria-label="Map legend"
    >
      <p className="mb-2 font-mono text-[9px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
        Legend
      </p>
      <ul className="flex flex-col gap-2 font-sans text-[11px] text-[var(--text-secondary)]">
        <li className="flex items-center gap-2">
          <span
            className="inline-block size-3 shrink-0 rounded-full border-2 border-[var(--valve-ring)] bg-[var(--accent)]"
            aria-hidden
          />
          <span>Valve</span>
        </li>
        <li className="flex items-center gap-2">
          <Diamond
            className="size-3.5 shrink-0 text-[var(--sensor-legend-fill)]"
            strokeWidth={2}
            aria-hidden
          />
          <span>IoT Sensors</span>
        </li>
      </ul>
    </div>
  );
}
