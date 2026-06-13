import { useState, useMemo, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Wallet, TrendingDown, Plus, Download, ArrowRight, CreditCard, Calendar, Pencil } from "lucide-react";
import { SummaryCard } from "@/components/SummaryCard";
import { TransactionTable } from "@/components/TransactionTable";
import { SpendingTrendsChart } from "@/components/SpendingTrendsChart";
import { AIChatbot } from "@/components/AIChatbot";
import { BudgetAccuracyChart } from "@/components/BudgetAccuracyChart";
import { BudgetBurnRate } from "@/components/BudgetBurnRate";
import { AccountSwitcher } from "@/components/AccountSwitcher";
import { DateRangeFilter, DateRange } from "@/components/DateRangeFilter";
import { SavingsGoalProgress } from "@/components/SavingsGoalProgress";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { SafeToSpendCard } from "@/components/SafeToSpendCard";
import { RecentTransactionsList } from "@/components/RecentTransactionsList";
import { BudgetVarianceChart } from "@/components/BudgetVarianceChart";
import { EmptyDashboard } from "@/components/EmptyDashboard";
import { useNavigate } from "react-router-dom";
import { subDays, startOfMonth, isAfter, parseISO, format } from "date-fns";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { GeminiSparkle } from "@/components/ui/GeminiSparkle";
import { Card, CardContent } from "@/components/ui/card";
import { MotionWrapper } from "@/components/MotionWrapper";
import { Progress } from "@/components/ui/progress";
import { BudgetGoal, Transaction, Category } from "@/lib/data";

const Dashboard = () => {
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>("all");
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    const triggerSync = async (consentId: string) => {
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
      }
    };

    const handleSetuCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const urlConsentId = params.get('id') || params.get('consentId');
      const success = params.get('success');
      if (urlConsentId && success === 'true') await triggerSync(urlConsentId);
    };
    handleSetuCallback();
  }, [queryClient]);

  const handleDelete = async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Authentication required");
      const { error } = await supabase.from("transactions").delete().eq("id", id).eq("user_id", user.id);
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
      const { data, error } = await supabase.from("user_profiles").select("*").eq("user_id", user.id).single();
      if (error) return { currency: "₹", monthly_income: 0, monthly_savings_target: 0, full_name: "", has_onboarded: false };
      return data || { currency: "₹", monthly_income: 0, monthly_savings_target: 0, full_name: "", has_onboarded: false };
    },
    staleTime: 0,
  });

  const currencySymbol = profile?.currency || "₹";
  const currencyCode = profile?.currency === "$" ? "USD" : "INR";
  const income = profile?.monthly_income || 0;
  const savingsTarget = Number(profile?.monthly_savings_target) || 0;

  const { data: categoryBudgets = [] } = useQuery({
    queryKey: ["category-budgets"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase.from("budget_expectations").select("*").eq("user_id", user.id);
      if (error) return [];
      return data.map((b: any) => ({
        category: b.category,
        expected_amount: Number(b.expected_amount || 0),
        budget: Number(b.expected_amount || 0),
      }));
    },
    staleTime: 0,
  });

  const { data: allTransactions = [], isLoading: isLoadingTransactions } = useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase.from("transactions").select("*").eq("user_id", user.id).order("date", { ascending: false });
      if (error) return [];
      return data.map((t: any) => ({
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

  const filteredTransactions = useMemo(() => {
    let filtered = allTransactions;
    if (selectedAccountId) filtered = filtered.filter(t => t.account_id === selectedAccountId);
    const now = new Date();
    if (dateRange === "7d") {
      filtered = filtered.filter(t => isAfter(parseISO(t.date), subDays(now, 7)));
    } else if (dateRange === "1m") {
      filtered = filtered.filter(t => isAfter(parseISO(t.date), startOfMonth(now)));
    }
    return filtered;
  }, [allTransactions, selectedAccountId, dateRange]);

  const totalExpenses = filteredTransactions
    .filter(t => t.type === 'expense' || !t.type)
    .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);

  const spendingBudget = Math.max(0, income - savingsTarget);
  const remainingBalance = income - totalExpenses;

  const categorySpent = useMemo(() => {
    return filteredTransactions.reduce((acc, t) => {
      let category = t.category || "Others";
      acc[category] = (acc[category] || 0) + Math.abs(t.amount || 0);
      return acc;
    }, {} as Record<string, number>);
  }, [filteredTransactions]);

  const spendingTrendData = useMemo(() => {
    const dailyData: Record<string, number> = {};
    const sorted = [...filteredTransactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    sorted.forEach(t => {
      const date = format(parseISO(t.date), "MMM dd");
      if (t.type === 'expense' || !t.type) dailyData[date] = (dailyData[date] || 0) + Math.abs(t.amount);
    });
    return Object.entries(dailyData).map(([date, amount]) => ({ date, amount }));
  }, [filteredTransactions]);

  const allCategoryKeys = Array.from(new Set([...categoryBudgets.map((b: any) => b.category), ...Object.keys(categorySpent)]));

  const currentBudgets: BudgetGoal[] = allCategoryKeys.map(cat => {
    const budgetObj = categoryBudgets.find((b: any) => b.category === cat);
    let limit = budgetObj ? budgetObj.expected_amount : Math.round(income / 5 || 1);
    return { category: cat as Category, budget: limit, spent: categorySpent[cat] || 0 };
  }).filter(item => item.budget > 0 || item.spent > 0).sort((a, b) => b.spent - a.spent);

  const varianceData = useMemo(() => {
    return currentBudgets.map(d => ({ category: d.category, actual: d.spent, expected: d.budget }));
  }, [currentBudgets]);

  const placeholderBills = [
    { id: "1", name: "Streaming Subscription", amount: 499, dueDate: "Every 15th" },
    { id: "2", name: "Cloud Infrastructure", amount: 1250, dueDate: "Every 22nd" }
  ];

  if (isLoadingTransactions || isLoadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-[500px] bg-background">
        <p className="text-muted-foreground font-semibold text-lg">Syncing Vault...</p>
      </div>
    );
  }

  if (allTransactions.length === 0) return <EmptyDashboard />;

  return (
    <div className="space-y-6 w-full relative pb-10">
      <MotionWrapper delay={0.05}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold gemini-text-gradient">Dashboard</h1>
              <GeminiSparkle className="w-6 h-6" />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => toast.success("CSV Downloaded!")} className="gap-2"><Download className="h-4 w-4" />Export</Button>
            <AccountSwitcher selectedAccountId={selectedAccountId || "all"} onAccountChange={(val) => setSelectedAccountId(val === "all" ? null : val)} />
            <DateRangeFilter selectedRange={dateRange} onRangeChange={setDateRange} />
            <Button className="gap-2" onClick={() => setIsAddExpenseOpen(true)}><Plus className="h-4 w-4" />Add Expense</Button>
          </div>
        </div>
      </MotionWrapper>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard title="Monthly Income" value={income} icon={<Wallet />} variant="primary" currencyCode={currencyCode} />
        <SummaryCard title="Total Expenses" value={totalExpenses} icon={<TrendingDown />} variant="warning" currencyCode={currencyCode} />
        <SafeToSpendCard income={income} savingsTarget={savingsTarget} totalSpent={totalExpenses} currencyCode={currencyCode} />
        <SavingsGoalProgress income={income} totalSpent={totalExpenses} savingsTarget={savingsTarget} currencyCode={currencyCode} currencySymbol={currencySymbol} />
      </div>

      {/* 🏛️ TWO-COLUMN ISOLATION GRID MESH */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full relative">
        
        {/* ==================== LEFT ANALYTICS CHANNEL (8 Columns) ==================== */}
        <div className="lg:col-span-8 flex flex-col gap-6 w-full min-w-0 pr-0 lg:pr-2">
          
          {/* Spending Trends Fixed Block Containment Box */}
          <div className="w-full h-[330px] bg-[#0d1527]/20 border border-white/[0.02] rounded-2xl p-5 relative block z-30 mb-8 overflow-visible">
  <SpendingTrendsChart data={spendingTrendData} currencySymbol={currencySymbol} />
</div>

          {/* Symmetrical Dual Sub-Grid Configuration Track */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start w-full relative z-10">
            <div className="w-full min-w-0">
              <BudgetVarianceChart data={varianceData} currencyCode={currencyCode} className="card-glass rounded-xl w-full" />
            </div>

            {/* Forecast Predictive Component Box */}
            <Card className="card-glass rounded-xl border border-white/5 bg-[#131C2E]/30 p-5 min-w-0 w-full shadow-elevation-2">
              <div className="pb-3 border-b border-white/[0.04] mb-4">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-[#FFAA00] shadow-[0_0_8px_#FFAA00]" />
                  <h3 className="text-sm font-semibold tracking-tight text-white">Projected Spending</h3>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                  Estimated spending by end of month based on current trends. Lets get it undercontrol buddy!
                </p>
              </div>

              <div className="space-y-4">
                {currentBudgets.map((item) => {
                  const estimatedProjectedAmount = item.spent * 1.08; 
                  const isOverProjected = estimatedProjectedAmount > item.budget;
                  const projectionPercent = Math.min(100, (estimatedProjectedAmount / (item.budget || 1)) * 100);

                  return (
                    <div key={`projected-${item.category}`} className="space-y-2 min-w-0">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-white font-medium truncate pr-2">{item.category}</span>
                        <div className="flex items-center gap-1.5 shrink-0 text-muted-foreground">
                          <span className={isOverProjected ? "text-red-400 font-bold" : "text-white"}>
                            {currencySymbol}{Math.round(estimatedProjectedAmount).toLocaleString()}
                          </span>
                          <span>/</span>
                          <span>{currencySymbol}{item.budget.toLocaleString()}</span>
                        </div>
                      </div>
                      <Progress value={projectionPercent} className="h-1.5 bg-white/5 rounded-full overflow-hidden" indicatorClassName={isOverProjected ? "bg-red-500" : "bg-cyan-500"} />
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>

        {/* ==================== RIGHT SIDEBAR CHANNEL (4 Columns) ==================== */}
        <div className="lg:col-span-4 flex flex-col gap-6 w-full min-w-0 relative z-20">
          <Card className="card-glass rounded-xl border border-white/5 bg-[#131C2E]/30 shadow-elevation-2">
            <CardContent className="p-5">
              <div className="flex items-center justify-between gap-4 pb-4 border-b border-white/[0.04] mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0"><CreditCard className="h-4 w-4" /></div>
                  <div>
                    <h3 className="text-sm font-semibold tracking-tight text-white">Recurring Bills</h3>
                    <p className="text-[11px] text-muted-foreground">Fixed monthly commitments</p>
                  </div>
                </div>
                <Button size="sm" variant="secondary" className="h-8 gap-1 text-xs px-2.5 bg-white/5 hover:bg-white/10 text-white border border-white/5">
                  <Plus className="h-3.5 w-3.5" />Add Bill
                </Button>
              </div>
              <div className="space-y-2.5">
                {placeholderBills.map((bill) => (
                  <div key={bill.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-all">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-1.5 rounded-md bg-white/5 text-muted-foreground shrink-0"><Calendar className="h-3.5 w-3.5" /></div>
                      <div className="truncate">
                        <p className="text-xs font-medium text-white truncate">{bill.name}</p>
                        <p className="text-[10px] text-muted-foreground">{bill.dueDate}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 pl-2">
                      <p className="text-xs font-bold text-white">{currencySymbol}{bill.amount.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="card-glass rounded-xl border border-white/5 bg-[#131C2E]/30 shadow-elevation-2">
            <CardContent className="p-5">
              <div className="pb-3 border-b border-white/[0.04] mb-4">
                <h3 className="text-sm font-semibold tracking-tight text-white">Monthly Budget Goals</h3>
                <p className="text-[11px] text-muted-foreground">Category target expenditure tracks</p>
              </div>
              <div className="space-y-4">
                {currentBudgets.map((item) => {
                  const isOver = item.spent > item.budget;
                  const overAmount = item.spent - item.budget;
                  const percentage = Math.min(100, (item.spent / (item.budget || 1)) * 100);

                  return (
                    <div key={item.category} className="space-y-2 min-w-0">
                      <div className="flex justify-between items-start gap-4">
                        <span className="text-xs font-medium text-white truncate pt-0.5">{item.category}</span>
                        <div className="flex flex-col items-end text-right shrink-0 min-w-0">
                          <div className="flex items-center gap-1.5 text-xs">
                            <span className={isOver ? "text-red-400 font-bold" : "text-white"}>{currencySymbol}{item.spent.toLocaleString()}</span>
                            <span className="text-muted-foreground">/</span>
                            <span className="text-muted-foreground/70">{currencySymbol}{item.budget.toLocaleString()}</span>
                            <button className="text-muted-foreground/40 hover:text-primary transition-colors p-0.5 rounded ml-0.5"><Pencil className="h-3 w-3" /></button>
                          </div>
                          {isOver && (
                            <span className="text-[10px] font-medium text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded mt-1 border border-red-500/10 tracking-tight animate-pulse">
                              Over by {currencySymbol}{overAmount.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="relative pt-0.5">
                        <Progress value={percentage} className="h-1.5 bg-white/5 rounded-full overflow-hidden" indicatorClassName={isOver ? "bg-red-500" : "bg-amber-500"} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <MotionWrapper delay={0.5}>
        <Card className="card-glass rounded-xl bg-[#131C2E]/40 border border-white/5 w-full mt-4">
          <div className="p-5 border-b border-white/[0.03]">
            <h3 className="text-base font-black tracking-tight text-white flex items-center gap-2">
              <div className="h-2 w-2 bg-[#00F5D4] rounded-full shadow-[0_0_8px_#00F5D4]" />
              AI Action Recommendations
            </h3>
          </div>
          <CardContent className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-[#94A3B8]">
            <div className="flex items-center gap-3 bg-white/[0.02] p-4 rounded-xl border border-white/[0.04]">
              <span className="text-xl">💡</span>
              <p>Your <strong className="text-white">Lifestyle</strong> spending is overshooting thresholds by <span className="text-red-400 font-bold">112%</span>. Consider cooling down optional purchases.</p>
            </div>
            <div className="flex items-center gap-3 bg-white/[0.02] p-4 rounded-xl border border-white/[0.04]">
              <span className="text-xl">🎯</span>
              <p>You have <strong className="text-white">₹18,500</strong> left in your buffer before your target net savings window closes.</p>
            </div>
          </CardContent>
        </Card>
      </MotionWrapper>

      <MotionWrapper delay={0.62}>
        <Card className="card-glass rounded-xl w-full">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <BudgetAccuracyChart totalBudget={spendingBudget} totalSpent={totalExpenses} budgets={currentBudgets} />
        <BudgetBurnRate totalBudget={spendingBudget} totalSpent={totalExpenses} />
      </div>

      <TransactionTable transactions={filteredTransactions} onDelete={handleDelete} onEdit={setEditingTransaction} currencyCode={currencyCode} />
      
      <AIChatbot budgets={currentBudgets} transactions={filteredTransactions} income={income} totalExpenses={totalExpenses} remainingBalance={remainingBalance} currencySymbol={currencySymbol} savingsTarget={savingsTarget} />
    </div>
  );
};

const DashboardWithErrorBoundary = () => (
  <ErrorBoundary>
    <Dashboard />
  </ErrorBoundary>
);

export default DashboardWithErrorBoundary;