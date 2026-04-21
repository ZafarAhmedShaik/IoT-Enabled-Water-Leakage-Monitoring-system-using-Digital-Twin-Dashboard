import { Gauge, RefreshCw, Settings } from 'lucide-react';
import {
  POLL_INTERVAL_MS,
  POLL_INTERVAL_SLIDER_MAX,
  POLL_INTERVAL_SLIDER_MIN,
  POLL_INTERVAL_SLIDER_STEP,
} from '../config/pipeline';
import { ThresholdControl } from '../components/settings/ThresholdControl';
import { useSettings } from '../context/SettingsContext';

/**
 * Threshold, polling, and display preferences (in-memory).
 */
export default function SettingsPage() {
  const {
    pollIntervalMs,
    setPollIntervalMs,
    displayFlowUnit,
    setDisplayFlowUnit,
  } = useSettings();

  return (
    <div className="page-ambient scrollbar-themed min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto max-w-2xl px-5 py-8 md:px-10">
        <header className="mb-10 flex gap-4 border-b border-[var(--border-subtle)] pb-8">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--accent)] shadow-[0_0_0_1px_var(--accent-muted)_inset]"
            aria-hidden
          >
            <Settings className="size-7" strokeWidth={1.5} />
          </div>
          <div>
            <p className="font-mono text-[10px] font-medium uppercase tracking-[0.25em] text-[var(--accent)]">
              Preferences
            </p>
            <h1 className="mt-1 font-sans text-2xl font-semibold tracking-tight text-[var(--text-primary)] md:text-3xl">
              Settings
            </h1>
            <p className="mt-2 max-w-lg font-sans text-sm leading-relaxed text-[var(--text-secondary)]">
              Tune how the mock pipeline is evaluated and how often data
              refreshes. Nothing is persisted — reset on reload.
            </p>
          </div>
        </header>

        <div className="flex flex-col gap-6">
          <ThresholdControl />

          <section className="surface-elevated overflow-hidden">
            <div className="flex items-start gap-3 border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)]/60 px-5 py-4">
              <span className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--bg-base)] text-[var(--accent)]">
                <RefreshCw className="size-5" strokeWidth={1.75} />
              </span>
              <div>
                <h2 className="font-sans text-sm font-semibold text-[var(--text-primary)]">
                  Data refresh interval
                </h2>
                <p className="mt-1 font-sans text-xs leading-relaxed text-[var(--text-muted)]">
                  How often the UI polls the mock service. Default is{' '}
                  {POLL_INTERVAL_MS} ms — lower is snappier but busier.
                </p>
              </div>
            </div>
            <div className="space-y-4 px-5 py-5">
              <div className="rounded-xl bg-[var(--bg-base)] p-4 ring-1 ring-[var(--border-subtle)]">
                <input
                  type="range"
                  min={POLL_INTERVAL_SLIDER_MIN}
                  max={POLL_INTERVAL_SLIDER_MAX}
                  step={POLL_INTERVAL_SLIDER_STEP}
                  value={pollIntervalMs}
                  onChange={(e) => setPollIntervalMs(Number(e.target.value))}
                  className="h-2.5 w-full cursor-pointer accent-[var(--accent)]"
                  aria-label="Polling interval in milliseconds"
                />
              </div>
              <p className="text-center font-mono text-2xl font-semibold tabular-nums tracking-tight text-[var(--accent)]">
                {pollIntervalMs}
                <span className="ml-1.5 text-sm font-normal text-[var(--text-muted)]">
                  ms
                </span>
              </p>
            </div>
          </section>

          <section className="surface-elevated overflow-hidden">
            <div className="flex items-start gap-3 border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)]/60 px-5 py-4">
              <span className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--bg-base)] text-[var(--accent)]">
                <Gauge className="size-5" strokeWidth={1.75} />
              </span>
              <div>
                <h2 className="font-sans text-sm font-semibold text-[var(--text-primary)]">
                  Flow display unit
                </h2>
                <p className="mt-1 font-sans text-xs leading-relaxed text-[var(--text-muted)]">
                  Applies to header KPIs and labels that show aggregate flow.
                </p>
              </div>
            </div>
            <div className="px-5 py-5">
              <div
                className="inline-flex rounded-xl border border-[var(--border-default)] bg-[var(--bg-base)] p-1 shadow-inner"
                role="group"
                aria-label="Flow unit"
              >
                <button
                  type="button"
                  onClick={() => setDisplayFlowUnit('lpm')}
                  className={`rounded-lg px-5 py-2.5 font-sans text-sm font-medium transition ${
                    displayFlowUnit === 'lpm'
                      ? 'bg-[var(--accent)] text-[var(--text-inverse)] shadow-md'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  L/min
                </button>
                <button
                  type="button"
                  onClick={() => setDisplayFlowUnit('m3h')}
                  className={`rounded-lg px-5 py-2.5 font-sans text-sm font-medium transition ${
                    displayFlowUnit === 'm3h'
                      ? 'bg-[var(--accent)] text-[var(--text-inverse)] shadow-md'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  m³/h
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
