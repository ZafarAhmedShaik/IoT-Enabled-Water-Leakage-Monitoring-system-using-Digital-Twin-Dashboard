import { usePipelineContext } from '../../context/PipelineContext';
import { usePipelineActions } from '../../hooks/usePipelineActions';

function GaugeArc({
  label,
  valuePercent,
  sublabel,
  compact = false,
  layout = 'vertical',
}: {
  label?: string;
  valuePercent: number;
  sublabel: string;
  compact?: boolean;
  layout?: 'horizontal' | 'vertical';
}) {
  const pct = Math.max(0, Math.min(100, valuePercent));
  const circumference = Math.PI * 42;
  const dash = (pct / 100) * circumference;
  const theta = Math.PI * (1 - pct / 100);
  const cx = 50;
  const cy = 48;
  const needleR = 30;
  const nx = cx + needleR * Math.cos(theta);
  const ny = cy + needleR * Math.sin(theta);

  const labelClsHorizontal = compact
    ? 'shrink-0 font-mono text-[8px] uppercase tracking-wider text-[var(--text-muted)]'
    : 'shrink-0 font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)]';

  const subClsHorizontal = compact
    ? 'min-w-0 truncate font-mono text-[12px] text-[var(--text-secondary)]'
    : 'min-w-0 truncate font-mono text-xs text-[var(--text-secondary)]';

  const svgCls = compact ? 'h-14 w-28 shrink-0' : 'h-16 w-32 shrink-0';

  const arcSvg = (
    <svg viewBox="0 0 100 56" className={svgCls} aria-hidden>
      <path
        d="M 12 48 A 38 38 0 0 1 88 48"
        fill="none"
        stroke="var(--border-default)"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <path
        d="M 12 48 A 38 38 0 0 1 88 48"
        fill="none"
        stroke="var(--status-normal)"
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circumference}`}
      />
      <line
        x1={cx}
        y1={cy}
        x2={nx}
        y2={ny}
        stroke="var(--text-primary)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx={cx} cy={cy} r="3" className="fill-[var(--text-primary)]" />
    </svg>
  );

  if (layout === 'horizontal') {
    return (
      <div className="flex items-center gap-2">
        {label ? <span className={labelClsHorizontal}>{label}</span> : null}
        {arcSvg}
        <span className={subClsHorizontal}>{sublabel}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      {label ? <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)]">{label}</p> : null}
      {arcSvg}
      <p className="mt-1 font-mono text-xs text-[var(--text-secondary)]">{sublabel}</p>
    </div>
  );
}

export interface SystemHealthPanelProps {
  variant?: 'default' | 'railTop';
}

export function SystemHealthPanel({ variant = 'default' }: SystemHealthPanelProps) {
  const { state } = usePipelineContext();
  const { setPumpOn } = usePipelineActions();
  const { pumpOn } = state.systemHealth;

  const loading = state.isLoading && state.lastUpdated === 0;
  const railTop = variant === 'railTop';

  return (
    <section
      className={
        railTop
          ? 'w-full border-b border-[var(--border-subtle)] px-2 pb-4 pt-3'
          : 'border-t border-[var(--border-subtle)] p-4'
      }
    >
      {railTop ? (
        <div className="flex flex-col items-start gap-2">
          <p className="px-2 text-left w-full font-mono text-[13px] font-semibold uppercase tracking-wide text-[var(--text-primary)]">
             System health
          </p>

          <div className="w-full border-t border-[var(--border-subtle)] pt-3 flex justify-center">
            <div className="flex items-center gap-4">
              <span className="font-mono text-[13px] uppercase tracking-wider text-[var(--text-muted)]">
                Pump
              </span>

              <GaugeArc
                compact
                layout="horizontal"
                valuePercent={pumpOn ? 100 : 0}
                sublabel={loading ? '—' : pumpOn ? 'Running' : 'Stopped'}
              />

              <button
                type="button"
                onClick={() => void setPumpOn(!pumpOn)}
                aria-pressed={pumpOn}
                className={`rounded-md px-2 py-1 font-mono text-[11px] ${
                  pumpOn
                    ? 'bg-[var(--status-normal-bg)] text-[var(--status-normal)]'
                    : 'border border-[var(--border-default)] bg-[var(--bg-elevated)] text-[var(--text-primary)]'
                }`}
              >
                {pumpOn ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <p className="mb-4 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-primary)]">
            System health
          </p>

          <div className="flex flex-col items-center">
            <GaugeArc
              valuePercent={pumpOn ? 100 : 0}
              sublabel={loading ? '—' : pumpOn ? 'Running' : 'Stopped'}
            />

            <button
              type="button"
              onClick={() => void setPumpOn(!pumpOn)}
              aria-pressed={pumpOn}
              className={`mt-3 rounded-md px-3 py-1 font-mono text-[11px] ${
                pumpOn
                  ? 'bg-[var(--status-normal-bg)] text-[var(--status-normal)]'
                  : 'border border-[var(--border-default)] bg-[var(--bg-elevated)] text-[var(--text-primary)]'
              }`}
            >
              {pumpOn ? 'ON' : 'OFF'}
            </button>
          </div>
        </>
      )}
    </section>
  );
}