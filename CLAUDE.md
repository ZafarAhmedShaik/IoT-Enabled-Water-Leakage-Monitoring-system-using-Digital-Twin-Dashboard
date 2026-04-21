# CLAUDE.md — Agent Instructions for IoT Pipeline Dashboard

> **Primary agent context for this repository.** Read this file fully before writing substantial code. Re-read the relevant sections before starting each new task.
>
> Companion docs: `ARCHITECTURE.md` (structure, types, coordinates), `DESIGN.md` (tokens, UI specs). For a bootstrap one-shot, see `PROMPT.md`.

---

## 1. Project Overview

This repo targets a **React + Vite digital twin dashboard** for an IoT water pipeline monitoring system.
The physical system has 13 pipes, 3 reservoirs (A, B, C), automated valves, and IoT flow/pressure sensors.
The hardware is not ready yet — the dashboard runs entirely on **simulated/mock data** for now.
The codebase must be architected so that swapping mock data for real InfluxDB data later requires changing **only one file** (`src/services/dataService.ts`).

**Repository reality**: If `package.json` is missing dependencies listed in Section 3, add them during **Step 1 (Foundation)**—do not assume they are already installed.

---

## 2. Non-Negotiable Rules

### Code Quality
- Every component must be typed with TypeScript interfaces (no `any`)
- No inline styles — use CSS Modules or Tailwind classes only
- No hardcoded magic numbers — use constants from `src/config/pipeline.ts`
- No placeholder `// TODO` stubs left in finished features — complete what you start
- All functions must have JSDoc comments explaining their purpose

### Architecture Integrity
- The data layer is **completely isolated** — UI components never call data functions directly
- Data flows: `DataService` → `usePipelineData` hook → components
- To swap mock → real data: change ONLY `src/services/dataService.ts`
- Never import from `src/mock/` anywhere except `src/services/dataService.ts`

### File Discipline
- Strictly follow the folder structure in `ARCHITECTURE.md`
- One component per file, filename matches component name exactly
- Export components as named exports, not default exports (except pages)

### Design
- Follow the design tokens in `DESIGN.md` exactly — no improvised colors
- Pipeline canvas SVG must match the layout in `DESIGN.md` / `ARCHITECTURE.md` (pipe IDs, positions, connections)
- All status colors must come from the `STATUS` token map / CSS variables

---

## 3. Tech Stack (Fixed — Do Not Change)

| Layer | Technology |
|---|---|
| Framework | React + Vite |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v3 |
| Charts | Recharts |
| State | React Context + useReducer (no Redux) |
| Icons | Lucide React |
| Data (now) | Mock simulation in `src/mock/` |
| Data (later) | InfluxDB via Python REST API |
| Linting | ESLint + Prettier (use project config) |

**Do not install additional dependencies beyond this stack without explicit instruction.**
**Recharts and Lucide React must be available when you implement charting and icons—add them in Foundation if missing.**

---

## 4. Pipeline Domain Knowledge

### Reservoirs
| ID | Label | Position |
|---|---|---|
| A | Source / Reservoir A | Top-left |
| B | Reservoir B | Top-right |
| C | Reservoir C | Bottom-right |

### Pipes (13 total)
| Pipe | From | To | Orientation |
|---|---|---|---|
| 1 | A (right) | Junction J1 | Horizontal |
| 2 | J1 | Junction J2 | Horizontal |
| 3 | J2 | B (left) | Horizontal |
| 4 | A (bottom) | Junction J3 | Vertical |
| 5 | J3 | Junction J4 | Horizontal |
| 6 | J1 | Junction J4 | Vertical |
| 7 | J4 | Junction J5 | Horizontal |
| 8 | J2 | Junction J5 | Vertical |
| 9 | J3 | Junction J6 | Horizontal |
| 10 | J4 | Junction J7 | Vertical |
| 11 | J7 | Junction J8 | Horizontal |
| 12 | J5 | Junction J8 | Vertical |
| 13 | J8 | C (left) | Horizontal |

### Sensor Placement (diamonds on the layout)
Each pipe has one sensor. Sensor ID = `S{pipeId}` e.g. `S1`, `S7`, `S13`.

### Valve Placement (circles on the layout)
Valves sit at key junctions. Valve ID = `V{junctionId}` e.g. `VA` (at A exit), `VB` (at B inlet), `VC` (at C inlet), `VJ4`, `VJ5`.

### Flow Thresholds
- **Normal**: flow ≥ 6.0 L/min → green
- **Warning**: 3.0 ≤ flow < 6.0 L/min → amber
- **Critical**: flow < 3.0 L/min → red (leak/blockage)
- Threshold values live in `src/config/pipeline.ts` as constants

---

## 5. Mock Data Behavior

The mock simulator must:
- Generate a reading every **2 seconds** for all 13 sensors simultaneously
- Normal flow: random value between 7.0 – 12.0 L/min with ±0.3 jitter
- Leak simulation: when a pipe is set to "leaking", its flow drops to 0.5 – 2.5 L/min
- History: keep the last **60 readings** per sensor (2 minutes of data)
- Expose a `simulateLeak(pipeId)` and `clearLeak(pipeId)` function for manual testing via UI

---

## 6. Build Order

Build features in this exact order. Complete each before starting the next.

1. **Foundation** — Vite config, Tailwind setup, folder structure, TypeScript config, design tokens as CSS vars
2. **Data Layer** — `PipelineConfig`, mock generator, `DataService`, `usePipelineData` hook
3. **Pipeline Canvas** — SVG layout matching `DESIGN.md`, static first, then wired to data
4. **Sensor Overlays** — Live flow values on canvas, color-coded status
5. **Alerts Panel** — Right sidebar, active alerts list, severity badges
6. **Flow Charts** — `FlowChart` component using Recharts, one line per selected sensor
7. **System Stats Bar** — Top bar: total flow, uptime, active leaks count, system health
8. **Leak Simulator Controls** — Dev panel to manually trigger/clear leak on any pipe
9. **Settings Panel** — Threshold configurator, refresh interval, unit toggle (L/min ↔ m³/h)
10. **Polish** — Animations, loading states, empty states, responsive layout

---

## 7. What NOT to Do

- Do not build a 3D visualization
- Do not add pressure sensor support (no pressure data in mock or UI)
- Do not install Grafana or any backend — this is a pure React frontend
- Do not use `useEffect` for data polling directly in components — use the hook
- Do not use `localStorage` for anything
- Do not use `any` type in TypeScript
- Do not create a login/auth screen
- Do not add a map view (the SVG canvas IS the map)
- Do not use random `Math.random()` calls outside of `src/mock/` files

---

## 8. Definition of Done (Per Feature)

A feature is complete when:
- [ ] It renders correctly with mock data
- [ ] TypeScript has zero errors (`tsc --noEmit` passes)
- [ ] It uses only tokens from the design system
- [ ] It handles the loading state (data not yet available)
- [ ] It handles the error/empty state
- [ ] The data service interface is unchanged (no new imports from mock)

---

## 9. Milestone Reporting

After completing each numbered step from Section 6, state clearly:

> "Step N complete. Files changed: [list]. Ready for Step N+1."

Avoid bundling multiple steps into one response unless the user asks for it.
