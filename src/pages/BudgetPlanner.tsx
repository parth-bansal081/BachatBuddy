import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Save, PiggyBank, ArrowLeft, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Category, Transaction } from "@/lib/data";
import { useUserProfile } from "@/hooks/useUserProfile";
import { MotionWrapper } from "@/components/MotionWrapper";
import { BudgetSummaryVisuals } from "@/components/BudgetSummaryVisuals";
import { useThreeTheme } from "@/hooks/useThreeTheme";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AddBudgetForm } from "@/components/AddBudgetForm";

const CATEGORIES: Category[] = ["Shopping", "Food", "Transport", "Bills", "Lifestyle", "Entertainment"]; // Added Entertainment

export default function BudgetPlanner() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { profile, updateProfile, isLoading: isLoadingProfile } = useUserProfile();
    const [expectations, setExpectations] = useState<Record<string, number>>({});
    const [savingsGoal, setSavingsGoal] = useState<string>("");
    const [isSaving, setIsSaving] = useState(false);
    const [isAddBudgetOpen, setIsAddBudgetOpen] = useState(false); // State for AddBudget dialog
    const theme = useThreeTheme();

    const { data: allTransactions = [] } = useQuery({
        queryKey: ["transactions"],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return [];
            const { data, error } = await supabase
                .from("transactions")
                .select("*")
                .eq("user_id", user.id);
            if (error) return [];
            return data;
        }
    });

    const categorySpent = useMemo(() => {
        return allTransactions.reduce((acc: Record<string, number>, t: any) => {
            const category = t.category || "Others";
            acc[category] = (acc[category] || 0) + Math.abs(t.amount || 0);
            return acc;
        }, {});
    }, [allTransactions]);

    const currentBudgets = useMemo(() => {
        return Object.entries(expectations).map(([category, budget]) => ({
            category,
            budget,
            spent: categorySpent[category] || 0,
        }));
    }, [expectations, categorySpent]);

    const totalSpent = useMemo(() => {
        return Object.values(categorySpent).reduce((a: number, b: number) => a + b, 0);
    }, [categorySpent]);

    const { data: existingData, isLoading } = useQuery({
        queryKey: ["category-budgets"],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            const { data, error } = await supabase
                .from("budget_expectations")
                .select("*")
                .eq("user_id", user.id);

            if (error) throw error;
            return data;
        },
    });

    useEffect(() => {
        if (existingData) {
            const initial: Record<string, number> = {};
            existingData.forEach((item: any) => {
                initial[item.category] = Number(item.expected_amount); // budget_expectations uses expected_amount
            });
            setExpectations(initial);
        }
    }, [existingData]);

    useQuery({
        queryKey: ["user-savings-goal"],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return null;
            const { data } = await supabase.from("user_profiles").select("monthly_savings_target").eq("user_id", user.id).single();
            if (data) setSavingsGoal(data.monthly_savings_target?.toString() || "");
            return data;
        }
    });

    const handleInputChange = (category: string, value: string) => {
        setExpectations(prev => ({
            ...prev,
            [category]: Number(value)
        }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                toast.error("Please login to save");
                return;
            }

            const { error } = await supabase
                .from("budget_expectations")
                .upsert(
                    Object.entries(expectations).map(([category, amount]) => ({
                        user_id: user.id,
                        category,
                        expected_amount: amount,
                        updated_at: new Date().toISOString()
                    })),
                    { onConflict: 'user_id,category' }
                );

            if (error) throw error;

            toast.success("Budget expectations saved!");
            queryClient.invalidateQueries({ queryKey: ["category-budgets"] });
        } catch (error: any) {
            console.error("Save error:", error);
            toast.error("Failed to save: " + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const totalExpected = Object.values(expectations).reduce((a, b) => a + b, 0);

    if (isLoadingProfile || isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center space-y-3">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                    <p className="text-muted-foreground">Loading budget planner...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <MotionWrapper delay={0.05}>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <h1 className="text-2xl font-bold gemini-text-gradient">Budget Planner</h1>
                        <p className="text-muted-foreground text-sm">Set your expected monthly spending per category</p>
                    </div>
                    <Dialog open={isAddBudgetOpen} onOpenChange={setIsAddBudgetOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" className="gap-2">
                                <Plus className="h-4 w-4" />
                                Add Budget
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader><DialogTitle>Add New Budget</DialogTitle></DialogHeader>
                            <AddBudgetForm onSuccess={() => setIsAddBudgetOpen(false)} />
                        </DialogContent>
                    </Dialog>
                </div>
            </MotionWrapper>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <MotionWrapper delay={0.1}>
                        <Card className="card-glass shadow-elevation-2">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <PiggyBank className="h-5 w-5 text-primary" />
                                    Monthly Savings Goal
                                </CardTitle>
                                <CardDescription>How much do you want to save this month?</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex gap-4 items-end">
                                    <div className="space-y-2 flex-1">
                                        <Label htmlFor="savingsGoal">Target Amount</Label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                                            <Input
                                                id="savingsGoal"
                                                type="number"
                                                className="pl-7"
                                                value={savingsGoal}
                                                onChange={(e) => setSavingsGoal(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <Button
                                        onClick={async () => {
                                            try {
                                                const { data: { user } } = await supabase.auth.getUser();
                                                if (!user) return;

                                                await updateProfile.mutateAsync({
                                                    monthly_savings_target: Number(savingsGoal)
                                                });

                                                await handleSave();

                                                toast.success("Goal & Budgets updated!");
                                                queryClient.invalidateQueries({ queryKey: ["user-profile"] });
                                                queryClient.invalidateQueries({ queryKey: ["category-budgets"] });
                                            } catch (err: any) {
                                                toast.error("Failed to update: " + err.message);
                                            }
                                        }}
                                        className="shadow-elevation-2"
                                    >
                                        Update Goal
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </MotionWrapper>

                    <MotionWrapper delay={0.15}>
                        <Card className="card-glass shadow-elevation-2">
                            <CardHeader>
                                <CardTitle>Monthly Expectations</CardTitle>
                                <CardDescription>How much do you plan to spend this month?</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid gap-4">
                                    {CATEGORIES.map((category) => (
                                        <div key={category} className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor={category} className="col-span-1 text-base font-medium text-muted-foreground">
                                                {category}
                                            </Label>
                                            <div className="col-span-3 relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                                                <Input
                                                    id={category}
                                                    type="number"
                                                    className="pl-7"
                                                    placeholder="0"
                                                    value={expectations[category] || ""}
                                                    onChange={(e) => handleInputChange(category, e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-4 flex justify-end">
                                    <Button onClick={handleSave} disabled={isSaving} className="w-full md:w-auto min-w-[150px] shadow-elevation-2">
                                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                        Save Changes
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </MotionWrapper>
                </div>

                <div className="space-y-6">
                    <MotionWrapper delay={0.2}>
                        <Card className="card-glass shadow-elevation-2 bg-primary/10">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <PiggyBank className="h-5 w-5 text-primary" />
                                    Total Expected
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-primary">
                                    ₹{totalExpected.toLocaleString()}
                                </div>
                                <p className="text-sm text-muted-foreground mt-2">
                                    This is your planned monthly burn rate.
                                </p>
                            </CardContent>
                        </Card>
                    </MotionWrapper>

                    <MotionWrapper delay={0.25}>
                        {savingsGoal && (
                            <Card className="card-glass shadow-elevation-2 overflow-hidden">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base font-semibold">Savings & Budgets Summary</CardTitle>
                                    <CardDescription>Visual breakdown of your financial targets</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <BudgetSummaryVisuals
                                        savingsGoal={Number(savingsGoal)}
                                        savingsCurrent={Math.max(0, (profile?.monthly_income || 0) - totalSpent)}
                                        budgets={currentBudgets}
                                        currencySymbol={profile?.currency || "₹"}
                                        currencyCode={profile?.currency === "₹" ? "INR" : "USD"}
                                    />
                                </CardContent>
                            </Card>
                        )}
                    </MotionWrapper>
                </div>
            </div>
        </div>
    );
}
