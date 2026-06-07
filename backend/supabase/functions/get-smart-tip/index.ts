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
        const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
        const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
        const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");

        if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured");

        const authHeader = req.headers.get("Authorization");
        if (!authHeader) throw new Error("Missing Authorization header");

        const supabase = createClient(
            SUPABASE_URL ?? "",
            SUPABASE_ANON_KEY ?? "",
            {
                global: { headers: { Authorization: authHeader } },
            }
        );

        const { income, savingsTarget, totalSpent, unpaidBills } = await req.json();

        // Fetch category spending for this month
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("No user found");

        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const { data: transactions } = await supabase
            .from("transactions")
            .select("category, amount")
            .gte("date", startOfMonth.toISOString().split("T")[0])
            .eq("user_id", user.id);

        // Calculate spending by category
        const categorySpending: Record<string, number> = {};
        (transactions || []).forEach((t: any) => {
            const cat = t.category || "Others";
            categorySpending[cat] = (categorySpending[cat] || 0) + Number(t.amount);
        });

        // Find highest spending category
        const topCategory = Object.entries(categorySpending)
            .sort(([, a], [, b]) => b - a)[0];

        const topCategoryName = topCategory?.[0] || "Unknown";
        const topCategoryAmount = topCategory?.[1] || 0;

        // Calculate projected savings shortfall
        const remainingBudget = income - savingsTarget - totalSpent - unpaidBills;
        const savingsShortfall = Math.max(0, savingsTarget - (income - totalSpent - unpaidBills));

        const systemPrompt = `You are a professional financial coach. Analyze the user's spending and give them ONE specific, actionable tip. 
If they're overspending in a category (especially Food/Entertainment), mention it specifically. 
If they're at risk of missing their savings goal, calculate and mention the exact shortfall amount.
Keep it under 30 words. Be direct and helpful.`;

        const userPrompt = `Context:
- Monthly Income: ₹${income.toLocaleString()}
- Savings Target: ₹${savingsTarget.toLocaleString()}
- Total Spent So Far: ₹${totalSpent.toLocaleString()}
- Unpaid Bills: ₹${unpaidBills.toLocaleString()}
- Highest Spending Category: ${topCategoryName} (₹${topCategoryAmount.toLocaleString()})
- Remaining Budget: ₹${remainingBudget.toLocaleString()}
- Projected Savings Shortfall: ₹${savingsShortfall.toLocaleString()}

Generate a specific, actionable tip focusing on their highest spending category or savings goal risk.`;

        // Call Gemini 2.0 Flash
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }]
                }]
            }),
        });

        const data = await response.json();

        let tip = "Track your spending to stay on budget!";
        if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
            tip = data.candidates[0].content.parts[0].text;
        } else if (data.error) {
            console.error("Gemini Error:", data.error);
            tip = "AI Insight unavailable. Check API Key.";
        }

        return new Response(
            JSON.stringify({ tip }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    } catch (error: any) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
