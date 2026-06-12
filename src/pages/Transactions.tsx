import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TransactionTable } from "@/components/TransactionTable";
import { AddExpenseForm } from "@/components/AddExpenseForm";
import { toast } from "sonner";
import { Transaction, Category } from "@/lib/data";
import { DateRangeFilter, DateRange } from "@/components/DateRangeFilter";
import { subDays, startOfMonth, isAfter, parseISO, format } from "date-fns";
import { Plus, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MotionWrapper } from "@/components/MotionWrapper";
import { SpendingTrendsChart } from "@/components/SpendingTrendsChart";

const Transactions = () => {
  const [dateRange, setDateRange] = useState<DateRange>("all");
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();


  const handleDelete = async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("transactions").delete().eq("id", id).eq("user_id", user.id);
      if (error) throw error;
      toast.success("Transaction deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const { data: transactions = [] } = useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false });

      if (error) throw error;
      return (data || []).map((t: any) => ({
        id: t.id,
        date: t.date,
        merchant: t.merchant,
        category: t.category as Category,
        amount: Number(t.amount),
      })) as Transaction[];
    },
  });

  const filteredTransactions = useMemo(() => {
    let filtered = transactions;
    const now = new Date();
    if (dateRange === "7d") {
      const sevenDaysAgo = subDays(now, 7);
      filtered = filtered.filter(t => isAfter(parseISO(t.date), sevenDaysAgo));
    } else if (dateRange === "1m") {
      const monthStart = startOfMonth(now);
      filtered = filtered.filter(t => isAfter(parseISO(t.date), monthStart));
    }
    return filtered;
  }, [transactions, dateRange]);

  const spendingTrendData = useMemo(() => {
    const dailyData: Record<string, number> = {};
    const sorted = [...(filteredTransactions || [])].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    sorted.forEach(t => {
      const date = format(parseISO(t.date), "MMM dd");
      if (t.type === 'expense' || !t.type) {
        dailyData[date] = (dailyData[date] || 0) + Math.abs(t.amount);
      }
    });
    return Object.entries(dailyData).map(([date, amount]) => ({ x: date, y: amount }));
  }, [filteredTransactions]);

  const handleExport = () => {
    const headers = ["Date", "Merchant", "Category", "Amount", "Type"];
    const csvContent = [
      headers.join(","),
      ...(filteredTransactions || []).map(t => [
        t.date,
        `"${t.merchant}"`, 
        t.category,
        t.amount,
        "Expense"
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `transactions_export_${format(new Date(), "yyyy-MM-dd")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Transactions exported!");
  };

  return (
    <div className="space-y-6">
      <MotionWrapper delay={0.05}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Transactions</h1>
            <p className="text-muted-foreground mt-1 text-sm">View and manage all your transactions</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <DateRangeFilter
              selectedRange={dateRange}
              onRangeChange={setDateRange}
            />
            <Dialog open={isAddExpenseOpen} onOpenChange={setIsAddExpenseOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Expense
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add New Expense</DialogTitle></DialogHeader>
                <AddExpenseForm onSuccess={() => setIsAddExpenseOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </MotionWrapper>

      <MotionWrapper delay={0.1}>
        <SpendingTrendsChart
          data={spendingTrendData.map(d => ({ date: d.x, amount: d.y }))}
          className="shadow-elevation-2"
        />
      </MotionWrapper>

      <MotionWrapper delay={0.15}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold gemini-text-gradient">Full Transaction History</h3>
          <Button variant="link" onClick={() => navigate("/transactions")}>View Full History</Button>
        </div>
        <TransactionTable transactions={filteredTransactions} onDelete={handleDelete} onEdit={setEditingTransaction} />
      </MotionWrapper>

      <Dialog open={!!editingTransaction} onOpenChange={(open) => !open && setEditingTransaction(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Transaction</DialogTitle></DialogHeader>
          {editingTransaction && <AddExpenseForm initialData={editingTransaction} onSuccess={() => setEditingTransaction(null)} />}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Transactions;
