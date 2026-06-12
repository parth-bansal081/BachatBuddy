import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Html } from "@react-three/drei";
import { useSpring, animated } from "@react-spring/three";
import { useFrame } from "@react-three/fiber";
import { CHART_COLORS } from "@/hooks/useThreeTheme";
// Assuming BudgetGoal type exists from @/lib/data
// import { BudgetGoal } from "@/lib/data"; 

interface BudgetGoal { // Placeholder type if not globally available
  category: string;
  budget: number;
  spent: number;
  color?: string;
}

interface Props {
  budgets: BudgetGoal[];
  radius?: number; // Radius of the orbital path
}

export function BudgetOrbSystem({ budgets, radius = 5 }: Props) {
  const groupRef = useRef<THREE.Group>(null);

  const orbData = useMemo(() => {
    const cleanBudgets = (budgets || []).filter((b) => b !== undefined && b !== null);
    const totalBudget = cleanBudgets.reduce((sum, b) => sum + Math.max(0, b.budget), 0) || 1;
    return cleanBudgets.map((b, i) => {
      const allocation = Math.max(0, b.budget) / totalBudget;
      const spentRatio = Math.min(1, b.spent / Math.max(1, b.budget));
      let color = new THREE.Color(CHART_COLORS[i % CHART_COLORS.length]);
      if (spentRatio > 0.8) {
        color.lerp(new THREE.Color("red"), (spentRatio - 0.8) / 0.2); // Shift to red
      } else if (spentRatio > 0.5) {
        color.lerp(new THREE.Color("orange"), (spentRatio - 0.5) / 0.3); // Shift to orange
      }
      return { ...b, allocation, spentRatio, color: color.getHex() };
    });
  }, [budgets]);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.05; // Gentle rotation
    }
  });

  return (
    <group ref={groupRef}>
      {orbData.map((orb, i) => (
        <BudgetOrb
          key={orb.category}
          orb={orb}
          index={i}
          totalOrbs={orbData.length}
          orbitalRadius={radius}
        />
      ))}
    </group>
  );
}

interface OrbProps {
  orb: BudgetGoal & { allocation: number; spentRatio: number; color: number };
  index: number;
  totalOrbs: number;
  orbitalRadius: number;
}

function BudgetOrb({ orb, index, totalOrbs, orbitalRadius }: OrbProps) {
  const [hovered, setHovered] = useState(false);
  const angle = (index / totalOrbs) * Math.PI * 2;
  const x = Math.cos(angle) * orbitalRadius;
  const z = Math.sin(angle) * orbitalRadius;
  const y = Math.sin(angle * 2) * 0.5; // Slight up/down motion

  const { scale, positionY } = useSpring({
    scale: hovered ? 1.4 : 1 + orb.allocation * 0.8, // Size by allocation
    positionY: hovered ? y + 0.5 : y,
    config: { mass: 1, tension: 280, friction: 30 },
  });

  // Pulse animation when over budget (conceptual for now, will need more advanced implementation)
  useFrame(({ clock }) => {
    if (orb.spentRatio >= 0.8 && !hovered) {
      // For simplicity in this text output, we'll keep it conceptual
      // Actual implementation would directly manipulate mesh scale or use a ref and apply pulse
    }
  });

  return (
    <animated.group
      position={[x, positionY, z]}
      scale={scale}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <mesh>
        <sphereGeometry args={[0.5, 32, 32]} /> {/* Base sphere size */}
        <meshStandardMaterial
          color={orb.color}
          emissive={orb.color}
          emissiveIntensity={hovered ? 0.8 : orb.spentRatio > 0.8 ? 0.5 : 0.2}
        />
      </mesh>
      <Html center position-y={1}>
        <div className="text-center pointer-events-none select-none">
          <p className="text-xs text-slate-400">{orb.category}</p>
          <p className="text-sm font-bold text-teal-400">
            {((orb.spent / Math.max(1, orb.budget)) * 100).toFixed(0)}%
          </p>
        </div>
      </Html>
    </animated.group>
  );
}