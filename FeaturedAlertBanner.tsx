import { AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Alert } from '../../types/pipeline';

export interface FeaturedAlertBannerProps {
  alert: Alert;
}

/**
 * Prominent featured alert block for the right rail (matches industrial dashboard mock).
 */
export function FeaturedAlertBanner({ alert }: FeaturedAlertBannerProps) {
  const isCritical = alert.severity === 'critical';
  const pipeLabel = `P ${alert.pipeId.toString().padStart(2, '0')}`;
  const headline = isCritical
    ? 'CRITICAL FLOW / LEAK'
    : 'WARNING — LOW FLOW';

  return (
    <Link
      to={`/event/${encodeURIComponent(alert.id)}`}
      className="group mx-3 mb-3 mt-2 block overflow-hidden rounded-lg border border-[var(--status-warning)]/40 bg-gradient-to-br from-[var(--status-critical-bg)] via-[var(--status-warning-bg)] to-[var(--bg-elevated)] shadow-md transition-[transform,box-shadow] hover:shadow-lg"
    >
      <div className="flex items-stretch gap-0">
        <div className="flex w-11 shrink-0 items-center justify-center bg-[var(--status-critical)]/90">
          <AlertTriangle
            className="size-6 text-white"
            strokeWidth={2}
            aria-hidden
          />
        </div>
        <div className="min-w-0 flex-1 px-3 py-3">
          <p className="font-mono text-[11px] font-bold uppercase tracking-wide text-white">
            {headline}
          </p>
          <p className="mt-2 font-mono text-[11px] text-[var(--text-secondary)]">
            PIPE ID:{' '}
            <span className="text-[var(--text-primary)]">
              {pipeLabel}{' '}
              <span className="text-[var(--status-critical)]">
                ({isCritical ? 'Critical' : 'Warning'})
              </span>
            </span>
          </p>
          <p className="mt-1 font-sans text-[12px] font-medium text-[var(--status-warning)]">
            WARNING: {alert.message}
          </p>
        </div>
      </div>
    </Link>
  );
}
