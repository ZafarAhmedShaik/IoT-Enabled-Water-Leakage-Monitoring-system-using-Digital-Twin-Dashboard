import type { ValveDefinition, ValveState } from '../../types/pipeline';

export interface ValveIndicatorProps {
  valve: ValveDefinition;
  state: ValveState;
  /** Invoked when the operator clicks the valve (mock SCADA toggle). */
  onActivate?: () => void;
}

/**
 * Renders a valve as a circle with open/closed coloring.
 */
export function ValveIndicator({ valve, state, onActivate }: ValveIndicatorProps) {
  const fillClass = state.isOpen
    ? 'fill-[var(--valve-open)]'
    : 'fill-[var(--valve-closed)]';

  return (
    <circle
      cx={valve.cx}
      cy={valve.cy}
      r={10}
      role="button"
      tabIndex={0}
      className={`${fillClass} stroke-[var(--valve-ring)] transition-[fill] duration-[var(--transition-base)] ${
        onActivate ? 'cursor-pointer hover:opacity-90' : ''
      }`}
      strokeWidth={2}
      onClick={(e) => {
        e.stopPropagation();
        onActivate?.();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onActivate?.();
        }
      }}
    >
      <title>
        {`Valve ${valve.valveId} — ${state.isOpen ? 'Open' : 'Closed'} — click to toggle`}
      </title>
    </circle>
  );
}
