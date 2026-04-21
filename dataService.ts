import { getHistory, tick } from '../mock/generator';
import {
  getEventLogSlice,
  pushEvent,
} from '../mock/eventLog';
import {
  acknowledge,
  getMaintenanceSnapshot,
  markReplace,
} from '../mock/maintenanceStore';
import {
  clearLeak as clearLeakPipe,
  simulateLeak as simulateLeakPipe,
} from '../mock/leakSimulator';
import { ISOLATION_VALVES_BY_PIPE } from '../mock/valvePipeMap';
import {
  getFilterHealthPercent,
  getPumpOn,
  getRoutingModeSnapshot,
  getValveStatesSnapshot,
  getWaterSavedLiters,
  setPumpOnInternal,
  setRoutingModeInternal,
  setValveStateInternal,
} from '../mock/valveStore';
import type {
  DataService,
  PipeId,
  RoutingMode,
  SensorHistory,
  SensorId,
  SystemHealthSnapshot,
  ValveId,
  ValveState,
} from '../types/pipeline';

/**
 * Application data boundary: swap this module’s implementation for InfluxDB later without touching UI.
 */
export const dataService: DataService = {
  /**
   * Runs one simulation step and returns the latest reading per sensor.
   */
  async getLatestReadings() {
    return Promise.resolve(tick());
  },

  /**
   * Returns recent history for charting and diagnostics.
   */
  async getHistory(sensorId: SensorId, limit: number): Promise<SensorHistory> {
    return Promise.resolve(getHistory(sensorId, limit));
  },

  /**
   * Returns valve positions from the mock store.
   */
  async getValveStates(): Promise<Record<ValveId, ValveState>> {
    return Promise.resolve(getValveStatesSnapshot());
  },

  /**
   * Updates mock valve state (simulated SCADA control).
   */
  async setValveState(valveId: ValveId, isOpen: boolean): Promise<void> {
    setValveStateInternal(valveId, isOpen);
    pushEvent({
      kind: 'valve',
      message: `Valve ${valveId} ${isOpen ? 'opened' : 'closed'}`,
      timestamp: Date.now(),
      valveId,
    });
  },

  /**
   * Returns cumulative mock KPIs for header + health widgets.
   */
  async getSystemHealth(): Promise<SystemHealthSnapshot> {
    const snapshot: SystemHealthSnapshot = {
      waterSavedLiters: getWaterSavedLiters(),
      pumpOn: getPumpOn(),
      filterHealthPercent: getFilterHealthPercent(),
    };
    return Promise.resolve(snapshot);
  },

  async setPumpOn(on: boolean): Promise<void> {
    setPumpOnInternal(on);
    pushEvent({
      kind: 'valve',
      message: `Pump ${on ? 'started' : 'stopped'}`,
      timestamp: Date.now(),
    });
  },

  async getRoutingMode(): Promise<RoutingMode> {
    return Promise.resolve(getRoutingModeSnapshot());
  },

  async setRoutingMode(mode: RoutingMode): Promise<void> {
    setRoutingModeInternal(mode);
    pushEvent({
      kind: 'routing',
      message: `Routing profile: ${mode}`,
      timestamp: Date.now(),
    });
  },

  /**
   * Closes a heuristic set of valves to isolate a pipe segment (mock).
   */
  async isolatePipe(pipeId: PipeId): Promise<void> {
    const list = ISOLATION_VALVES_BY_PIPE[pipeId];
    if (list) {
      for (const vid of list) {
        setValveStateInternal(vid, false);
      }
    }
    pushEvent({
      kind: 'valve',
      message: `Isolation sequence executed for pipe ${pipeId}`,
      timestamp: Date.now(),
      pipeId,
    });
  },

  async getMaintenanceMeta() {
    return Promise.resolve(getMaintenanceSnapshot());
  },

  async acknowledgeSensor(sensorId: SensorId): Promise<void> {
    acknowledge(sensorId);
    pushEvent({
      kind: 'resolved',
      message: `Sensor ${sensorId} acknowledged`,
      timestamp: Date.now(),
    });
  },

  async markReplaceSensor(sensorId: SensorId): Promise<void> {
    markReplace(sensorId);
    pushEvent({
      kind: 'alert',
      message: `Sensor ${sensorId} marked for replacement`,
      timestamp: Date.now(),
    });
  },

  async getEventLog(limit: number) {
    return Promise.resolve(getEventLogSlice(limit));
  },

  /**
   * Dev-only hook: force a pipe into leak mode in the mock generator.
   */
  simulateLeak(pipeId: Parameters<DataService['simulateLeak']>[0]): void {
    simulateLeakPipe(pipeId);
    pushEvent({
      kind: 'alert',
      message: `Simulated leak on pipe ${pipeId}`,
      timestamp: Date.now(),
      pipeId,
    });
  },

  /**
   * Dev-only hook: clear simulated leak state for a pipe.
   */
  clearLeak(pipeId: Parameters<DataService['clearLeak']>[0]): void {
    clearLeakPipe(pipeId);
    pushEvent({
      kind: 'resolved',
      message: `Cleared simulated leak on pipe ${pipeId}`,
      timestamp: Date.now(),
      pipeId,
    });
  },
};
