# Phase 3 — AI & Atmosphere Implementation Plan

> **Goal:** Integrate 3D financial coach assistant avatar, cursor hover ripple, and background parallax layers.

**Architecture:** Use `AIAvatar`, `CursorRipple`, and `ParallaxBackground` components within `ThreeScene.tsx` so all R3F canvases acquire depth layers and interactive rippling automatically. Upgrade `AISmartTip.tsx` with the live 3D floating avatar.

**Tech Stack:** Existing R3F setup.

## Tasks Completed

### Task 1: Create AIAvatar component
**File:** `src/components/three/AIAvatar.tsx`
- Renders a compact geometric 3D character (Sphere head, Capsule body, Sphere eyes).
- Leverages `<Float>` (from drei) for custom floating bob/sway.
- Tracks mouse pointer to subtly pivot head and track looking direction.
- Features `idle`, `speaking` (with blue pulsing mouth indicator), and `thinking` (squeezed eye scale) states.

### Task 2: Create ParallaxBackground component
**File:** `src/components/three/ParallaxBackground.tsx`
- Renders 3 layers of large flat planes at deep Z offsets.
- Multiplies coordinates based on pointer mouse coordinates at different factors per layer.
- Adds incredible spatial canvas depth.

### Task 3: Create CursorRipple component
**File:** `src/components/three/CursorRipple.tsx`
- Renders a flat invisible ground plane to capture pointer move coordinates.
- Tracks mouse movement to dynamically spawn concentric scaling and fading rings (RingGeometry).
- Limits maximum concurrent active ring count to preserve rendering performance.

### Task 4: Integrate background layers in ThreeScene
**File:** `src/components/three/ThreeScene.tsx`
- Added `showBackground` and `showRipple` properties (default true).
- Automatically renders `ParallaxBackground` and `CursorRipple` in the Canvas background context.
- Disables ripple system on low-tier mobile devices to preserve frames.

### Task 5: Upgrade AI Smart Tip card
**File:** `src/components/AISmartTip.tsx`
- Swapped static `Bot` SVG icon with an embedded `<ThreeScene>` rendering the custom `<AIAvatar>`.
- Linked loading states directly to the avatar's state: loading tip triggers `thinking` squint, resolved tip triggers speaking float animation.

### Task 6: Update barrel exports
**File:** `src/components/three/index.ts`
- Added exports for `AIAvatar`, `ParallaxBackground`, `CursorRipple`.

## Files Created/Modified
```
NEW  src/components/three/AIAvatar.tsx           (84 lines)
NEW  src/components/three/ParallaxBackground.tsx  (43 lines)
NEW  src/components/three/CursorRipple.tsx        (48 lines)
MOD  src/components/three/index.ts               (3 exports added)
MOD  src/components/three/ThreeScene.tsx         (background, ripple layers integrated)
MOD  src/components/AISmartTip.tsx               (3D scene + AIAvatar integrated)
```

## Build Result
- ✅ Build passes with zero errors
- ✅ 4642 modules compiled
- ✅ High fidelity cursor-reactive canvas, visual ambient, and live 3D advisor running

## Next: Phase 4 — Polish & Performance
Device-aware throttling, keyboard tab layouts, prefers-reduced-motion accessibility, and route-level code splitting.