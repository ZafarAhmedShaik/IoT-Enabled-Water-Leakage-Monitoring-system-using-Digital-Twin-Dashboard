import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  FLOW_CHART_PLOT_HEIGHT_PX,
  PIPE_IDS,
} from '../config/pipeline';
import { usePipelineContext } from '../context/PipelineContext';
import type { PipeId, SensorId } from '../types/pipeline';
import { downloadCsv } from '../utils/csv';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

/**
 * Historical analytics: multi-chart layout, filters, CSV export, print-to-PDF.
 */
export default function AnalyticsPage() {
  const { state } = usePipelineContext();
  const { history, alerts, lastUpdated } = state;
  const [pipeFilter, setPipeFilter] = useState<PipeId | 'all'>('all');

  const selectedPipes = useMemo(() => {
    if (pipeFilter === 'all') {
      return [...PIPE_IDS];
    }
    return [pipeFilter];
  }, [pipeFilter]);

  const dailyConsumption = useMemo(() => {
    return DAY_LABELS.map((day, dayIndex) => {
      let sumLiters = 0;
      for (const pipeId of selectedPipes) {
        const sid = `S${pipeId}` as SensorId;
        const readings = history[sid]?.readings ?? [];
        const r = readings[readings.length - 7 + dayIndex];
        if (r) {
          sumLiters += r.flowRate * 2.2;
        }
      }
      return { day, liters: Math.round(sumLiters * 10) / 10 };
    });
  }, [history, selectedPipes]);

  const leakByMonth = useMemo(() => {
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    return months.map((m, monthIndex) => ({
      month: m,
      count: alerts.filter(
        (a) => new Date(a.triggeredAt).getMonth() === monthIndex,
      ).length,
    }));
  }, [alerts]);

  const correlationSeries = useMemo(() => {
    const sid = `S${selectedPipes[0] ?? 1}` as SensorId;
    const readings = history[sid]?.readings ?? [];
    return readings.map((r, i) => ({
      i,
      flow: r.flowRate,
      pressure: r.pressureKpa,
    }));
  }, [history, selectedPipes]);

  const exportCsv = () => {
    const rows: string[][] = [
      ['Section', 'Key', 'Value'],
      ...dailyConsumption.map((d) => ['Daily consumption (L est.)', d.day, String(d.liters)]),
      ...leakByMonth.map((row) => ['Leak frequency', row.month, String(row.count)]),
      ...correlationSeries.map((row) => [
        'Flow vs pressure',
        String(row.i),
        `${row.flow},${row.pressure}`,
      ]),
    ];
    downloadCsv(`analytics-export-${Date.now()}.csv`, rows);
  };

  const printPdf = () => {
    window.print();
  };

  const waiting = state.isLoading && lastUpdated === 0;

  return (
    <div
      id="analytics-print-root"
      className="scrollbar-themed min-h-0 flex-1 overflow-y-auto bg-[var(--bg-base)] p-4"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-mono text-sm font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
          Historical data & analytics
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 font-sans text-[12px] text-[var(--text-muted)]">
            Pipe
            <select
              value={pipeFilter === 'all' ? 'all' : String(pipeFilter)}
              onChange={(e) => {
                const v = e.target.value;
                setPipeFilter(v === 'all' ? 'all' : (Number(v) as PipeId));
              }}
              className="rounded border border-[var(--border-default)] bg-[var(--bg-elevated)] px-2 py-1 font-mono text-xs text-[var(--text-primary)]"
            >
              <option value="all">All pipes</option>
              {PIPE_IDS.map((id) => (
                <option key={id} value={id}>
                  {`P${String(id).padStart(2, '0')}`}
                </option>
              ))}
            </select>
          </label>
          <span className="font-sans text-[12px] text-[var(--text-muted)]">
            Date range: mock (live range wired with backend later)
          </span>
          <button
            type="button"
            onClick={exportCsv}
            className="rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 py-1.5 font-mono text-[11px] text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
          >
            CSV
          </button>
          <button
            type="button"
            onClick={printPdf}
            className="rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 py-1.5 font-mono text-[11px] text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
          >
            PDF / Print
          </button>
        </div>
      </div>

      {waiting ? (
        <p className="font-mono text-xs text-[var(--text-muted)]">Loading…</p>
      ) : (
        <div className="flex flex-col gap-6">
          <section className="rounded-md border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4">
            <h2 className="mb-2 font-mono text-[11px] uppercase tracking-wider text-[var(--text-muted)]">
              Daily water consumption (liters est.)
            </h2>
            <div
              style={{
                height: FLOW_CHART_PLOT_HEIGHT_PX + 40,
                minHeight: FLOW_CHART_PLOT_HEIGHT_PX + 40,
              }}
              className="w-full min-w-0"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyConsumption}>
                  <CartesianGrid
                    stroke="var(--border-subtle)"
                    strokeDasharray="3 3"
                  />
                  <XAxis
                    dataKey="day"
                    tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                  />
                  <YAxis
                    tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                    width={40}
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
                    type="monotone"
                    dataKey="liters"
                    name="Liters (est.)"
                    stroke="var(--accent)"
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-md border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4">
              <h2 className="mb-2 font-mono text-[11px] uppercase tracking-wider text-[var(--text-muted)]">
                Leak frequency (by month, mock)
              </h2>
              <div
                style={{ height: FLOW_CHART_PLOT_HEIGHT_PX, minHeight: FLOW_CHART_PLOT_HEIGHT_PX }}
                className="w-full min-w-0"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={leakByMonth}>
                    <CartesianGrid
                      stroke="var(--border-subtle)"
                      strokeDasharray="3 3"
                    />
                    <XAxis
                      dataKey="month"
                      tick={{ fill: 'var(--text-muted)', fontSize: 9 }}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                      width={28}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--bg-elevated)',
                        border: '1px solid var(--border-default)',
                        fontSize: '11px',
                      }}
                    />
                    <Bar
                      dataKey="count"
                      name="Events"
                      fill="var(--status-warning)"
                      isAnimationActive={false}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="rounded-md border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4">
              <h2 className="mb-2 font-mono text-[11px] uppercase tracking-wider text-[var(--text-muted)]">
                Pressure vs flow correlation
              </h2>
              <div
                style={{ height: FLOW_CHART_PLOT_HEIGHT_PX, minHeight: FLOW_CHART_PLOT_HEIGHT_PX }}
                className="w-full min-w-0"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={correlationSeries}>
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
                      tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                      width={32}
                    />
                    <YAxis
                      yAxisId="r"
                      orientation="right"
                      domain={[0, 100]}
                      tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                      width={36}
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
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
