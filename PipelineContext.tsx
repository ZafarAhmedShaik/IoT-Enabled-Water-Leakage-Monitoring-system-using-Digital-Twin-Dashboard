/* Context modules export a hook alongside the provider — expected for Fast Refresh. */
/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useReducer,
  type Dispatch,
  type ReactNode,
} from 'react';
import { PIPE_IDS, VALVES } from '../config/pipeline';
import {
  FlowStatus,
  type PipelineAction,
  type PipelineState,
  type SensorHistory,
  type SensorId,
  type SensorReading,
  type ValveId,
  type ValveState,
} from '../types/pipeline';

type PipelineContextValue = {
  state: PipelineState;
  dispatch: Dispatch<PipelineAction>;
};

const PipelineContext = createContext<PipelineContextValue | null>(null);

/**
 * Builds the initial empty history map for every sensor (Step 2 will populate readings).
 */
function createInitialHistory(): Record<SensorId, SensorHistory> {
  const history = {} as Record<SensorId, SensorHistory>;
  for (const pipeId of PIPE_IDS) {
    const sensorId = `S${pipeId}` as SensorId;
    history[sensorId] = { sensorId, readings: [] };
  }
  return history;
}

/**
 * Builds placeholder sensor readings until the data layer delivers live values.
 */
function createInitialSensors(): Record<SensorId, SensorReading> {
  const sensors = {} as Record<SensorId, SensorReading>;
  for (const pipeId of PIPE_IDS) {
    const sensorId = `S${pipeId}` as SensorId;
    sensors[sensorId] = {
      sensorId,
      pipeId,
      flowRate: 0,
      pressureKpa: 0,
      status: FlowStatus.UNKNOWN,
      pressureStatus: FlowStatus.UNKNOWN,
      timestamp: 0,
    };
  }
  return sensors;
}

/**
 * Default valve positions for the mock system (all open).
 */
function createInitialValves(): Record<ValveId, ValveState> {
  const valves = {} as Record<ValveId, ValveState>;
  for (const v of VALVES) {
    valves[v.valveId] = { valveId: v.valveId, isOpen: true };
  }
  return valves;
}

/**
 * Creates the initial pipeline state before polling or mock data is attached.
 */
function createInitialPipelineState(): PipelineState {
  return {
    sensors: createInitialSensors(),
    history: createInitialHistory(),
    valves: createInitialValves(),
    systemHealth: {
      waterSavedLiters: 30,
      pumpOn: true,
      filterHealthPercent: 92,
    },
    alerts: [],
    lastUpdated: 0,
    isLoading: true,
    error: null,
  };
}

/**
 * Reduces pipeline actions into the next immutable `PipelineState`.
 */
function pipelineReducer(
  state: PipelineState,
  action: PipelineAction,
): PipelineState {
  switch (action.type) {
    case 'SET_READINGS':
      return { ...state, sensors: action.payload };
    case 'APPLY_POLL':
      return {
        ...state,
        sensors: action.payload.sensors,
        history: action.payload.history,
        lastUpdated: action.payload.lastUpdated,
        isLoading: false,
        error: null,
      };
    case 'SET_HISTORY':
      return {
        ...state,
        history: {
          ...state.history,
          [action.payload.sensorId]: action.payload.history,
        },
      };
    case 'SET_VALVE':
      return {
        ...state,
        valves: {
          ...state.valves,
          [action.payload.valveId]: action.payload,
        },
      };
    case 'SET_SYSTEM_HEALTH':
      return { ...state, systemHealth: action.payload };
    case 'ADD_ALERT':
      return { ...state, alerts: [...state.alerts, action.payload] };
    case 'RESOLVE_ALERT': {
      const now = Date.now();
      return {
        ...state,
        alerts: state.alerts.map((a) =>
          a.id === action.payload.alertId ? { ...a, resolvedAt: now } : a,
        ),
      };
    }
    case 'RESOLVE_ALERTS_FOR_PIPE': {
      const now = Date.now();
      const { pipeId } = action.payload;
      return {
        ...state,
        alerts: state.alerts.map((a) =>
          a.pipeId === pipeId && a.resolvedAt === undefined
            ? { ...a, resolvedAt: now }
            : a,
        ),
      };
    }
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_LAST_UPDATED':
      return { ...state, lastUpdated: action.payload };
    default: {
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}

/**
 * Provides pipeline state and dispatch to the dashboard subtree.
 */
export function PipelineProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(
    pipelineReducer,
    undefined,
    (): PipelineState => createInitialPipelineState(),
  );

  return (
    <PipelineContext.Provider value={{ state, dispatch }}>
      {children}
    </PipelineContext.Provider>
  );
}

/**
 * Returns the pipeline context; throws if used outside `PipelineProvider`.
 */
export function usePipelineContext(): PipelineContextValue {
  const ctx = useContext(PipelineContext);
  if (!ctx) {
    throw new Error('usePipelineContext must be used within PipelineProvider');
  }
  return ctx;
}
