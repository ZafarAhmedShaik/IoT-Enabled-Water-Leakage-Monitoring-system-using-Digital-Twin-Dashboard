import { VALVES } from '../config/pipeline';
import type { RoutingMode, ValveId, ValveState } from '../types/pipeline';

let valves: Record<ValveId, ValveState> = buildInitial();

function buildInitial(): Record<ValveId, ValveState> {
  const v = {} as Record<ValveId, ValveState>;
  for (const def of VALVES) {
    v[def.valveId] = { valveId: def.valveId, isOpen: true };
  }
  return v;
}

let routingMode: RoutingMode = 'default';
let pumpOn = true;
let waterSavedLiters = 30;
let filterHealthPercent = 92;

/**
 * Returns a copy of simulated valve positions.
 */
export function getValveStatesSnapshot(): Record<ValveId, ValveState> {
  return { ...valves };
}

/**
 * Updates one valve in the mock store (immediate UI sync via data service).
 */
export function setValveStateInternal(valveId: ValveId, isOpen: boolean): void {
  valves = { ...valves, [valveId]: { valveId, isOpen } };
}

/**
 * Mock routing profile for “reroute” actions.
 */
export function getRoutingModeSnapshot(): RoutingMode {
  return routingMode;
}

export function setRoutingModeInternal(mode: RoutingMode): void {
  routingMode = mode;
}

export function getPumpOn(): boolean {
  return pumpOn;
}

export function setPumpOnInternal(on: boolean): void {
  pumpOn = on;
}

export function getWaterSavedLiters(): number {
  return waterSavedLiters;
}

export function incrementWaterSaved(deltaLiters: number): void {
  waterSavedLiters = Math.round((waterSavedLiters + deltaLiters) * 1000) / 1000;
}

export function getFilterHealthPercent(): number {
  return filterHealthPercent;
}

export function tickFilterMock(now: number): void {
  filterHealthPercent = Math.round(
    72 + 20 * Math.sin(now / 45000) + (Math.random() - 0.5) * 2,
  );
  filterHealthPercent = Math.max(55, Math.min(99, filterHealthPercent));
}

export function resetMockStoresForTests(): void {
  valves = buildInitial();
  routingMode = 'default';
  pumpOn = true;
  waterSavedLiters = 30;
  filterHealthPercent = 92;
}
