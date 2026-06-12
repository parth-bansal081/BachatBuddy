import { useRef, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, RoundedBox } from "@react-three/drei";
import { useSpring, animated } from "@react-spring/three";
import { CHART_COLORS } from "@/hooks/useThreeTheme";
import * as THREE from "three";

export interface BarData {
  label: string;
  value: number;
  color?: string;
}

interface Props {
  data: BarData[];
  width?: number;
  maxHeight?: number;
}

function Bar({ item, index, maxValue, totalBars, width, maxHeight }: {
  item: BarData;
  index: number;
  maxValue: number;
  totalBars: number;
  width: number;
  maxHeight: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const barWidth = (width * 0.7) / totalBars;
  const gap = (width * 0.3) / (totalBars + 1);
  const xPos = -width / 2 + gap + index * (barWidth + gap);
  const normalizedH = Math.max(0.05, item.value / (maxValue || 1)) * maxHeight;
  const color = item.color || CHART_COLORS[index % CHART_COLORS.length];
  const [hovered, setHovered] = useState(false);

  const { springY } = useSpring({
    springY: hovered ? normalizedH + 0.3 : normalizedH,
    config: { mass: 1, tension: 280, friction: 30 },
  });

  return (
    <group position={[xPos, 0, 0]}>
      <animated.group position={springY.to((h) => [0, h / 2, 0])}>
        <RoundedBox
          ref={meshRef}
          args={[barWidth * 0.8, normalizedH, barWidth * 0.8]}
          radius={0.05}
          smoothness={4}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={hovered ? 0.4 : 0.1} />
        </RoundedBox>
        <Text
          position={[0, normalizedH / 2 + 0.2, 0]}
          fontSize={0.18}
          color="#94a3b8"
          anchorX="center"
        >
          {item.value.toLocaleString()}
        </Text>
      </animated.group>
      <Text
        position={[0, -0.3, 0]}
        fontSize={0.14}
        color="#64748b"
        anchorX="center"
        maxWidth={barWidth}
      >
        {item.label}
      </Text>
    </group>
  );
}

export function ThreeBarChart({ data, width = 8, maxHeight = 4 }: Props) {
  const cleanData = useMemo(() => (data || []).filter((d) => d !== undefined && d !== null), [data]);
  const maxValue = useMemo(() => Math.max(...cleanData.map((d) => d.value), 1), [cleanData]);

  return (
    <group aria-label="Bar chart showing spending over time">
      {[0, maxValue / 4, maxValue / 2, (maxValue * 3) / 4, maxValue].map((v) => (
        <mesh key={v} position={[0, (v / maxValue) * maxHeight, 0]}>
          <planeGeometry args={[width + 1, 0.02]} />
          <meshBasicMaterial color="#1e293b" transparent opacity={0.3} />
        </mesh>
      ))}
      {cleanData.map((item, i) => (
        <Bar
          key={item.label}
          item={item}
          index={i}
          maxValue={maxValue}
          totalBars={cleanData.length}
          width={width}
          maxHeight={maxHeight}
        />
      ))}
    </group>
  );
}
