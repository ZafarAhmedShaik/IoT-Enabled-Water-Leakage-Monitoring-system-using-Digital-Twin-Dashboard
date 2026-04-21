import { useMemo } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  CHART_LINE_STROKES,
  FLOW_CHART_PLOT_HEIGHT_PX,
} from '../../config/pipeline';
import { useChartSensorSelection } from '../../context/ChartSensorSelectionContext';
import { usePipelineContext } from '../../context/PipelineContext';
import { useSettings } from '../../context/SettingsContext';
import { SensorSelector } from './SensorSelector';

/**
 * Multi-series flow history (last 60 samples per sensor) with a threshold reference line.
 * Plot area uses a fixed height so `ResponsiveContainer` always gets a non-zero size (no flicker).
 */
export function FlowChart() {
  const { state } = usePipelineContext();
  const { flowThresholdLpm } = useSettings();
  const { history, isLoading, lastUpdated } = state;
  const { selectedSensors, setSelectedSensors } = useChartSensorSelection();

  const chartRows = useMemo(() => {
    if (selectedSensors.length === 0) {
      return [];
    }
    let maxLen = 0;
    for (const sid of selectedSensors) {
      maxLen = Math.max(maxLen, history[sid]?.readings.length ?? 0);
    }
    const rows: Record<string, number | string>[] = [];
    for (let i = 0; i < maxLen; i++) {
      const row: Record<string, number | string> = { i };
      let t = 0;
      for (const sid of selectedSensors) {
        const readings = history[sid]?.readings ?? [];
        const r = readings[i];
        const v = r?.flowRate ?? 0;
        row[sid] = v;
        if (r?.timestamp) {
          t = r.timestamp;
        }
      }
      row.t = t;
      rows.push(row);
    }
    return rows;
  }, [history, selectedSensors]);

  const waiting = isLoading && lastUpdated === 0;
  const noSelection = selectedSensors.length === 0;
  const showPlot = !waiting && !noSelection;

  const chartData = chartRows.length > 0 ? chartRows : [{ i: 0 }];

  return (
    <div className="rounded-[inherit] overflow-hidden flex w-full min-w-0 shrink-0 flex-col border-t border-[var(--border-subtle)] bg-[var(--bg-surface)]">
      <SensorSelector selected={selectedSensors} onChange={setSelectedSensors} />
      <div
        className="w-full min-w-0 shrink-0 px-4 pb-2 pt-1"
        style={{
          height: FLOW_CHART_PLOT_HEIGHT_PX,
          minHeight: FLOW_CHART_PLOT_HEIGHT_PX,
        }}
      >
        {waiting && (
          <div className="flex h-full items-center justify-center font-mono text-xs text-[var(--text-muted)]">
            Waiting for history…
          </div>
        )}
        {!waiting && noSelection && (
          <div className="flex h-full items-center justify-center font-mono text-xs text-[var(--text-muted)]">
            Select at least one sensor to plot.
          </div>
        )}
        {showPlot && (
          <div className="h-full w-full min-h-0 min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 6, right: 10, left: 2, bottom: 4 }}
              >
                <CartesianGrid
                  stroke="var(--border-subtle)"
                  strokeDasharray="3 3"
                />
                <XAxis
                  dataKey="i"
                  tick={{
                    fill: 'var(--text-muted)',
                    fontSize: 10,
                    fontFamily: 'IBM Plex Mono, monospace',
                  }}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 15]}
                  tick={{
                    fill: 'var(--text-muted)',
                    fontSize: 10,
                    fontFamily: 'IBM Plex Mono, monospace',
                  }}
                  tickLine={false}
                  width={36}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-elevated)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)',
                    fontSize: '11px',
                  }}
                />
                <ReferenceLine
                  y={flowThresholdLpm}
                  stroke="var(--status-warning)"
                  strokeDasharray="4 4"
                />
                <Legend
                  verticalAlign="bottom"
                  height={48}
                  wrapperStyle={{
                    fontSize: '10px',
                    fontFamily: 'DM Sans, sans-serif',
                    maxHeight: '48px',
                    overflowY: 'auto',
                    paddingTop: '4px',
                  }}
                />
                {selectedSensors.map((sid, index) => (
                  <Line
                    key={sid}
                    type="monotone"
                    dataKey={sid}
                    name={sid}
                    stroke={
                      CHART_LINE_STROKES[index % CHART_LINE_STROKES.length]
                    }
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                    activeDot={{ r: 4 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
