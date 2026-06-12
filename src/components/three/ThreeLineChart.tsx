import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Line } from "@react-three/drei"; // For simple lines
import { Html } from "@react-three/drei";
import { useSpring, animated } from "@react-spring/three";
import { useFrame } from "@react-three/fiber";
import { CHART_COLORS } from "@/hooks/useThreeTheme";

export interface LineDataPoint {
  x: string; // Date string
  y: number;
}

export interface LineSeries {
  name: string;
  dataPoints: LineDataPoint[];
  color?: string;
}

interface Props {
  series: LineSeries[];
  width?: number;
  height?: number;
  depthOffset?: number; // Z-offset for each series
  position?: [number, number, number];
}

export function ThreeLineChart({
  series,
  width = 10,
  height = 5,
  depthOffset = 1,
  position = [0, 0, 0],
}: Props) {
  const cleanSeries = useMemo(() => (series || []).filter(s => s !== undefined && s !== null && Array.isArray(s.dataPoints)), [series]);

  const allXValues = useMemo(
    () => Array.from(new Set(cleanSeries.flatMap((s) => s.dataPoints.filter(dp => dp !== null && dp !== undefined).map((dp) => dp.x)))),
    [cleanSeries]
  ).sort();

  const allYValues = useMemo(
    () => cleanSeries.flatMap((s) => s.dataPoints.filter(dp => dp !== null && dp !== undefined).map((dp) => dp.y)),
    [cleanSeries]
  );
  const maxY = useMemo(() => Math.max(...allYValues, 1), [allYValues]);
  const minY = useMemo(() => Math.min(...allYValues, 0), [allYValues]);

  const xStep = width / (allXValues.length - 1 || 1);
  const yScale = height / (maxY - minY || 1);

  return (
    <group position={position}>
      {/* Grid lines (simplified) */}
      <mesh position={[0, height / 2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width + 1, height + 1]} />
        <meshBasicMaterial color="#1e293b" transparent opacity={0.15} />
      </mesh>

      {cleanSeries.map((s, seriesIndex) => {
        const lineColor = s.color || CHART_COLORS[seriesIndex % CHART_COLORS.length];
        const cleanPoints = s.dataPoints.filter(dp => dp !== null && dp !== undefined);
        const points = cleanPoints.map((dp) => {
          const xIndex = allXValues.indexOf(dp.x);
          const x = xIndex * xStep - width / 2;
          const y = (dp.y - minY) * yScale;
          return new THREE.Vector3(x, y, seriesIndex * depthOffset);
        });

        if (points.length < 2) return null;

        return (
          <group key={s.name}>
            <Line points={points} color={lineColor} lineWidth={3} />
            {/* Data points */}
            {points.map((p, i) => (
              <DataPoint
                key={i}
                position={p.toArray()}
                color={lineColor}
                label={`${s.name}: ${cleanPoints[i].y}`}
              />
            ))}
          </group>
        );
      })}
    </group>
  );
}

interface DataPointProps {
  position: [number, number, number];
  color: string;
  label: string;
}

function DataPoint({ position, color, label }: DataPointProps) {
  const [hovered, setHovered] = useState(false);
  return (
    <group
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <mesh>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={hovered ? 0.8 : 0.2} />
      </mesh>
      {hovered && (
        <Html position-y={0.3}>
          <div className="text-xs bg-slate-800 text-white px-2 py-1 rounded-md">
            {label}
          </div>
        </Html>
      )}
    </group>
  );
}