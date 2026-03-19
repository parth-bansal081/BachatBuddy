import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversationHistory } = await req.json();
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");

    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not configured");

    // Initialize Supabase Client with Auth Context
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing Authorization header");

    const supabase = createClient(
      SUPABASE_URL ?? "",
      SUPABASE_ANON_KEY ?? "",
      {
        global: { headers: { Authorization: authHeader } },
      }
    );

    // Fetch Financial Data
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString();
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const [transactionsResult, budgetsResult] = await Promise.all([
      supabase.from("transactions").select("*").gte("date", last30Days).order("date", { ascending: false }).limit(50),
      supabase.from("budgets").select("*")
    ]);

    const transactions = transactionsResult.data || [];
    const budgets = budgetsResult.data || [];

    // Calculate Aggregates
    const currentMonthTransactions = transactions.filter(t => t.date >= startOfMonth);
    const income = budgets.reduce((sum, b) => sum + b.budget, 0); // Assuming budget goal = income for simplicity, or we check separate income
    // Note: Previous logic assumed sum of budgets = income. We'll stick to that or just list budgets.
    const totalExpenses = currentMonthTransactions.reduce((sum, t) => sum + t.amount, 0);
    const remainingBalance = income - totalExpenses;

    // Calculate Budget Usage
    const categorySpent = currentMonthTransactions.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

    const budgetStatus = budgets.map((b: any) => ({
      category: b.category,
      budget: b.budget,
      spent: categorySpent[b.category] || 0,
      percentUsed: Math.round(((categorySpent[b.category] || 0) / b.budget) * 100)
    }));

    // Build system prompt
    const systemPrompt = `You are an expert financial assistant. You have DIRECT access to the user's recent financial data (last 30 days) via the database.

CURRENT FINANCIAL SNAPSHOT (This Month):
- Approximate Income (Sum of Budgets): ₹${income.toLocaleString()}
- Total Expenses: ₹${totalExpenses.toLocaleString()}
- Remaining Balance: ₹${remainingBalance.toLocaleString()}

BUDGET STATUS:
${budgetStatus.map((b: any) =>
      `- ${b.category}: Spent ₹${b.spent.toLocaleString()} of ₹${b.budget.toLocaleString()} (${b.percentUsed}%)`
    ).join('\n')}

RECENT TRANSACTIONS (Last 30 Days):
${transactions.map((t: any) =>
      `- ${t.date}: ${t.merchant} (${t.category}) - ₹${t.amount.toLocaleString()}`
    ).join('\n')}

INSTRUCTIONS:
1. You are a helpful, professional finance expert.
2. Answer questions based ONLY on the data provided above.
3. If the user asks about a transaction not listed, assume it didn't happen in the last 30 days.
4. Always use Indian Rupee (₹).
5. Be concise.`;

    // Call OpenAI
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          ...(conversationHistory || []),
          { role: "user", content: message },
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      // ... (Error handling same as before)
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const assistantResponse = data.choices?.[0]?.message?.content || "No response";

    return new Response(
      JSON.stringify({ response: assistantResponse }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
