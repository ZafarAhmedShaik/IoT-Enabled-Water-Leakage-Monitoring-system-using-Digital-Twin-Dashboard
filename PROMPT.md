# PROMPT.md — Bootstrap Instructions for the Coding Agent

Use this file as the **initial high-level instruction** when starting or resetting work on the IoT Pipeline Monitoring Dashboard (e.g. paste into a new agent thread or combine with `@CLAUDE.md`).

---

You are an expert React/TypeScript engineer. You will build a production-grade **IoT Pipeline Monitoring Dashboard** for a university capstone project on water leak detection using digital twin technology.

## Your Working Environment

Target stack: **Vite + React + TypeScript**. The following should be present or added during **Step 1 (Foundation)** as specified in `CLAUDE.md`:

- React
- TypeScript (strict mode)
- Tailwind CSS v3
- Recharts
- Lucide React

You have three reference documents in the **project root**. Read and internalize all three before writing application code:

1. `CLAUDE.md` — Rules, constraints, build order, and definition of done
2. `ARCHITECTURE.md` — Folder structure, TypeScript interfaces, SVG coordinate system, data flow
3. `DESIGN.md` — Color tokens, component specs, typography, animation guidelines

## The Project

This is a real-time digital twin dashboard for a water pipeline monitoring system. The physical system has:
- **3 reservoirs**: A (source, top-left), B (top-right), C (bottom-right)
- **13 pipes** interconnecting the reservoirs through a grid network
- **13 IoT flow sensors** (one per pipe, shown as diamonds on the layout)
- **5 automated valves** at key junctions (shown as circles)

The hardware is not built yet, so the dashboard runs on **simulated mock data**. The architecture must be designed so that switching to real InfluxDB data later requires changing exactly one file (`src/services/dataService.ts`).

## What You Are Building

A dark-themed, industrial control room style dashboard with:

1. **System Stats Bar** — Top header showing total flow, active leaks count, system health, uptime, live clock
2. **Pipeline Canvas** — SVG visualization of the 13-pipe network with color-coded status (green/amber/red), live flow values on sensors, valve states
3. **Alerts Panel** — Right sidebar listing active leak/warning alerts with severity, pipe ID, flow value, timestamp
4. **Flow Chart** — Bottom chart (Recharts) showing flow over time for selected sensors
5. **Leak Simulator** — Dev controls inside the alerts panel to manually trigger/clear leaks on any of the 13 pipes
6. **Settings** — Configurable flow threshold, refresh interval

## Build Order (Do Not Skip Steps)

Follow the build order from `CLAUDE.md` Section 6 exactly. Complete each step fully before the next.

**Start with Step 1: Foundation.**

### Step 1 — Foundation
Set up everything that all other code depends on:

1. **`src/styles/tokens.css`** — All CSS custom properties from `DESIGN.md` Section 2. Import this in `main.tsx`.

2. **`src/config/pipeline.ts`** — Export:
   ```typescript
   export const THRESHOLDS = {
     normal: 6.0,    // L/min — at or above this = normal
     warning: 3.0,   // L/min — at or above this = warning, below = critical
   };
   export const POLL_INTERVAL_MS = 2000;
   export const HISTORY_LENGTH = 60;
   export const PIPES: PipeDefinition[] = [ /* all 13 pipes */ ];
   export const RESERVOIRS: ReservoirDefinition[] = [ /* A, B, C */ ];
   export const VALVES: ValveDefinition[] = [ /* 5 valves */ ];
   export const SENSORS: SensorDefinition[] = [ /* 13 sensors */ ];
   ```
   Use the coordinates from `ARCHITECTURE.md` Section 5 for positions.

3. **`src/types/pipeline.ts`** — All interfaces from `ARCHITECTURE.md` Section 3. Exactly as written.

4. **`tailwind.config.js`** — Extend theme to include IBM Plex Mono and DM Sans font families. Add content paths.

5. **`index.html`** — Add Google Fonts link tag for IBM Plex Mono and DM Sans.

6. **`App.tsx`** — Simple shell that renders `<Dashboard />` wrapped in `<PipelineProvider>`.

When Step 1 is complete, say:
> "Step 1 complete. Files changed: [list]. Ready for Step 2."

Then wait for confirmation before proceeding (unless the user asks to continue without pausing).

---

## Key Constraints (Repeat from CLAUDE.md — Internalize These)

- No 3D visualization
- No pressure sensor data (skip entirely)
- No backend, no API calls to external services (mock only for now)
- No `any` in TypeScript
- No inline styles — only Tailwind classes and CSS variables
- No magic numbers — all values come from `src/config/pipeline.ts`
- No imports from `src/mock/` outside of `src/services/dataService.ts`
- Every component handles loading state AND empty/error state
- All status colors come from CSS variables only
- Pipe layout must match the coordinates in `ARCHITECTURE.md` exactly

---

## Visual Outcome

When complete, the dashboard should look like a professional SCADA/industrial monitoring interface:
- Almost-black background with subtle dot grid
- The pipeline network rendered as colored lines with diamond sensors and circle valves
- Real-time updating (every 2 seconds) with smooth color transitions
- Red pipes glowing when a leak is detected
- Alert panel showing timestamped notifications
- Monospaced font for all numeric data (IBM Plex Mono)

The aesthetic goal is: **"this looks like it belongs in an actual control room, not a student project."**

---

## Begin Now

Read `CLAUDE.md`, `ARCHITECTURE.md`, and `DESIGN.md` in full.
Then begin Step 1.
Output all files for Step 1 in full — no truncation, no placeholders.
