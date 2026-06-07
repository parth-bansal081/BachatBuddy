import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BudgetGoal } from "@/lib/data";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface BudgetMatchGaugeProps {
  budgets: BudgetGoal[];
}

export function BudgetMatchGauge({ budgets }: BudgetMatchGaugeProps) {
  // Calculate matching score (0-100%)
  // Formula: Average of how close each category's spending is to budget
  // If under budget: score = (spent/budget) * 100
  // If over budget: score = max(0, 100 - ((spent - budget) / budget) * 100)
  const categoryScores = budgets.map((b) => {
    if (b.spent <= b.budget) {
      // Under or at budget - closer to budget is better
      const percentUsed = (b.spent / b.budget) * 100;
      // Score based on how close to 100% usage (ideal is 100%)
      return 100 - Math.abs(100 - percentUsed);
    } else {
      // Over budget - penalize
      const overPercent = ((b.spent - b.budget) / b.budget) * 100;
      return Math.max(0, 100 - overPercent);
    }
  });

  const matchingScore = Math.round(
    categoryScores.reduce((sum, score) => sum + score, 0) / categoryScores.length
  );

  // Data for semi-circle gauge
  const gaugeData = [
    { name: "score", value: matchingScore },
    { name: "remaining", value: 100 - matchingScore },
  ];

  // Get color based on score
  const getScoreColor = (score: number) => {
    if (score >= 80) return "hsl(var(--success))";
    if (score >= 60) return "hsl(var(--primary))";
    if (score >= 40) return "hsl(var(--warning))";
    return "hsl(var(--destructive))";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Needs Work";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-foreground">Budget Match Score</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          {/* Gauge Chart */}
          <div className="relative w-full h-[220px] pb-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={gaugeData}
                  cx="50%"
                  cy="75%"
                  startAngle={180}
                  endAngle={0}
                  innerRadius="65%"
                  outerRadius="85%"
                  paddingAngle={0}
                  dataKey="value"
                  stroke="none"
                >
                  <Cell fill={getScoreColor(matchingScore)} />
                  <Cell fill="hsl(var(--muted))" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text - Adjusted positioning */}
            <div
              className="absolute inset-0 flex flex-col items-center justify-center"
              style={{ paddingTop: "50px" }}
            >
              <span
                className="text-3xl font-bold leading-none"
                style={{
                  color: getScoreColor(matchingScore),
                  fontSize: matchingScore >= 100 ? "2rem" : "2.5rem" // Scale down for 3-digit numbers
                }}
              >
                {matchingScore}%
              </span>
              <span className="text-xs text-gray-400 mt-2 font-medium">
                {getScoreLabel(matchingScore)}
              </span>
            </div>
          </div>

          {/* Category breakdown */}
          <div className="w-full mt-4 space-y-2">
            <p className="text-xs text-muted-foreground text-center mb-3">
              How closely your spending matches your budget goals
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {budgets.map((b, index) => {
                const score = Math.round(categoryScores[index]);
                return (
                  <div
                    key={b.category}
                    className="flex items-center justify-between p-2 rounded-lg bg-secondary/50"
                  >
                    <span className="text-muted-foreground truncate">{b.category}</span>
                    <span
                      className="font-medium"
                      style={{ color: getScoreColor(score) }}
                    >
                      {score}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
