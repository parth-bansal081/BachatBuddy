import { useRef, useState, Fragment } from "react";
import { useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import { useSpring, animated } from "@react-spring/three";
import { CHART_COLORS } from "@/hooks/useThreeTheme";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import * as THREE from "three";

interface Props {
  state?: "idle" | "speaking" | "thinking" | "hidden";
  position?: [number, number, number];
  scale?: number;
  ariaLabel?: string;
}

function AvatarMeshes({ state, headRef, leftEyeRef, rightEyeRef, baseColor, eyeColor, emissiveIntensity }: {
  state: string;
  headRef: React.RefObject<THREE.Mesh>;
  leftEyeRef: React.RefObject<THREE.Mesh>;
  rightEyeRef: React.RefObject<THREE.Mesh>;
  baseColor: string;
  eyeColor: string;
  emissiveIntensity: number;
}) {
  return (
    <>
      <mesh ref={headRef}>
        <sphereGeometry args={[0.7, 32, 32]} />
        <meshStandardMaterial
          color={baseColor}
          emissive={baseColor}
          emissiveIntensity={emissiveIntensity}
          roughness={0.2}
          metalness={0.1}
        />
        <mesh ref={leftEyeRef} position={[-0.2, 0.15, 0.55]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshBasicMaterial color={eyeColor} />
        </mesh>
        <mesh ref={rightEyeRef} position={[0.2, 0.15, 0.55]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshBasicMaterial color={eyeColor} />
        </mesh>
        <group position={[0, -0.2, 0.55]}>
          <mesh>
            <ringGeometry args={[0.05, 0.1, 16]} />
            <meshBasicMaterial color={state === "speaking" ? "#38bdf8" : eyeColor} />
          </mesh>
        </group>
      </mesh>
      <mesh position={[0, -1.0, 0]}>
        <capsuleGeometry args={[0.4, 0.6, 16, 16]} />
        <meshStandardMaterial
          color={baseColor}
          roughness={0.4}
          metalness={0.2}
        />
      </mesh>
    </>
  );
}

export function AIAvatar({
  state = "idle",
  position = [0, 0, 0],
  scale = 1,
  ariaLabel = "AI Financial Coach avatar",
}: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const leftEyeRef = useRef<THREE.Mesh>(null);
  const rightEyeRef = useRef<THREE.Mesh>(null);
  const reducedMotion = useReducedMotion();

  const [hovered, setHovered] = useState(false);

  const { avatarScale, emissiveIntensity } = useSpring({
    avatarScale: state === "hidden" ? 0 : hovered ? scale * 1.15 : scale,
    emissiveIntensity: state === "speaking" ? 0.6 : state === "thinking" ? 0.4 : 0.15,
    config: { mass: 1, tension: 170, friction: 26 },
    immediate: reducedMotion,
  });

  useFrame(({ pointer }) => {
    if (headRef.current && leftEyeRef.current && rightEyeRef.current) {
      if (reducedMotion) return;
      const lookX = pointer.x * 0.15;
      const lookY = pointer.y * 0.15;
      headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, lookX, 0.1);
      headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, -lookY, 0.1);
      if (state === "thinking") {
        leftEyeRef.current.scale.set(1, 0.2, 1);
        rightEyeRef.current.scale.set(1, 0.2, 1);
      } else {
        leftEyeRef.current.scale.set(1, 1, 1);
        rightEyeRef.current.scale.set(1, 1, 1);
      }
    }
  });

  const baseColor = CHART_COLORS[0];
  const eyeColor = "#0f172a";

  const meshes = (
    <AvatarMeshes
      state={state}
      headRef={headRef}
      leftEyeRef={leftEyeRef}
      rightEyeRef={rightEyeRef}
      baseColor={baseColor}
      eyeColor={eyeColor}
      emissiveIntensity={emissiveIntensity.get()}
    />
  );

  return (
    <animated.group
      ref={groupRef}
      position={position}
      scale={avatarScale}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {reducedMotion ? meshes : <Float speed={2.5} rotationIntensity={0.2} floatIntensity={0.4}>{meshes}</Float>}
    </animated.group>
  );
}