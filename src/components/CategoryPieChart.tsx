import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { Transaction, formatCurrency } from "@/lib/data";
import { useMemo } from "react";

interface CategoryPieChartProps {
  transactions: Transaction[];
  currencyCode?: string;
}

const COLORS = [
  "#10b981", // Emerald 500
  "#6366f1", // Indigo 500
  "#64748b", // Slate 500
  "#059669", // Emerald 600
  "#4f46e5", // Indigo 600
  "#475569", // Slate 600
  "#34d399", // Emerald 400
  "#818cf8", // Indigo 400
];

export function CategoryPieChart({ transactions, currencyCode }: CategoryPieChartProps) {
  const { data, totalSpent } = useMemo(() => {
    // Safety check: ensure transactions is an array
    const safeTransactions = Array.isArray(transactions) ? transactions : [];

    if (safeTransactions.length === 0) {
      return { data: [], totalSpent: 0 };
    }

    const categoryMap = safeTransactions.reduce((acc, t) => {
      const category = t?.category || "Others";
      const amount = Number(t?.amount) || 0;
      acc[category] = (acc[category] || 0) + amount;
      return acc;
    }, {} as Record<string, number>);

    const total = Object.values(categoryMap).reduce((sum, val) => sum + (val || 0), 0);

    const chartData = Object.entries(categoryMap)
      .map(([name, value]) => ({
        name,
        value,
        percentage: total > 0 ? ((value / total) * 100).toFixed(1) : 0,
      }))
      .sort((a, b) => b.value - a.value); // Sort by highest spenders

    return { data: chartData, totalSpent: total };
  }, [transactions]);

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null;

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.6; // Slightly further out
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        className="text-[10px] font-bold fill-white drop-shadow-md"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Card className="shadow-card hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold flex justify-between items-center">
          <span>Spending by Category</span>
          <span className="text-sm font-normal text-muted-foreground">Total: {formatCurrency(totalSpent, currencyCode)}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomLabel}
                outerRadius={110}
                innerRadius={60}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {data.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                    className="hover:opacity-80 transition-opacity duration-200 cursor-pointer"
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [formatCurrency(value, currencyCode), "Spent"]}
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  borderColor: "hsl(var(--border))",
                  borderRadius: "0.5rem",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  color: "hsl(var(--popover-foreground))",
                }}
                itemStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Legend
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ paddingTop: "20px" }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No transactions yet
          </div>
        )}
      </CardContent>
    </Card>
  );
}
