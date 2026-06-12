# Phase 4 — Polish, Performance & Accessibility

> **Goal:** Device-aware rendering, graceful fallbacks, code splitting, a11y, and optimization.

## Tasks

### Task 1: Create useFPSMonitor hook
**File:** `src/hooks/useFPSMonitor.ts`
- Monitors real-time FPS via requestAnimationFrame.
- Returns `{ fps, tier }` — tier adjusts down if FPS drops below thresholds.
- Auto-adjusts: high (>50fps), mid (30-50fps), low (<30fps).
- Used by ThreeScene and 3D components to throttle rendering.

### Task 2: Create useReducedMotion hook
**File:** `src/hooks/useReducedMotion.ts`
- Wraps `window.matchMedia("(prefers-reduced-motion: reduce)")`.
- Returns `{ reducedMotion }`.
- Used by AIAvatar and CursorRipple to disable animations.

### Task 3: Create ThreeFallback 2D component
**File:** `src/components/three/ThreeFallback.tsx`
- Static 2D placeholder when WebGL unsupported or device is low-tier.
- Shows a card with icon and message — maintains layout integrity.

### Task 4: Upgrade useDeviceTier with FPS override
**File:** `src/hooks/useDeviceTier.ts`
- Merges static device detection with dynamic FPS monitor.
- FPS can downgrade tier but never upgrade (prevents thrashing).

### Task 5: Integrate reduced-motion and FPS into ThreeScene
**File:** `src/components/three/ThreeScene.tsx`
- Respects `reducedMotion` to disable ParallaxBackground + CursorRipple.
- Uses `fpsTier` to downgrade dpr, antialias, and disable ripple.

### Task 6: Add ARIA labels to 3D components
**Files:** `src/components/three/AIAvatar.tsx`, `ThreeScene.tsx`, `ThreeBarChart.tsx`, `ThreeRingChart.tsx`
- aria-label on Canvas wrapper div.
- aria-label on interactive 3D groups.

### Task 7: Code splitting in App.tsx
**File:** `src/App.tsx`
- React.lazy + Suspense for all page imports.
- Shared loading spinner for Suspense fallback.

### Task 8: Mobile touch optimization for ThreeScene
**File:** `src/components/three/ThreeScene.tsx`
- DisableOrbit on mobile (width < 768).
- Enable zoom with pinch on mobile.

### Task 9: Bundle size audit
- Compare dist/asset sizes before/after code splitting.

## Build Result
- Build passes with zero errors.
- All Phase 4 items implemented.