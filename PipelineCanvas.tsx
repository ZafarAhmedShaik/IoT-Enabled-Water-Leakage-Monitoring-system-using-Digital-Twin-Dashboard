import {
  CANVAS_CONTENT_OFFSET_Y,
  CANVAS_VIEWBOX_HEIGHT,
  CANVAS_VIEWBOX_WIDTH,
  PIPES,
  PIPE_IDS,
  RESERVOIRS,
  SENSORS,
  VALVES,
} from '../../config/pipeline';
import { useChartSensorSelection } from '../../context/ChartSensorSelectionContext';
import { usePipelineContext } from '../../context/PipelineContext';
import { usePipelineActions } from '../../hooks/usePipelineActions';
import { FlowStatus, type SensorId } from '../../types/pipeline';
import { PipeIdLabel } from './PipeIdLabel';
import { PipelineLegend } from './PipelineLegend';
import { PipeSegment } from './PipeSegment';
import { PipeWarningLabel } from './PipeWarningLabel';
import { ReservoirNode } from './ReservoirNode';
import { SensorMarker } from './SensorMarker';
import { ValveIndicator } from './ValveIndicator';

/**
 * Main SVG digital twin: pipes, reservoirs, valves, and flow sensor markers.
 */
export function PipelineCanvas() {
  const { state } = usePipelineContext();
  const { setValveState } = usePipelineActions();
  const { isSensorSelected, toggleSensor } = useChartSensorSelection();
  const { sensors, valves, isLoading, lastUpdated } = state;

  const showSkeleton = isLoading && lastUpdated === 0;

  if (showSkeleton) {
    return (
      <div
        className="canvas-dot-grid relative flex min-h-0 flex-1 animate-pulse flex-col overflow-hidden rounded-[inherit] bg-[var(--bg-surface)] p-2 sm:p-3"
        aria-busy
        aria-label="Loading pipeline data"
      />
    );
  }

  return (
    <div className="canvas-dot-grid relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-[inherit] p-2 sm:p-3">
      <PipelineLegend />
      <svg
        viewBox={`0 0 ${CANVAS_VIEWBOX_WIDTH} ${CANVAS_VIEWBOX_HEIGHT}`}
        className="h-full w-full min-h-0 flex-1"
        preserveAspectRatio="xMinYMin meet"
        role="img"
        aria-label="Pipeline schematic"
      >
        <g transform={`translate(0, ${CANVAS_CONTENT_OFFSET_Y})`}>
          {PIPES.map((pipe) => {
            const sensorId = `S${pipe.id}` as SensorId;
            const reading = sensors[sensorId];
            return (
              <PipeSegment
                key={pipe.id}
                pipeId={pipe.id}
                pipeLabel={pipe.label}
                status={reading?.status ?? FlowStatus.UNKNOWN}
                isSelected={isSensorSelected(sensorId)}
                onActivate={() => {
                  toggleSensor(sensorId);
                }}
              />
            );
          })}

          {PIPE_IDS.map((pipeId) => {
            const sensorId = `S${pipeId}` as SensorId;
            return (
              <PipeIdLabel
                key={`pl-${pipeId}`}
                pipeId={pipeId}
                isSelected={isSensorSelected(sensorId)}
              />
            );
          })}

          {RESERVOIRS.map((r) => (
            <ReservoirNode key={r.id} reservoir={r} />
          ))}

          {VALVES.map((v) => {
            const vs = valves[v.valveId];
            return (
              <ValveIndicator
                key={v.valveId}
                valve={v}
                state={vs}
                onActivate={() =>
                  void setValveState(v.valveId, !vs.isOpen)
                }
              />
            );
          })}

          {PIPE_IDS.map((pipeId) => (
            <PipeWarningLabel key={`warn-${pipeId}`} pipeId={pipeId} sensors={sensors} />
          ))}

          {SENSORS.map((sensor) => {
            const reading = sensors[sensor.sensorId];
            const unknown = !reading || reading.timestamp === 0;
            const flowDisplay = unknown
              ? '?'
              : `${reading.flowRate.toFixed(1)} L/min`;
            return (
              <SensorMarker
                key={sensor.sensorId}
                sensor={sensor}
                flowDisplay={flowDisplay}
                status={reading?.status ?? FlowStatus.UNKNOWN}
                isSelected={isSensorSelected(sensor.sensorId)}
                onActivate={() => {
                  toggleSensor(sensor.sensorId);
                }}
              />
            );
          })}
        </g>
      </svg>
    </div>
  );
}
