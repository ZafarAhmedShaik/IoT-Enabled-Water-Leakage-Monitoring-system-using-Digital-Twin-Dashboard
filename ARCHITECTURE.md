# ARCHITECTURE.md — IoT Pipeline Dashboard

## 1. Guiding Principle: The Data Boundary

The single most important architectural decision is the **data boundary**.

```
┌─────────────────────────────────────────────────────────┐
│                    React UI Layer                       │
│   Components only know about: PipelineState interface  │
└─────────────────────────┬───────────────────────────────┘
                          │ usePipelineData() hook
┌─────────────────────────▼───────────────────────────────┐
│               DataService (src/services/)               │
│   translatesMock/InfluxDB data → PipelineState          │
└─────────────────────────┬───────────────────────────────┘
                          │
          ┌───────────────┴───────────────┐
          │                               │
┌─────────▼──────────┐         ┌──────────▼──────────┐
│  Mock Generator    │   OR    │  InfluxDB REST API   │
│  src/mock/         │         │  (future, Phase 2)   │
└────────────────────┘         └─────────────────────┘
```

**To migrate from mock → real data: change only `src/services/dataService.ts`.**
All component code, hooks, and types remain untouched.

---

## 2. Folder Structure

```
src/
├── config/
│   └── pipeline.ts          # Pipe/valve/sensor definitions, thresholds, constants
│
├── types/
│   └── pipeline.ts          # All TypeScript interfaces and enums
│
├── mock/
│   ├── generator.ts         # Generates fake sensor readings
│   └── leakSimulator.ts     # Manages which pipes are in "leak" state
│
├── services/
│   └── dataService.ts       # THE data boundary — only file that imports from mock/
│
├── hooks/
│   ├── usePipelineData.ts   # Main data hook — polls DataService, returns PipelineState
│   └── useAlerts.ts         # Derives alerts from PipelineState
│
├── context/
│   └── PipelineContext.tsx  # React Context + useReducer for global pipeline state
│
├── components/
│   ├── canvas/
│   │   ├── PipelineCanvas.tsx      # SVG container, orchestrates all canvas elements
│   │   ├── PipeSegment.tsx         # Single pipe rectangle, color from flow status
│   │   ├── ValveIndicator.tsx      # Circle, open/closed state
│   │   ├── SensorMarker.tsx        # Diamond, shows live flow value
│   │   └── ReservoirNode.tsx       # Labeled rectangle for A, B, C
│   │
│   ├── panels/
│   │   ├── AlertsPanel.tsx         # Right sidebar, active alert list
│   │   ├── AlertItem.tsx           # Single alert row with severity badge
│   │   ├── SystemStatsBar.tsx      # Top header bar
│   │   └── LeakSimulator.tsx       # Dev controls to trigger/clear leaks
│   │
│   ├── charts/
│   │   ├── FlowChart.tsx           # Recharts LineChart, flow over time
│   │   └── SensorSelector.tsx      # Checkbox list to pick which sensors to plot
│   │
│   ├── settings/
│   │   └── SettingsPanel.tsx       # Threshold config, interval, units
│   │
│   └── ui/
│       ├── StatusBadge.tsx         # Reusable normal/warning/critical badge
│       ├── StatCard.tsx            # Single metric display card
│       └── SectionHeader.tsx       # Consistent section title
│
├── pages/
│   └── Dashboard.tsx               # Root page layout — composes all panels
│
├── styles/
│   └── tokens.css                  # CSS custom properties (design tokens)
│
├── App.tsx
├── main.tsx
└── vite-env.d.ts
```

---

## 3. Core TypeScript Interfaces

```typescript
// src/types/pipeline.ts

export type PipeId = 1|2|3|4|5|6|7|8|9|10|11|12|13;
export type ReservoirId = 'A'|'B'|'C';
export type SensorId = `S${PipeId}`;
export type ValveId = 'VA'|'VB'|'VC'|'VJ4'|'VJ5';

export enum FlowStatus {
  NORMAL = 'normal',
  WARNING = 'warning',
  CRITICAL = 'critical',
  UNKNOWN = 'unknown',
}

export interface SensorReading {
  sensorId: SensorId;
  pipeId: PipeId;
  flowRate: number;          // L/min
  status: FlowStatus;
  timestamp: number;         // Unix ms
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
  triggeredAt: number;       // Unix ms
  resolvedAt?: number;
}

export interface PipelineState {
  sensors: Record<SensorId, SensorReading>;
  history: Record<SensorId, SensorHistory>;
  valves: Record<ValveId, ValveState>;
  alerts: Alert[];
  lastUpdated: number;
  isLoading: boolean;
  error: string | null;
}

export interface PipelineConfig {
  pipes: PipeDefinition[];
  reservoirs: ReservoirDefinition[];
  valves: ValveDefinition[];
  sensors: SensorDefinition[];
}

export interface PipeDefinition {
  id: PipeId;
  label: string;
  from: string;              // junction or reservoir ID
  to: string;
  orientation: 'horizontal' | 'vertical';
}

export interface DataService {
  getLatestReadings(): Promise<Record<SensorId, SensorReading>>;
  getHistory(sensorId: SensorId, limit: number): Promise<SensorHistory>;
  getValveStates(): Promise<Record<ValveId, ValveState>>;
  simulateLeak(pipeId: PipeId): void;    // no-op in production service
  clearLeak(pipeId: PipeId): void;       // no-op in production service
}
```

---

## 4. State Management

Single `PipelineContext` holds all runtime state.

```
PipelineContext
├── state: PipelineState
└── dispatch: Dispatch<PipelineAction>

Actions:
  SET_READINGS     — new sensor batch arrived
  SET_HISTORY      — history loaded for a sensor
  SET_VALVE        — valve state changed
  ADD_ALERT        — new alert generated
  RESOLVE_ALERT    — alert cleared
  SET_ERROR        — data fetch error
  SET_LOADING      — loading toggle
```

`usePipelineData` hook:
- Polls `DataService.getLatestReadings()` every N seconds (configurable, default 2s)
- Derives `FlowStatus` from reading vs threshold
- Dispatches `SET_READINGS` on each poll
- On status change to WARNING/CRITICAL → dispatches `ADD_ALERT`
- On status return to NORMAL → dispatches `RESOLVE_ALERT`

---

## 5. SVG Canvas Coordinate System

The pipeline canvas is a responsive SVG with `viewBox="0 0 900 560"`.
All coordinates below are in SVG units.

### Reservoirs (rect elements)
| ID | x | y | width | height |
|---|---|---|---|---|
| A | 30 | 60 | 90 | 80 |
| B | 730 | 60 | 90 | 80 |
| C | 730 | 400 | 90 | 80 |

### Junctions (reference points, not rendered)
| ID | cx | cy |
|---|---|---|
| J1 | 300 | 100 |
| J2 | 560 | 100 |
| J3 | 120 | 240 |
| J4 | 300 | 240 |
| J5 | 560 | 240 |
| J6 | 120 | 400 |
| J7 | 300 | 400 |
| J8 | 560 | 400 |

### Pipes (rect elements — stroke only, 12px wide)
Each pipe rect is derived from its two junction endpoints.
| Pipe | x1 | y1 | x2 | y2 |
|---|---|---|---|---|
| 1 | 120 | 100 | 300 | 100 |
| 2 | 300 | 100 | 560 | 100 |
| 3 | 560 | 100 | 730 | 100 |
| 4 | 120 | 100 | 120 | 240 |
| 5 | 120 | 240 | 300 | 240 |
| 6 | 300 | 100 | 300 | 240 |
| 7 | 300 | 240 | 560 | 240 |
| 8 | 560 | 100 | 560 | 240 |
| 9 | 120 | 240 | 120 | 400 |
| 10 | 300 | 240 | 300 | 400 |
| 11 | 120 | 400 | 560 | 400 |
| 12 | 560 | 240 | 560 | 400 |
| 13 | 560 | 400 | 730 | 440 |

### Sensor Markers (diamond, midpoint of each pipe)
Place at the midpoint of each pipe segment.

### Valve Circles (r=10)
| Valve | cx | cy |
|---|---|---|
| VA | 120 | 100 |
| VB | 730 | 100 |
| VC | 730 | 440 |
| VJ4 | 300 | 240 |
| VJ5 | 560 | 240 |

---

## 6. Data Flow (Runtime)

```
Every 2 seconds:
  MockGenerator.tick()
    → generates SensorReading[] for all 13 sensors
    → DataService.getLatestReadings() returns them
    → usePipelineData picks them up
    → derives FlowStatus per sensor
    → dispatches SET_READINGS
    → checks for status changes → dispatches alerts
    → PipelineContext state updates
    → all subscribed components re-render

User triggers leak:
  LeakSimulator UI
    → DataService.simulateLeak(pipeId)
    → MockGenerator marks pipeId as leaking
    → Next tick generates low flow for that pipe
    → Status transitions to CRITICAL
    → Alert created
    → Canvas pipe turns red
    → Alert appears in AlertsPanel
```

---

## 7. Phase 2 Migration Path (Future Reference)

When hardware is ready, replace `src/services/dataService.ts` with:

```typescript
// Production implementation (do not build now)
export const dataService: DataService = {
  async getLatestReadings() {
    const res = await fetch('/api/sensors/latest');
    return res.json(); // Same SensorReading shape
  },
  async getHistory(sensorId, limit) {
    const res = await fetch(`/api/sensors/${sensorId}/history?limit=${limit}`);
    return res.json();
  },
  async getValveStates() {
    const res = await fetch('/api/valves');
    return res.json();
  },
  simulateLeak: () => {},   // no-op in production
  clearLeak: () => {},      // no-op in production
};
```

Zero changes to hooks, context, or components.
