import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BudgetGoal } from "@/lib/data";
import { Pencil } from "lucide-react";

interface BudgetProgressProps {
  budgets: BudgetGoal[];
  onBudgetChange?: (category: string, newBudget: number) => void;
  currencyCode?: string;
  className?: string;
}

export const BudgetProgress = ({ budgets, onBudgetChange, currencyCode = "INR", className = "" }: BudgetProgressProps) => {
  const symbol = currencyCode === "USD" ? "$" : "₹";

  return (
    <Card className={`card-glass rounded-xl border border-white/5 bg-[#131C2E]/30 shadow-elevation-2 ${className}`}>
      <CardContent className="p-5">
        <div className="pb-3 border-b border-white/[0.04] mb-4">
          <h3 className="text-sm font-semibold tracking-tight text-white">Monthly Budget Goals</h3>
          <p className="text-[11px] text-muted-foreground">Category target expenditure tracks</p>
        </div>

        <div className="space-y-4">
          {budgets.map((item) => {
            const isOver = item.spent > item.budget;
            const overAmount = item.spent - item.budget;
            const percentage = Math.min(100, (item.spent / (item.budget || 1)) * 100);

            return (
              <div key={item.category} className="space-y-2 min-w-0">
                {/* Upper Value Row Layout */}
                <div className="flex justify-between items-start gap-4">
                  <span className="text-xs font-medium text-white truncate pt-0.5">{item.category}</span>
                  
                  {/* ⚡ ANTI-OVERLAP BOX: Dynamic text stacking via flex-col items-end */}
                  <div className="flex flex-col items-end text-right shrink-0 min-w-0">
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className={`${isOver ? "text-red-400 font-bold" : "text-white"}`}>
                        {symbol}{item.spent.toLocaleString()}
                      </span>
                      <span className="text-muted-foreground">/</span>
                      <span className="text-muted-foreground/70">
                        {symbol}{item.budget.toLocaleString()}
                      </span>
                      <button className="text-muted-foreground/40 hover:text-primary transition-colors p-0.5 rounded ml-0.5">
                        <Pencil className="h-3 w-3" />
                      </button>
                    </div>
                    
                    {/* Overshoot Warning Tag - Isolated to a stacked layout row */}
                    {isOver && (
                      <span className="text-[10px] font-medium text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded mt-1 border border-red-500/10 tracking-tight animate-pulse">
                        Over by {symbol}{overAmount.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Performance Progress Bar Line Asset */}
                <div className="relative pt-0.5">
                  <Progress 
                    value={percentage} 
                    className="h-1.5 bg-white/5 rounded-full overflow-hidden" 
                    indicatorClassName={`${isOver ? "bg-red-500" : "bg-amber-500"}`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};