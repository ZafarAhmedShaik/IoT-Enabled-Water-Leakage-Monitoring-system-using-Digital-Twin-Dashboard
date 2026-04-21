export type PipeId =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13;
export type ReservoirId = 'A' | 'B' | 'C';
export type SensorId = `S${PipeId}`;
export type ValveId =
  | 'VB'
  | 'VC'
  | 'VJ1'
  | 'VJ2'
  | 'VJ3'
  | 'VJ4'
  | 'VJ5'
  | 'VJ7'
  | 'VJ8';

/** Flow health classification (string union; const object avoids TS `enum` under `erasableSyntaxOnly`). */
export const FlowStatus = {
  NORMAL: 'normal',
  WARNING: 'warning',
  CRITICAL: 'critical',
  UNKNOWN: 'unknown',
} as const;

export type FlowStatus = (typeof FlowStatus)[keyof typeof FlowStatus];

export interface SensorReading {
  sensorId: SensorId;
  pipeId: PipeId;
  flowRate: number; // L/min
  status: FlowStatus;
  /** Mock gauge pressure (kPa) for Maintenance / Analytics wireframes. */
  pressureKpa: number;
  pressureStatus: FlowStatus;
  timestamp: number; // Unix ms
}

export interface SensorHistory {
  sensorId: SensorId;
  readings: SensorReading[]; // Last 60 readings, newest last
}

export interface ValveState {
  valveId: ValveId;
  isOpen: boolean;
}

export interface Alert {
  id: string;
  pipeId: PipeId;
  sensorId: SensorId;
  severity: 'warning' | 'critical';
  message: string;
  triggeredAt: number; // Unix ms
  resolvedAt?: number;
}

/** Aggregated mock health for header + System Health panel. */
export interface SystemHealthSnapshot {
  waterSavedLiters: number;
  pumpOn: boolean;
  filterHealthPercent: number;
}

/** Per-sensor maintenance row metadata (mock-backed). */
export interface SensorMaintenanceMeta {
  reviewedAt: number | null;
  pendingAction: 'none' | 'replace' | 'inspect';
}

export interface PipelineEventLogEntry {
  id: string;
  kind: 'alert' | 'resolved' | 'valve' | 'routing';
  message: string;
  timestamp: number;
  pipeId?: PipeId;
  valveId?: ValveId;
}

export interface PipelineState {
  sensors: Record<SensorId, SensorReading>;
  history: Record<SensorId, SensorHistory>;
  valves: Record<ValveId, ValveState>;
  systemHealth: SystemHealthSnapshot;
  alerts: Alert[];
  lastUpdated: number;
  isLoading: boolean;
  error: string | null;
}

export interface PipeDefinition {
  id: PipeId;
  label: string;
  from: string; // junction or reservoir ID
  to: string;
  orientation: 'horizontal' | 'vertical';
}

/** SVG layout for a reservoir (ARCHITECTURE.md §5). */
export interface ReservoirDefinition {
  id: ReservoirId;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

/** SVG placement for a valve (ARCHITECTURE.md §5). */
export interface ValveDefinition {
  valveId: ValveId;
  cx: number;
  cy: number;
}

/** SVG placement for a flow sensor marker (midpoint of its pipe segment). */
export interface SensorDefinition {
  sensorId: SensorId;
  pipeId: PipeId;
  cx: number;
  cy: number;
}

export interface PipelineConfig {
  pipes: PipeDefinition[];
  reservoirs: ReservoirDefinition[];
  valves: ValveDefinition[];
  sensors: SensorDefinition[];
}

export type RoutingMode = 'default' | 'rerouteNorth' | 'rerouteSouth';

export interface DataService {
  getLatestReadings(): Promise<Record<SensorId, SensorReading>>;
  getHistory(sensorId: SensorId, limit: number): Promise<SensorHistory>;
  getValveStates(): Promise<Record<ValveId, ValveState>>;
  setValveState(valveId: ValveId, isOpen: boolean): Promise<void>;
  getSystemHealth(): Promise<SystemHealthSnapshot>;
  setPumpOn(on: boolean): Promise<void>;
  getRoutingMode(): Promise<RoutingMode>;
  setRoutingMode(mode: RoutingMode): Promise<void>;
  isolatePipe(pipeId: PipeId): Promise<void>;
  getMaintenanceMeta(): Promise<Record<SensorId, SensorMaintenanceMeta>>;
  acknowledgeSensor(sensorId: SensorId): Promise<void>;
  markReplaceSensor(sensorId: SensorId): Promise<void>;
  getEventLog(limit: number): Promise<PipelineEventLogEntry[]>;
  simulateLeak(pipeId: PipeId): void; // no-op in production service
  clearLeak(pipeId: PipeId): void; // no-op in production service
}

/** Actions for the pipeline UI state reducer (ARCHITECTURE.md §4). */
export type PipelineAction =
  | { type: 'SET_READINGS'; payload: Record<SensorId, SensorReading> }
  | {
    type: 'SET_HISTORY';
    payload: { sensorId: SensorId; history: SensorHistory };
  }
  | {
    type: 'APPLY_POLL';
    payload: {
      sensors: Record<SensorId, SensorReading>;
      history: Record<SensorId, SensorHistory>;
      lastUpdated: number;
    };
  }
  | { type: 'SET_VALVE'; payload: ValveState }
  | {
    type: 'SET_SYSTEM_HEALTH';
    payload: SystemHealthSnapshot;
  }
  | { type: 'ADD_ALERT'; payload: Alert }
  | { type: 'RESOLVE_ALERT'; payload: { alertId: string } }
  | { type: 'RESOLVE_ALERTS_FOR_PIPE'; payload: { pipeId: PipeId } }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_LAST_UPDATED'; payload: number };
