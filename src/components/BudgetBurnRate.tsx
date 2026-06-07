import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { AlertTriangle, TrendingUp, CheckCircle2 } from "lucide-react";
import { formatCurrency } from "@/lib/data";

interface BudgetBurnRateProps {
    totalBudget: number;
    totalSpent: number;
}

export function BudgetBurnRate({ totalBudget, totalSpent }: BudgetBurnRateProps) {
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const currentDay = now.getDate();

    const monthProgress = currentDay / daysInMonth;
    const budgetProgress = totalBudget > 0 ? totalSpent / totalBudget : 0;

    // Burn rate: if > 1, spending faster than time
    const burnRate = monthProgress > 0 ? budgetProgress / monthProgress : 0;
    const isSpendingTooFast = budgetProgress > monthProgress && budgetProgress > 0.1;

    const data = [
        { name: "Progress", value: Math.min(monthProgress, 1) * 100 },
        { name: "Remaining", value: Math.max(0, 1 - monthProgress) * 100 },
    ];

    // Colors for the gauge based on burn rate
    const getGaugeColor = () => {
        if (burnRate > 1.2) return "#ef4444"; // Red - Danger
        if (burnRate > 1.0) return "#f59e0b"; // Amber - Warning
        return "#10b981"; // Emerald - Good
    };

    return (
        <Card className="shadow-card hover:shadow-lg transition-shadow duration-200 h-full">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold flex items-center justify-between">
                    <span>Budget Burn Rate</span>
                    {isSpendingTooFast ? (
                        <AlertTriangle className="h-5 w-5 text-destructive animate-pulse" />
                    ) : (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
                <div className="h-[140px] w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="100%"
                                startAngle={180}
                                endAngle={0}
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={0}
                                dataKey="value"
                                stroke="none"
                            >
                                <Cell fill={getGaugeColor()} />
                                <Cell fill="hsl(var(--muted)/0.2)" />
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center pb-2">
                        <span className="text-2xl font-bold">{(burnRate * 100).toFixed(0)}%</span>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-tighter">Velocity</p>
                    </div>
                </div>

                <div className="w-full mt-4 space-y-3">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Month Progress</span>
                        <span className="font-medium">{currentDay} / {daysInMonth} days</span>
                    </div>
                    <div className="w-full bg-muted/30 h-1.5 rounded-full overflow-hidden">
                        <div
                            className="bg-slate-400 h-full transition-all duration-500"
                            style={{ width: `${monthProgress * 100}%` }}
                        />
                    </div>

                    <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Budget Used</span>
                        <span className="font-medium">{(budgetProgress * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-muted/30 h-1.5 rounded-full overflow-hidden">
                        <div
                            className="h-full transition-all duration-500"
                            style={{
                                width: `${Math.min(budgetProgress * 100, 100)}%`,
                                backgroundColor: getGaugeColor()
                            }}
                        />
                    </div>
                </div>

                {isSpendingTooFast && (
                    <div className="mt-4 p-2 bg-destructive/10 border border-destructive/20 rounded flex items-center gap-2 text-[11px] text-destructive font-medium w-full">
                        <TrendingUp className="h-3 w-3" />
                        <span>Warning: Spending {((burnRate - 1) * 100).toFixed(0)}% faster than usual.</span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
