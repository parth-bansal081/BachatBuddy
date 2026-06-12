import { useState, useEffect, lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import "./i18n";
import { Session } from "@supabase/supabase-js";
import { RequiresOnboarding } from "@/components/RequiresOnboarding";

const Index = lazy(() => import("./pages/Index"));
const Accounts = lazy(() => import("./pages/Accounts"));
const Transactions = lazy(() => import("./pages/Transactions"));
const Settings = lazy(() => import("./pages/Settings"));
const BudgetPlanner = lazy(() => import("./pages/BudgetPlanner"));
const InsightsDeepDive = lazy(() => import("@/pages/insights/DeepDive"));
const LandingPage = lazy(() => import("./pages/LandingPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Auth = lazy(() => import("./pages/Auth"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const LoadingInsights = lazy(() => import("./pages/LoadingInsights"));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <div className="h-12 w-12 bg-primary/20 rounded-full"></div>
        <p className="text-muted-foreground font-medium">Loading BachatBuddy...</p>
      </div>
    </div>
  );
}

const queryClient = new QueryClient();

// PRODUCTION IDENTITY LOCKDOWN
const SITE_URL = "https://bachatbuddy-hq.vercel.app";

// One-time purge removed — it was clearing Supabase auth sessions on every load


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
    // DO NOT clear localStorage here — it contains the Supabase auth session!
    // Clearing it causes the user to be logged out on every page load.

    // Circuit Breaker Removed - Compliance with Total Purge

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      // GHOST SESSION BREAKOUT (MISSION CLEAN SLATE)
      // If Supabase returns no session/error but ghost auth cookies remain, force a total purge.
      const hasAuthCookie = document.cookie.includes('sb-') && document.cookie.includes('-auth-token');
      
      if ((error || !session) && hasAuthCookie) {
        console.warn("Ghost session detected in browser. Clearing authenticators...");
        supabase.auth.signOut().then(() => {
          localStorage.clear();
          sessionStorage.clear();
          window.location.reload();
        });
        return;
      }
      
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
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route
                path="/"
                element={<Navigate to="/dashboard" replace />}
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
              <Route
                path="/loading-insights"
                element={
                  <ProtectedRoute session={session}>
                    <LoadingInsights />
                  </ProtectedRoute>
                }
              />
              <Route path="/insights/deep-dive" element={<InsightsDeepDive />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
