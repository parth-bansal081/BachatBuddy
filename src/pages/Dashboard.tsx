import { useState, useMemo, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Wallet, TrendingDown, PiggyBank, Plus, Download, ArrowRight } from "lucide-react";
import { SummaryCard } from "@/components/SummaryCard";
import { BudgetProgress } from "@/components/BudgetProgress";
import { TransactionTable } from "@/components/TransactionTable";
import { SpendingTrendsChart } from "@/components/SpendingTrendsChart";
import { AIInsightsPanel } from "@/components/AIInsightsPanel";
import { ProjectedSpendingChart } from "@/components/ProjectedSpendingChart";
import { AIChatbot } from "@/components/AIChatbot";
import { AddExpenseForm } from "@/components/AddExpenseForm";
import { BudgetAccuracyChart } from "@/components/BudgetAccuracyChart";
import { BudgetBurnRate } from "@/components/BudgetBurnRate";
import { AccountSwitcher } from "@/components/AccountSwitcher";
import { DateRangeFilter, DateRange } from "@/components/DateRangeFilter";
import { SavingsGoalProgress } from "@/components/SavingsGoalProgress";
import { RecurringBills } from "@/components/RecurringBills";
import { BudgetGoal, Transaction, Category } from "@/lib/data";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { SmartInsightCard } from "@/components/SmartInsightCard";
import { SafeToSpendCard } from "@/components/SafeToSpendCard";
import { RecentTransactionsList } from "@/components/RecentTransactionsList";
import { BudgetVarianceChart } from "@/components/BudgetVarianceChart";
import { EmptyDashboard } from "@/components/EmptyDashboard";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { subDays, startOfMonth, isAfter, parseISO, format, isSameMonth } from "date-fns";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { GeminiSparkle } from "@/components/ui/GeminiSparkle";
import { Card, CardContent } from "@/components/ui/card";
import { MotionWrapper } from "@/components/MotionWrapper";
import { useThreeTheme } from "@/hooks/useThreeTheme";


const Dashboard = () => {
  const { chartColors: CHART_COLORS } = useThreeTheme();
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>("all");
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    const triggerSync = async (consentId: string) => {
      sessionStorage.setItem('setu_sync_done', 'true');
      window.history.replaceState({}, '', '/dashboard');
      const toastId = toast.loading("Syncing your financial data...");
      try {
        const { error } = await supabase.functions.invoke('sync-bank-data', {
          body: { mode: 'FETCH_DATA', consentId }
        });
        if (error) throw error;
        toast.success("Financial data synced!", { id: toastId });
        queryClient.invalidateQueries({ queryKey: ["transactions"] });
        queryClient.invalidateQueries({ queryKey: ["accounts"] });
        queryClient.invalidateQueries({ queryKey: ["category-budgets"] });
      } catch (err: any) {
        console.error("Sync error:", err);
        toast.error("Sync failed: " + (err.message || 'Unknown error'), { id: toastId });
        sessionStorage.removeItem('setu_sync_done');
      }
    };

    const handleSetuCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const urlConsentId = params.get('id') || params.get('consentId');
      const success = params.get('success');

      if (urlConsentId && success === 'true') {
        sessionStorage.removeItem('setu_sync_done');
        await triggerSync(urlConsentId);
      }
    };
    handleSetuCallback();
  }, [queryClient]);

  const handleDelete = async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Authentication required");

      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;
      toast.success("Transaction deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const { data: profile, isLoading: isLoadingProfile } = useQuery<any>({
    queryKey: ["user-profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { currency: "₹", monthly_income: 0, monthly_savings_target: 0, full_name: "", has_onboarded: false };
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (error) return { currency: "₹", monthly_income: 0, monthly_savings_target: 0, full_name: "", has_onboarded: false };
      return data || { currency: "₹", monthly_income: 0, monthly_savings_target: 0, full_name: "", has_onboarded: false };
    },
    staleTime: 0,
  });

  const currencySymbol = (profile as any)?.currency || "₹";
  const currencyMap: Record<string, string> = {
    "₹": "INR",
    "$": "USD",
    "€": "EUR",
    "INR": "INR",
    "USD": "USD",
    "EUR": "EUR",
  };
  const currencyCode = currencyMap[currencySymbol] || "INR";

  const income = (profile as any)?.monthly_income || 0;
  const savingsTarget = Number((profile as any)?.monthly_savings_target) || 0;

  const { data: categoryBudgets = [] } = useQuery({
    queryKey: ["category-budgets"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase
        .from("budget_expectations")
        .select("*")
        .eq("user_id", user.id);
      if (error) return [];
      return (data || []).map((b: any) => ({
        category: b.category,
        expected_amount: Number(b.expected_amount || 0),
        budget: Number(b.expected_amount || 0),
      }));
    },
    staleTime: 0,
  });

  const { data: allTransactions = [], isLoading: isLoadingTransactions, error: transactionsError } = useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false });
      if (error) return [];
      return (data || []).map((t: any) => ({
        id: t.id,
        date: t.date,
        merchant: t.merchant,
        category: t.category as Category,
        amount: Number(t.amount),
        type: Number(t.amount) >= 0 ? "income" : "expense",
        account_id: t.account_id,
      })) as Transaction[];
    },
    staleTime: 0,
  });

  const { data: bills = [], isLoading: isLoadingBills } = useQuery({
    queryKey: ["recurring_bills"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase
        .from("recurring_bills")
        .select("*")
        .eq("user_id", user.id)
        .order("billing_day", { ascending: true });
      if (error) return [];
      return data || [];
    },
    staleTime: 0,
  });

  const unpaidBillsTotal = useMemo(() => {
    return (bills || [])
      .filter((b: any) => {
        if (!b?.last_paid_at) return true;
        return !isSameMonth(parseISO(b.last_paid_at), new Date());
      })
      .reduce((sum, b: any) => sum + Number(b?.amount || 0), 0);
  }, [bills]);

  const filteredTransactions = useMemo(() => {
    let filtered = allTransactions;
    if (selectedAccountId) filtered = filtered.filter(t => t.account_id === selectedAccountId);
    const now = new Date();
    if (dateRange === "7d") {
      const sevenDaysAgo = subDays(now, 7);
      filtered = filtered.filter(t => isAfter(parseISO(t.date), sevenDaysAgo));
    } else if (dateRange === "1m") {
      const monthStart = startOfMonth(now);
      filtered = filtered.filter(t => isAfter(parseISO(t.date), monthStart));
    }
    return filtered;
  }, [allTransactions, selectedAccountId, dateRange]);

  const totalExpenses = (filteredTransactions || [])
    .filter(t => t.type === 'expense' || !t.type)
    .reduce((sum, t) => sum + Math.abs(t?.amount || 0), 0);

  const spendingBudget = Math.max(0, income - savingsTarget);
  const remainingBalance = income - totalExpenses;

  const categorySpent = useMemo(() => {
    if (!filteredTransactions) return {};
    return filteredTransactions.reduce((acc, t) => {
      let category = t?.category || "Others";
      const remark = (t.merchant || "").toLowerCase();
      if (category === "Lifestyle" || category === "Others") {
        if (remark.includes("ft/cr") || remark.includes("salary")) category = "Income";
        else if (remark.includes("zomato") || remark.includes("swiggy") || remark.includes("eat")) category = "Food & Dining";
        else if (remark.includes("netflix") || remark.includes("spotify") || remark.includes("hotstar")) category = "Entertainment";
        else if (remark.includes("amazon") || remark.includes("flipkart")) category = "Shopping";
        else if (remark.includes("uber") || remark.includes("ola") || remark.includes("petrol")) category = "Transport";
        else if (remark.includes("bill") || remark.includes("recharge")) category = "Bills";
        else if (remark.includes("rent")) category = "Rent";
      }
      acc[category] = (acc[category] || 0) + Math.abs(t?.amount || 0);
      return acc;
    }, {} as Record<string, number>);
  }, [filteredTransactions]);

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
    return Object.entries(dailyData).map(([date, amount]) => ({ date, amount }));
  }, [filteredTransactions]);

  const allCategoryKeys = Array.from(new Set([
    ...(categoryBudgets || []).map((b: any) => b.category),
    ...Object.keys(categorySpent || {})
  ]));

  const currentBudgets: BudgetGoal[] = (allCategoryKeys || []).map(cat => {
    const budgetObj = categoryBudgets.find((b: any) => b.category === cat);
    let limit = budgetObj ? (Number((budgetObj as any).expected_amount || 0) || Number((budgetObj as any).budget || 0)) : 0;
    if (!budgetObj && income > 0) {
      limit = Math.round(income / 5);
    }
    if (limit === 0 && income === 0) limit = 1;
    return {
      category: cat as Category,
      budget: limit,
      spent: categorySpent[cat] || 0,
    };
  }).filter(item => item.budget > 0 || item.spent > 0)
    .sort((a, b) => b.spent - a.spent);

  const handleBudgetChange = async (category: string, newBudget: number) => {
    console.log("Budget update logic here");
  };

  const isLoading = isLoadingTransactions || isLoadingBills || isLoadingProfile;

  const spendingData = useMemo(() => {
    const allCategories = Array.from(new Set([
      ...Object.keys(categorySpent || {}),
      ...(categoryBudgets || []).map((b: any) => b.category)
    ]));
    return (allCategories || []).map(cat => {
      const budgetObj = categoryBudgets.find((b: any) => b.category === cat);
      let limit = Number((budgetObj as any)?.expected_amount || 0) || Number((budgetObj as any)?.budget || 0) || 0;
      if (limit === 0 && income > 0) {
        limit = Math.round(income / 5);
      }
      return {
        category: cat,
        actual: categorySpent[cat] || 0,
        budget: limit
      };
    }).filter(d => d.actual > 0 || d.budget > 0);
  }, [categorySpent, categoryBudgets, income]);

  const varianceData = useMemo(() => {
    return (spendingData || []).map(d => ({
      category: d.category,
      actual: d.actual,
      expected: d.budget
    }));
  }, [spendingData]);

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

  if (isLoading || isLoadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-[500px] bg-background">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
            <TrendingDown className="h-8 w-8 text-primary animate-spin-slow" />
          </div>
          <p className="text-muted-foreground font-semibold text-lg">Syncing your Vault...</p>
        </div>
      </div>
    );
  }

  if (!isLoading && !isLoadingProfile && allTransactions.length === 0) {
    return <EmptyDashboard />;
  }

  return (
    <div className="space-y-6">
      <MotionWrapper delay={0.05}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold gemini-text-gradient">Dashboard</h1>
              <GeminiSparkle className="w-6 h-6" />
            </div>
            <p className="text-muted-foreground mt-1 text-sm">Track your financial health at a glance</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <AccountSwitcher
              selectedAccountId={selectedAccountId || "all"}
              onAccountChange={(val) => setSelectedAccountId(val === "all" ? null : val)}
            />
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
        <SmartInsightCard transactions={allTransactions} currencySymbol={currencySymbol} />
      </MotionWrapper>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl bg-card/50" />
          ))
        ) : (
          <>
            <MotionWrapper delay={0.15} className="flex flex-col h-full">
              {income === 0 ? (
                <Card className="card-glass h-full flex flex-col justify-center items-center p-6 gap-2">
                  <p className="text-muted-foreground font-medium text-sm">Profile Incomplete</p>
                  <Button size="sm" onClick={() => navigate('/onboarding')} className="shadow-elevation-1">
                    Complete Profile
                  </Button>
                </Card>
              ) : (
                <SummaryCard title="Monthly Income" value={income} icon={<Wallet />} variant="primary" currencyCode={currencyCode} className="h-full" />
              )}
            </MotionWrapper>

            <MotionWrapper delay={0.2} className="flex flex-col h-full">
              <SummaryCard title="Total Expenses" value={totalExpenses} icon={<TrendingDown />} variant="warning" currencyCode={currencyCode} className="h-full" />
            </MotionWrapper>

            <MotionWrapper delay={0.25} className="flex flex-col h-full">
              <SafeToSpendCard
                income={income}
                savingsTarget={savingsTarget}
                totalSpent={totalExpenses}
                currencyCode={currencyCode}
                className="h-full"
              />
            </MotionWrapper>

            <MotionWrapper delay={0.3} className="flex flex-col h-full">
              <SavingsGoalProgress income={income} totalSpent={totalExpenses} savingsTarget={savingsTarget} currencyCode={currencyCode} currencySymbol={currencySymbol} className="h-full" />
            </MotionWrapper>
          </>
        )}
      </div>

      <MotionWrapper delay={0.35}>
        <AIInsightsPanel
          budgets={currentBudgets}
          transactions={filteredTransactions}
          income={income}
          savingsTarget={savingsTarget}
          currencyCode={currencyCode}
          currencySymbol={currencySymbol}
        />
      </MotionWrapper>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <MotionWrapper delay={0.4}>
            <SpendingTrendsChart
              data={spendingTrendData}
              currencySymbol={currencySymbol}
              className="shadow-elevation-2"
            />
          </MotionWrapper>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <MotionWrapper delay={0.45}>
              <BudgetVarianceChart data={varianceData} currencyCode={currencyCode} className="card-glass rounded-xl shadow-elevation-2" />
            </MotionWrapper>

            <MotionWrapper delay={0.5}>
              <ProjectedSpendingChart budgets={currentBudgets} income={spendingBudget} currencySymbol={currencySymbol} className="card-glass rounded-xl shadow-elevation-2" />
            </MotionWrapper>
          </div>
        </div>
        <div className="space-y-6">
          <MotionWrapper delay={0.45}>
            <Card className="card-glass rounded-xl shadow-elevation-2">
              <CardContent className="p-5">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-foreground">Recent Transactions</h3>
                  <Button variant="ghost" size="sm" onClick={() => navigate("/transactions")} className="gap-1 text-muted-foreground hover:text-primary">
                    View All <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
                <RecentTransactionsList transactions={filteredTransactions} currencyCode={currencyCode} />
              </CardContent>
            </Card>
          </MotionWrapper>

          <MotionWrapper delay={0.55}>
            <RecurringBills currencyCode={currencyCode} className="card-glass rounded-xl shadow-elevation-2" />
          </MotionWrapper>

          <MotionWrapper delay={0.6}>
            <BudgetProgress budgets={currentBudgets} onBudgetChange={handleBudgetChange} currencyCode={currencyCode} className="card-glass rounded-xl shadow-elevation-2" />
          </MotionWrapper>
        </div>
      </div>

      {/* Budget Insights/Diagnostics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MotionWrapper delay={0.65}>
          <BudgetAccuracyChart
            totalBudget={spendingBudget}
            totalSpent={totalExpenses}
            budgets={currentBudgets}
          />
        </MotionWrapper>
        <MotionWrapper delay={0.7}>
          <BudgetBurnRate
            totalBudget={spendingBudget}
            totalSpent={totalExpenses}
          />
        </MotionWrapper>
      </div>

      {/* Table Section */}
      <MotionWrapper delay={0.75}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold gemini-text-gradient">All Transactions</h3>
          <Button variant="link" onClick={() => navigate("/transactions")}>View Full History</Button>
        </div>
        <TransactionTable transactions={filteredTransactions} onDelete={handleDelete} onEdit={setEditingTransaction} currencyCode={currencyCode} />
      </MotionWrapper>

      {!isLoading && (
        <AIChatbot
          budgets={currentBudgets}
          transactions={filteredTransactions}
          income={income}
          totalExpenses={totalExpenses}
          remainingBalance={remainingBalance}
          currencySymbol={currencySymbol}
          savingsTarget={savingsTarget}
        />
      )}

      <Dialog open={!!editingTransaction} onOpenChange={(open) => !open && setEditingTransaction(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Transaction</DialogTitle></DialogHeader>
          {editingTransaction && <AddExpenseForm initialData={editingTransaction} onSuccess={() => setEditingTransaction(null)} />}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const DashboardWithErrorBoundary = () => (
  <ErrorBoundary>
    <Dashboard />
  </ErrorBoundary>
);

export default DashboardWithErrorBoundary;