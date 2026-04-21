import { CheckCircle } from 'lucide-react';
import { useMemo } from 'react';
import { usePipelineContext } from '../../context/PipelineContext';
import { useSearch } from '../../context/SearchContext';
import { AlertItem } from './AlertItem';
import { FeaturedAlertBanner } from './FeaturedAlertBanner';

/**
 * Right rail listing unresolved alerts with severity and timestamps.
 * Scroll body height is fixed via `.alerts-panel-scroll` (see `ALERTS_PANEL_BODY_HEIGHT_PX`).
 */
export function AlertsPanel() {
  const { state } = usePipelineContext();
  const { query } = useSearch();

  const unresolvedAll = useMemo(
    () => state.alerts.filter((a) => a.resolvedAt === undefined),
    [state.alerts],
  );

  const active = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return unresolvedAll;
    }
    return unresolvedAll.filter(
      (a) =>
        a.message.toLowerCase().includes(q) ||
        `pipe ${a.pipeId}`.includes(q) ||
        String(a.pipeId).includes(q) ||
        a.id.toLowerCase().includes(q),
    );
  }, [unresolvedAll, query]);

  const count = active.length;
  const noSearchMatches =
    query.trim().length > 0 && active.length === 0 && unresolvedAll.length > 0;

  const featured = active[0];
  const rest = count > 1 ? active.slice(1) : [];

  return (
    <aside className="flex min-h-0 w-full flex-1 flex-col overflow-hidden bg-transparent">
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-[var(--border-subtle)] px-4">
        <span className="flex items-center gap-1 font-mono text-[13px] font-semibold uppercase tracking-wider text-[var(--text-primary)]">
          Active Alerts
        </span>
        <span
          className="flex h-6 min-w-6 items-center justify-center rounded-full bg-[var(--status-critical-bg)] px-2 font-mono text-xs font-semibold text-[var(--status-critical)]"
          aria-label={`${count} active alerts`}
        >
          {count}
        </span>
      </div>

      <div className="scrollbar-themed min-h-0 w-full flex-1 overflow-y-auto overflow-x-hidden">
        {state.isLoading && state.lastUpdated === 0 ? (
          <p className="p-4 font-mono text-xs text-[var(--text-muted)]">
            Waiting for data…
          </p>
        ) : noSearchMatches ? (
          <p className="p-4 font-mono text-xs text-[var(--text-muted)]">
            No alerts match your search.
          </p>
        ) : count === 0 ? (
          <div className="flex min-h-[12rem] flex-col items-center justify-center gap-2 px-4 py-10 text-center">
            <CheckCircle
              className="size-8 text-[var(--status-normal)]"
              strokeWidth={1.5}
              aria-hidden
            />
            <p className="font-sans text-sm text-[var(--text-secondary)]">
              All systems normal
            </p>
          </div>
        ) : (
          <>
            {featured ? <FeaturedAlertBanner alert={featured} /> : null}
            {rest.map((a) => (
              <AlertItem key={a.id} alert={a} />
            ))}
          </>
        )}
      </div>
    </aside>
  );
}
