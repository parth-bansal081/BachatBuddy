import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Building2, Plus, Loader2, Wallet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CategoryPieChart } from "@/components/charts/CategoryPieChart";
import { BudgetMatchGauge } from "@/components/charts/BudgetMatchGauge";
import { BankSyncButton } from "@/components/shared/BankSyncButton";
import { defaultBudgets, Transaction } from "@/lib/data";
import { useNavigate } from "react-router-dom";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { toast } from "sonner";

// Simple bank color mapping
const getBankColor = (name: string) => {
  const nameLower = (name || "").toLowerCase();

  if (nameLower.includes("sbi")) return "#003399"; // Official SBI Blue
  if (nameLower.includes("hdfc")) return "#800000"; // Maroon
  if (nameLower.includes("icici")) return "#f58220"; // Orange
  if (nameLower.includes("axis")) return "#ae285d"; // Purple
  if (nameLower.includes("kotak")) return "#ed1c24"; // Red

  return "#94a3b8"; // Default gray
};

const AccountsContent = () => {
  const [budgets] = useState(defaultBudgets);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    const checkSyncStatus = async () => {
      const isPending = localStorage.getItem('bank_link_pending');

      if (isPending) {
        localStorage.removeItem('bank_link_pending');
        const toastId = toast.loading("Syncing linked bank accounts...");

        try {
          // Invoke the sync function
          const { error } = await supabase.functions.invoke('sync-bank-data');
          if (error) throw error;

          toast.success("Accounts synced successfully!", { id: toastId });

          // Refresh accounts list
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

  // Fetch accounts with proper initialization
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

        // Always return an array
        return Array.isArray(data) ? data : [];
      } catch (err) {
        console.error("Error fetching accounts:", err);
        return []; // Return empty array on error
      }
    },
  });

  // Fetch transactions for the chart
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

  // Loading state
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

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md border-destructive/50">
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

  // Empty state - check before any array operations
  if (!accounts || accounts.length === 0) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="animate-fade-in">
          <h1 className="text-2xl font-bold text-foreground">Accounts</h1>
          <p className="text-muted-foreground mt-1">Manage your connected bank accounts</p>
        </div>

        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-red-500 to-green-500 rounded-xl opacity-75 blur-md group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
          <Card className="relative border-0 bg-black/60 backdrop-blur-xl">
            <CardContent className="flex flex-col items-center justify-center py-20 px-6 text-center">
              <div className="p-6 rounded-full bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 mb-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                <Building2 className="h-16 w-16 text-blue-400 drop-shadow-[0_0_15px_rgba(66,133,244,0.5)]" />
              </div>
              <h3 className="text-3xl font-bold mb-3 bg-gradient-to-r from-blue-400 via-red-400 to-yellow-400 bg-clip-text text-transparent">
                Welcome to Gemini Finance
              </h3>
              <p className="text-muted-foreground mb-8 max-w-md text-lg">
                Experience the next generation of financial tracking. <br />
                Link your bank to magically sync your transactions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                <BankSyncButton className="w-full sm:w-auto px-8 py-6 text-lg font-semibold shadow-[0_0_20px_rgba(66,133,244,0.3)] hover:shadow-[0_0_30px_rgba(66,133,244,0.5)] transition-all duration-500 bg-gradient-to-r from-blue-600 to-indigo-600 border-0" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Main content - only renders if accounts exist
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold text-foreground">Accounts</h1>
        <p className="text-muted-foreground mt-1">Manage your connected bank accounts and view spending analytics</p>
      </div>

      {/* Connected Accounts */}
      <div className="animate-slide-up" style={{ animationDelay: "100ms" }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">
            Connected Accounts ({accounts.length})
          </h2>
          <div className="flex gap-2">
            <BankSyncButton size="sm" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(accounts || []).map((account) => {
            const bankColor = getBankColor(account?.account_name || "");

            return (
              <Card key={account?.id || Math.random()} className="hover:border-primary/50 transition-colors group">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {/* Simple Wallet icon with bank color */}
                      <div
                        className="rounded-xl flex items-center justify-center p-2 transition-all duration-300"
                        style={{
                          backgroundColor: `${bankColor}15`,
                          border: `2px solid ${bankColor}30`,
                        }}
                      >
                        <Wallet className="h-8 w-8" style={{ color: bankColor }} />
                      </div>

                      <div>
                        <p className="font-medium text-foreground text-sm">
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
                  </div>

                  <div className="mt-4">
                    <p className="text-xs text-muted-foreground">
                      Added: {account?.created_at
                        ? new Date(account.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric"
                        })
                        : "Unknown"
                      }
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slide-up" style={{ animationDelay: "200ms" }}>
        <CategoryPieChart transactions={transactions} />
        <BudgetMatchGauge budgets={budgets} />
      </div>
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
