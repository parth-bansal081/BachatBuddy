import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, TrendingUp, AlertCircle, ArrowRight } from "lucide-react";
import { Transaction } from "@/lib/data";
import { startOfWeek, subWeeks, isSameWeek } from "date-fns";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";

interface SmartInsightCardProps {
    transactions: Transaction[];
    currencySymbol?: string;
}

const typeConfig = {
    warning: { bg: "bg-warning/10", text: "text-warning", icon: TrendingUp, badge: "bg-warning/15 text-warning" },
    alert: { bg: "bg-destructive/10", text: "text-destructive", icon: AlertCircle, badge: "bg-destructive/15 text-destructive" },
    success: { bg: "bg-primary/10", text: "text-primary", icon: Sparkles, badge: "bg-primary/15 text-primary" },
};

export function SmartInsightCard({ transactions, currencySymbol = "₹" }: SmartInsightCardProps) {
    const navigate = useNavigate();

    const insight = useMemo(() => {
        if (!transactions || transactions.length < 5) return null;

        const latest5 = transactions.slice(0, 5);
        const recentTotal = latest5.reduce((sum, t) => sum + t.amount, 0);

        const categoryCounts: Record<string, number> = {};
        latest5.forEach(t => { categoryCounts[t.category] = (categoryCounts[t.category] || 0) + t.amount; });
        const topCategory = Object.entries(categoryCounts).sort(([, a], [, b]) => b - a)[0];

        const now = new Date();
        const thisWeekSpent = transactions.filter(t => isSameWeek(new Date(t.date), now)).reduce((sum, t) => sum + t.amount, 0);
        const lastWeekSpent = transactions.filter(t => isSameWeek(new Date(t.date), subWeeks(now, 1))).reduce((sum, t) => sum + t.amount, 0);

        if (thisWeekSpent > lastWeekSpent * 1.2 && lastWeekSpent > 0) {
            const pct = Math.round(((thisWeekSpent - lastWeekSpent) / lastWeekSpent) * 100);
            return { text: `You spent ${pct}% more this week compared to last week.`, detail: `Total spend: ${currencySymbol}${thisWeekSpent.toLocaleString()}`, type: "warning" as const };
        }

        if (topCategory && topCategory[1] > recentTotal * 0.5) {
            return { text: `Watch out! ${Math.round((topCategory[1] / recentTotal) * 100)}% of your recent spending is on ${topCategory[0]}.`, detail: `That's ${currencySymbol}${topCategory[1].toLocaleString()} in your last 5 transactions.`, type: "alert" as const };
        }

        return { text: "Your spending looks stable this week.", detail: `Average transaction: ${currencySymbol}${Math.round(recentTotal / 5).toLocaleString()}`, type: "success" as const };
    }, [transactions, currencySymbol]);

    if (!insight) return null;

    const config = typeConfig[insight.type];
    const Icon = config.icon;

    return (
        <Card className="animate-fade-in">
            <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-xl ${config.bg} ${config.text}`}>
                        <Icon className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                            AI Insight
                            {insight.type === 'warning' && <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${config.badge}`}>High Spend</span>}
                        </h3>
                        <p className="text-sm font-medium text-foreground/80 mt-0.5">{insight.text}</p>
                        <p className="text-xs text-muted-foreground mt-1">{insight.detail}</p>
                    </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate("/insights/deep-dive")} className="hidden md:flex shrink-0 gap-1 text-muted-foreground hover:text-foreground">
                    Deep Dive <ArrowRight className="h-3.5 w-3.5" />
                </Button>
            </CardContent>
        </Card>
    );
}