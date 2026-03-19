import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getMockBankData } from './mock-service.ts'
import { SetuClient } from './setu-client.ts'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-client-id, x-client-secret, x-product-instance-id',
    'Cache-Control': 'no-store, no-cache, must-revalidate',
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

    try {
        const setu = new SetuClient();

        // Handle FETCH_DATA mode
        const { mode, consentId } = await req.json().catch(() => ({ mode: null }));

        if (mode === 'FETCH_DATA') {
            if (!consentId) throw new Error("Missing consentId");

            // Verify User
            const authHeader = req.headers.get('Authorization')!;
            const supabaseClient = createClient(
                Deno.env.get('SUPABASE_URL') ?? '',
                Deno.env.get('SUPABASE_ANON_KEY') ?? '',
                { global: { headers: { Authorization: authHeader } } }
            );

            const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
            if (userError || !user) throw new Error("Unauthorized");

            // 1. CLEAR GHOST DATA (Reset for demo)
            await supabaseClient.from("transactions").delete().eq("user_id", user.id);
            await supabaseClient.from("accounts").delete().eq("user_id", user.id);

            // 2. "FETCH" DATA (Simulated via Mock Service for UAT Instant-Result requirement)
            // In a production app, we would call: await setu.fetchFiData(consentId);
            const mockData = getMockBankData();
            const accountData = mockData.Account.Summary;
            const txnsData = mockData.Account.Transactions.Transaction;

            // 3. INSERT ACCOUNT
            const { data: account, error: accError } = await supabaseClient
                .from("accounts")
                .insert({
                    user_id: user.id,
                    account_name: "HDFC Savings",
                    account_type: accountData.type,
                    balance: parseFloat(accountData.currentBalance),
                    last_four: accountData.accountNumber.slice(-4),
                    account_number: accountData.accountNumber
                })
                .select()
                .single();

            if (accError) throw accError;

            // 4. MAP & INSERT TRANSACTIONS
            const newTxns = txnsData.map((t: any) => {
                let cat = "Lifestyle";
                const narr = t.narration.toUpperCase();
                if (narr.includes("SWIGGY") || narr.includes("ZOMATO") || narr.includes("STARBUCKS")) cat = "Food";
                if (narr.includes("UBER") || narr.includes("PETROL")) cat = "Transport";
                if (narr.includes("AMAZON") || narr.includes("SHOPPING")) cat = "Shopping";
                if (narr.includes("RENT") || narr.includes("NETFLIX")) cat = "Bills";

                return {
                    user_id: user.id,
                    account_id: account.id,
                    date: t.txnDate,
                    amount: parseFloat(t.amount),
                    type: t.type === "CREDIT" ? "income" : "expense",
                    category: cat,
                    merchant: t.narration,
                    description: t.narration
                };
            });

            const { error: txnError } = await supabaseClient
                .from("transactions")
                .insert(newTxns);

            if (txnError) throw txnError;

            return new Response(JSON.stringify({ success: true, count: newTxns.length }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            });
        }

        // --- CONSENT FLOW (INIT) ---
        // Explicitly hardcoded to FinTrack HQ as requested
        const redirectUrl = "https://fintrack-hq.vercel.app/dashboard";
        const result = await setu.createConsent(redirectUrl);

        return new Response(JSON.stringify({ url: result.url }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error) {
        console.error("Function Error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }
})