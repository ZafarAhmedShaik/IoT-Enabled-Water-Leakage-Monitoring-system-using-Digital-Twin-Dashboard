import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { FLOW_CHART_PLOT_HEIGHT_PX } from '../config/pipeline';
import { usePipelineContext } from '../context/PipelineContext';
import { usePipelineActions } from '../hooks/usePipelineActions';

/**
 * Event drill-down: before/after, isolate / reroute, dual-series chart (Fig 14).
 */
export default function EventDetailPage() {
  const { alertId } = useParams<{ alertId: string }>();
  const navigate = useNavigate();
  const { state } = usePipelineContext();
  const { isolatePipe, applyReroute } = usePipelineActions();

  const alert = useMemo(
    () => state.alerts.find((a) => a.id === alertId),
    [state.alerts, alertId],
  );

  if (!alertId || !alert) {
    return (
      <div className="p-6">
        <p className="font-mono text-sm text-[var(--text-muted)]">
          Event not found.
        </p>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="mt-4 font-mono text-xs text-[var(--accent)]"
        >
          Back to dashboard
        </button>
      </div>
    );
  }

  const sensorId = alert.sensorId;
  const history = state.history[sensorId]?.readings ?? [];
  const chartData = history.map((r, i) => ({
    i,
    flow: r.flowRate,
    pressure: r.pressureKpa,
  }));

  const latest = state.sensors[sensorId];
  const before =
    history.length >= 2 ? history[history.length - 2] : latest ?? null;
  const after = latest ?? null;

  return (
    <div className="scrollbar-themed flex min-h-0 flex-1 flex-col overflow-y-auto bg-[var(--bg-base)] p-4">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-4 w-fit font-mono text-xs text-[var(--accent)]"
      >
        ← Back
      </button>
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-md border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4">
          <h1 className="font-mono text-sm font-bold text-[var(--text-primary)]">
            {`Pipe ${alert.pipeId} — event`}
          </h1>
          <p className="mt-2 font-mono text-xs text-[var(--text-muted)]">
            {new Date(alert.triggeredAt).toLocaleString()}
          </p>
          <div className="mt-4 flex flex-wrap gap-4 font-mono text-sm text-[var(--text-secondary)]">
            <span>
              BEFORE:{' '}
              {before ? `${before.flowRate.toFixed(1)} L/min` : '—'}
            </span>
            <span aria-hidden>→</span>
            <span>
              AFTER: {after ? `${after.flowRate.toFixed(1)} L/min` : '—'}
            </span>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              className="rounded-md bg-[var(--status-critical-bg)] px-4 py-2 font-mono text-xs font-semibold text-[var(--status-critical)]"
              onClick={() => void isolatePipe(alert.pipeId)}
            >
              ISOLATE PIPE
            </button>
            <button
              type="button"
              className="rounded-md bg-[var(--accent)] px-4 py-2 font-mono text-xs font-semibold text-[var(--bg-base)]"
              onClick={() => void applyReroute()}
            >
              REROUTE
            </button>
          </div>
        </section>
        <section className="rounded-md border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4">
          <h2 className="font-mono text-[11px] uppercase tracking-wider text-[var(--text-muted)]">
            Pressure over time (recent window)
          </h2>
          <div
            className="mt-2 w-full min-w-0"
            style={{
              height: FLOW_CHART_PLOT_HEIGHT_PX,
              minHeight: FLOW_CHART_PLOT_HEIGHT_PX,
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid
                  stroke="var(--border-subtle)"
                  strokeDasharray="3 3"
                />
                <XAxis
                  dataKey="i"
                  tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                />
                <YAxis
                  yAxisId="l"
                  domain={[0, 16]}
                  width={32}
                  tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                />
                <YAxis
                  yAxisId="r"
                  orientation="right"
                  domain={[0, 100]}
                  width={36}
                  tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-elevated)',
                    border: '1px solid var(--border-default)',
                    fontSize: '11px',
                  }}
                />
                <Legend />
                <Line
                  yAxisId="l"
                  type="monotone"
                  dataKey="flow"
                  name="Flow L/min"
                  stroke="var(--accent)"
                  dot={false}
                  strokeWidth={2}
                  isAnimationActive={false}
                />
                <Line
                  yAxisId="r"
                  type="monotone"
                  dataKey="pressure"
                  name="Pressure kPa"
                  stroke="var(--status-normal)"
                  dot={false}
                  strokeWidth={2}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-3 inline-block rounded border border-[var(--status-normal)] bg-[var(--status-normal-bg)] px-2 py-0.5 font-mono text-[10px] text-[var(--status-normal)]">
            Maintenance ticket: OPEN (mock)
          </p>
        </section>
      </div>
    </div>
  );
}
