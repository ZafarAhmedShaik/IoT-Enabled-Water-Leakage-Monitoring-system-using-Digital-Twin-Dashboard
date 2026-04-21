# DESIGN.md — Visual Design System

## 1. Aesthetic Direction

**Theme**: Industrial Control Room — Dark, precise, utilitarian with vivid status accents.

Think: offshore oil platform SCADA system meets modern SaaS dashboard.
- Almost-black backgrounds with subtle cool undertones
- Monospaced data displays
- Status colors that pop against the dark surface with authority
- Thin, precise lines for the pipeline canvas
- No gradients on data elements — only on backgrounds

**Typography**:
- Display / labels: `IBM Plex Mono` (monospaced, industrial feel)
- Body / UI: `DM Sans` (clean, readable at small sizes)
- Status numbers: `IBM Plex Mono` always

Load via Google Fonts in `index.html`:
```html
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet">
```

---

## 2. Color Tokens

Define all of these as CSS custom properties in `src/styles/tokens.css`.

```css
:root {
  /* Backgrounds */
  --bg-base: #0a0e14;           /* Page background */
  --bg-surface: #111720;        /* Cards, panels */
  --bg-elevated: #1a2233;       /* Modals, dropdowns */
  --bg-hover: #1e2a3d;          /* Hover state on interactive elements */

  /* Borders */
  --border-subtle: #1e2a3d;     /* Between sections */
  --border-default: #2a3a52;    /* Card borders, inputs */
  --border-strong: #3d5278;     /* Focused elements */

  /* Text */
  --text-primary: #e8edf5;      /* Main content */
  --text-secondary: #8899b4;    /* Labels, metadata */
  --text-muted: #4a5f7a;        /* Placeholders, disabled */
  --text-inverse: #0a0e14;      /* Text on colored backgrounds */

  /* Status — Pipeline */
  --status-normal: #22c55e;     /* Green — flow OK */
  --status-normal-bg: #052e16;  /* Green tinted bg */
  --status-normal-glow: rgba(34, 197, 94, 0.25);

  --status-warning: #f59e0b;    /* Amber — low flow */
  --status-warning-bg: #2d1a00;
  --status-warning-glow: rgba(245, 158, 11, 0.25);

  --status-critical: #ef4444;   /* Red — leak/blockage */
  --status-critical-bg: #2d0a0a;
  --status-critical-glow: rgba(239, 68, 68, 0.4);

  --status-unknown: #4a5f7a;    /* Grey — no data */
  --status-unknown-bg: #111720;

  /* Pipeline Canvas */
  --pipe-width: 12px;           /* Stroke width for pipe lines */
  --pipe-bg: #1a2233;           /* Inactive pipe background */
  --pipe-border: #2a3a52;       /* Pipe outline */

  --valve-open: #22c55e;        /* Open valve fill */
  --valve-closed: #ef4444;      /* Closed valve fill */
  --valve-ring: #e8edf5;        /* Valve circle outline */

  --sensor-fill: #1a2233;       /* Diamond background */
  --sensor-stroke: #3d5278;     /* Diamond outline */
  --sensor-text: #e8edf5;       /* Value label */

  --reservoir-fill: #111720;    /* Reservoir rect fill */
  --reservoir-stroke: #3d5278;  /* Reservoir border */
  --reservoir-text: #e8edf5;    /* Reservoir label */

  /* Brand accent */
  --accent: #3b82f6;            /* Blue — interactive elements, selection */
  --accent-hover: #2563eb;
  --accent-muted: rgba(59, 130, 246, 0.15);

  /* Spacing scale */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;

  /* Border radius */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 10px;

  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-base: 250ms ease;
  --transition-slow: 500ms ease;
}
```

---

## 3. Layout Structure

```
┌─────────────────────────────────────────────────────────────────┐
│  SystemStatsBar (h: 64px, full width)                           │
│  [Total Flow] [Active Leaks] [System Health] [Uptime] [Clock]   │
├─────────────────────────────────────┬───────────────────────────┤
│                                     │                           │
│   PipelineCanvas                    │   AlertsPanel             │
│   (flex-1, min-h: 480px)           │   (w: 320px, fixed)       │
│                                     │                           │
│   SVG viewBox 900×560               │   Scrollable alert list   │
│                                     │   + LeakSimulator         │
├─────────────────────────────────────┴───────────────────────────┤
│                                                                  │
│   FlowChart (h: 200px, full width)                               │
│   Recharts LineChart — last 60 readings per selected sensor      │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

**Responsive behavior**: Below 1024px, right panel collapses to a bottom sheet. Below 768px, chart moves below the bottom sheet.

---

## 4. Component Specs

### SystemStatsBar
```
height: 64px
background: var(--bg-surface)
border-bottom: 1px solid var(--border-subtle)
padding: 0 24px
display: flex, align-items: center, gap: 32px

Left: Logo mark (blue circle 28px) + "PIPELINE MONITOR" in IBM Plex Mono 11px tracking-widest
Center: Stat cards spaced evenly
Right: Settings gear icon (20px) + current time in IBM Plex Mono
```

**StatCard inside bar**:
```
label: DM Sans 11px var(--text-muted) uppercase tracking-wider
value: IBM Plex Mono 20px bold, color depends on status
unit: IBM Plex Mono 11px var(--text-secondary)
```

### PipelineCanvas
```
background: var(--bg-base)
padding: 32px
SVG fills container, viewBox="0 0 900 560"
Subtle dot-grid background pattern (CSS background-image radial-gradient)
```

**Dot grid pattern**:
```css
background-image: radial-gradient(circle, var(--border-subtle) 1px, transparent 1px);
background-size: 24px 24px;
```

**PipeSegment** (SVG line element):
```
stroke-width: 12
stroke-linecap: round
color: var(--status-normal) | var(--status-warning) | var(--status-critical)
transition: stroke 500ms ease
filter: drop-shadow when status is critical (glow effect)
  drop-shadow(0 0 6px var(--status-critical-glow))
```

**ReservoirNode** (SVG rect + text):
```
width: 72, height: 52
rx: 6
fill: var(--reservoir-fill)
stroke: var(--reservoir-stroke), stroke-width: 1.5
Label: IBM Plex Mono 18px bold, centered, var(--text-primary)
Subtext: "RESERVOIR" in 9px var(--text-muted) uppercase
```

**ValveIndicator** (SVG circle):
```
r: 8
fill: var(--valve-open) or var(--valve-closed)
stroke: var(--valve-ring), stroke-width: 2
Tooltip on hover: "Valve [ID] — Open/Closed"
transition: fill 250ms ease
```

**SensorMarker** (SVG polygon — diamond shape):
```
points: compute from center cx,cy with size 14
  (cx, cy-14), (cx+14, cy), (cx, cy+14), (cx-14, cy)
fill: var(--sensor-fill)
stroke: same as pipe status color
stroke-width: 2
transition: stroke 500ms ease

Value label below: IBM Plex Mono 10px, var(--status-{x}) color
  format: "7.3 L/m"
  background: var(--bg-surface) with 4px padding, 3px radius
```

### AlertsPanel
```
width: 320px
background: var(--bg-surface)
border-left: 1px solid var(--border-subtle)
display: flex flex-col

Header (48px):
  "ACTIVE ALERTS" — IBM Plex Mono 11px uppercase var(--text-muted)
  Alert count badge — red circle, number

Alert list (flex-1, overflow-y: auto):
  Each AlertItem: 72px min-height
  New alerts animate in from right (translateX + opacity)
```

**AlertItem**:
```
padding: 12px 16px
border-bottom: 1px solid var(--border-subtle)
border-left: 3px solid var(--status-critical) or var(--status-warning)
background: var(--status-critical-bg) or var(--status-warning-bg)

Line 1: "PIPE [N] — [CRITICAL|WARNING]" IBM Plex Mono 12px bold
Line 2: "Low flow: 1.4 L/min" DM Sans 13px var(--text-secondary)
Line 3: timestamp DM Sans 11px var(--text-muted)
```

### FlowChart (Recharts)
```
background: var(--bg-surface)
border-top: 1px solid var(--border-subtle)
padding: 16px 24px
height: 200px

LineChart:
  background: transparent
  CartesianGrid: stroke var(--border-subtle), strokeDasharray "3 3"
  XAxis: IBM Plex Mono 10px var(--text-muted), shows time HH:MM:SS
  YAxis: IBM Plex Mono 10px var(--text-muted), domain [0, 15]
  ReferenceLine at threshold (y=6): stroke var(--status-warning) strokeDasharray "4 4"

  Each sensor line:
    stroke: var(--status-{current status of that sensor})
    strokeWidth: 2
    dot: false (too many points)
    activeDot: r=4

  Legend: custom render, DM Sans 11px, colored dots matching lines
```

### LeakSimulator (dev panel, inside AlertsPanel bottom)
```
background: var(--bg-elevated)
border-top: 1px solid var(--border-default)
padding: 12px 16px

Header: "LEAK SIMULATOR" IBM Plex Mono 10px var(--text-muted) + DEV badge

Pipe buttons: 13 small buttons P01–P13
  default: var(--bg-hover) border var(--border-default)
  active (leaking): var(--status-critical-bg) border var(--status-critical)
  size: 32px × 28px, IBM Plex Mono 10px
  arranged in a 7-column grid
```

### StatusBadge (reusable)
```
display: inline-flex align-items: center gap: 6px
padding: 2px 8px
border-radius: 100px
font: DM Sans 11px 500

normal:   bg var(--status-normal-bg)   color var(--status-normal)   dot green
warning:  bg var(--status-warning-bg)  color var(--status-warning)  dot amber
critical: bg var(--status-critical-bg) color var(--status-critical) dot red (pulsing)
unknown:  bg var(--status-unknown-bg)  color var(--text-muted)

Pulsing animation on critical dot:
  @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.3 } }
  animation: pulse 1.2s ease-in-out infinite
```

---

## 5. Animation Guidelines

| Interaction | Animation |
|---|---|
| Pipe status change | `stroke` transition 500ms ease |
| New alert arrives | Slide in from right, 300ms |
| Alert resolved | Fade out 200ms |
| Critical sensor marker | Subtle scale pulse 1.5s loop |
| Dashboard initial load | Staggered fade-in of panels, 50ms delay each |
| Stats update | Number counter tick (CSS transform, 150ms) |

---

## 6. Empty & Loading States

**Loading (initial)**:
- Entire canvas shows skeleton with `var(--bg-elevated)` animated shimmer
- Stats bar shows `---` values
- Alerts panel shows "Waiting for data..."

**No alerts**:
- Alerts panel shows centered icon (CheckCircle from Lucide) + "All systems normal"
- Color: var(--status-normal), icon 32px

**Sensor unknown**:
- SensorMarker shows `?` instead of value
- stroke: var(--status-unknown)
