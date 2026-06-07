import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BudgetGoal, formatCurrency, categoryTextColors } from "@/lib/data";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Pencil, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BudgetProgressProps {
  budgets: BudgetGoal[];
  onBudgetChange: (category: string, newBudget: number) => void;
  currencyCode?: string;
}

export function BudgetProgress({ budgets, onBudgetChange, currencyCode }: BudgetProgressProps) {
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");

  const handleEdit = (category: string, currentBudget: number) => {
    setEditingCategory(category);
    setInputValue(currentBudget.toString());
  };

  const handleSave = (category: string) => {
    const numValue = parseFloat(inputValue.replace(/,/g, ""));
    if (!isNaN(numValue)) {
      onBudgetChange(category, numValue);
    }
    setEditingCategory(null);
  };

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">Monthly Budget Goals</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {budgets.map((item) => {
          const percentage = Math.min((item.spent / item.budget) * 100, 100);
          const isOverBudget = item.spent > item.budget;
          const isEditing = editingCategory === item.category;

          return (
            <div key={item.category} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium ${categoryTextColors[item.category]}`}>
                  {item.category}
                </span>
                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <>
                      <Input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSave(item.category)}
                        className="h-7 w-24 text-sm text-right"
                        autoFocus
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-primary"
                        onClick={() => handleSave(item.category)}
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <span className="text-sm text-muted-foreground">
                        {formatCurrency(item.spent, currencyCode)} / {formatCurrency(item.budget, currencyCode)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-foreground"
                        onClick={() => handleEdit(item.category, item.budget)}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
              <div className="relative">
                {item.budget > 0 ? (
                  <>
                    <Progress
                      value={percentage}
                      className={`h-2 transition-all [&>div]:transition-all ${isOverBudget
                        ? "[&>div]:bg-destructive"
                        : percentage > 85
                          ? "[&>div]:bg-warning [&>div]:shadow-[0_0_10px_hsl(var(--warning))]"
                          : (item.category === 'Groceries' || item.category === 'Education')
                            ? "[&>div]:bg-[hsl(var(--chart-3))] [&>div]:shadow-[0_0_10px_hsl(var(--chart-3))]"
                            : (item.category === 'Entertainment' || item.category === 'Eating Out' || item.category === 'Lifestyle')
                              ? "[&>div]:bg-[hsl(var(--chart-2))] [&>div]:shadow-[0_0_10px_hsl(var(--chart-2))]"
                              : (item.category === 'Transport')
                                ? "[&>div]:bg-[hsl(var(--chart-5))] [&>div]:shadow-[0_0_10px_hsl(var(--chart-5))]"
                                : "[&>div]:bg-primary"
                        }`}
                    />
                    {isOverBudget && (
                      <span className="absolute right-0 -top-5 text-xs text-destructive font-medium">
                        Over by {formatCurrency(item.spent - item.budget, currencyCode)}
                      </span>
                    )}
                  </>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground italic">Budget not set</span>
                    <Progress value={0} className="h-2 w-full ml-4 bg-muted/20" />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
