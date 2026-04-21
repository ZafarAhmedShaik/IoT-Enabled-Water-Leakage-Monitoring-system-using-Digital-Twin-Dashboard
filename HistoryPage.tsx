import {
  AlertTriangle,
  GitBranch,
  History,
  ShieldCheck,
  Wrench,
} from 'lucide-react';
import { usePipelineContext } from '../context/PipelineContext';
import { useEventLog } from '../hooks/useEventLog';
import type { PipelineEventLogEntry } from '../types/pipeline';

function kindIcon(kind: PipelineEventLogEntry['kind']) {
  switch (kind) {
    case 'alert':
      return AlertTriangle;
    case 'resolved':
      return ShieldCheck;
    case 'valve':
      return Wrench;
    case 'routing':
      return GitBranch;
  }
}

function kindBadgeClass(kind: PipelineEventLogEntry['kind']): string {
  switch (kind) {
    case 'alert':
      return 'border-[var(--status-critical)]/40 bg-[var(--status-critical-bg)] text-[var(--status-critical)]';
    case 'resolved':
      return 'border-[var(--status-normal)]/40 bg-[var(--status-normal-bg)] text-[var(--status-normal)]';
    case 'valve':
      return 'border-[var(--accent)]/30 bg-[var(--accent-muted)] text-[var(--accent)]';
    case 'routing':
      return 'border-[var(--status-warning)]/40 bg-[var(--status-warning-bg)] text-[var(--status-warning)]';
  }
}

/**
 * Read-only event timeline backed by the mock event log.
 */
export default function HistoryPage() {
  const { state } = usePipelineContext();
  const entries = useEventLog(80, state.lastUpdated);

  return (
    <div className="page-ambient scrollbar-themed min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto max-w-3xl px-5 py-8 md:px-10">
        <header className="mb-10 flex gap-4 border-b border-[var(--border-subtle)] pb-8">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--accent)] shadow-[0_0_0_1px_var(--accent-muted)_inset]"
            aria-hidden
          >
            <History className="size-7" strokeWidth={1.5} />
          </div>
          <div>
            <p className="font-mono text-[10px] font-medium uppercase tracking-[0.25em] text-[var(--accent)]">
              Audit trail
            </p>
            <h1 className="mt-1 font-sans text-2xl font-semibold tracking-tight text-[var(--text-primary)] md:text-3xl">
              Event history
            </h1>
            <p className="mt-2 max-w-lg font-sans text-sm leading-relaxed text-[var(--text-secondary)]">
              A living log of mock valve actions, routing changes, and alerts —
              newest first.
            </p>
          </div>
        </header>

        {entries.length === 0 ? (
          <div className="surface-elevated flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
            <div className="rounded-full bg-[var(--bg-elevated)] p-5 text-[var(--text-muted)]">
              <History className="size-10" strokeWidth={1.25} />
            </div>
            <div>
              <p className="font-sans text-base font-medium text-[var(--text-primary)]">
                No events recorded yet
              </p>
              <p className="mt-1 max-w-sm font-sans text-sm text-[var(--text-muted)]">
                Interact with valves, routing, or the leak simulator on the
                dashboard — entries will appear here.
              </p>
            </div>
          </div>
        ) : (
          <div className="relative">
            <div
              className="pointer-events-none absolute bottom-8 left-[18px] top-2 w-px bg-gradient-to-b from-[var(--accent)]/50 via-[var(--border-default)] to-transparent"
              aria-hidden
            />
            <ul className="list-none pl-0">
              {entries.map((e) => {
              const Icon = kindIcon(e.kind);
              return (
                <li key={e.id} className="relative pb-6 pl-10 last:pb-0">
                  <span
                    className="absolute left-[11px] top-2 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[var(--bg-base)] bg-[var(--bg-surface)] text-[var(--accent)] shadow-md ring-2 ring-[var(--accent-muted)]"
                    aria-hidden
                  >
                    <Icon className="size-2.5" strokeWidth={3} />
                  </span>
                  <article className="surface-elevated group overflow-hidden transition hover:border-[var(--border-strong)]">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)]/50 px-4 py-2.5">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider ${kindBadgeClass(e.kind)}`}
                      >
                        {e.kind}
                      </span>
                      <time
                        className="font-mono text-[11px] tabular-nums text-[var(--text-muted)]"
                        dateTime={new Date(e.timestamp).toISOString()}
                      >
                        {new Date(e.timestamp).toLocaleString()}
                      </time>
                    </div>
                    <p className="px-4 py-4 font-sans text-[14px] leading-relaxed text-[var(--text-primary)] transition group-hover:text-[var(--text-secondary)]">
                      {e.message}
                    </p>
                  </article>
                </li>
              );
            })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
