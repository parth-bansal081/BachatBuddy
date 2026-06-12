import { useMemo, useRef } from "react";
import * as THREE from "three";
import { Tube } from "@react-three/drei";
import { CHART_COLORS } from "@/hooks/useThreeTheme";
// Assuming Transaction type exists from @/lib/data
// import { Transaction } from "@/lib/data"; 

interface Transaction { // Placeholder type if not globally available
  date: string;
  amount: number;
  category?: string;
}

interface Props {
  transactions: Transaction[];
  timeRange?: "week" | "month" | "year";
  height?: number;
  width?: number;
}

export function TransactionFlow({
  transactions,
  timeRange = "month",
  height = 3,
  width = 10,
}: Props) {
  const points = useMemo(() => {
    if (transactions.length === 0) return [];
    // Sort transactions by date for chronological flow
    const sortedTransactions = [...transactions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const pathPoints: THREE.Vector3[] = [];
    const minX = -width / 2;
    const maxX = width / 2;

    // Simple linear distribution along X-axis for now
    sortedTransactions.forEach((txn, i) => {
      const x = minX + (i / (sortedTransactions.length - 1 || 1)) * width;
      const y = Math.random() * height - height / 2; // Random Y for visual interest
      const z = Math.random() * 2 - 1; // Slight Z variation
      pathPoints.push(new THREE.Vector3(x, y, z));
    });

    return pathPoints;
  }, [transactions, width, height]);

  const path = useMemo(() => {
    if (points.length < 2) return new THREE.CatmullRomCurve3([]); // Return an empty curve if not enough points
    return new THREE.CatmullRomCurve3(points);
  }, [points]);

  if (points.length < 2) return null; // Need at least two points for a tube

  return (
    <group>
      <Tube args={[path, 64, 0.2, 8, false]}>
        <meshStandardMaterial color={CHART_COLORS[0]} /> {/* Basic color */}
      </Tube>
      {/* Add transaction nodes here in a follow-up task if needed */}
    </group>
  );
}