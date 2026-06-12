import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { formatCurrency } from "@/lib/data";

interface BudgetSummaryVisualsProps {
  savingsGoal: number;
  savingsCurrent: number;
  budgets: { category: string; budget: number; spent: number }[];
  currencySymbol?: string;
  currencyCode?: string;
}

export function BudgetSummaryVisuals({
  savingsGoal,
  savingsCurrent,
  budgets,
  currencySymbol = "₹",
  currencyCode = "INR",
}: BudgetSummaryVisualsProps) {
  // 1. Calculate savings goal percentage
  const target = Math.max(1, savingsGoal);
  const current = Math.max(0, savingsCurrent);
  const savingsPercent = Math.min(100, Math.round((current / target) * 100));

  // Circular progress ring setup
  const radius = 60;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (savingsPercent / 100) * circumference;

  // 2. Prepare budget chart data
  const chartData = useMemo(() => {
    return (budgets || [])
      .filter((b) => b.budget > 0 || b.spent > 0)
      .map((b) => ({
        category: b.category,
        Budget: b.budget,
        Spent: b.spent,
      }));
  }, [budgets]);

  // Custom Tooltip for comparison bar chart
  const CustomCompareTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const categoryName = payload[0].payload.category;
      const budgetVal = payload[0].value;
      const spentVal = payload[1].value;
      const overBudget = spentVal > budgetVal;

      return (
        <div className="bg-white border-2 border-slate-950 rounded-xl p-3 shadow-[4px_4px_0px_rgba(0,0,0,0.85)] text-slate-900 animate-in fade-in zoom-in-95 duration-100">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            {categoryName}
          </p>
          <div className="space-y-1 text-sm font-semibold">
            <p className="text-slate-600">
              Budget: <span className="font-extrabold">{currencySymbol}{budgetVal.toLocaleString()}</span>
            </p>
            <p className={overBudget ? "text-red-500 font-extrabold" : "text-teal-600 font-extrabold"}>
              Spent: <span>{currencySymbol}{spentVal.toLocaleString()}</span>
            </p>
            {overBudget && (
              <p className="text-xs text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded border border-red-200 mt-1">
                Over budget by {currencySymbol}{(spentVal - budgetVal).toLocaleString()}
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Top Section: Savings Progress Ring */}
      <div className="flex flex-col items-center justify-center p-6 bg-slate-950/20 dark:bg-white/[0.02] border border-slate-200/40 dark:border-white/[0.04] rounded-2xl">
        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Savings Progress
        </h4>
        
        <div className="relative flex items-center justify-center h-36 w-36">
          {/* Background Ring */}
          <svg className="absolute transform -rotate-95 w-full h-full">
            <circle
              cx="72"
              cy="72"
              r={radius}
              className="text-slate-200 dark:text-slate-800"
              strokeWidth={strokeWidth}
              stroke="currentColor"
              fill="transparent"
            />
            {/* Foreground Ring */}
            <circle
              cx="72"
              cy="72"
              r={radius}
              className="text-teal-500 transition-all duration-1000 ease-out"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              stroke="url(#savingsGradient)"
              fill="transparent"
            />
            <defs>
              <linearGradient id="savingsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#14b8a6" />
              </linearGradient>
            </defs>
          </svg>

          {/* Inner Content */}
          <div className="text-center z-10 pointer-events-none select-none">
            <span className="text-2xl font-black text-foreground">{savingsPercent}%</span>
            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest mt-0.5">
              Saved
            </p>
          </div>
        </div>

        <div className="text-center mt-4 space-y-1">
          <p className="text-sm font-semibold text-foreground">
            Saved {currencySymbol}{current.toLocaleString()} of {currencySymbol}{target.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">
            {savingsPercent >= 100
              ? "Savings goal achieved! Awesome job! 🎉"
              : `${currencySymbol}${(target - current).toLocaleString()} remaining to hit target`}
          </p>
        </div>
      </div>

      {/* Bottom Section: Category Budgets vs Spent Bar Chart */}
      <div className="p-4 bg-slate-950/20 dark:bg-white/[0.02] border border-slate-200/40 dark:border-white/[0.04] rounded-2xl">
        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-2">
          Budgets vs Actual Spent
        </h4>

        {chartData.length === 0 ? (
          <div className="h-[180px] flex items-center justify-center text-center">
            <p className="text-xs text-muted-foreground font-medium">
              No budgets or spending data available.
            </p>
          </div>
        ) : (
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
              >
                <XAxis
                  type="number"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                  tickFormatter={(val) => `${currencySymbol}${val}`}
                />
                <YAxis
                  type="category"
                  dataKey="category"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontWeight: 600 }}
                  width={75}
                />
                <Tooltip
                  content={<CustomCompareTooltip />}
                  cursor={{ fill: "rgba(255,255,255,0.05)" }}
                />
                <Legend
                  verticalAlign="top"
                  height={36}
                  iconSize={10}
                  wrapperStyle={{ fontSize: 11, fontWeight: 500 }}
                />
                <Bar
                  dataKey="Budget"
                  fill="hsl(var(--muted))"
                  radius={[0, 4, 4, 0]}
                  barSize={8}
                />
                <Bar
                  dataKey="Spent"
                  fill="hsl(var(--primary))"
                  radius={[0, 4, 4, 0]}
                  barSize={8}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
