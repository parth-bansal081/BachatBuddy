import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useThreeTheme } from "@/hooks/useThreeTheme";
import * as THREE from "three";

interface Props {
  layerCount?: number;
  speed?: number;
}

export function ParallaxBackground({ layerCount = 3, speed = 0.5 }: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const theme = useThreeTheme();

  // Create positions & details for each layer
  const layers = useMemo(() => {
    return Array.from({ length: layerCount }).map((_, i) => {
      const z = -5 - i * 3; // Position layers deeper in background
      const scale = 1.5 + i * 0.5; // Scale up deeper layers
      const opacity = 0.15 - i * 0.03; // Fade out deeper layers
      return { z, scale, opacity, index: i };
    });
  }, [layerCount]);

  useFrame(({ pointer }) => {
    if (groupRef.current) {
      // Rotate and move group slightly based on cursor/pointer
      const targetX = pointer.x * 0.3 * speed;
      const targetY = pointer.y * 0.3 * speed;

      groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, 0.05);
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.05);
    }
  });

  return (
    <group ref={groupRef}>
      {layers.map((layer) => (
        <mesh
          key={layer.index}
          position={[0, 0, layer.z]}
          scale={[15 * layer.scale, 10 * layer.scale, 1]}
        >
          <planeGeometry />
          <meshBasicMaterial
            color={theme.primary}
            transparent={true}
            opacity={layer.opacity}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}