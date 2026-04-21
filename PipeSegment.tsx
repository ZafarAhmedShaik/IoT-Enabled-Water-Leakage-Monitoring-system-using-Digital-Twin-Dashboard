import { PIPE_STROKE_PX, PIPE_SEGMENT_GEOMETRY } from '../../config/pipeline';
import { FlowStatus, type PipeId } from '../../types/pipeline';

const PIPE_HIT_STROKE_PX = PIPE_STROKE_PX + 16;

export interface PipeSegmentProps {
  pipeId: PipeId;
  /** Route label from pipeline config (e.g. A → J1), shown in the hover tooltip. */
  pipeLabel: string;
  status: FlowStatus;
  /** When true, draws an accent halo (matches flow-chart sensor selection). */
  isSelected?: boolean;
  /** Wide hit target + click to toggle chart selection for this pipe’s sensor. */
  onActivate?: () => void;
}

/**
 * Renders one pipe run as a thick SVG line segment with status-colored stroke.
 */
export function PipeSegment({
  pipeId,
  pipeLabel,
  status,
  isSelected = false,
  onActivate,
}: PipeSegmentProps) {
  const g = PIPE_SEGMENT_GEOMETRY[pipeId];
  const strokeClass =
    status === FlowStatus.NORMAL
      ? 'stroke-[var(--status-normal)]'
      : status === FlowStatus.CRITICAL
        ? 'pipe-critical-glow stroke-[var(--status-critical)]'
        : status === FlowStatus.WARNING
          ? 'stroke-[var(--status-warning)]'
          : 'stroke-[var(--status-unknown)]';

  return (
    <g>
      {isSelected ? (
        <line
          x1={g.x1}
          y1={g.y1}
          x2={g.x2}
          y2={g.y2}
          className="pointer-events-none stroke-[var(--accent)] opacity-40"
          strokeWidth={PIPE_STROKE_PX + 8}
          strokeLinecap="round"
        />
      ) : null}
      <line
        x1={g.x1}
        y1={g.y1}
        x2={g.x2}
        y2={g.y2}
        className={`pointer-events-none transition-[stroke,filter] duration-500 ease-in-out ${strokeClass}`}
        strokeWidth={PIPE_STROKE_PX}
        strokeLinecap="round"
      />
      {onActivate ? (
        <g
          className="cursor-pointer outline-none"
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation();
            onActivate();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              e.stopPropagation();
              onActivate();
            }
          }}
        >
          <line
            x1={g.x1}
            y1={g.y1}
            x2={g.x2}
            y2={g.y2}
            className="stroke-[var(--text-primary)] opacity-[0.012] hover:opacity-[0.08]"
            strokeWidth={PIPE_HIT_STROKE_PX}
            strokeLinecap="round"
            pointerEvents="stroke"
          />
          <title>{`Pipe: ${pipeLabel} — Sensor: S${pipeId} — Click to toggle chart`}</title>
        </g>
      ) : null}
    </g>
  );
}
