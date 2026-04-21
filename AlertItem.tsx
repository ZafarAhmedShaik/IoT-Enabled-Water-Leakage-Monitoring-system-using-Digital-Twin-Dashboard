import { Link } from 'react-router-dom';
import type { Alert } from '../../types/pipeline';

export interface AlertItemProps {
  alert: Alert;
}

/**
 * One row in the active alerts list with severity accent and timestamp.
 */
export function AlertItem({ alert }: AlertItemProps) {
  const isCritical = alert.severity === 'critical';
  const borderClass = isCritical
    ? 'border-l-[var(--status-critical)] bg-[var(--status-critical-bg)]'
    : 'border-l-[var(--status-warning)] bg-[var(--status-warning-bg)]';

  const title = isCritical ? 'CRITICAL' : 'WARNING';

  const time = new Date(alert.triggeredAt).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  return (
    <Link
      to={`/event/${encodeURIComponent(alert.id)}`}
      className={`block min-h-[72px] border-b border-[var(--border-subtle)] border-l-[3px] px-4 py-3 transition-colors hover:bg-[var(--bg-elevated)] ${borderClass}`}
    >
      <p className="font-mono text-xs font-bold text-[var(--text-primary)]">
        {`PIPE ${alert.pipeId} — ${title}`}
      </p>
      <p className="mt-1 font-sans text-[13px] text-[var(--text-secondary)]">
        {alert.message}
      </p>
      <p className="mt-1 font-sans text-[11px] text-[var(--text-muted)]">
        {time}
      </p>
    </Link>
  );
}
