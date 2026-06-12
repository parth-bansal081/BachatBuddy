import { useState, useEffect, useRef } from "react";
import type { DeviceTier } from "./useDeviceTier";

const FPS_SAMPLES = 30;
const HIGH_FPS = 50;
const LOW_FPS = 30;

export function useFPSMonitor(initialTier: DeviceTier): { fps: number; tier: DeviceTier } {
  const [fps, setFps] = useState(60);
  const [tier, setTier] = useState<DeviceTier>(initialTier);
  const frameTimes = useRef<number[]>([]);
  const lastTime = useRef(performance.now());
  const rafId = useRef(0);

  useEffect(() => {
    let running = true;

    const tick = (now: number) => {
      if (!running) return;
      const delta = now - lastTime.current;
      lastTime.current = now;
      frameTimes.current.push(delta);
      if (frameTimes.current.length > FPS_SAMPLES) {
        frameTimes.current.shift();
      }
      if (frameTimes.current.length === FPS_SAMPLES) {
        const avgDelta = frameTimes.current.reduce((a, b) => a + b, 0) / FPS_SAMPLES;
        const currentFps = Math.round(1000 / avgDelta);
        setFps(currentFps);
        setTier((prev) => {
          if (currentFps >= HIGH_FPS) return prev;
          if (currentFps >= LOW_FPS) return prev === "high" ? "mid" : prev;
          return "low";
        });
      }
      rafId.current = requestAnimationFrame(tick);
    };

    rafId.current = requestAnimationFrame(tick);
    return () => {
      running = false;
      cancelAnimationFrame(rafId.current);
    };
  }, [initialTier]);

  return { fps, tier };
}