import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, TrendingUp, TrendingDown, AlertCircle, ArrowRight } from "lucide-react";
import { Transaction } from "@/lib/data";
import { startOfWeek, subWeeks, isSameWeek } from "date-fns";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";

interface SmartInsightCardProps {
    transactions: Transaction[];
    currencySymbol?: string;
}

export function SmartInsightCard({ transactions, currencySymbol = "₹" }: SmartInsightCardProps) {
    const navigate = useNavigate();
    const insight = useMemo(() => {
        if (!transactions || transactions.length < 5) return null;

        // 1. Analyze latest 5 transactions
        const latest5 = transactions.slice(0, 5);
        const recentTotal = latest5.reduce((sum, t) => sum + t.amount, 0);

        // Find top category in latest 5
        const categoryCounts: Record<string, number> = {};
        latest5.forEach(t => {
            categoryCounts[t.category] = (categoryCounts[t.category] || 0) + t.amount;
        });

        const topCategory = Object.entries(categoryCounts)
            .sort(([, a], [, b]) => b - a)[0];

        // 2. Weekly Comparison (User specific request)
        const now = new Date();
        const thisWeekStart = startOfWeek(now);
        const lastWeekStart = startOfWeek(subWeeks(now, 1));

        const thisWeekSpent = transactions
            .filter(t => isSameWeek(new Date(t.date), now))
            .reduce((sum, t) => sum + t.amount, 0);

        const lastWeekSpent = transactions
            .filter(t => isSameWeek(new Date(t.date), subWeeks(now, 1)))
            .reduce((sum, t) => sum + t.amount, 0);

        // Generate Insight String
        if (thisWeekSpent > lastWeekSpent * 1.2 && lastWeekSpent > 0) {
            const percentage = Math.round(((thisWeekSpent - lastWeekSpent) / lastWeekSpent) * 100);
            return {
                text: `You spent ${percentage}% more this week compared to last week.`,
                detail: `Total spend: ${currencySymbol}${thisWeekSpent.toLocaleString()}`,
                type: "warning",
                icon: TrendingUp
            };
        }

        if (topCategory && topCategory[1] > recentTotal * 0.5) {
            return {
                text: `Watch out! ${Math.round((topCategory[1] / recentTotal) * 100)}% of your recent spending is on ${topCategory[0]}.`,
                detail: `That's ${currencySymbol}${topCategory[1].toLocaleString()} in your last 5 transactions.`,
                type: "alert",
                icon: AlertCircle
            };
        }

        return {
            text: "Your spending looks stable this week.",
            detail: `Average transaction: ${currencySymbol}${Math.round(recentTotal / 5).toLocaleString()}`,
            type: "success",
            icon: Sparkles
        };

    }, [transactions, currencySymbol]);

    if (!insight) return null;

    const Icon = insight.icon;

    return (
        <Card className="border-violet-500/20 shadow-sm animate-fade-in group hover:shadow-md transition-all">
            <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${insight.type === 'warning' ? 'bg-amber-500/20 text-amber-600' :
                        insight.type === 'alert' ? 'bg-rose-500/20 text-rose-600' :
                            'bg-violet-500/20 text-violet-600'
                        }`}>
                        {insight.type === 'success' ? <Sparkles className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                    </div>
                    <div>
                        <h3 className="font-semibold text-foreground flex items-center gap-2">
                            AI Insight
                            {insight.type === 'warning' && <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600">High Spend</span>}
                        </h3>
                        <p className="text-sm font-medium text-foreground/90 mt-0.5">
                            {insight.text}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {insight.detail}
                        </p>
                    </div>
                </div>

                <Button variant="ghost" size="sm" onClick={() => navigate("/insights/deep-dive")} className="hidden group-hover:flex gap-1">
                    See Deep Dive <ArrowRight className="h-4 w-4" />
                </Button>
            </CardContent>
        </Card>
    );
}
