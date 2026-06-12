import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Label } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Lightbulb } from "lucide-react";
import { formatCurrency } from "@/lib/data";

interface BudgetAccuracyChartProps {
    totalBudget: number;
    totalSpent: number;
    budgets: any[];
    className?: string;
}

export function BudgetAccuracyChart({ totalBudget, totalSpent, budgets, className }: BudgetAccuracyChartProps) {
    const [tip, setTip] = useState<string>("");
    const [loadingTip, setLoadingTip] = useState(false);

    const percentage = totalBudget > 0 ? Math.min(100, Math.round((totalSpent / totalBudget) * 100)) : 0;

    // Data for the Gauge
    const data = [
        { name: "Spent", value: percentage },
        { name: "Remaining", value: 100 - percentage },
    ];

    const COLORS = [
        percentage > 100 ? "hsl(var(--destructive))" : percentage > 85 ? "hsl(var(--warning))" : "hsl(var(--primary))",
        "hsl(var(--muted)/0.2)",
    ];

    return (
        <Card className={`shadow-elevation-2 h-full flex flex-col ${className || ""}`}>
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold">Budget Accuracy</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-center justify-center relative">
                <div className="h-[200px] w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="70%"
                                startAngle={180}
                                endAngle={0}
                                innerRadius={60}
                                outerRadius={85}
                                paddingAngle={0}
                                dataKey="value"
                                stroke="none"
                            >
                                {data.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute top-[60%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                        <div className="text-3xl font-bold">{percentage}%</div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wider">Used</div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
