import { PIPE_SEGMENT_GEOMETRY } from '../../config/pipeline';
import type { PipeId } from '../../types/pipeline';

export interface PipeIdLabelProps {
  pipeId: PipeId;
  /** Matches flow-chart sensor selection for this pipe. */
  isSelected?: boolean;
}

/**
 * Renders a compact pipe identifier (e.g. P 06) at the segment midpoint for the SCADA map.
 */
export function PipeIdLabel({ pipeId, isSelected = false }: PipeIdLabelProps) {
  const g = PIPE_SEGMENT_GEOMETRY[pipeId];
  const cx = (g.x1 + g.x2) / 2+35;
  const cy = (g.y1 + g.y2) / 2.08;
  const label = `P ${pipeId.toString().padStart(2, '0')}`;

  return (
    <text
      x={cx}
      y={cy - 8}
      textAnchor="middle"
      className={`pointer-events-none select-none font-mono text-[13px] font-bold uppercase ${
        isSelected
          ? 'fill-[var(--accent)] drop-shadow-[0_0_6px_var(--accent-muted)]'
          : 'fill-[var(--text-primary)]'
      }`}
    >
      {label}
    </text>
  );
}
