import { useEffect, useState } from 'react';
import { dataService } from '../services/dataService';
import type { PipelineEventLogEntry } from '../types/pipeline';

/**
 * Polls the mock event timeline for the History page.
 */
export function useEventLog(limit: number, lastUpdated: number): PipelineEventLogEntry[] {
  const [entries, setEntries] = useState<PipelineEventLogEntry[]>([]);

  useEffect(() => {
    let cancelled = false;
    void dataService.getEventLog(limit).then((e) => {
      if (!cancelled) {
        setEntries(e);
      }
    });
    const t = window.setInterval(() => {
      void dataService.getEventLog(limit).then((e) => {
        if (!cancelled) {
          setEntries(e);
        }
      });
    }, 8000);
    return () => {
      cancelled = true;
      window.clearInterval(t);
    };
  }, [limit, lastUpdated]);

  return entries;
}
