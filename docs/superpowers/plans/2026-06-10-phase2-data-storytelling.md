# Phase 2 — Data Storytelling Implementation Plan

> **Goal:** Enhance Transactions and Budget Planner pages with interactive 3D visualizations for money flow, budget allocation, and savings goals.

**Architecture:** Use R3F components in `src/components/three/` on Transactions and Budget Planner pages.
- Transactions gets `TransactionFlow` spline ribbon + `ThreeLineChart` historical line graph.
- Budget Planner gets a 3D Sidebar Vault containing `BudgetOrbSystem` orbital spheres and `GoalTower` progress building.

**Tech Stack:** Existing R3F setup.

## Tasks Completed

### Task 1: Create TransactionFlow component
**File:** `src/components/three/TransactionFlow.tsx`
- Renders a 3D tube using CatmullRomSpline3 points distributed chronologically.
- Sorts transactions by date.
- Emissive standard material representing flow.

### Task 2: Create BudgetOrbSystem component
**File:** `src/components/three/BudgetOrbSystem.tsx`
- Renders orbiting spheres for active budgets.
- Size scaled relative to budget allocation percentage.
- Colors shift green → orange → red based on spent ratio.
- Interactive HTML overlays showing category spent percentage on hover.
- Automatic slow group rotation.

### Task 3: Create GoalTower component
**File:** `src/components/three/GoalTower.tsx`
- Renders stacked box segments corresponding to savings milestones.
- Completed segments scale to full size, current segment scales dynamically based on progress.
- Non-completed future segments show as translucent wireframes.
- HTML overlay with title and overall progress.

### Task 4: Create ThreeLineChart component
**File:** `src/components/three/ThreeLineChart.tsx`
- Renders historical data lines with customizable spacing along depth (Z) axis.
- Standard line segments joining data points.
- Sphere markers at data points with hover HTML tooltip labels.
- Grid plane reference background.

### Task 5: Upgrade Transactions page
**File:** `src/pages/Transactions.tsx`
- Replaced 2D search bar and header with full MotionWrapper.
- Inserted `<ThreeScene>` below header rendering `<ParticleField>`, `<TransactionFlow>`, and `<ThreeLineChart>`.
- Derived `spendingTrendData` dynamically from `filteredTransactions`.
- Verified table and dialog forms remain fully integrated and functional.

### Task 6: Upgrade Budget Planner page
**File:** `src/pages/BudgetPlanner.tsx`
- Added useThreeTheme and useQuery for transactions.
- Created `categorySpent` and `currentBudgets` mappings.
- Embedded a 3D Sidebar "Vault Visualization" card showcasing `<BudgetOrbSystem>` and `<GoalTower>` linked directly to set budgets and savings target.
- Added motion wrappers for page animations.

### Task 7: Update barrel exports
**File:** `src/components/three/index.ts`
- Added exports for `TransactionFlow`, `BudgetOrbSystem`, `GoalTower`, `ThreeLineChart`.

## Files Created/Modified
```
NEW  src/components/three/TransactionFlow.tsx   (45 lines)
NEW  src/components/three/BudgetOrbSystem.tsx    (100 lines)
NEW  src/components/three/GoalTower.tsx          (102 lines)
NEW  src/components/three/ThreeLineChart.tsx     (108 lines)
MOD  src/components/three/index.ts               (7 exports added)
MOD  src/pages/Transactions.tsx                  (imports updated, 3D scene added, JSX resolved)
MOD  src/pages/BudgetPlanner.tsx                 (data prepared, 3D sidebar card added)
```

## Build Result
- ✅ Build passes with zero errors
- ✅ 4639 modules compiled
- ✅ High-quality 3D interactive layers implemented

## Next: Phase 3 — AI & Atmosphere
Integrate the 3D assistant avatar and environmental lighting/cursor reactions.