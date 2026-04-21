import { useEffect, useMemo, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { PIPE_IDS } from '../../config/pipeline';
import { usePipelineContext } from '../../context/PipelineContext';
import { useSearch } from '../../context/SearchContext';
import { useSettings } from '../../context/SettingsContext';
import { FlowStatus, type SensorId } from '../../types/pipeline';

function formatUptime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function flowAggregateStatus(
  sensors: Record<SensorId, { status: (typeof FlowStatus)[keyof typeof FlowStatus] }>,
): 'NORMAL' | 'WARNING' | 'CRITICAL' {
  let worst = 0;
  for (const pipeId of PIPE_IDS) {
    const sensorId = `S${pipeId}` as SensorId;
    const st = sensors[sensorId]?.status ?? FlowStatus.UNKNOWN;
    if (st === FlowStatus.CRITICAL) {
      worst = 2;
      break;
    }
    if (st === FlowStatus.WARNING) {
      worst = Math.max(worst, 1);
    }
  }
  return worst === 2 ? 'CRITICAL' : worst === 1 ? 'WARNING' : 'NORMAL';
}

export function AppHeader() {
  const { state } = usePipelineContext();
  const { query, setQuery } = useSearch();
  const { displayFlowUnit } = useSettings();

  const [clock, setClock] = useState(() => new Date());
  const [uptimeSec, setUptimeSec] = useState(0);
  const sessionStartRef = useRef<number | null>(null);

  useEffect(() => {
    const id = window.setInterval(() => setClock(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      if (sessionStartRef.current !== null) {
        setUptimeSec(Math.floor((Date.now() - sessionStartRef.current) / 1000));
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (state.lastUpdated > 0 && sessionStartRef.current === null) {
      sessionStartRef.current = state.lastUpdated;
    }
  }, [state.lastUpdated]);

  const totalFlowLpm = useMemo(() => {
    let sum = 0;
    for (const pipeId of PIPE_IDS) {
      const sensorId = `S${pipeId}` as SensorId;
      const r = state.sensors[sensorId];
      if (r?.timestamp) sum += r.flowRate;
    }
    return sum;
  }, [state.sensors]);

  const displayFlow =
    displayFlowUnit === 'm3h'
      ? (totalFlowLpm * 60) / 1000
      : totalFlowLpm;

  const flowUnitLabel = displayFlowUnit === 'm3h' ? 'm³/h' : 'L/min';

  const activeLeaks = useMemo(() => {
    let n = 0;
    for (const pipeId of PIPE_IDS) {
      const sensorId = `S${pipeId}` as SensorId;
      if (state.sensors[sensorId]?.status === FlowStatus.CRITICAL) {
        n += 1;
      }
    }
    return n;
  }, [state.sensors]);

  const agg = flowAggregateStatus(state.sensors);
  const loading = state.isLoading && state.lastUpdated === 0;

  const flowTone =
    agg === 'CRITICAL'
      ? 'text-[var(--status-critical)]'
      : agg === 'WARNING'
        ? 'text-[var(--status-warning)]'
        : 'text-[var(--status-normal)]';

  const flowDisplayStr = loading
    ? '—'
    : `${displayFlow.toLocaleString(undefined, {
        maximumFractionDigits: 1,
      })} ${flowUnitLabel}`;

  const waterSavedStr = loading
    ? '—'
    : `${state.systemHealth.waterSavedLiters.toLocaleString(undefined, {
        maximumFractionDigits: 1,
      })} L`;

  return (
    <header className="flex items-center justify-between border-b border-[var(--border-subtle)] px-3 py-2 bg-[var(--bg-base)]">

      {/* KPI TEXT (NO BOXES) */}
      <div className="flex flex-wrap items-center gap-7 font-mono text-[12px] uppercase tracking-wide text-[var(--text-muted)]">

        <div className="flex items-center gap-1.5">
          <span>Total flow</span>
          <span className="text-[12px] font-semibold text-[var(--text-primary)]">
            {flowDisplayStr}
          </span>
          {!loading && (
            <span className={`text-[12px] font-semibold ${flowTone}`}>
              ({agg})
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <span>Uptime</span>
          <span className="text-[12px] font-semibold text-[var(--text-primary)]">
            {loading ? '—' : formatUptime(uptimeSec)}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span>Saved</span>
          <span className="text-[12px] font-semibold text-[var(--text-primary)]">
            {waterSavedStr}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span>Leaks</span>
          <span
            className={
              activeLeaks > 0
                ? 'text-[12px] font-semibold text-[var(--status-critical)]'
                : 'text-[12px] font-semibold text-[var(--status-normal)]'
            }
          >
            {loading ? '—' : activeLeaks}{' '}
            {!loading && (activeLeaks > 0 ? '(CRITICAL)' : '(OK)')}
          </span>
        </div>
      </div>

      {/* SEARCH + CLOCK */}
      <div className="flex items-center gap-2">
        <label className="relative flex items-center">
          <Search className="absolute left-2 size-3.5 text-[var(--text-muted)]" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            className="w-40 rounded-full border border-[var(--border-default)] bg-[var(--bg-elevated)] py-1.5 pl-7 pr-2 text-[12px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
          />
        </label>

        <time
          className="hidden text-[12px] font-mono text-[var(--text-muted)] xl:block"
          dateTime={clock.toISOString()}
        >
          {clock.toLocaleTimeString(undefined, {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
          })}
        </time>
      </div>
    </header>
  );
}