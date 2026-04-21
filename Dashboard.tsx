import { AlertsPanel } from '../components/panels/AlertsPanel';
import { LeakSimulator } from '../components/panels/LeakSimulator';
import { SystemHealthPanel } from '../components/panels/SystemHealthPanel';
import { FlowChart } from '../components/charts/FlowChart';
import { PipelineCanvas } from '../components/canvas/PipelineCanvas';
import { ChartSensorSelectionProvider } from '../context/ChartSensorSelectionContext';

/**
 * Main digital twin view: SVG canvas, flow chart, alerts, health, and leak simulator.
 */
export default function Dashboard() {
  return (
    <ChartSensorSelectionProvider>
    <div className="flex min-h-0 min-w-0 flex-1 gap-4 p-3 sm:p-4">
      <div className="dashboard-pipeline-stack grid min-h-0 min-w-0 flex-1 gap-4">
        <div className="surface-elevated flex min-h-0 min-w-0 flex-col overflow-hidden">
          <PipelineCanvas />
        </div>
        <div className="surface-elevated flex min-w-0 shrink-0 flex-col">
          <FlowChart />
        </div>
      </div>
      <div className="surface-elevated flex self-stretch min-h-0 w-[min(22rem,100%)] shrink-0 flex-col overflow-hidden">
        <SystemHealthPanel variant="railTop" />
        <AlertsPanel />
        <div className="shrink-0">
          <LeakSimulator />
        </div>
      </div>
    </div>
    </ChartSensorSelectionProvider>
  );
}
