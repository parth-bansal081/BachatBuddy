import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import "./i18n"; // Import i18n config
import Index from "./pages/Index";
import Accounts from "./pages/Accounts";
import Transactions from "./pages/Transactions";
import Settings from "./pages/Settings";
import BudgetPlanner from "./pages/BudgetPlanner";
import InsightsDeepDive from "@/pages/insights/DeepDive";
import LandingPage from "./pages/LandingPage";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import { Session } from "@supabase/supabase-js";
import { RequiresOnboarding } from "@/components/shared/RequiresOnboarding";

const queryClient = new QueryClient();

// PRODUCTION IDENTITY LOCKDOWN
const SITE_URL = "https://bachatbuddy-hq.vercel.app";

// --- ONE-TIME CLEANUP SCRIPT ---
const PURGE_KEY = "bachatbuddy_purge_v3";
if (!localStorage.getItem(PURGE_KEY)) {
  console.log("Purging old local storage/session data for clean slate...");
  localStorage.clear();
  localStorage.setItem(PURGE_KEY, "true");
}

// Circuit Breaker: Force Redirect if on Legacy Domain
// Circuit Breaker Removed - Compliance with Total Purge
// -------------------------------

const ProtectedRoute = ({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Session | null;
}) => {
  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

const App = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // AGGRESSIVE CLEANUP: Wipe everything on load to prevent Emerald artifacts
    console.log("Global Scrub: Clearing all local storage & session data.");
    localStorage.clear();
    sessionStorage.clear();

    // Circuit Breaker Removed - Compliance with Total Purge

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);

      if (event === "SIGNED_OUT") {
        console.log("User signed out. Clearing local storage.");
        localStorage.clear();
        setSession(null);
        return;
      }

      // STALE STATE CLEARING
      if (session?.user) {
        const storedUserId = localStorage.getItem("bachatbuddy_user_id");
        if (storedUserId && storedUserId !== session.user.id) {
          console.log("User mismatch detected. Clearing stale data.");
          localStorage.clear();
        }
        localStorage.setItem("bachatbuddy_user_id", session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-12 w-12 bg-primary/20 rounded-full"></div>
          <p className="text-muted-foreground font-medium">Loading BachatBuddy...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={session ? <Navigate to="/dashboard" replace /> : <LandingPage />}
            />
            <Route path="/auth" element={<Auth />} />

            <Route
              path="/onboarding"
              element={
                <ProtectedRoute session={session}>
                  <Onboarding />
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute session={session}>
                  <RequiresOnboarding>
                    <Layout>
                      <Index />
                    </Layout>
                  </RequiresOnboarding>
                </ProtectedRoute>
              }
            />
            <Route
              path="/accounts"
              element={
                <ProtectedRoute session={session}>
                  <RequiresOnboarding>
                    <Layout>
                      <Accounts />
                    </Layout>
                  </RequiresOnboarding>
                </ProtectedRoute>
              }
            />
            <Route
              path="/transactions"
              element={
                <ProtectedRoute session={session}>
                  <RequiresOnboarding>
                    <Layout>
                      <Transactions />
                    </Layout>
                  </RequiresOnboarding>
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute session={session}>
                  <RequiresOnboarding>
                    <Layout>
                      <Settings />
                    </Layout>
                  </RequiresOnboarding>
                </ProtectedRoute>
              }
            />
            <Route
              path="/budget-planner"
              element={
                <ProtectedRoute session={session}>
                  <RequiresOnboarding>
                    <Layout>
                      <BudgetPlanner />
                    </Layout>
                  </RequiresOnboarding>
                </ProtectedRoute>
              }
            />
            <Route
              path="/setup-accounts"
              element={<Navigate to="/onboarding" replace />}
            />
            <Route path="/insights/deep-dive" element={<InsightsDeepDive />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
