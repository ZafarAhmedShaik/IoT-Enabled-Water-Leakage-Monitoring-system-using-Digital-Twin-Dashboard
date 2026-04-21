import { SlidersHorizontal } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

/**
 * Slider + numeric input to set the minimum acceptable flow (L/min) for green vs red styling.
 */
export function ThresholdControl() {
  const {
    flowThresholdLpm,
    setFlowThresholdLpm,
    flowThresholdMin,
    flowThresholdMax,
    flowThresholdStep,
  } = useSettings();

  return (
    <section className="surface-elevated overflow-hidden">
      <div className="flex items-start gap-3 border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)]/60 px-5 py-4">
        <span className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--bg-base)] text-[var(--accent)]">
          <SlidersHorizontal className="size-5" strokeWidth={1.75} />
        </span>
        <div>
          <h2 className="font-sans text-sm font-semibold text-[var(--text-primary)]">
            Flow alert threshold
          </h2>
          <p className="mt-1 font-sans text-xs leading-relaxed text-[var(--text-muted)]">
            Minimum flow (L/min) treated as &quot;normal&quot; for pipe health
            coloring and alerts.
          </p>
        </div>
      </div>
      <div className="space-y-4 px-5 py-5">
        <div className="rounded-xl bg-[var(--bg-base)] p-4 ring-1 ring-[var(--border-subtle)]">
          <input
            type="range"
            min={flowThresholdMin}
            max={flowThresholdMax}
            step={flowThresholdStep}
            value={flowThresholdLpm}
            onChange={(e) => {
              setFlowThresholdLpm(Number(e.target.value));
            }}
            className="h-2.5 w-full cursor-pointer accent-[var(--accent)]"
            aria-label="Minimum flow threshold in liters per minute"
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label
            htmlFor="flow-threshold-input"
            className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)]"
          >
            Value (L/min)
          </label>
          <input
            id="flow-threshold-input"
            type="number"
            min={flowThresholdMin}
            max={flowThresholdMax}
            step={flowThresholdStep}
            value={flowThresholdLpm}
            onChange={(e) => {
              const v = Number(e.target.value);
              if (!Number.isFinite(v)) {
                return;
              }
              const clamped = Math.min(
                flowThresholdMax,
                Math.max(flowThresholdMin, v),
              );
              setFlowThresholdLpm(clamped);
            }}
            className="min-w-[5rem] rounded-lg border border-[var(--border-default)] bg-[var(--bg-elevated)] px-3 py-2 text-right font-mono text-lg font-semibold tabular-nums text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none"
            aria-label="Threshold numeric value"
          />
        </div>
        <p className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-base)]/80 px-3 py-2.5 font-sans text-[11px] leading-relaxed text-[var(--text-muted)]">
          At or above threshold = normal. Between the warning band and threshold =
          amber. Below the warning band = critical.
        </p>
      </div>
    </section>
  );
}
