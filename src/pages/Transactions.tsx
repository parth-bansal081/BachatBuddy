import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TransactionTable } from "@/components/TransactionTable";
import { AddExpenseForm } from "@/components/AddExpenseForm";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { Transaction, Category } from "@/lib/data";
import { DateRangeFilter, DateRange } from "@/components/DateRangeFilter";
import { subDays, startOfMonth, isAfter, parseISO } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Transactions = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState<DateRange>("all");
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const queryClient = useQueryClient();

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

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch =
      t.merchant.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesDate = true;
    const now = new Date();
    if (dateRange === "7d") {
      const sevenDaysAgo = subDays(now, 7);
      matchesDate = isAfter(parseISO(t.date), sevenDaysAgo);
    } else if (dateRange === "1m") {
      const monthStart = startOfMonth(now);
      matchesDate = isAfter(parseISO(t.date), monthStart);
    }

    return matchesSearch && matchesDate;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="animate-fade-in flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Transactions</h1>
          <p className="text-muted-foreground mt-1">View and manage all your transactions</p>
        </div>
        <DateRangeFilter
          selectedRange={dateRange}
          onRangeChange={setDateRange}
        />
      </div>

      {/* Search */}
      <div className="relative animate-slide-up" style={{ animationDelay: "100ms" }}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by merchant or category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 max-w-md"
        />
      </div>

      {/* Table */}
      <div className="animate-slide-up" style={{ animationDelay: "200ms" }}>
        <TransactionTable
          transactions={filteredTransactions}
          showAll
          onDelete={handleDelete}
          onEdit={setEditingTransaction}
        />
      </div>

      <Dialog open={!!editingTransaction} onOpenChange={(open) => !open && setEditingTransaction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
          </DialogHeader>
          {editingTransaction && (
            <AddExpenseForm
              initialData={editingTransaction}
              onSuccess={() => setEditingTransaction(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Transactions;
