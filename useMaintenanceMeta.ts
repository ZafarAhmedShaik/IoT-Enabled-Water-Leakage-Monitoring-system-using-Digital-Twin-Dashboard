import { useEffect, useState } from 'react';
import { dataService } from '../services/dataService';
import type { SensorId, SensorMaintenanceMeta } from '../types/pipeline';

/**
 * Loads mock maintenance row metadata whenever pipeline data refreshes.
 */
export function useMaintenanceMeta(
  lastUpdated: number,
  refreshNonce: number,
): Record<SensorId, SensorMaintenanceMeta> | null {
  const [meta, setMeta] = useState<Record<
    SensorId,
    SensorMaintenanceMeta
  > | null>(null);

  useEffect(() => {
    let cancelled = false;
    void dataService.getMaintenanceMeta().then((m) => {
      if (!cancelled) {
        setMeta(m);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [lastUpdated, refreshNonce]);

  return meta;
}
