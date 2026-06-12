import { useRef, useMemo, useState } from "react";
import { useSpring, animated } from "@react-spring/three";
import { Text, Html } from "@react-three/drei";
import { CHART_COLORS } from "@/hooks/useThreeTheme";
import * as THREE from "three";

export interface RingSegment {
  label: string;
  value: number;
  color?: string;
}

interface Props {
  segments: RingSegment[];
  radius?: number;
}

function Segment({
  item, index, total, radius, totalValue, segments
}: {
  item: RingSegment;
  index: number;
  total: number;
  radius: number;
  totalValue: number;
  segments: RingSegment[];
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const anglePer = (item.value / totalValue) * Math.PI * 2;
  
  // compute start angle by summing previous segments
  let startAngle = 0;
  for (let i = 0; i < index; i++) {
    startAngle += ((segments[i]?.value || 0) / totalValue) * Math.PI * 2;
  }
  const midAngle = startAngle + anglePer / 2;
  const color = item.color || CHART_COLORS[index % CHART_COLORS.length];
  const extrusionDepth = 0.3;

  const { offset } = useSpring({
    offset: hovered ? 0.3 : 0,
    config: { tension: 300, friction: 20 },
  });

  const shape = useMemo(() => {
    const ringInner = radius - 0.8;
    const ringOuter = radius + 0.8;
    const pts = 32;
    const shape = new THREE.Shape();
    for (let i = 0; i <= pts; i++) {
      const a = startAngle + (anglePer * i) / pts;
      const x = Math.cos(a);
      const y = Math.sin(a);
      if (i === 0) shape.moveTo(x * ringInner, y * ringInner);
      else shape.lineTo(x * ringInner, y * ringInner);
    }
    for (let i = pts; i >= 0; i--) {
      const a = startAngle + (anglePer * i) / pts;
      shape.lineTo(Math.cos(a) * ringOuter, Math.sin(a) * ringOuter);
    }
    return shape;
  }, [startAngle, anglePer, radius]);

  const extrudeSettings = { steps: 1, depth: extrusionDepth, bevelEnabled: false };

  return (
    <animated.group position={offset.to((z) => [0, 0, z])}>
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <extrudeGeometry args={[shape, extrudeSettings]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={hovered ? 0.5 : 0.1} />
      </mesh>
      <Text
        position={[Math.cos(midAngle) * (radius + 0.5), Math.sin(midAngle) * (radius + 0.5), extrusionDepth / 2]}
        fontSize={0.15}
        color="#e2e8f0"
        anchorX="center"
      >
        {item.label} ({((item.value / totalValue) * 100).toFixed(0)}%)
      </Text>
    </animated.group>
  );
}

export function ThreeRingChart({ segments, radius = 3 }: Props) {
  const cleanSegments = useMemo(() => (segments || []).filter((s) => s !== undefined && s !== null), [segments]);
  const totalValue = useMemo(
    () => cleanSegments.reduce((s, seg) => s + seg.value, 0) || 1,
    [cleanSegments]
  );

  return (
    <group aria-label="Ring chart showing category distribution">
      {cleanSegments.map((item, i) => (
        <Segment
          key={item.label}
          item={item}
          index={i}
          total={cleanSegments.length}
          radius={radius}
          totalValue={totalValue}
          segments={cleanSegments}
        />
      ))}
      <Html center position={[0, 0, 0]}>
        <div className="text-center pointer-events-none select-none">
          <p className="text-xs text-slate-400">Total</p>
          <p className="text-lg font-bold text-teal-400">
            {totalValue.toLocaleString()}
          </p>
        </div>
      </Html>
    </group>
  );
}
