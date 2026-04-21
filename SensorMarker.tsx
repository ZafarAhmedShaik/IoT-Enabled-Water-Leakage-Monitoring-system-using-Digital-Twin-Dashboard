import { FlowStatus, type SensorDefinition } from '../../types/pipeline';

export interface SensorMarkerProps {
  sensor: SensorDefinition;
  flowDisplay: string;
  status: FlowStatus;
  /** Highlights when this sensor is selected for the flow chart. */
  isSelected?: boolean;
  /** Click / keyboard to toggle chart selection for this sensor. */
  onActivate?: () => void;
}

const DIAMOND = 14;

/**
 * Diamond marker with live flow label for a pipe sensor.
 */
export function SensorMarker({
  sensor,
  flowDisplay,
  status,
  isSelected = false,
  onActivate,
}: SensorMarkerProps) {
  const { cx, cy } = sensor;
  const strokeClass =
    status === FlowStatus.NORMAL
      ? 'stroke-[var(--status-normal)]'
      : status === FlowStatus.CRITICAL
        ? 'stroke-[var(--status-critical)]'
        : status === FlowStatus.WARNING
          ? 'stroke-[var(--status-warning)]'
          : 'stroke-[var(--status-unknown)]';

  const textClass =
    status === FlowStatus.NORMAL
      ? 'fill-[var(--status-normal)]'
      : status === FlowStatus.CRITICAL
        ? 'fill-[var(--status-critical)]'
        : status === FlowStatus.WARNING
          ? 'fill-[var(--status-warning)]'
          : 'fill-[var(--text-muted)]';

  const points = `${cx},${cy - DIAMOND} ${cx + DIAMOND},${cy} ${cx},${cy + DIAMOND} ${cx - DIAMOND},${cy}`;
  const ringPoints = `${cx},${cy - DIAMOND - 3} ${cx + DIAMOND + 3},${cy} ${cx},${cy + DIAMOND + 3} ${cx - DIAMOND - 3},${cy}`;

  const interactive = onActivate !== undefined;

  return (
    <g>
      {isSelected ? (
        <polygon
          points={ringPoints}
          className="pointer-events-none fill-none stroke-[var(--accent)] stroke-[3px]"
          strokeLinejoin="round"
        />
      ) : null}
      <g
        className={interactive ? 'cursor-pointer outline-none' : undefined}
        role={interactive ? 'button' : undefined}
        tabIndex={interactive ? 0 : undefined}
        onClick={
          interactive
            ? (e) => {
                e.stopPropagation();
                onActivate();
              }
            : undefined
        }
        onKeyDown={
          interactive
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  e.stopPropagation();
                  onActivate();
                }
              }
            : undefined
        }
      >
        <polygon
          points={points}
          className={`fill-[var(--sensor-fill)] transition-[stroke] duration-500 ease-in-out ${strokeClass}`}
          strokeWidth={2}
        />
        {interactive ? (
          <title>{`Toggle chart for ${sensor.sensorId}`}</title>
        ) : null}
      </g>
      <text
        x={cx}
        y={cy + DIAMOND + 16}
        textAnchor="middle"
        className={`pointer-events-none font-mono text-[10px] ${textClass}`}
      >
        {flowDisplay}
      </text>
    </g>
  );
}
