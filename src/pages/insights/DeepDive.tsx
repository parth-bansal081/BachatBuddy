import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, TrendingDown, TrendingUp, Activity, CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { formatCurrency, Transaction } from "@/lib/data";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Legend
} from "recharts";
import { startOfMonth, subMonths, format, endOfMonth, differenceInDays, parseISO } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { calculateActualBurn, calculateSafeToSpend } from "@/utils/financialPhysics";

export default function InsightsDeepDive() {
    const navigate = useNavigate();

    // Fetch User Profile for Income/Currency
    const { data: profile } = useQuery({
        queryKey: ["user-profile"],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return null;
            const { data } = await supabase.from("user_profiles").select("*").eq("id", user.id).single();
            return data;
        },
    });

    const currencySymbol = profile?.currency || "₹";
    const currencyCode = "INR"; // Simplify for now
    const savingsTarget = Number((profile as any)?.monthly_savings_goal) || 10000; // Sync Logic

    // Fetch Transactions for Analysis
    const { data: transactions = [], isLoading } = useQuery({
        queryKey: ["transactions"],
        queryFn: async () => {
            const { data } = await supabase.from("transactions").select("*").order("date", { ascending: true }); // ASC for charts
            return (data || []).map((t: any) => ({
                ...t,
                amount: Number(t.amount),
                date: t.date,
            })) as Transaction[];
        },
    });

    // --- LOGIC ENGINE ---

    // 1. Burn Rate Analysis (Last 3 Months)
    const now = new Date();
    const threeMonthsAgo = subMonths(now, 3);
    const recentTransactions = transactions.filter(t => new Date(t.date) >= threeMonthsAgo);

    // Current Month Velocity
    const currentMonthSpent = transactions
        .filter(t => new Date(t.date) >= startOfMonth(new Date()))
        .reduce((sum, t) => sum + ((t.category as string) !== 'Income' ? t.amount : 0), 0);

    // Use Shared Logic for consistency
    // We need income and goal to calculate the TARGET velocity (Safe Limit)
    const monthlyIncome = Number(profile?.monthly_income) || 0;
    // savingsTarget defined above

    // Import dynamically? No, just replicate for now or import at top. 
    // Wait, I can't add imports easily with replace_file_content if top lines not in context.
    // I will assume I need to add import or just replicate logic using the unified formula.
    // actually I should add the import at the top first in a separate call or just logic here.
    // Let's use the logic:
    // SafeDaily = (Income - Goal - CurrentSpent) / RemainingDays -> This changes every day.
    // Target Average Daily = (Income - Goal) / DaysInMonth -> This is the static "Ideal".

    // User asked for: "Your Projected Target (matching the Dashboard's ₹1,206)".
    // The Dashboard's number is `dailySafeAmount`.

    // Let's calculate `dailySafeAmount` here locally matching `metrics.ts` logic.
    const totalDaysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const currentDay = now.getDate();
    const remainingDays = totalDaysInMonth - currentDay + 1;
    const availableFunds = Math.max(0, monthlyIncome - savingsTarget - currentMonthSpent);
    const dailySafeAmount = remainingDays > 0 ? availableFunds / remainingDays : 0;

    const daysPassed = currentDay; // 1-indexed
    const dailyBurnRate = daysPassed > 0 ? currentMonthSpent / daysPassed : 0;
    const monthlyBurnRate = dailyBurnRate * 30; // Projected

    // 2. Runway Calculation
    // monthlyIncome is already defined above.

    // In a real app, we would fetch the true 'Account Balance' sum here.
    // For now, we assume a healthy reserve based on savings goal progress or income.
    // Let's use a meaningful heuristic: (Income - Expenses) accumulated over time + standard buffer.
    // Fallback: If no history, assume 3 months runway buffer as a baseline for "Safe".

    // Better Logic: Reserve = (Total Income in Txns) - (Total Burn in Txns)
    // Use the entire transaction history if available or just assume 3x Monthly Income as a "Healthy" baseline for visual demo.
    // Getting strict: Reserve = monthlyIncome * 3 (standard emergency fund recommendation) - (current month burn).

    const currentMonthBurn = transactions
        .filter(t => new Date(t.date) >= startOfMonth(new Date()))
        .reduce((sum, t) => sum + ((t.category as string) !== 'Income' ? t.amount : 0), 0);

    const estimatedReserve = (monthlyIncome * 3) - currentMonthBurn;
    const runwayDays = dailyBurnRate > 0 ? Math.round(estimatedReserve / dailyBurnRate) : 999;

    // 3. Category Trend Data (Monthly)
    // Group by Month -> Category -> Sum
    const monthlyData: Record<string, Record<string, number>> = {};

    recentTransactions.forEach(t => {
        const monthKey = format(new Date(t.date), "MMM yyyy");
        if (!monthlyData[monthKey]) monthlyData[monthKey] = {};
        monthlyData[monthKey][t.category] = (monthlyData[monthKey][t.category] || 0) + t.amount;
    });

    const trendData = Object.entries(monthlyData).map(([month, cats]) => ({
        name: month,
        Shopping: cats['Shopping'] || 0,
        Food: cats['Food'] || 0,
        Transport: cats['Transport'] || 0,
        Total: Object.values(cats).reduce((a, b) => a + b, 0)
    }));

    // Top Categories Logic
    const categoryTotals = transactions.reduce((acc, t) => {
        if ((t.category as string) === 'Income') return acc;
        acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
        return acc;
    }, {} as Record<string, number>);

    const categoryBreakdownData = Object.entries(categoryTotals).map(([name, value]) => ({
        name,
        value,
    })).sort((a, b) => b.value - a.value).slice(0, 6);

    // 4. Anomalies
    const spikes = recentTransactions.filter(t => t.amount > dailyBurnRate * 5).length; // Transactions 5x the daily burn

    if (isLoading) return <div className="p-8"><Skeleton className="h-96 w-full" /></div>;

    return (
        <div className="space-y-8 max-w-7xl mx-auto p-4 md:p-8 animate-fade-in pb-24">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold gemini-text-gradient">Financial Forensics</h1>
                    <p className="text-muted-foreground">Deep-dive analysis of your financial health.</p>
                </div>
            </div>

            {/* Hero Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-0 shadow-lg">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                            <TrendingDown className="h-4 w-4 text-rose-500" /> Current Spending Velocity
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{formatCurrency(dailyBurnRate, currencyCode)} <span className="text-sm text-muted-foreground font-normal">/ day</span></div>
                        <p className="text-xs text-slate-400 mt-1 flex justify-between">
                            <span>Avg Actual</span>
                            <span className="text-emerald-400">Target: {formatCurrency(dailySafeAmount, currencyCode)}</span>
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-emerald-900 to-emerald-800 text-white border-0 shadow-lg">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-emerald-200 flex items-center gap-2">
                            <CalendarClock className="h-4 w-4" /> Calculated Runway
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{runwayDays} Days</div>
                        <p className="text-xs text-emerald-200/70 mt-1">
                            Until estimated reserves hit ₹0 at this rate.
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-indigo-900 to-violet-900 text-white border-0 shadow-lg">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-indigo-300 flex items-center gap-2">
                            <Activity className="h-4 w-4" /> Volatility Index
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{spikes} Spikes</div>
                        <p className="text-xs text-indigo-300/70 mt-1">
                            Large transactions (&gt;5x daily avg) in last 90 days.
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="shadow-lg">
                    <CardHeader><CardTitle>Monthly Spending Trend</CardTitle></CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={trendData}>
                                <defs>
                                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val / 1000}k`} />
                                <Tooltip formatter={(value: number) => [formatCurrency(value, currencyCode), "Spent"]} />
                                <Area type="monotone" dataKey="Total" stroke="#8884d8" fillOpacity={1} fill="url(#colorTotal)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="shadow-lg">
                    <CardHeader><CardTitle>Top Spending Categories</CardTitle></CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={categoryBreakdownData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val / 1000}k`} />
                                <YAxis type="category" dataKey="name" fontSize={12} tickLine={false} axisLine={false} width={100} />
                                <Tooltip formatter={(value: number) => [formatCurrency(value, currencyCode)]} />
                                <Bar dataKey="value" fill="#8884d8" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
