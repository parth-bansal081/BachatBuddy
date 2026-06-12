import { ReactNode, Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { ThreeErrorBoundary } from "./ThreeErrorBoundary";
import { ThreeFallback } from "./ThreeFallback";
import { useThreeTheme } from "@/hooks/useThreeTheme";
import { useDeviceTier } from "@/hooks/useDeviceTier";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useWebGLSupport } from "@/hooks/useWebGLSupport";
import { ParallaxBackground } from "./ParallaxBackground";
import { CursorRipple } from "./CursorRipple";

interface Props {
  children: ReactNode;
  height?: string;
  disableOrbit?: boolean;
  showBackground?: boolean;
  showRipple?: boolean;
  ariaLabel?: string;
}

export function ThreeScene({
  children,
  height = "400px",
  disableOrbit,
  showBackground = true,
  showRipple = true,
  ariaLabel = "3D visualization",
}: Props) {
  const tier = useDeviceTier();
  const theme = useThreeTheme();
  const reducedMotion = useReducedMotion();
  const { supported, checked } = useWebGLSupport();

  const isMobile = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth < 768;
  }, []);

  if (checked && !supported) {
    return <ThreeFallback height={height} message="3D visualization not supported on this browser" />;
  }

  if (tier === "low") {
    return <ThreeFallback height={height} message="Simplified view for your device" />;
  }

  return (
    <ThreeErrorBoundary>
      <div style={{ height, width: "100%" }} className="rounded-xl overflow-hidden relative" role="img" aria-label={ariaLabel}>
        <Canvas
          camera={{ position: [0, 0, 8], fov: 50 }}
          dpr={[1, tier === "high" ? 2 : 1.5]}
          gl={{ antialias: tier !== "low", alpha: true }}
          style={{ background: theme.background }}
        >
          <Suspense fallback={null}>
            <ambientLight intensity={0.4} />
            <directionalLight
              position={[5, 5, 5]}
              intensity={0.8}
              color={theme.primary}
            />
            {showBackground && !reducedMotion && <ParallaxBackground />}
            {showRipple && tier !== "low" && !reducedMotion && <CursorRipple />}
            {!disableOrbit && (
              <OrbitControls
                enableZoom={!isMobile}
                enablePan={false}
                enableRotate={!isMobile}
                minDistance={4}
                maxDistance={15}
                dampingFactor={0.1}
              />
            )}
            {children}
          </Suspense>
        </Canvas>
      </div>
    </ThreeErrorBoundary>
  );
}
