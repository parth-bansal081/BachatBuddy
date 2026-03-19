import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Save, PiggyBank, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Category } from "@/lib/data";

const CATEGORIES: Category[] = ["Shopping", "Food", "Transport", "Bills", "Lifestyle"];

export default function BudgetPlanner() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [expectations, setExpectations] = useState<Record<string, number>>({});
    const [savingsGoal, setSavingsGoal] = useState<string>("");
    const [isSaving, setIsSaving] = useState(false);

    // Fetch existing expectations
    const { data: existingData, isLoading } = useQuery({
        queryKey: ["category-budgets"],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            // @ts-ignore
            const { data, error } = await supabase
                .from("category_budgets")
                .select("*")
                .eq("user_id", user.id);

            if (error) throw error;
            return data;
        },
    });

    // Populate state on load
    useEffect(() => {
        if (existingData) {
            const initial: Record<string, number> = {};
            existingData.forEach((item: any) => {
                initial[item.category] = Number(item.budget_limit);
            });
            setExpectations(initial);
        }
    }, [existingData]);

    // Fetch current savings goal
    useQuery({
        queryKey: ["user-savings-goal"],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return null;
            const { data } = await supabase.from("user_profiles").select("monthly_savings_target").eq("id", user.id).single();
            if (data) setSavingsGoal(data.monthly_savings_target.toString());
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

            const upsertData = Object.entries(expectations).map(([category, amount]) => ({
                user_id: user.id,
                category,
                budget_limit: amount,
                updated_at: new Date().toISOString()
            }));

            // Upsert logic per category
            // Note: Supabase upsert works best with unique constraints (user_id, category) which we added in migration
            // @ts-ignore
            const { error } = await supabase
                .from("category_budgets")
                .upsert(upsertData, { onConflict: 'user_id,category' });

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

    return (
        <div className="space-y-6 max-w-4xl mx-auto p-4 md:p-8 animate-fade-in">
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-emerald-600">Budget Planner</h1>
                    <p className="text-muted-foreground">Set your expected monthly spending per category</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-4">
                    {/* SAVINGS GOAL CARD */}
                    <Card className="border-none shadow-md bg-emerald-50/50 dark:bg-emerald-950/10">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <PiggyBank className="h-5 w-5 text-emerald-600" />
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
                                        const { data: { user } } = await supabase.auth.getUser();
                                        if (!user) return;

                                        // 1. Update Savings Goal
                                        const { error } = await supabase.from("user_profiles").update({ monthly_savings_target: Number(savingsGoal) }).eq("id", user.id);

                                        // 2. Also Save Monthly Expectations (Category Budgets)
                                        await handleSave();

                                        if (!error) {
                                            toast.success("Goal & Budgets updated!");
                                            queryClient.invalidateQueries({ queryKey: ["user-profile"] });
                                            queryClient.invalidateQueries({ queryKey: ["category-budgets"] });
                                        } else {
                                            toast.error("Failed to update goal");
                                        }
                                    }}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                >
                                    Update Goal
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-md">
                        <CardHeader>
                            <CardTitle>Monthly Expectations</CardTitle>
                            <CardDescription>How much do you plan to spend this month?</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {isLoading ? (
                                <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                            ) : (
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
                            )}

                            <div className="pt-4 flex justify-end">
                                <Button onClick={handleSave} disabled={isSaving} className="w-full md:w-auto min-w-[150px]">
                                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                    Save Changes
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-4">
                    <Card className="bg-primary/5 border-none">
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
                </div>
            </div>
        </div>
    );
}
