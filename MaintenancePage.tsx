import { Download, Gauge, Wrench } from 'lucide-react';
import { useMemo, useState } from 'react';
import { PIPE_IDS } from '../config/pipeline';
import { usePipelineContext } from '../context/PipelineContext';
import { usePipelineActions } from '../hooks/usePipelineActions';
import { useMaintenanceMeta } from '../hooks/useMaintenanceMeta';
import { FlowStatus, type SensorId } from '../types/pipeline';
import { downloadCsv } from '../utils/csv';

function rowStatus(
  flow: (typeof FlowStatus)[keyof typeof FlowStatus],
  pressure: (typeof FlowStatus)[keyof typeof FlowStatus],
): 'OK' | 'ERROR' {
  if (flow === FlowStatus.CRITICAL || pressure === FlowStatus.CRITICAL) {
    return 'ERROR';
  }
  return 'OK';
}

/**
 * IoT sensor health table with mock maintenance actions.
 */
export default function MaintenancePage() {
  const { state } = usePipelineContext();
  const { acknowledgeSensor, markReplaceSensor } = usePipelineActions();
  const [refreshNonce, setRefreshNonce] = useState(0);
  const meta = useMaintenanceMeta(state.lastUpdated, refreshNonce);

  const rows = useMemo(() => {
    return PIPE_IDS.map((pipeId) => {
      const sensorId = `S${pipeId}` as SensorId;
      const reading = state.sensors[sensorId];
      const m = meta?.[sensorId];
      const st = rowStatus(
        reading?.status ?? FlowStatus.UNKNOWN,
        reading?.pressureStatus ?? FlowStatus.UNKNOWN,
      );
      return {
        pipeId,
        sensorId,
        displayId: `F-${String(pipeId).padStart(3, '0')}`,
        flow: reading?.flowRate ?? 0,
        pressure: reading?.pressureKpa ?? 0,
        reviewedAt: m?.reviewedAt ?? null,
        status: st,
        pendingAction: m?.pendingAction ?? 'none',
      };
    });
  }, [meta, state.sensors]);

  const stats = useMemo(() => {
    const errors = rows.filter((r) => r.status === 'ERROR').length;
    const pending = rows.filter((r) => r.pendingAction === 'replace').length;
    return { total: rows.length, errors, pending };
  }, [rows]);

  const downloadTable = () => {
    const header = [
      'ID',
      'Flow L/min',
      'Pressure kPa',
      'Reviewed',
      'Status',
      'Pending action',
    ];
    const dataRows = rows.map((r) => [
      r.displayId,
      String(r.flow.toFixed(1)),
      String(r.pressure.toFixed(1)),
      r.reviewedAt
        ? new Date(r.reviewedAt).toLocaleString()
        : '—',
      r.status,
      r.pendingAction,
    ]);
    downloadCsv(`maintenance-sensors-${Date.now()}.csv`, [header, ...dataRows]);
  };

  const bump = () => setRefreshNonce((n) => n + 1);

  const loading = state.isLoading && state.lastUpdated === 0;

  return (
    <div className="page-ambient scrollbar-themed min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto max-w-6xl px-5 py-8 md:px-10">
        <header className="mb-8 flex flex-col gap-6 border-b border-[var(--border-subtle)] pb-8 md:flex-row md:items-end md:justify-between">
          <div className="flex gap-4">
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--accent)] shadow-[0_0_0_1px_var(--accent-muted)_inset]"
              aria-hidden
            >
              <Wrench className="size-7" strokeWidth={1.5} />
            </div>
            <div>
              <p className="font-mono text-[10px] font-medium uppercase tracking-[0.25em] text-[var(--accent)]">
                Operations
              </p>
              <h1 className="mt-1 font-sans text-2xl font-semibold tracking-tight text-[var(--text-primary)] md:text-3xl">
                Sensor health
              </h1>
              <p className="mt-2 max-w-xl font-sans text-sm leading-relaxed text-[var(--text-secondary)]">
                Live flow and pressure per IoT node. Acknowledge warnings or flag
                hardware for replacement — all mock-backed for demos.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={downloadTable}
            className="inline-flex items-center justify-center gap-2 self-start rounded-xl bg-[var(--accent)] px-5 py-3 font-sans text-sm font-medium text-[var(--text-inverse)] shadow-lg shadow-[var(--accent-muted)] transition hover:bg-[var(--accent-hover)] active:scale-[0.98]"
          >
            <Download className="size-4 shrink-0" strokeWidth={2} />
            Export CSV
          </button>
        </header>

        {!loading && meta ? (
          <div className="mb-8 grid gap-3 sm:grid-cols-3">
            <div className="surface-elevated flex items-center gap-3 px-4 py-4 transition hover:border-[var(--border-strong)]">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--bg-elevated)] text-[var(--text-secondary)]">
                <Gauge className="size-5" strokeWidth={1.75} />
              </span>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                  Monitored
                </p>
                <p className="font-mono text-xl font-semibold tabular-nums text-[var(--text-primary)]">
                  {stats.total}
                </p>
              </div>
            </div>
            <div className="surface-elevated flex items-center gap-3 px-4 py-4 transition hover:border-[var(--border-strong)]">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--status-critical-bg)] text-[var(--status-critical)]">
                <span className="font-mono text-xs font-bold">!</span>
              </span>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                  Attention
                </p>
                <p className="font-mono text-xl font-semibold tabular-nums text-[var(--text-primary)]">
                  {stats.errors}
                </p>
              </div>
            </div>
            <div className="surface-elevated flex items-center gap-3 px-4 py-4 transition hover:border-[var(--border-strong)]">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--status-warning-bg)] text-[var(--status-warning)]">
                <Wrench className="size-5" strokeWidth={1.75} />
              </span>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                  Replace pending
                </p>
                <p className="font-mono text-xl font-semibold tabular-nums text-[var(--text-primary)]">
                  {stats.pending}
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {loading || !meta ? (
          <div className="surface-elevated flex items-center justify-center py-20">
            <p className="animate-pulse font-mono text-sm text-[var(--text-muted)]">
              Loading sensor matrix…
            </p>
          </div>
        ) : (
          <div className="surface-elevated overflow-hidden">
            <div className="border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-4 py-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)]">
                IoT sensors
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)] font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                    <th className="px-4 py-3 font-medium">ID</th>
                    <th className="px-4 py-3 font-medium">Flow</th>
                    <th className="px-4 py-3 font-medium">Pressure</th>
                    <th className="px-4 py-3 font-medium">Reviewed</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="font-sans text-[13px] text-[var(--text-primary)]">
                  {rows.map((r, i) => (
                    <tr
                      key={r.sensorId}
                      className={`border-b border-[var(--border-subtle)] transition-colors duration-150 hover:bg-[var(--bg-elevated)] ${
                        i % 2 === 0 ? 'bg-transparent' : 'bg-[var(--bg-base)]/40'
                      }`}
                    >
                      <td className="px-4 py-3 font-mono text-xs text-[var(--accent)]">
                        {r.displayId}
                      </td>
                      <td className="px-4 py-3 tabular-nums text-[var(--text-secondary)]">
                        {r.flow.toFixed(1)}{' '}
                        <span className="text-[var(--text-muted)]">L/min</span>
                      </td>
                      <td className="px-4 py-3 tabular-nums text-[var(--text-secondary)]">
                        {r.pressure.toFixed(1)}{' '}
                        <span className="text-[var(--text-muted)]">kPa</span>
                      </td>
                      <td className="px-4 py-3 text-[var(--text-muted)]">
                        {r.reviewedAt
                          ? new Date(r.reviewedAt).toLocaleDateString()
                          : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 font-mono text-[11px] font-semibold ${
                            r.status === 'OK'
                              ? 'bg-[var(--status-normal-bg)] text-[var(--status-normal)]'
                              : 'bg-[var(--status-critical-bg)] text-[var(--status-critical)]'
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-base)] px-3 py-1.5 font-mono text-[10px] font-medium uppercase tracking-wide text-[var(--text-secondary)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                            onClick={() =>
                              void acknowledgeSensor(r.sensorId).then(bump)
                            }
                          >
                            Acknowledge
                          </button>
                          <button
                            type="button"
                            className="rounded-lg border border-[var(--status-critical)] bg-[var(--status-critical-bg)]/30 px-3 py-1.5 font-mono text-[10px] font-medium uppercase tracking-wide text-[var(--status-critical)] transition hover:bg-[var(--status-critical-bg)]"
                            onClick={() =>
                              void markReplaceSensor(r.sensorId).then(bump)
                            }
                          >
                            Replace
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
