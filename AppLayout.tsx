import { Outlet } from 'react-router-dom';
import { usePipelineContext } from '../../context/PipelineContext';
import { usePipelineData } from '../../hooks/usePipelineData';
import { AppHeader } from './AppHeader';
import { AppNav } from './AppNav';

/**
 * Keeps mock polling attached for all routes under the main shell.
 */
function PipelineDataHost() {
  usePipelineData();
  return null;
}

/**
 * Wireframe shell: left nav, KPI header, routed main content.
 */
export function AppLayout() {
  const { state } = usePipelineContext();

  return (
    <div className="flex h-dvh max-h-dvh flex-col overflow-hidden bg-[var(--bg-base)] text-[var(--text-primary)]">
      <PipelineDataHost />
      {state.error ? (
        <div
          role="alert"
          className="border-b border-[var(--status-critical)] bg-[var(--status-critical-bg)] px-4 py-2 font-mono text-sm text-[var(--status-critical)]"
        >
          {state.error}
        </div>
      ) : null}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <div className="flex min-h-0 shrink-0 flex-col">
          <AppNav />
        </div>
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <AppHeader />
          <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[var(--bg-base)]">
            <div className="scrollbar-themed min-h-0 flex-1 overflow-x-hidden overflow-y-auto">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
