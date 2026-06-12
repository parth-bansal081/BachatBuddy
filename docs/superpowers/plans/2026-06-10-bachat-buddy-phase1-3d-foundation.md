# Phase 1 — 3D Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish the React Three Fiber 3D component library with shared theme/hooks and upgrade the Dashboard page with 3D charts + particles.

**Architecture:** Per-page isolated R3F `<Canvas>` instances drawing from a shared `src/components/three/` library. 3D charts replace Recharts on Dashboard; existing 2D cards and tables remain untouched. Device tier detection and WebGL fallback are built-in from the start.

**Tech Stack:** @react-three/fiber, @react-three/drei, three, @react-spring/three, @types/three

---

### Task 1: Install Dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install R3F + Three.js packages**

Run:
```bash
npm install three @react-three/fiber @react-three/drei @react-spring/three
npm install -D @types/three
```