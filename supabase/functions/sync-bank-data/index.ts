import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { SetuClient } from './setu-client.ts'


const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-client-id, x-client-secret, x-product-instance-id',
    'Cache-Control': 'no-store, no-cache, must-revalidate',
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

    try {
        // Handle FETCH_DATA mode
        const { mode, consentId } = await req.json().catch(() => ({ mode: null, consentId: null }));

        if (mode === 'FETCH_DATA') {
            if (!consentId) throw new Error("Missing consentId");

            // 1. Verify the user via their JWT (anon client)
            const authHeader = req.headers.get('Authorization')!;
            const anonClient = createClient(
                Deno.env.get('SUPABASE_URL') ?? '',
                Deno.env.get('SUPABASE_ANON_KEY') ?? '',
                { global: { headers: { Authorization: authHeader } } }
            );
            const { data: { user }, error: userError } = await anonClient.auth.getUser();
            if (userError || !user) throw new Error("Unauthorized");

            // 2. Use service role client for all DB operations (bypasses RLS)
            const adminClient = createClient(
                Deno.env.get('SUPABASE_URL') ?? '',
                Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
            );

            // 3. Clear existing data for this user
            await adminClient.from("transactions").delete().eq("user_id", user.id);
            await adminClient.from("accounts").delete().eq("user_id", user.id);

            // 4. Fetch real FI data from Setu sandbox (falls back to mock on error)
            let txnsData: any[] = [];
            let accountLabel = "Linked Account";
            let accountTypeName = "SAVINGS";

            try {
                const setu = new SetuClient();
                const setuData = await setu.fetchFiData(consentId);
                console.log("[sync] Setu FI data status:", setuData.status);

                // Accept any account that has data (status may be READY, DELIVERED, etc.)
                const accounts = setuData?.fips?.flatMap((fip: any) => {
                    console.log(`[sync] FIP: ${fip.fipID}, accounts:`, JSON.stringify(fip.accounts?.map((a: any) => ({ status: a.status, masked: a.maskedAccNumber }))));
                    return (fip.accounts || []).filter((a: any) => a.data != null);
                }) || [];

                if (accounts.length > 0) {
                    const firstAcc = accounts[0].data?.account || accounts[0].data;
                    accountLabel = `****${accounts[0].maskedAccNumber?.slice(-4) || "XXXX"}`;
                    accountTypeName = firstAcc?.summary?.type || "SAVINGS";

                    const allTxns = accounts.flatMap((a: any) => {
                        const txns = a.data?.account?.transactions?.transaction
                            || a.data?.transactions?.transaction
                            || [];
                        return Array.isArray(txns) ? txns : [txns];
                    });
                    txnsData = allTxns;
                    console.log("[sync] Got", txnsData.length, "real transactions from Setu");
                } else {
                    console.error("[sync] Raw Setu response:", JSON.stringify(setuData));
                    throw new Error("Setu returned no accounts with data. Consent may be expired — please re-link your bank.");
                }
            } catch (setuErr: any) {
                console.error("[sync] Setu FI fetch failed:", setuErr.message);
                throw setuErr;
            }

            // 5. Insert account record
            const { data: account, error: accError } = await adminClient
                .from("accounts")
                .insert({
                    user_id: user.id,
                    account_name: accountLabel,
                    account_type: accountTypeName,
                    last_four: accountLabel.slice(-4),
                })
                .select()
                .single();

            if (accError) {
                console.error("Account insert error:", JSON.stringify(accError));
                throw new Error("Account insert failed: " + accError.message);
            }

            // 6. Map & insert transactions
            const newTxns = txnsData.map((t: any) => {
                // Handle both Setu real format and our mock format
                const narration = t.narration || t.description || t.txnDescription || "";
                const narr = narration.toUpperCase();
                const rawAmt = parseFloat(t.amount || "0") / 100; // scale down sandbox FIP amounts to realistic values
                const txnType = (t.type || t.txnType || "DEBIT").toUpperCase();
                const isCredit = txnType === "CREDIT";
                const signedAmount = isCredit ? Math.abs(rawAmt) : -Math.abs(rawAmt);
                const txnDate = t.txnDate || t.valueDate || t.date || new Date().toISOString();

                let cat = "Lifestyle";
                if (narr.includes("SWIGGY") || narr.includes("ZOMATO") || narr.includes("STARBUCKS")) cat = "Food";
                if (narr.includes("UBER") || narr.includes("PETROL") || narr.includes("OLA")) cat = "Transport";
                if (narr.includes("AMAZON") || narr.includes("SHOPPING") || narr.includes("FLIPKART")) cat = "Shopping";
                if (narr.includes("RENT") || narr.includes("NETFLIX") || narr.includes("SPOTIFY")) cat = "Bills";
                if (narr.includes("SALARY") || narr.includes("ACH") || narr.includes("NEFT")) cat = "Income";

                return {
                    user_id: user.id,
                    account_id: account.id,
                    date: txnDate,
                    amount: signedAmount,
                    category: cat,
                    merchant: narration || "Unknown",
                };
            }).filter((t: any) => t.merchant !== "Unknown" || t.amount !== 0);

            const { error: txnError } = await adminClient
                .from("transactions")
                .insert(newTxns);

            if (txnError) {
                console.error("Transaction insert error:", JSON.stringify(txnError));
                throw new Error("Transaction insert failed: " + txnError.message);
            }

            return new Response(JSON.stringify({
                success: true,
                count: newTxns.length,
                source: "setu"
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            });
        }

        // Unknown mode
        return new Response(JSON.stringify({ error: 'Unknown mode. Use mode: FETCH_DATA' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });

    } catch (error) {
        console.error("Function Error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }
})