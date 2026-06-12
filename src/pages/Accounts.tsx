import { useState, useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Building2, Loader2, Wallet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CategoryPieChart } from "@/components/CategoryPieChart";
import { BudgetMatchGauge } from "@/components/BudgetMatchGauge";
import { BankSyncButton } from "@/components/BankSyncButton";
import { Transaction } from "@/lib/data";
import { useNavigate } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { toast } from "sonner";
import { MotionWrapper } from "@/components/MotionWrapper";

// Simple bank color mapping
const getBankColor = (name: string) => {
  const nameLower = (name || "").toLowerCase();

  if (nameLower.includes("sbi")) return "#003399";
  if (nameLower.includes("hdfc")) return "#800000";
  if (nameLower.includes("icici")) return "#f58220";
  if (nameLower.includes("axis")) return "#ae285d";
  if (nameLower.includes("kotak")) return "#ed1c24";

  return "#94a3b8";
};

const AccountsContent = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

    const { data: rawBudgets = [] } = useQuery({
      queryKey: ["category-budgets"],
      queryFn: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];
        const { data, error } = await supabase
          .from("budget_expectations")
          .select("*")
          .eq("user_id", user.id);
        if (error) { console.error("Budget fetch error:", error); return []; }
        return (data || []).map((b: any) => ({
          category: b.category,
          budget: Number(b.expected_amount || 0),
          spent: 0,
        }));
      },
    });

  useEffect(() => {
    const checkSyncStatus = async () => {
      const isPending = localStorage.getItem('bank_link_pending');

      if (isPending) {
        localStorage.removeItem('bank_link_pending');
        const toastId = toast.loading("Syncing linked bank accounts...");

        try {
          const { error } = await supabase.functions.invoke('sync-bank-data');
          if (error) throw error;

          toast.success("Accounts synced successfully!", { id: toastId });

          queryClient.invalidateQueries({ queryKey: ["accounts"] });
          queryClient.invalidateQueries({ queryKey: ["transactions"] });

        } catch (err: any) {
          console.error("Sync error:", err);
          toast.error("Failed to sync accounts. Please try again.", { id: toastId });
        }
      }
    };

    checkSyncStatus();
  }, [queryClient]);

  const { data: accounts = [], isLoading, error } = useQuery({
    queryKey: ["accounts"],
    queryFn: async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        const { data, error } = await supabase
          .from("accounts")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        return Array.isArray(data) ? data : [];
      } catch (err) {
        console.error("Error fetching accounts:", err);
        return [];
      }
    },
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false });

      if (error) throw error;
      return (data as unknown as Transaction[]) || [];
    },
  });

  const budgets = useMemo(() => {
    const spentByCategory: Record<string, number> = {};
    transactions.forEach((t: any) => {
      const amt = Number(t.amount);
      if (amt < 0) {
        const cat = t.category || "Lifestyle";
        spentByCategory[cat] = (spentByCategory[cat] || 0) + Math.abs(amt);
      }
    });
    return rawBudgets.map((b: any) => ({
      ...b,
      spent: spentByCategory[b.category] || 0,
    }));
  }, [rawBudgets, transactions]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading accounts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md card-glass shadow-elevation-2">
          <CardContent className="pt-6 text-center space-y-4">
            <p className="text-destructive">Failed to load accounts</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!accounts || accounts.length === 0) {
    return (
      <div className="space-y-6">
        <MotionWrapper delay={0.05}>
          <h1 className="text-2xl font-bold text-foreground">Accounts</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage your connected bank accounts</p>
        </MotionWrapper>

        <MotionWrapper delay={0.1}>
          <Card className="card-glass shadow-elevation-2">
            <CardContent className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="p-4 rounded-full bg-primary/10 text-primary mb-4 shadow-elevation-1">
                <Building2 className="h-12 w-12" />
              </div>
              <h3 className="text-2xl font-bold mb-2 gemini-text-gradient">
                Link Your First Bank Account
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md text-base">
                Experience the next generation of financial tracking. <br />
                Connect your bank to magically sync your transactions.
              </p>
              <BankSyncButton className="shadow-elevation-2" />
            </CardContent>
          </Card>
        </MotionWrapper>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <MotionWrapper delay={0.05}>
        <h1 className="text-2xl font-bold text-foreground">Accounts</h1>
        <p className="text-muted-foreground mt-1 text-sm">Manage your connected bank accounts and view spending analytics</p>
      </MotionWrapper>

      <MotionWrapper delay={0.1}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">
            Connected Accounts ({accounts.length})
          </h2>
          <BankSyncButton size="sm" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(accounts || []).map((account) => {
            const bankColor = getBankColor(account?.account_name || "");

            return (
              <Card key={account?.id || Math.random()} className="card-glass shadow-elevation-1 hover:shadow-elevation-2">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="rounded-xl flex items-center justify-center p-2"
                      style={{
                        backgroundColor: `${bankColor}15`,
                        border: `1px solid ${bankColor}30`,
                      }}
                    >
                      <Wallet className="h-6 w-6" style={{ color: bankColor }} />
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-base">
                        {account?.account_name || "Bank Account"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {account?.account_type || "Account"} •••• {account?.last_four || "****"}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-primary border-primary/30 bg-primary/10 text-xs">
                    Active
                  </Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </MotionWrapper>

      <MotionWrapper delay={0.2}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CategoryPieChart transactions={transactions} className="card-glass rounded-xl shadow-elevation-2" />
          <BudgetMatchGauge budgets={budgets} className="card-glass rounded-xl shadow-elevation-2" />
        </div>
      </MotionWrapper>
    </div>
  );
};

const Accounts = () => {
  return (
    <ErrorBoundary>
      <AccountsContent />
    </ErrorBoundary>
  );
};

export default Accounts;
