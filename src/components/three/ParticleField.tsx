import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useDeviceTier } from "@/hooks/useDeviceTier";
import * as THREE from "three";

interface Props {
  count?: number;
  spread?: number;
  speed?: number;
  color?: string;
}

export function ParticleField({
  count: _count,
  spread = 10,
  speed = 0.3,
  color = "#14b8a6",
}: Props) {
  const tier = useDeviceTier();
  const count = _count ?? (tier === "high" ? 400 : tier === "mid" ? 150 : 0);
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * spread;
      arr[i * 3 + 1] = (Math.random() - 0.5) * spread;
      arr[i * 3 + 2] = (Math.random() - 0.5) * spread;
    }
    return arr;
  }, [count, spread]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime() * speed;
    for (let i = 0; i < count; i++) {
      dummy.position.set(
        positions[i * 3] + Math.sin(t + i * 0.5) * 0.5,
        positions[i * 3 + 1] + Math.cos(t + i * 0.3) * 0.3,
        positions[i * 3 + 2],
      );
      const s = 0.02 + Math.sin(t + i) * 0.01;
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  if (count === 0) return null;

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[0.03, 4, 4]} />
      <meshBasicMaterial color={color} transparent opacity={0.4} />
    </instancedMesh>
  );
}
