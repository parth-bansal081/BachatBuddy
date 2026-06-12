# Phase 1 — 3D Foundation Implementation Plan

> **Goal:** Establish React Three Fiber 3D component library with shared hooks and upgrade Dashboard with 3D charts + particles.

**Architecture:** Per-page `<Canvas>` from shared `src/components/three/` library. 3D charts replace Recharts on Dashboard. Device tier + WebGL fallback built in from day one.

**Tech Stack (added):** `three@0.170` `@react-three/fiber@8` `@react-three/drei@9` `@react-spring/three` `@types/three`

## Tasks Completed

### Task 1: Install Dependencies
- Added: `three@0.170`, `@react-three/fiber@8`, `@react-three/drei@9`, `@react-spring/three`, `@types/three@0.170`
- Using React 18-compatible versions (R3F v8, drei v9)
- Build verified: 4635 modules compiled, no errors

### Task 2: useWebGLSupport hook
**File:** `src/hooks/useWebGLSupport.ts`
- Checks for WebGL2 then WebGL1
- Returns `{supported: boolean, checked: boolean}`
- Used by ThreeScene/ThreeErrorBoundary for graceful fallback

### Task 3: useDeviceTier hook
**File:** `src/hooks/useDeviceTier.ts`
- Classifies device as `"high" | "mid" | "low"`
- Factors: `deviceMemory`, `hardwareConcurrency`, screen width
- Used by ParticleField to adjust particle count, ThreeScene for DPR

### Task 4: useThreeTheme hook
**File:** `src/hooks/useThreeTheme.ts`
- Exports `BACHAT_GREEN`, `BG_DARK`, `CHART_COLORS` array (8 colors)
- Used by ThreeScene (lighting), ThreeBarChart/ThreeRingChart (segment colors)

### Task 5: ThreeErrorBoundary component
**File:** `src/components/three/ThreeErrorBoundary.tsx`
- Class component error boundary
- Falls back to a "3D view unavailable" message with 2D fallback option
- Wraps every `<Canvas>` instance

### Task 6: ThreeScene wrapper
**File:** `src/components/three/ThreeScene.tsx`
- Props: `children`, `height` (default 400px), `disableOrbit`
- Sets up: Canvas, camera (0,0,8 fov:50), ambientLight, directionalLight (Bachat green), OrbitControls
- Uses useDeviceTier for adaptive DPR
- Uses useThreeTheme for lighting color
- Wrapped in ThreeErrorBoundary + Suspense
- Transparent background with alpha:true

### Task 7: ThreeBarChart component
**File:** `src/components/three/ThreeBarChart.tsx`
- Props: `data: {label, value, color?}[]`, `width: 8`, `maxHeight: 4`
- Bars: RoundedBox (from drei) per data point
- Hover: bar lifts, emissive glow increases
- Labels: Text (from drei) above bar, label below bar
- Grid: 5 horizontal reference lines at 0/25/50/75/100%
- Empty state: returns null when data is empty

### Task 8: ThreeRingChart component
**File:** `src/components/three/ThreeRingChart.tsx`
- Props: `segments: {label, value, color?}[]`, `radius: 3`, `thickness: 1.2`, `depth: 0.4`
- Segments: ExtrudeGeometry donut arcs with Shape path
- Hover: segment extends on Z-axis, emissive glow
- Labels: Text labels positioned outside each segment midpoint
- Center: Html overlay showing total value
- Empty state: returns null when segments is empty

### Task 9: ParticleField component
**File:** `src/components/three/ParticleField.tsx`
- Props: `count`, `spread`, `speed`, `color`
- Uses InstancedMesh for single-draw-call performance
- Particle count adapts to device tier (400/150/0)
- Animation: sinusoidal drift with per-particle phase offset
- Empty state: returns null on low tier or count=0

### Task 10: Barrel index
**File:** `src/components/three/index.ts`
- Exports: ThreeScene, ThreeBarChart (BarData type), ThreeRingChart (RingSegment type), ParticleField, ThreeErrorBoundary

### Task 11: Dashboard upgrade
**File:** `src/pages/Dashboard.tsx`
- Removed: `SpendingChart`, `CategoryPieChart` imports
- Added: `ThreeScene`, `ThreeBarChart`, `ThreeRingChart`, `ParticleField` imports
- Replaced: `<SpendingChart>` → `<ThreeScene>` with `<ParticleField>` + `<ThreeBarChart>`
- ThreeBarChart receives transformed `spendingTrendData` (map to {label, value} format)

## Files Created/Modified
```
NEW  src/hooks/useWebGLSupport.ts        (21 lines)
NEW  src/hooks/useDeviceTier.ts          (24 lines)
NEW  src/hooks/useThreeTheme.ts          (20 lines)
NEW  src/components/three/ThreeErrorBoundary.tsx  (27 lines)
NEW  src/components/three/ThreeScene.tsx          (47 lines)
NEW  src/components/three/ThreeBarChart.tsx       (89 lines)
NEW  src/components/three/ThreeRingChart.tsx      (104 lines)
NEW  src/components/three/ParticleField.tsx        (60 lines)
NEW  src/components/three/index.ts                 (8 lines)
MOD  src/pages/Dashboard.tsx                       (3 imports replaced, chart section swapped)
MOD  package.json                                   (5 deps added)
```

## Build Result
- ✅ Build passes with zero errors
- ✅ 4635 modules compiled
- ✅ Bundle includes three.js (code-splitting deferred to Phase 4)

## Next: Phase 2 — Data Storytelling
Add TransactionFlow, BudgetOrbSystem, GoalTower, ThreeLineChart on Transactions and Budget pages.