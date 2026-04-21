import { PIPE_SEGMENT_GEOMETRY } from '../../config/pipeline';
import { FlowStatus, type PipeId, type SensorId, type SensorReading } from '../../types/pipeline';

export interface PipeWarningLabelProps {
  pipeId: PipeId;
  sensors: Record<SensorId, SensorReading>;
}

/**
 * Renders a small on-pipe warning caption when flow or pressure is in warning/critical bands.
 */
export function PipeWarningLabel({ pipeId, sensors }: PipeWarningLabelProps) {
  const sensorId = `S${pipeId}` as SensorId;
  const r = sensors[sensorId];
  if (!r?.timestamp) {
    return null;
  }

  let text: string | null = null;
  let tone = 'fill-[var(--status-warning)]';
  if (r.pressureStatus === FlowStatus.CRITICAL) {
    text = 'LOW PRESSURE';
    tone = 'fill-[var(--status-critical)]';
  } else if (r.status === FlowStatus.CRITICAL) {
    text = 'CRITICAL FLOW';
    tone = 'fill-[var(--status-critical)]';
  } else if (r.pressureStatus === FlowStatus.WARNING) {
    text = 'PRESSURE';
    tone = 'fill-[var(--status-warning)]';
  } else if (r.status === FlowStatus.WARNING) {
    text = 'LOW FLOW';
    tone = 'fill-[var(--status-warning)]';
  }

  if (!text) {
    return null;
  }

  const g = PIPE_SEGMENT_GEOMETRY[pipeId];
  const cx = (g.x1 + g.x2) / 2;
  const cy = (g.y1 + g.y2) / 2 - 20;

  return (
    <text
      x={cx}
      y={cy}
      textAnchor="middle"
      className={`pointer-events-none font-mono text-[9px] font-bold ${tone}`}
    >
      {text}
    </text>
  );
}
