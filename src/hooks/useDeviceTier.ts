import { useState, useEffect, useRef } from "react";

export type DeviceTier = "high" | "mid" | "low";

const FPS_SAMPLES = 30;
const HIGH_FPS = 50;
const LOW_FPS = 30;

export function useDeviceTier(): DeviceTier {
  const [staticTier, setStaticTier] = useState<DeviceTier>("high");
  const fpsTier = useRef<DeviceTier | null>(null);
  const frameTimes = useRef<number[]>([]);
  const lastTime = useRef(performance.now());
  const rafId = useRef(0);

  useEffect(() => {
    const w = window.innerWidth;
    const memory = (navigator as any).deviceMemory as number | undefined;
    const cores = navigator.hardwareConcurrency || 4;

    let initial: DeviceTier = "high";
    if (!memory || memory <= 2 || cores <= 2) {
      initial = "low";
    } else if (memory <= 4 || w < 768 || cores <= 4) {
      initial = "mid";
    }
    setStaticTier(initial);
  }, []);

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
        if (currentFps < LOW_FPS) fpsTier.current = "low";
        else if (currentFps < HIGH_FPS && fpsTier.current !== "low") fpsTier.current = "mid";
      }
      rafId.current = requestAnimationFrame(tick);
    };
    rafId.current = requestAnimationFrame(tick);
    return () => {
      running = false;
      cancelAnimationFrame(rafId.current);
    };
  }, []);

  if (fpsTier.current === "low") return "low";
  if (fpsTier.current === "mid") return staticTier === "low" ? "low" : "mid";
  return staticTier;
}