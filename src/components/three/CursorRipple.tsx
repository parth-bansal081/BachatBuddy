import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useThreeTheme } from "@/hooks/useThreeTheme";
import * as THREE from "three";

export function CursorRipple() {
  const meshRef = useRef<THREE.Group>(null);
  const theme = useThreeTheme();
  const [ripples, setRipples] = useState<{ id: number; position: THREE.Vector3; scale: number; opacity: number }[]>([]);

  useFrame((state) => {
    // Smoothly scale up and fade out existing ripples
    setRipples((prev) =>
      prev
        .map((r) => ({
          ...r,
          scale: r.scale + 0.08,
          opacity: r.opacity - 0.02,
        }))
        .filter((r) => r.opacity > 0)
    );
  });

  const handlePointerMove = (e: any) => {
    // Throttle new ripples based on random chance to avoid heavy rendering
    if (Math.random() > 0.15) return;

    const point = e.point;
    if (point) {
      setRipples((prev) => [
        ...prev.slice(-15), // Cap at 15 ripples for high performance
        {
          id: Date.now() + Math.random(),
          position: new THREE.Vector3(point.x, point.y, point.z + 0.05),
          scale: 0.1,
          opacity: 0.6,
        },
      ]);
    }
  };

  return (
    <group>
      {/* Flat invisible ground plane to capture pointer moves */}
      <mesh position={[0, 0, 0]} onPointerMove={handlePointerMove}>
        <planeGeometry args={[50, 50]} />
        <meshBasicMaterial visible={false} />
      </mesh>

      {/* Render active rings */}
      {ripples.map((ripple) => (
        <group key={ripple.id} position={ripple.position} scale={[ripple.scale, ripple.scale, 1]}>
          <mesh>
            <ringGeometry args={[0.3, 0.35, 32]} />
            <meshBasicMaterial
              color={theme.primary}
              transparent={true}
              opacity={ripple.opacity}
              depthWrite={false}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}