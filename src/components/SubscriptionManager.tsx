import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Calendar, CreditCard, Loader2 } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/data";

const SubscriptionManager = () => {
    const [name, setName] = useState("");
    const [amount, setAmount] = useState("");
    const [billingDay, setBillingDay] = useState("1");
    const [loading, setLoading] = useState(false);
    const queryClient = useQueryClient();

    const { data: subscriptions = [], isLoading } = useQuery({
        queryKey: ["recurring_bills"],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return [];

            const { data, error } = await supabase
                .from("recurring_bills")
                .select("*")
                .eq("user_id", user.id)
                .order("name");

            if (error) throw error;
            return data || [];
        },
    });

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("No user found");

            const { error } = await supabase.from("recurring_bills").insert({
                user_id: user.id,
                name,
                bill_name: name, // Redundant save to satisfy schema
                amount: parseFloat(amount),
                billing_day: parseInt(billingDay),
                due_day: parseInt(billingDay), // Redundant save to satisfy schema
                category: "Other", // Default for now
            });

            if (error) throw error;
            toast.success("Subscription added!");
            setName("");
            setAmount("");
            setBillingDay("1");
            queryClient.invalidateQueries({ queryKey: ["recurring_bills"] });
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const { error } = await supabase.from("recurring_bills").delete().eq("id", id);
            if (error) throw error;
            toast.success("Subscription removed");
            queryClient.invalidateQueries({ queryKey: ["recurring_bills"] });
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    return (
        <div className="space-y-6">
            <Card className="shadow-card">
                <CardHeader>
                    <CardTitle className="text-lg">Add New Recurring Bill</CardTitle>
                    <CardDescription>Track your monthly subscriptions like Netflix, Rent, etc.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div className="space-y-2 md:col-span-1">
                            <Label htmlFor="sub-name">Name</Label>
                            <Input id="sub-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Netflix" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="sub-amount">Amount</Label>
                            <Input id="sub-amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="499" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="sub-day">Billing Day (1-31)</Label>
                            <Input id="sub-day" type="number" min="1" max="31" value={billingDay} onChange={(e) => setBillingDay(e.target.value)} required />
                        </div>
                        <Button type="submit" disabled={loading} className="gap-2">
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                            Add
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {isLoading ? (
                    <div className="h-20 w-full animate-pulse bg-muted rounded-lg" />
                ) : subscriptions.length > 0 ? (
                    subscriptions.map((sub) => (
                        <Card key={sub.id} className="border-border bg-card/50 hover:bg-card transition-colors">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                        <Calendar className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm">{sub.name}</p>
                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                            <CreditCard className="h-3 w-3" />
                                            Day {sub.billing_day} of month
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <p className="font-bold text-sm">{formatCurrency(sub.amount)}</p>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                        onClick={() => handleDelete(sub.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <p className="text-sm text-muted-foreground italic col-span-2 text-center py-8 border border-dashed rounded-lg">
                        No recurring bills added yet.
                    </p>
                )}
            </div>
        </div>
    );
};

export default SubscriptionManager;
