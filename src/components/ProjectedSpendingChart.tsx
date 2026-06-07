import { CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BudgetGoal } from "@/lib/data";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart,
  BarChart,
  Bar,
  Cell
} from "recharts";

interface ProjectedSpendingChartProps {
  budgets: BudgetGoal[];
  income: number;
  currencySymbol?: string;
}

export function ProjectedSpendingChart({ budgets, income, currencySymbol = "₹" }: ProjectedSpendingChartProps) {
  const totalBudget = (budgets || []).reduce((sum, b) => sum + (b?.budget || 0), 0);
  const currentSpent = (budgets || []).reduce((sum, b) => sum + (b?.spent || 0), 0);

  // Calculate dynamic current day and days in month
  const now = new Date();
  const currentDay = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

  // Calculate daily average spending
  // If it's the 1st, we avoid division by zero
  const dailyAverage = currentSpent / Math.max(currentDay, 1);

  // Project spending for the rest of the month
  const projectedTotal = Math.round(dailyAverage * daysInMonth);
  const willExceedBudget = projectedTotal > (income || totalBudget);

  // Generate chart data
  const chartData = [];
  const barChartData = []; // Create separate data for bar chart compatibility

  for (let day = 1; day <= daysInMonth; day++) {
    const actualSpent = day <= currentDay ? Math.round(dailyAverage * day) : null;
    const projected = day > currentDay ? Math.round(dailyAverage * day) : null;

    chartData.push({
      day: `Day ${day}`,
      actual: actualSpent,
      projected: projected,
      budget: totalBudget,
    });
  }

  // Populate bar chart data
  (budgets || []).forEach(b => {
    barChartData.push({
      name: b.category,
      budget: b.budget,
      projected: b.spent / Math.max(currentDay, 1) * daysInMonth, // Simple projection per category
      spent: b.spent
    });
  });


  // Add connecting point for smooth transition
  if (chartData[currentDay - 1]) {
    chartData[currentDay - 1].projected = chartData[currentDay - 1].actual;
  }

  return (
    <SpotlightCard className="shadow-none h-full">
      <CardHeader>
        <CardTitle className="text-xl font-black tracking-tight flex items-center gap-2">
          <div className="h-3 w-3 bg-secondary rounded-sm rotate-45" />
          Projected Spending
        </CardTitle>
        <CardDescription>Estimated spending by end of month based on current trends. Lets get it undercontrol buddy!</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={barChartData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
            >
              <XAxis type="number" hide />
              <YAxis
                dataKey="name"
                type="category"
                width={80}
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))', fontWeight: 600 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '2px solid #000',
                  boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)',
                  borderRadius: '8px',
                  fontWeight: 'bold'
                }}
                formatter={(value: number) => [`${currencySymbol}${value?.toLocaleString()}`, "Projected Total"]}
              />
              <Bar dataKey="projected" name="Projected Total" fill="hsl(var(--muted))" radius={[0, 4, 4, 0]} barSize={12}>
                {
                  barChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.projected > entry.budget ? 'hsl(var(--destructive))' : 'hsl(var(--primary))'} />
                  ))
                }
              </Bar>
              {/* Marker for Budget Limit */}
              {/* <ReferenceLine x={income} stroke="green" label="Income Limit" /> */}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </SpotlightCard>
  );
}
