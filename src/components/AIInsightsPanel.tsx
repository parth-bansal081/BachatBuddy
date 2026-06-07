import { useState, useEffect } from "react";
import { Sparkles, TrendingUp, TrendingDown, PiggyBank, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BudgetGoal, Transaction } from "@/lib/data";
import { useQuery } from "@tanstack/react-query";
import { aiService } from "@/lib/aiService";
import { Loader2 } from "lucide-react";

interface AIInsightsPanelProps {
  budgets: BudgetGoal[];
  transactions: Transaction[];
  income: number;
  savingsTarget?: number;
  currencyCode?: string;
  currencySymbol?: string;
}

interface Insight {
  id: string;
  text: string;
  type: "positive" | "warning" | "neutral";
  icon: React.ReactNode;
}

export function AIInsightsPanel({ budgets = [], transactions = [], income = 0, savingsTarget = 0, currencyCode, currencySymbol = "₹" }: AIInsightsPanelProps) {
  const [insights, setInsights] = useState<Insight[]>([]);

  // Fetch Real AI Strategic Summary from Backend
  const { data: aiSummary, isLoading: isAiLoading } = useQuery({
    queryKey: ["ai-analysis", transactions.length],
    queryFn: () => aiService.analyzeFinance(transactions),
    enabled: transactions.length > 0,
    staleTime: 1000 * 60 * 5, // Cache for 5 mins
  });

  useEffect(() => {
    // Generate dynamic insights based on data
    const generatedInsights: Insight[] = [];

    // Calculate total expenses
    const totalExpenses = (budgets || []).reduce((sum, b) => sum + (b?.spent || 0), 0);
    const remainingBalance = income - totalExpenses;

    // Find over-budget categories
    const overBudgetCategories = budgets.filter((b) => b.spent > b.budget);
    const underBudgetCategories = budgets.filter((b) => b.spent < b.budget * 0.8);

    // Insight: Over budget warning
    if (overBudgetCategories.length > 0) {
      const worst = overBudgetCategories.reduce((a, b) =>
        ((a.spent - a.budget) / a.budget) > ((b.spent - b.budget) / b.budget) ? a : b
      );
      const overPercent = Math.round(((worst.spent - worst.budget) / worst.budget) * 100);
      generatedInsights.push({
        id: "over-budget",
        text: `Your ${worst.category} spending is ${overPercent}% over budget this month.`,
        type: "warning",
        icon: <AlertTriangle className="h-4 w-4 text-warning" />,
      });
    }

    // Insight: Good savings potential
    if (remainingBalance > income * 0.2) {
      const savingsAmount = Math.round(remainingBalance * 0.5);
      generatedInsights.push({
        id: "savings",
        text: `You have enough remaining budget to put an extra ${currencySymbol}${savingsAmount.toLocaleString()} into savings.`,
        type: "positive",
        icon: <PiggyBank className="h-4 w-4 text-success" />,
      });
    }

    // Insight: Eating out trend
    const eatingOut = budgets.find((b) => b.category === "Eating Out");
    if (eatingOut && eatingOut.spent > eatingOut.budget * 0.9) {
      generatedInsights.push({
        id: "eating-out",
        text: "Your eating out expenses are approaching the limit. Consider meal planning to save more.",
        type: "warning",
        icon: <TrendingUp className="h-4 w-4 text-warning" />,
      });
    }

    // Insight: Under budget celebration
    if (underBudgetCategories.length > 0) {
      const best = underBudgetCategories[0];
      const savedAmount = best.budget - best.spent;
      generatedInsights.push({
        id: "under-budget",
        text: `Great job! You're ${currencySymbol}${savedAmount.toLocaleString()} under budget in ${best.category}.`,
        type: "positive",
        icon: <TrendingDown className="h-4 w-4 text-success" />,
      });
    }

    // Insight: Savings Target Achievement
    if (savingsTarget > 0 && remainingBalance >= savingsTarget) {
      generatedInsights.push({
        id: "savings-goal-reached",
        text: `Awesome! You've already secured your ${currencySymbol}${savingsTarget.toLocaleString()} savings goal for this month.`,
        type: "positive",
        icon: <PiggyBank className="h-4 w-4 text-primary" />,
      });
    } else if (savingsTarget > 0 && remainingBalance < savingsTarget && remainingBalance > 0) {
      const remainingToGoal = Math.round(savingsTarget - remainingBalance);
      generatedInsights.push({
        id: "savings-goal-pending",
        text: `You're just ${currencySymbol}${remainingToGoal.toLocaleString()} away from your monthly savings target.`,
        type: "neutral",
        icon: <TrendingUp className="h-4 w-4 text-muted-foreground" />,
      });
    }

    // Insight: Overall health
    const budgetUtilization = (totalExpenses / income) * 100;
    if (budgetUtilization < 70) {
      generatedInsights.push({
        id: "overall",
        text: `You've used only ${Math.round(budgetUtilization)}% of your monthly income. Excellent financial discipline!`,
        type: "positive",
        icon: <Sparkles className="h-4 w-4 text-primary" />,
      });
    }

    setInsights(generatedInsights.slice(0, 4));
  }, [budgets, transactions, income]);

  return (
    <Card className="bg-gradient-to-br from-card to-primary/5 border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {/* Real AI Advice (High Priority) */}
          <li className="bg-primary/10 border border-primary/20 p-4 rounded-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-1 opacity-20 group-hover:opacity-100 transition-opacity">
               <Sparkles className="h-4 w-4 text-primary" />
            </div>
            {isAiLoading ? (
              <div className="flex items-center gap-3">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-sm italic text-muted-foreground">BachatBuddy is thinking...</span>
              </div>
            ) : (
              <p className="text-sm font-medium text-foreground leading-relaxed italic">
                {aiSummary || "Connect your bank to receive personalized strategic advice from my AI agents."}
              </p>
            )}
          </li>

          {insights.map((insight) => (
            <li
              key={insight.id}
              className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${insight.type === "positive"
                ? "bg-success/10 border border-success/20"
                : insight.type === "warning"
                  ? "bg-warning/10 border border-warning/20"
                  : "bg-secondary/50"
                }`}
            >
              <div className="mt-0.5">{insight.icon}</div>
              <p className="text-sm text-foreground leading-relaxed">{insight.text}</p>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
