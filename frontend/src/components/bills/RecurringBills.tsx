import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Receipt, Plus, CheckCircle2, Calendar, Loader2 } from "lucide-react";
import { formatCurrency, Category } from "@/lib/data";
import { format, isSameMonth, parseISO } from "date-fns";

export function RecurringBills({ currencyCode }: { currencyCode?: string }) {
    const [isAddBillOpen, setIsAddBillOpen] = useState(false);
    const [name, setName] = useState("");
    const [amount, setAmount] = useState("");
    const [billingDay, setBillingDay] = useState("");
    const [category, setCategory] = useState<Category>("Others");
    const [loading, setLoading] = useState(false);
    const queryClient = useQueryClient();

    const { data: bills = [], isLoading } = useQuery({
        queryKey: ["recurring_bills"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("recurring_bills")
                .select("*")
                .order("billing_day", { ascending: true });
            if (error) throw error;
            return data || [];
        },
    });

    const handleAddBill = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("No user found");

            const { error } = await supabase.from("recurring_bills").insert({
                user_id: user.id,
                name,
                bill_name: name, // Redundant save to satisfy schema
                amount: Number(amount),
                billing_day: Number(billingDay),
                category,
            });

            if (error) throw error;
            toast.success("Recurring bill added!");
            setIsAddBillOpen(false);
            setName("");
            setAmount("");
            setBillingDay("");
            queryClient.invalidateQueries({ queryKey: ["recurring_bills"] });
        } catch (error: any) {
            console.error("Recurring Bill Insert Error:", error);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsPaid = async (bill: any) => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("No user found");

            // 1. Create Transaction
            const { error: tError } = await supabase.from("transactions").insert({
                user_id: user.id,
                merchant: bill.name,
                amount: bill.amount,
                category: bill.category,
                date: new Date().toISOString().split("T")[0],
            });
            if (tError) throw tError;

            // 2. Update last_paid_at
            const { error: bError } = await supabase
                .from("recurring_bills")
                .update({ last_paid_at: new Date().toISOString() })
                .eq("id", bill.id);
            if (bError) throw bError;

            toast.success(`${bill.name} marked as paid!`);
            queryClient.invalidateQueries({ queryKey: ["recurring_bills"] });
            queryClient.invalidateQueries({ queryKey: ["transactions"] });
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const isPaidThisMonth = (lastPaidAt: string | null) => {
        if (!lastPaidAt) return false;
        return isSameMonth(parseISO(lastPaidAt), new Date());
    };

    const isDueSoon = (billingDay: number) => {
        const today = new Date();
        const currentDay = today.getDate();
        const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

        // Calculate days until due
        let daysUntilDue;
        if (billingDay >= currentDay) {
            daysUntilDue = billingDay - currentDay;
        } else {
            // Bill is in next month
            daysUntilDue = (daysInMonth - currentDay) + billingDay;
        }

        return daysUntilDue <= 3 && daysUntilDue >= 0;
    };

    return (
        <Card className="card-pop shadow-none border-0 bg-transparent">
            <CardHeader className="flex flex-row items-center justify-between pb-4 px-0">
                <CardTitle className="text-2xl font-black flex items-center gap-3">
                    <div className="bg-primary text-white p-2 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] border-2 border-black">
                        <Receipt className="h-5 w-5" />
                    </div>
                    Recurring Bills
                </CardTitle>
                <Dialog open={isAddBillOpen} onOpenChange={setIsAddBillOpen}>
                    <DialogTrigger asChild>
                        <Button className="btn-pop gap-2">
                            <Plus className="h-5 w-5" />
                            Add Bill
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-black">Add Recurring Bill</DialogTitle>
                        </DialogHeader>
                        {/* Form implementation remains the same, assuming standard inputs */}
                        <form onSubmit={handleAddBill} className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label>Bill Name</Label>
                                <Input
                                    placeholder="e.g. Netflix, Rent"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="border-2 border-slate-200 focus:border-primary focus:shadow-[2px_2px_0px_0px_var(--primary)] transition-all"
                                />
                            </div>
                            {/* ... inputs ... */}
                            {/* Keeping form logic for brevity, just updating styles if shown */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Amount</Label>
                                    <Input
                                        type="number"
                                        placeholder="0.00"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        required
                                        className="border-2 border-slate-200 focus:border-primary focus:shadow-[2px_2px_0px_0px_var(--primary)] transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Billing Day (1-31)</Label>
                                    <Input
                                        type="number"
                                        min="1"
                                        max="31"
                                        placeholder="15"
                                        value={billingDay}
                                        onChange={(e) => setBillingDay(e.target.value)}
                                        required
                                        className="border-2 border-slate-200 focus:border-primary focus:shadow-[2px_2px_0px_0px_var(--primary)] transition-all"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Category</Label>
                                <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
                                    <SelectTrigger className="border-2 border-slate-200">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                        {/* Options */}
                                        <SelectItem value="Housing">Housing</SelectItem>
                                        <SelectItem value="Food">Food</SelectItem>
                                        <SelectItem value="Transport">Transport</SelectItem>
                                        <SelectItem value="Entertainment">Entertainment</SelectItem>
                                        <SelectItem value="Shopping">Shopping</SelectItem>
                                        <SelectItem value="Health">Health</SelectItem>
                                        <SelectItem value="Others">Others</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <DialogFooter>
                                <Button type="submit" className="w-full btn-pop" disabled={loading}>
                                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                    Save Bill
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent className="px-0">
                <div className="space-y-3">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : bills.length === 0 ? (
                        <p className="text-center py-6 text-muted-foreground text-sm font-medium bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl">
                            No active subscriptions.
                        </p>
                    ) : (
                        (bills as any[]).map((bill) => {
                            const paid = isPaidThisMonth(bill.last_paid_at);
                            const urgent = !paid && isDueSoon(bill.billing_day);

                            return (
                                <div
                                    key={bill.id}
                                    className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-300 ${paid
                                        ? "bg-slate-50 border-slate-100 opacity-60"
                                        : urgent
                                            ? "bg-red-50 border-red-500 shadow-[4px_4px_0px_0px_rgba(239,68,68,0.2)]"
                                            : "bg-white border-slate-200 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_var(--primary)] hover:border-primary"
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-lg border-2 font-black text-xs ${paid
                                            ? "bg-slate-100 border-slate-200 text-slate-400"
                                            : urgent
                                                ? "bg-red-100 border-red-500 text-red-600"
                                                : "bg-teal-50 border-primary text-primary"
                                            }`}>
                                            Day {bill.billing_day}
                                        </div>
                                        <div>
                                            <p className="font-bold text-base text-slate-900 tracking-tight flex items-center gap-2">
                                                {bill.name}
                                                {urgent && (
                                                    <span className="text-[9px] font-black uppercase tracking-wider text-white bg-red-500 px-1.5 py-0.5 rounded border border-red-700">
                                                        Due Soon
                                                    </span>
                                                )}
                                            </p>
                                            <p className="text-sm font-semibold text-slate-600">
                                                {formatCurrency(bill.amount, currencyCode)}
                                            </p>
                                        </div>
                                    </div>
                                    {paid ? (
                                        <div className="flex items-center gap-1 text-xs font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
                                            <CheckCircle2 className="h-3 w-3" />
                                            PAID
                                        </div>
                                    ) : (
                                        <Button
                                            size="sm"
                                            className={`h-9 px-4 font-bold border-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] transition-all active:translate-y-0.5 active:shadow-none ${urgent
                                                ? "bg-red-500 border-red-700 text-white hover:bg-red-600"
                                                : "bg-white border-primary text-primary hover:bg-primary hover:text-white"
                                                }`}
                                            onClick={() => handleMarkAsPaid(bill)}
                                            disabled={loading}
                                        >
                                            Mark Paid
                                        </Button>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
