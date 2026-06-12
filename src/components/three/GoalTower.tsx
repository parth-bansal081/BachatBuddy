import { useRef, useMemo, useState } from "react";
import * as THREE from "three";
import { Html } from "@react-three/drei";
import { useSpring, animated } from "@react-spring/three";
import { useFrame } from "@react-three/fiber";
import { CHART_COLORS } from "@/hooks/useThreeTheme";
// Assuming BudgetGoal type exists from @/lib/data (reusing for savings goal concept)
// import { BudgetGoal } from "@/lib/data"; 

interface BudgetGoal { // Placeholder for Goal type
  category: string;
  budget: number;
  spent: number;
}

interface Props {
  goal: BudgetGoal & {
    target: number;
    current: number;
    milestones: number[];
  };
  position?: [number, number, number];
}

export function GoalTower({ goal, position = [0, 0, 0] }: Props) {
  const progress = Math.min(1, (goal?.current || 0) / Math.max(1, goal?.target || 1));
  const towerHeight = 5;
  const milestones = goal?.milestones || [];
  const segmentHeight = towerHeight / (milestones.length || 1);

  return (
    <group position={position}>
      {milestones.map((milestone, i) => {
        if (milestone === undefined || milestone === null) return null;
        const milestoneProgress = Math.min(1, (goal?.current || 0) / milestone);
        const isCompleted = (goal?.current || 0) >= milestone;
        const isCurrentSegment = 
          (goal?.current || 0) >= (milestones[i - 1] || 0) && (goal?.current || 0) < milestone;

        return (
          <TowerSegment
            key={i}
            height={segmentHeight}
            yPos={i * segmentHeight + segmentHeight / 2}
            isCompleted={isCompleted}
            isCurrentSegment={isCurrentSegment}
            progress={milestoneProgress}
            color={CHART_COLORS[i % CHART_COLORS.length]}
            label={`Milestone ${i + 1}: ${milestone.toLocaleString()}`}
          />
        );
      })}
      <Html center position-y={towerHeight / 2 + 0.5}>
        <div className="text-center pointer-events-none select-none">
          <p className="text-xs text-slate-400">{goal?.category || "Savings"} Goal</p>
          <p className="text-lg font-bold text-teal-400">
            {(progress * 100).toFixed(0)}%
          </p>
        </div>
      </Html>
    </group>
  );
}

interface SegmentProps {
  height: number;
  yPos: number;
  isCompleted: boolean;
  isCurrentSegment: boolean;
  progress: number;
  color: string;
  label: string;
}

function TowerSegment({
  height,
  yPos,
  isCompleted,
  isCurrentSegment,
  progress,
  color,
  label,
}: SegmentProps) {
  const [hovered, setHovered] = useState(false);
  const { scaleY } = useSpring({
    scaleY: isCompleted ? 1 : isCurrentSegment ? Math.max(0.01, progress) : 0,
    config: { tension: 180, friction: 12 },
  });

  return (
    <animated.group
      position={[0, yPos, 0]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      scale={[1, scaleY, 1]}
    >
      <mesh>
        <boxGeometry args={[2, height, 2]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 0.4 : 0.1}
          wireframe={!isCompleted && !isCurrentSegment}
          transparent={!isCompleted && !isCurrentSegment}
          opacity={!isCompleted && !isCurrentSegment ? 0.3 : 1}
        />
      </mesh>
      {hovered && (
        <Html position={[0, height / 2 + 0.2, 1]}>
          <div className="text-xs bg-slate-800 text-white px-2 py-1 rounded-md">
            {label}
          </div>
        </Html>
      )}
    </animated.group>
  );
}