import type { ReservoirDefinition } from '../../types/pipeline';

export interface ReservoirNodeProps {
  reservoir: ReservoirDefinition;
}

/**
 * Renders a labeled reservoir tank on the SVG canvas.
 */
export function ReservoirNode({ reservoir }: ReservoirNodeProps) {
  const { x, y, width, height, id } = reservoir;
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={6}
        className="fill-[var(--reservoir-fill)] stroke-[var(--reservoir-stroke)]"
        strokeWidth={1.5}
      />
      <text
        x={x + width / 2}
        y={y + height / 2 - 6}
        textAnchor="middle"
        className="fill-[var(--reservoir-text)] font-mono text-[18px] font-bold"
      >
        {id}
      </text>
      <text
        x={x + width / 2}
        y={y + height / 2 + 12}
        textAnchor="middle"
        className="fill-[var(--text-muted)] font-mono text-[9px] uppercase"
      >
        Reservoir
      </text>
    </g>
  );
}
