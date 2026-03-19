import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { PiggyBank, Target, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/data";

interface SavingsGoalProgressProps {
    income: number;
    totalSpent: number;
    savingsTarget: number;
    currencyCode?: string;
    currencySymbol?: string;
    isLoading?: boolean;
}

export function SavingsGoalProgress({
    income,
    totalSpent,
    savingsTarget,
    currencyCode,
    currencySymbol = "₹",
    isLoading = false
}: SavingsGoalProgressProps) {
    // Logic Update: Saved = Income - Expenses
    const currentSavings = Math.max(0, income - totalSpent);

    // Progress = (Saved / Target) * 100
    // Allow > 100%
    // If target is 0 or null, avoid division by zero. Use 1 as strictly minimum to prevent NaN.
    const displayTarget = savingsTarget || 0;
    // Prevent division by zero if target is 0
    const rawProgress = displayTarget > 0 ? (currentSavings / displayTarget) * 100 : 0;
    const progress = Math.round(rawProgress);

    // Remaining to reach goal
    const remaining = Math.max(0, savingsTarget - currentSavings);

    const data = [
        { name: "Progress", value: currentSavings },
        { name: "Remaining", value: remaining },
    ];

    const COLORS = ["hsl(var(--primary))", "hsl(var(--muted)/0.2)"];

    return (
        <Card className="shadow-card overflow-hidden border-none bg-gradient-to-br from-card via-card to-primary/5 hover:to-primary/10 hover:shadow-lg transition-all duration-300 relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-primary" />
                        <span>Savings Goal</span>
                    </div>
                    {!isLoading && <span className="text-2xl font-bold text-primary">{progress}%</span>}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex items-center justify-center h-[200px]">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="h-[120px] w-full relative">
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
                                        paddingAngle={2}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {data.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center">
                                <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Current</p>
                                <p className="text-lg font-bold">{formatCurrency(currentSavings, currencyCode)}</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="font-bold text-foreground">
                                    {formatCurrency(currentSavings, currencyCode)} <span className="text-muted-foreground font-normal">of {formatCurrency(displayTarget, currencyCode)} saved</span>
                                </span>
                                {remaining > 0 ? (
                                    <span className="font-medium text-warning">{progress}%</span>
                                ) : (
                                    <span className="font-medium text-success">Goal Met!</span>
                                )}
                            </div>
                            <Progress value={progress} className="h-2 bg-muted/30" />
                        </div>

                        <p className="text-[11px] text-muted-foreground leading-relaxed italic text-center">
                            {progress >= 100
                                ? "Legendary! You've exceeded your savings target for this month."
                                : `Keep it up! You need to save ${formatCurrency(remaining, currencyCode)} more to hit your target.`}
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
