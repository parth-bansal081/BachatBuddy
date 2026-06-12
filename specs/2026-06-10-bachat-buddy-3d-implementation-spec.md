# Bachat Buddy 3D UI Enhancement — Implementation Spec

## Overview
Phased 2D-enhanced hybrid approach: add React Three Fiber 3D components incrementally to existing pages via per-page isolated `<Canvas>` instances, drawing from a shared `src/components/three/` component library. Core 2D functionality stays intact; 3D elements enhance data visualization, atmosphere, and AI interactions.

## Technical Stack (New Additions)
- **@react-three/fiber** — React renderer for Three.js (per-page Canvas)
- **@react-three/drei** — Utility components (OrbitControls, Html, Text, Float)
- **three** — Core 3D engine (~v0.170+)
- **@react-spring/three** — Physics-based spring animations in 3D
- **@types/three** — TypeScript type definitions

Existing stack unchanged: React 18, TypeScript, Vite 5, Tailwind CSS 3, shadcn/ui (Radix), @tanstack/react-query, Framer Motion, react-router-dom, Supabase, Recharts (gradually replaced by 3D charts).

## Architecture

```
App.tsx (React Router)
├── Dashboard       → R3F <Canvas> → ParticleField + ThreeRingChart + ThreeBarChart
├── Transactions    → R3F <Canvas> → TransactionFlow + ThreeLineChart
├── BudgetPlanner   → R3F <Canvas> → BudgetOrbSystem + GoalTower
├── Index/Insights  → R3F <Canvas> → AIAvatar + ParallaxBackground
├── Accounts     → 2D only
└── Settings     → 2D only

Each Canvas: isolated WebGL context, disposed on route change
All 3D components: drawn from shared library at src/components/three/
```

### Shared Infrastructure

```
src/components/three/
├── index.ts                  # Barrel exports
├── ThreeScene.tsx            # Canvas wrapper, camera, lights, error boundary
├── ThreeBarChart.tsx         # 3D bar chart
├── ThreeRingChart.tsx        # 3D donut ring
├── ThreeLineChart.tsx        # 3D time-series line
├── ParticleField.tsx         # GPU particle system
├── TransactionFlow.tsx       # 3D transaction ribbon
├── BudgetOrbSystem.tsx       # Orbiting budget spheres
├── GoalTower.tsx             # Savings goal towers
├── AIAvatar.tsx              # 3D assistant avatar
├── ParallaxBackground.tsx    # Depth-layer backgrounds
├── CursorRipple.tsx          # Interactive ground ripple
└── ThreeErrorBoundary.tsx    # Error + WebGL fallback

src/hooks/
├── useThreeTheme.ts          # Shared lighting, colors, accessibility
├── useDeviceTier.ts          # High/mid/low device detection
└── useWebGLSupport.ts        # WebGL availability check
```

## Phase 1 — 3D Foundation (Dashboard)

### Goal
Establish the 3D component library, theme system, and upgrade the Dashboard page.

### Components

#### ThreeScene
- Wraps `<Canvas>` from @react-three/fiber
- Sets up: ambient light, directional light (Bachat green tint), camera (PerspectiveCamera, default z=5), OrbitControls (with damping, min/max distance)
- Includes `<ThreeErrorBoundary>` showing 2D fallback on WebGL failure
- Optional `background` prop (color or transparent)
- Optional `children` rendered inside Canvas

#### ThreeBarChart
- Props: `data: {label: string, value: number, color: string}[]`, `width: number`, `height: number`
- Each bar: `BoxGeometry` positioned along X axis, height = value
- Rounded caps via `RoundedBox` (from drei) or custom `ExtrudeGeometry`
- Hover: bar lifts on Y axis via `useSpring`, color brightens
- Label: `<Text>` (from drei) floating above each bar
- Entrance animation: bars grow from y=0 sequentially with staggered delay
- Grid lines on XZ plane for reference

#### ThreeRingChart
- Props: `segments: {label: string, value: number, color: string}[]`, `radius: number`
- Each segment: `TorusGeometry` partial arc, height (Z extrusion) = value proportion
- Hover: segment extends outward via `useSpring`, tooltip via `<Html>`
- Center: `<Html>` overlay showing total amount
- Entrance: segments appear sequentially around the ring (staggered)

#### ParticleField
- Props: `count?: number (default 500)`, `spread?: number`, `speed?: number`, `cursorReactive?: boolean`
- Uses `InstancedMesh` (single draw call for all particles)
- Particles: tiny `SphereGeometry` or `PlaneGeometry` with transparent gradient texture
- Colors: Bachat green palette with slight random variation
- Animation: gentle sinusoidal drift + perlin-noise-like motion
- If `cursorReactive`: particles gently attract toward raycaster intersection point
- Performance: respects `useDeviceTier`, reduces count on mid/low

### Pages Upgraded

#### Dashboard.tsx
- Add `<ThreeScene>` wrapper around the chart area (below SummaryCards)
- Inside Canvas: `<ParticleField>` as background layer + `<ThreeBarChart>` replaces SpendingChart + `<ThreeRingChart>` replaces CategoryPieChart
- SummaryCards, AISmartTip, SafeToSpendCard remain 2D (above/below Canvas)
- Recharts imports can remain for other pages

### Files
| Action | Path |
|--------|------|
| New | `src/components/three/index.ts` |
| New | `src/components/three/ThreeScene.tsx` |
| New | `src/components/three/ThreeBarChart.tsx` |
| New | `src/components/three/ThreeRingChart.tsx` |
| New | `src/components/three/ParticleField.tsx` |
| New | `src/components/three/ThreeErrorBoundary.tsx` |
| New | `src/hooks/useThreeTheme.ts` |
| New | `src/hooks/useDeviceTier.ts` |
| New | `src/hooks/useWebGLSupport.ts` |
| Modify | `src/pages/Dashboard.tsx` |
| Modify | `package.json` (add deps) |

## Phase 2 — Data Storytelling (Transactions + Budget)

### Components

#### TransactionFlow
- Props: `transactions: Transaction[]`, `timeRange: 'week'|'month'|'year'`
- Visual: TubeGeometry along a CatmullRom spline curve in 3D space
- Tube radius at each point = transaction amount (normalized)
- Tube segment color = category color
- Transaction nodes: small spheres positioned along the tube at each transaction point
- Hover on node: `<Html>` tooltip with transaction details
- Camera controls: scroll along time axis, orbit to view from different angles

#### BudgetOrbSystem
- Props: `budgets: {category: string, allocated: number, spent: number, color: string}[]`
- Orbs: `SphereGeometry` instances orbiting a central invisible point
- Orb radius = budget allocation percentage
- Orb emissive color shifts: green (safe) → amber (warning) → red (over limit)
- Pulse animation (scale oscillation) when spent > 80% of allocated
- Click on orb: camera zooms in, `<Html>` overlay shows budget details
- Drag interaction planned for Phase 4 (accessibility concerns)

#### GoalTower
- Props: `goal: {name: string, target: number, current: number, milestones: number[]}`
- Tower: stacked `BoxGeometry` instances along Y axis, each = one milestone segment
- Completed segments: solid mesh with color gradient (dark → bright green upward)
- Pending segments: wireframe overlay
- Current partial segment: half-filled with animated growth
- Particles orbit completed milestones
- Click: camera animates to close-up, `<Html>` shows goal details + add funds button

#### ThreeLineChart
- Props: `series: {name: string, dataPoints: {x: string, y: number}[], color: string}[]`
- Lines: `BufferGeometry` along X (time) and Y (value), multiple series at different Z depths
- Fill: gradient plane below each line
- Data points: small spheres at each data point
- Entrance: lines draw-in from left to right
- Replaces ProjectedSpendingChart and BudgetAccuracyChart

### Pages Upgraded

#### Transactions.tsx
- Add `<ThreeScene>` above TransactionTable
- Inside: `<ParticleField>` + `<TransactionFlow>` + `<ThreeLineChart>` (side-by-side or stacked)
- TransactionTable remains 2D below

#### BudgetPlanner.tsx
- Add `<ThreeScene>` replacing the top chart area
- Inside: `<BudgetOrbSystem>` + `<GoalTower>` (for each active savings goal)
- Keep BudgetProgress, BudgetVarianceChart as 2D below for detail view

### Files
| Action | Path |
|--------|------|
| New | `src/components/three/TransactionFlow.tsx` |
| New | `src/components/three/BudgetOrbSystem.tsx` |
| New | `src/components/three/GoalTower.tsx` |
| New | `src/components/three/ThreeLineChart.tsx` |
| Modify | `src/pages/Transactions.tsx` |
| Modify | `src/pages/BudgetPlanner.tsx` |
| Modify | `src/components/three/index.ts` |

## Phase 3 — AI & Atmosphere

### Components

#### AIAvatar
- Props: `state: 'idle'|'speaking'|'thinking'|'hidden'`, `tip?: string`, `position?: [x,y,z]`
- Geometry: simple character — `SphereGeometry` head + `CapsuleGeometry` body + `SphereGeometry` eyes
- Animations: Float (drei) for idle bob, mouth ring pulse when speaking, eye tracking toward cursor
- When `tip` provided: avatar appears, "speaks" the tip, then returns to idle
- Integration: appears near AIChatbot panel, points at relevant chart when explaining

#### ParallaxBackground
- Renders 3-5 large `PlaneGeometry` meshes at different Z-depths
- Each plane: gradient material (Bachat green → dark navy)
- Parallax: planes shift at different speeds on scroll/mouse move
- Optional: subtle low-poly silhouette shapes on mid-layer

#### CursorRipple
- Large `PlaneGeometry` (ground plane) positioned below content
- Custom shader material: vertex displacement based on cursor proximity
- Ripple waves emanate from cursor intersection point, decay over time
- Respects `prefers-reduced-motion`

#### DynamicLighting (in useThreeTheme)
- Extend `useThreeTheme` to expose `lightingPreset: 'morning'|'afternoon'|'evening'`
- Based on actual time-of-day or manual override
- Also: context-based shifts (red-tinged when over budget, green when saving)
- Applied via `useFrame` in ThreeScene to update light colors/intensities

### Files
| Action | Path |
|--------|------|
| New | `src/components/three/AIAvatar.tsx` |
| New | `src/components/three/ParallaxBackground.tsx` |
| New | `src/components/three/CursorRipple.tsx` |
| Modify | `src/hooks/useThreeTheme.ts` |
| Modify | `src/components/three/ThreeScene.tsx` |
| Modify | `src/components/AIInsightsPanel.tsx` |
| Modify | `src/components/AISmartTip.tsx` |

## Phase 4 — Polish & Performance

### Device Detection System
- `useWebGLSupport()` — check `canvas.getContext('webgl2')`
- `useDeviceTier()` — classify as 'high'|'mid'|'low' based on:
  - GPU renderer string (via WebGL `getParameter`)
  - Screen size (mobile vs desktop)
  - Device memory API (`navigator.deviceMemory`)
  - Connection type (`navigator.connection.effectiveType`)
- Pass tier to all 3D components → adjust complexity

### Tier Behavior
| Feature | High | Mid | Low |
|---------|------|-----|-----|
| ParticleField count | 500 | 150 | CSS only |
| Shadows | Full PCF soft | None | None |
| Post-processing | Bloom | None | None |
| CursorRipple | Full shader | Simplified | Disabled |
| AIAvatar | Full | Static mesh | 2D illustration |
| BudgetOrbSystem | Full physics | Reduced orbits | CSS grid fallback |
| FPS target | 60 | 45 | 30 (CSS) |

### Accessibility
- All 3D interactive elements: `role="img"` + `aria-label` describing the data
- Keyboard: Tab through 3D panels, Arrow keys for orbit, Enter for detail view
- Screen reader: ensure `<Html>` overlays contain semantic HTML with same data as 3D
- `prefers-reduced-motion`: replace all animations with instant transitions
- Color contrast: test Bachat green in dark/light theme + 3D lighting states

### Performance
- `InstancedMesh` for ParticleField (single draw call)
- `frustumCulled={true}` on all meshes (R3F default)
- `dpr={[1, 2]}` — adaptive to device pixel ratio
- `React.lazy()` + `<Suspense>` for 3D component route-level code splitting
- Dispose all geometries, materials, textures on unmount (via `useEffect` cleanup)
- `useFrame` throttling: skip frames when FPS < 30
- Asset preloading: `useGLTF.preload()` for any future GLTF models

### Loading States
- Skeleton UI (pulsing rectangles) while 3D initializes
- R3F `<Suspense fallback={...}>` at each Canvas
- Progressive: render 2D instantly, fade 3D Canvas in after mount
- Error boundary: show "3D view unavailable" with retry button + 2D fallback auto-shown

### Mobile Optimization
- Touch gesture support: pinch=zoom, two-finger=orbit, tap=select
- Larger hit targets for 3D interaction (2x on mobile)
- Reduced or disabled ParticleField on mobile
- No CursorRipple on touch devices (no cursor)

### Files
| Action | Path |
|--------|------|
| Modify | `src/hooks/useDeviceTier.ts` (complete) |
| Modify | `src/hooks/useWebGLSupport.ts` (complete) |
| Modify | `src/components/three/ThreeScene.tsx` (integrations) |
| Modify | `src/components/three/ParticleField.tsx` (InstancedMesh) |
| Modify | `src/components/three/ThreeErrorBoundary.tsx` (complete) |
| New | `src/components/three/shaders/` (cursor ripple vertex/fragment) |

## Design Principles
- **Progressive Enhancement** — 2D always works, 3D layers on top
- **Per-page Isolation** — each Canvas is independent, no cross-page state leak
- **Performance First** — InstancedMesh, frustum culling, lazy loading, adaptive DPR
- **Accessibility Embedded** — ARIA on every 3D element, keyboard navigation, reduced motion
- **Brand Consistency** — Bachat green (#14b8a6) as primary 3D accent, dark theme throughout

## Risk Mitigations
| Risk | Mitigation |
|------|-----------|
| R3F/Three.js bundle size | Code split per page, lazy load 3D components |
| WebGL unsupported browser | WebGL detection → clean 2D fallback automatically |
| Mobile battery drain | Low tier disables continuous animations, reduces particles |
| 3D context memory leak | Dispose all resources on Canvas unmount, single Canvas per page |
| Scroll conflicts | OrbitControls disabled during 2D scroll, enabled={hovering3D} |
| Data sync between 2D/3D | Both read from same @tanstack/react-query cache |

## Success Metrics
- Dashboard page loads with 3D elements in <2s (LCP)
- FPS > 50 on high-tier devices, > 30 on mid-tier
- Zero functionality loss when WebGL unavailable
- Bundle size increase <80KB gzipped for Phase 1
- All existing tests pass (no regression in 2D features)
- Lighthouse accessibility score remains >=95